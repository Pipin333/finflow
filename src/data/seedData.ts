import { Account, Category, Transaction } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos
  { id: 'cat-food', name: 'Alimentación y Supermercado', type: 'expense', iconName: 'Utensils', color: '#f97316' },
  { id: 'cat-housing', name: 'Vivienda y Servicios', type: 'expense', iconName: 'Home', color: '#06b6d4' },
  { id: 'cat-transport', name: 'Transporte y Combustible', type: 'expense', iconName: 'Car', color: '#eab308' },
  { id: 'cat-entertainment', name: 'Ocio y Suscripciones', type: 'expense', iconName: 'Film', color: '#8b5cf6' },
  { id: 'cat-health', name: 'Salud y Farmacia', type: 'expense', iconName: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-tech', name: 'Tecnología y Equipamiento', type: 'expense', iconName: 'Laptop', color: '#3b82f6' },
  { id: 'cat-clothing', name: 'Ropa y Calzado', type: 'expense', iconName: 'Shirt', color: '#ec4899' },
  { id: 'cat-other-exp', name: 'Otros Gastos', type: 'expense', iconName: 'CircleDollarSign', color: '#64748b' },

  // Ingresos
  { id: 'cat-salary', name: 'Sueldo / Salario Principal', type: 'income', iconName: 'Briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Honorarios / Freelance', type: 'income', iconName: 'Sparkles', color: '#14b8a6' },
  { id: 'cat-investments', name: 'Rendimientos e Inversiones', type: 'income', iconName: 'TrendingUp', color: '#84cc16' },
  { id: 'cat-other-inc', name: 'Otros Ingresos', type: 'income', iconName: 'Wallet', color: '#22c55e' },
]

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-checking',
    name: 'Cuenta Corriente Banco',
    type: 'checking',
    balance: 480000,
    color: '#3b82f6',
    currency: '$',
    institution: 'Banco Principal',
  },
  {
    id: 'acc-savings',
    name: 'Caja de Ahorro / Fondo Reserva',
    type: 'savings',
    balance: 950000,
    color: '#10b981',
    currency: '$',
    institution: 'Fondo Rendimientos',
  },
  {
    id: 'acc-cash',
    name: 'Efectivo / Billetera',
    type: 'cash',
    balance: 38500,
    color: '#f59e0b',
    currency: '$',
  },
  {
    id: 'acc-visa',
    name: 'Visa Signature',
    type: 'credit',
    balance: 0,
    creditLimit: 1600000,
    statementClosingDay: 20,
    paymentDueDay: 5,
    color: '#6366f1',
    currency: '$',
    institution: 'Banco Principal',
  },
  {
    id: 'acc-mastercard',
    name: 'Mastercard Black',
    type: 'credit',
    balance: 0,
    creditLimit: 1200000,
    statementClosingDay: 12,
    paymentDueDay: 26,
    color: '#ec4899',
    currency: '$',
    institution: 'Banco Secundario',
  },
]

// Generador de transacciones de ejemplo con fechas relativas al mes actual
export const generateSeedTransactions = (): Transaction[] => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prevMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0')
  const prevYear = now.getMonth() === 0 ? year - 1 : year

  return [
    // Ingresos del mes
    {
      id: 'tx-1',
      date: `${year}-${month}-02`,
      type: 'income',
      amount: 1450000,
      accountId: 'acc-checking',
      category: 'Sueldo / Salario Principal',
      description: 'Acreditación de Sueldo Mensual',
    },
    {
      id: 'tx-2',
      date: `${year}-${month}-05`,
      type: 'income',
      amount: 68000,
      accountId: 'acc-savings',
      category: 'Rendimientos e Inversiones',
      description: 'Rendimiento mensual Cuenta Remunerada',
    },
    // Gastos fijos y variables
    {
      id: 'tx-3',
      date: `${year}-${month}-03`,
      type: 'expense',
      amount: 84500,
      accountId: 'acc-checking',
      category: 'Alimentación y Supermercado',
      description: 'Compra mensual mayorista alimentos',
    },
    {
      id: 'tx-4',
      date: `${year}-${month}-04`,
      type: 'expense',
      amount: 28400,
      accountId: 'acc-checking',
      category: 'Vivienda y Servicios',
      description: 'Servicio de Internet y Telefonía',
    },
    {
      id: 'tx-5',
      date: `${year}-${month}-06`,
      type: 'expense',
      amount: 14200,
      accountId: 'acc-cash',
      category: 'Transporte y Combustible',
      description: 'Carga de combustible y peajes',
    },
    // Compra en cuotas en tarjeta Visa
    {
      id: 'tx-6',
      date: `${prevYear}-${prevMonth}-15`,
      type: 'expense',
      amount: 480000,
      accountId: 'acc-visa',
      category: 'Tecnología y Equipamiento',
      description: 'Monitor 4K Ultrawide para Trabajo',
      installmentsCount: 6,
      isInterestFree: true,
      installmentAmount: 80000,
    },
    // Compra en cuotas en tarjeta Mastercard
    {
      id: 'tx-7',
      date: `${year}-${month}-01`,
      type: 'expense',
      amount: 240000,
      accountId: 'acc-mastercard',
      category: 'Ropa y Calzado',
      description: 'Ropa y calzado deportivo',
      installmentsCount: 3,
      isInterestFree: true,
      installmentAmount: 80000,
    },
    // Consumo directo en 1 pago con Visa
    {
      id: 'tx-8',
      date: `${year}-${month}-05`,
      type: 'expense',
      amount: 32600,
      accountId: 'acc-visa',
      category: 'Ocio y Suscripciones',
      description: 'Cena Restaurante y suscripciones streaming',
      installmentsCount: 1,
    },
    // Transferencia / Ahorro
    {
      id: 'tx-9',
      date: `${year}-${month}-03`,
      type: 'transfer',
      amount: 200000,
      accountId: 'acc-checking',
      toAccountId: 'acc-savings',
      category: 'Transferencia',
      description: 'Aporte a Fondo de Reserva para Ahorro',
    },
  ]
}
