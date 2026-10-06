import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  isCreditAccount,
  getAccountRealBalance,
  getNetWorth,
  getCreditCardStatement,
  getMonthlyMetrics,
} from './financeCalculators'
import { Account, Transaction } from '../types'

describe('financeCalculators', () => {
  describe('formatCurrency', () => {
    it('formatea montos positivos con el símbolo por defecto', () => {
      const result = formatCurrency(1500000)
      expect(result).toContain('$')
      expect(result).toContain('1.500.000')
    })

    it('formatea montos negativos con signo menos', () => {
      const result = formatCurrency(-50000)
      expect(result).toContain('-$')
      expect(result).toContain('50.000')
    })

    it('respeta divisas personalizadas como CLP o USD', () => {
      const clp = formatCurrency(25000, 'CLP $')
      expect(clp).toContain('CLP $')
      expect(clp).toContain('25.000')

      const usd = formatCurrency(120.5, 'USD $')
      expect(usd).toContain('USD $')
    })
  })

  describe('isCreditAccount', () => {
    it('identifica correctamente tarjetas de crédito y líneas de crédito', () => {
      expect(isCreditAccount('credit')).toBe(true)
      expect(isCreditAccount('credit_line')).toBe(true)
    })

    it('identifica cuentas líquidas como no-crédito', () => {
      expect(isCreditAccount('checking')).toBe(false)
      expect(isCreditAccount('savings')).toBe(false)
      expect(isCreditAccount('cash')).toBe(false)
    })
  })

  describe('getAccountRealBalance', () => {
    const checkingAcc: Account = {
      id: 'acc-check',
      name: 'Banco Galicia',
      type: 'checking',
      balance: 100000, // saldo inicial
      color: '#3b82f6',
      currency: '$',
    }

    const creditAcc: Account = {
      id: 'acc-visa',
      name: 'Visa Gold',
      type: 'credit',
      balance: 0, // deuda inicial
      creditLimit: 500000,
      statementClosingDay: 20,
      paymentDueDay: 5,
      color: '#6366f1',
      currency: '$',
    }

    it('calcula el saldo líquido con ingresos, egresos y transferencias', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          date: '2026-10-01',
          type: 'income',
          amount: 500000,
          accountId: 'acc-check',
          category: 'Sueldo',
          description: 'Cobro de haberes',
        },
        {
          id: 'tx-2',
          date: '2026-10-02',
          type: 'expense',
          amount: 60000,
          accountId: 'acc-check',
          category: 'Supermercado',
          description: 'Compras',
        },
        {
          id: 'tx-3',
          date: '2026-10-03',
          type: 'transfer',
          amount: 40000,
          accountId: 'acc-check',
          toAccountId: 'acc-savings',
          category: 'Transferencia',
          description: 'Ahorro',
        },
      ]

      // 100000 (inicial) + 500000 (ingreso) - 60000 (gasto) - 40000 (transferencia saliente) = 500000
      const balance = getAccountRealBalance(checkingAcc, transactions)
      expect(balance).toBe(500000)
    })

    it('calcula la deuda de tarjeta y la amortización tras un pago', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          date: '2026-10-01',
          type: 'expense',
          amount: 120000,
          accountId: 'acc-visa',
          category: 'Tecnología',
          description: 'Monitor',
          installmentsCount: 1,
        },
        {
          id: 'tx-2',
          date: '2026-10-05',
          type: 'transfer', // Pago de tarjeta
          amount: 50000,
          accountId: 'acc-check',
          toAccountId: 'acc-visa',
          category: 'Pago de Tarjeta',
          description: 'Abono parcial',
        },
      ]

      // Deuda: 120000 - 50000 = 70000
      const debt = getAccountRealBalance(creditAcc, transactions)
      expect(debt).toBe(70000)
    })
  })

  describe('getNetWorth', () => {
    it('calcula el patrimonio neto deduciendo las deudas de los activos líquidos', () => {
      const accounts: Account[] = [
        {
          id: 'acc-1',
          name: 'Cuenta Corriente',
          type: 'checking',
          balance: 300000,
          color: '#3b82f6',
          currency: '$',
        },
        {
          id: 'acc-2',
          name: 'Efectivo',
          type: 'cash',
          balance: 50000,
          color: '#f59e0b',
          currency: '$',
        },
        {
          id: 'acc-3',
          name: 'Visa Crédito',
          type: 'credit',
          balance: 80000, // deuda
          creditLimit: 500000,
          color: '#6366f1',
          currency: '$',
        },
      ]

      const { liquidAssets, totalDebt, netWorth } = getNetWorth(accounts, [])
      expect(liquidAssets).toBe(350000)
      expect(totalDebt).toBe(80000)
      expect(netWorth).toBe(270000)
    })
  })

  describe('getCreditCardStatement', () => {
    it('calcula el disponible y las cuotas de un ciclo', () => {
      const card: Account = {
        id: 'acc-visa',
        name: 'Visa Signature',
        type: 'credit',
        balance: 0,
        creditLimit: 1000000,
        statementClosingDay: 20,
        paymentDueDay: 5,
        color: '#6366f1',
        currency: '$',
      }

      // Compra en 3 cuotas sin interés
      const transactions: Transaction[] = [
        {
          id: 'tx-c1',
          date: '2026-10-02',
          type: 'expense',
          amount: 300000,
          accountId: 'acc-visa',
          category: 'Viajes',
          description: 'Pasajes',
          installmentsCount: 3,
          isInterestFree: true,
          installmentAmount: 100000,
        },
      ]

      const refDate = new Date(2026, 9, 10) // 10 de Octubre de 2026
      const stmt = getCreditCardStatement(card, transactions, refDate)

      expect(stmt.daysUntilClosing).toBeGreaterThan(0)
      expect(stmt.totalDebt).toBe(300000)
      expect(stmt.availableCredit).toBe(700000)
      expect(stmt.activeInstallments.length).toBe(1)
      expect(stmt.activeInstallments[0].monthlyAmount).toBe(100000)
    })
  })

  describe('getMonthlyMetrics', () => {
    it('calcula ingresos, egresos y tasa de ahorro del mes', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          date: '2026-10-01',
          type: 'income',
          amount: 1000000,
          accountId: 'acc-1',
          category: 'Sueldo',
          description: 'Sueldo',
        },
        {
          id: 'tx-2',
          date: '2026-10-05',
          type: 'expense',
          amount: 400000,
          accountId: 'acc-1',
          category: 'Alquiler',
          description: 'Alquiler mensual',
        },
      ]

      const metrics = getMonthlyMetrics(transactions, 2026, 10)
      expect(metrics.totalIncome).toBe(1000000)
      expect(metrics.totalExpense).toBe(400000)
      expect(metrics.netSavings).toBe(600000)
      expect(metrics.savingsRate).toBe(60) // 60% de ahorro
    })
  })
})
