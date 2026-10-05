import { Account, AccountType, Transaction } from '../types'

export const isCreditAccount = (type: AccountType): boolean => {
  return type === 'credit' || type === 'credit_line'
}

export const formatCurrency = (amount: number, currency: string = '$'): string => {
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  
  if (amount < 0) {
    return `-${currency} ${formatted}`
  }
  return `${currency} ${formatted}`
}

/**
 * Calcula el saldo actual real de una cuenta en base a su balance base y las transacciones históricas.
 */
export const getAccountRealBalance = (account: Account, transactions: Transaction[]): number => {
  if (isCreditAccount(account.type)) {
    // Para tarjetas de crédito el valor representa la DEUDA ACTUAL
    let totalDebt = account.balance || 0

    transactions.forEach(t => {
      if (t.accountId === account.id) {
        if (t.type === 'expense') {
          // El gasto total suma a la deuda comprometida
          const expenseAmount = t.totalWithInterest || t.amount
          totalDebt += expenseAmount
        }
      }
      // Pagos a la tarjeta (transferencias entrantes a la tarjeta) amortizan la deuda
      if (t.toAccountId === account.id && t.type === 'transfer') {
        totalDebt -= t.amount
      }
    })

    return Math.max(0, totalDebt)
  } else {
    // Cuenta líquida (efectivo, caja de ahorro, cuenta corriente)
    let balance = account.balance || 0

    transactions.forEach(t => {
      // Ingresos a la cuenta
      if (t.accountId === account.id && t.type === 'income') {
        balance += t.amount
      }
      // Gastos desde la cuenta
      if (t.accountId === account.id && t.type === 'expense') {
        balance -= t.amount
      }
      // Transferencia saliente desde esta cuenta
      if (t.accountId === account.id && t.type === 'transfer') {
        balance -= t.amount
      }
      // Transferencia entrante hacia esta cuenta
      if (t.toAccountId === account.id && t.type === 'transfer') {
        balance += t.amount
      }
    })

    return balance
  }
}

/**
 * Calcula el patrimonio neto (Activos Líquidos - Deuda Total de Crédito).
 */
export const getNetWorth = (accounts: Account[], transactions: Transaction[]) => {
  let liquidAssets = 0
  let totalDebt = 0

  accounts.forEach(acc => {
    const balance = getAccountRealBalance(acc, transactions)
    if (isCreditAccount(acc.type)) {
      totalDebt += balance
    } else {
      liquidAssets += balance
    }
  })

  return {
    liquidAssets,
    totalDebt,
    netWorth: liquidAssets - totalDebt,
  }
}

export interface ActiveInstallment {
  transaction: Transaction
  currentInstallment: number
  totalInstallments: number
  monthlyAmount: number
  remainingAmount: number
}

export interface CreditCardStatementSummary {
  account: Account
  closingDateStr: string
  dueDateStr: string
  daysUntilClosing: number
  daysUntilDue: number
  statementTotalToPay: number
  totalDebt: number
  availableCredit: number
  activeInstallments: ActiveInstallment[]
}

/**
 * Calcula el resumen del ciclo de facturación de una tarjeta de crédito
 */
