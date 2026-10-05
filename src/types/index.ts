export type AccountType = 'checking' | 'savings' | 'cash' | 'credit' | 'credit_line'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number // Para cuentas líquidas: saldo disponible. Para tarjetas: deuda acumulada base
  creditLimit?: number // Límite total de crédito
  statementClosingDay?: number // Día de cierre de corte de facturación (1-31)
  paymentDueDay?: number // Día de vencimiento/pago del resumen (1-31)
  color: string
  currency: string
  institution?: string
}

export type TransactionType = 'expense' | 'income' | 'transfer'

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  type: TransactionType
  amount: number
  accountId: string // Cuenta de origen (o pagadora)
  toAccountId?: string // Cuenta destino si es transferencia o pago de tarjeta
  category: string
  description: string
  notes?: string
  // Cuotas y convenios de tarjeta
  installmentsCount?: number // Cantidad total de cuotas (ej. 1, 3, 6, 12)
  isInterestFree?: boolean // Convenio cuotas sin interés
  installmentAmount?: number // Monto por cuota mensual
  totalWithInterest?: number // Si hubo recargo, el monto total con interés
}

export interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  iconName: string
  color: string
}