export const getCreditCardStatement = (
  account: Account,
  transactions: Transaction[],
  refDate: Date = new Date()
): CreditCardStatementSummary => {
  const closingDay = account.statementClosingDay || 20
  const dueDay = account.paymentDueDay || 5

  const year = refDate.getFullYear()
  const month = refDate.getMonth() // 0-indexed
  const todayDate = refDate.getDate()

  // Determinar fecha de cierre del ciclo actual
  let currentClosingDate: Date
  if (todayDate <= closingDay) {
    currentClosingDate = new Date(year, month, closingDay)
  } else {
    currentClosingDate = new Date(year, month + 1, closingDay)
  }

  // Determinar fecha de vencimiento (generalmente en el mes siguiente al cierre o pocos días después)
  let currentDueDate: Date
  if (dueDay > closingDay) {
    currentDueDate = new Date(currentClosingDate.getFullYear(), currentClosingDate.getMonth(), dueDay)
  } else {
    currentDueDate = new Date(currentClosingDate.getFullYear(), currentClosingDate.getMonth() + 1, dueDay)
  }

  // Días restantes
  const oneDayMs = 1000 * 60 * 60 * 24
  const daysUntilClosing = Math.max(0, Math.ceil((currentClosingDate.getTime() - refDate.getTime()) / oneDayMs))
  const daysUntilDue = Math.max(0, Math.ceil((currentDueDate.getTime() - refDate.getTime()) / oneDayMs))

  // Fecha inicio del ciclo actual (día posterior al cierre anterior)
  const prevClosingDate = new Date(currentClosingDate.getFullYear(), currentClosingDate.getMonth() - 1, closingDay)

  const cardTx = transactions.filter(t => t.accountId === account.id && t.type === 'expense')
  const paymentsInCycle = transactions.filter(
    t => t.toAccountId === account.id && t.type === 'transfer' && new Date(t.date) >= prevClosingDate && new Date(t.date) <= currentClosingDate
  )

  let oneTimeExpensesInCycle = 0
  let monthlyInstallmentsTotal = 0
  const activeInstallments: ActiveInstallment[] = []

  cardTx.forEach(t => {
    const txDate = new Date(t.date)
    const installments = t.installmentsCount || 1

    if (installments === 1) {
      // Consumo en 1 pago: si está dentro del ciclo
      if (txDate > prevClosingDate && txDate <= currentClosingDate) {
        oneTimeExpensesInCycle += t.amount
      }
    } else {
      // Compra en cuotas
      const monthlyAmount = t.installmentAmount || (t.amount / installments)
      
      // Calcular cuántos meses han pasado desde la compra hasta la fecha de cierre analizada
      const monthsDiff = (currentClosingDate.getFullYear() - txDate.getFullYear()) * 12 + (currentClosingDate.getMonth() - txDate.getMonth())
      
      // La primera cuota entra en el cierre siguiente a la compra
      const currentInstNum = txDate.getDate() <= closingDay ? monthsDiff + 1 : monthsDiff

      if (currentInstNum >= 1 && currentInstNum <= installments) {
        monthlyInstallmentsTotal += monthlyAmount
        const remainingInst = installments - currentInstNum
        activeInstallments.push({
          transaction: t,
          currentInstallment: currentInstNum,
          totalInstallments: installments,
          monthlyAmount,
          remainingAmount: remainingInst * monthlyAmount,
        })
      }
    }
  })

  const totalPaymentsMadeInCycle = paymentsInCycle.reduce((sum, p) => sum + p.amount, 0)
  const statementTotalToPay = Math.max(0, oneTimeExpensesInCycle + monthlyInstallmentsTotal - totalPaymentsMadeInCycle)
  const totalDebt = getAccountRealBalance(account, transactions)
  const availableCredit = Math.max(0, (account.creditLimit || 0) - totalDebt)

  const formatDateStr = (d: Date) => {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  return {
    account,
    closingDateStr: formatDateStr(currentClosingDate),
    dueDateStr: formatDateStr(currentDueDate),
    daysUntilClosing,
    daysUntilDue,
    statementTotalToPay,
    totalDebt,
    availableCredit,
    activeInstallments,
  }
}

/**
 * Calcula métricas mensuales: ingresos totales, gastos totales y flujo neto
 */
export const getMonthlyMetrics = (transactions: Transaction[], targetYear: number, targetMonth: number) => {
  let totalIncome = 0
  let totalExpense = 0

  transactions.forEach(t => {
    const [y, m] = t.date.split('-').map(Number)
    if (y === targetYear && m === targetMonth) {
      if (t.type === 'income') {
        totalIncome += t.amount
      } else if (t.type === 'expense') {
        // Si fue en cuotas, el impacto en este mes es el de la cuota mensual
        if (t.installmentsCount && t.installmentsCount > 1) {
          totalExpense += t.installmentAmount || (t.amount / t.installmentsCount)
        } else {
          totalExpense += t.amount
        }
      }
    }
  })

  return {
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    savingsRate: totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0,
  }
}
