import React, { createContext, useContext, useState, useEffect } from 'react'
import { Account, Category, Transaction } from '../types'
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, generateSeedTransactions } from '../data/seedData'

interface FinanceContextType {
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]
  selectedMonth: string // YYYY-MM
  currency: string
  isSetupCompleted: boolean
  setSelectedMonth: (month: string) => void
  setCurrency: (currency: string) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  editTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  addAccount: (acc: Omit<Account, 'id'>) => void
  editAccount: (acc: Account) => void
  deleteAccount: (id: string) => void
  payCreditCard: (fromAccountId: string, creditAccountId: string, amount: number, notes?: string) => void
  exportToJSON: () => void
  importFromJSON: (jsonString: string) => boolean
  exportToCSV: () => void
  completeSetup: (initialAccounts: Account[], chosenCurrency: string) => void
  resetToZero: () => void
  loadDemoData: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const STORAGE_KEY_ACCOUNTS = 'finflow_accounts_v2'
const STORAGE_KEY_TRANSACTIONS = 'finflow_transactions_v2'
const STORAGE_KEY_CATEGORIES = 'finflow_categories_v2'
const STORAGE_KEY_SETUP = 'finflow_setup_completed_v2'
const STORAGE_KEY_CURRENCY = 'finflow_currency_v2'

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr)

  // Estado de setup inicial
  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SETUP) === 'true'
    } catch {
      return false
    }
  })

  // Moneda elegida
  const [currency, setCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENCY) || '$'
    } catch {
      return '$'
    }
  })

  // Cuentas (por defecto vacías en cero hasta que el usuario complete el setup o cargue demo)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading accounts:', e)
    }
    return []
  })

  // Transacciones (por defecto vacías en cero)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading transactions:', e)
    }
    return []
  })

  // Categorías
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading categories:', e)
    }
    return DEFAULT_CATEGORIES
  })

  // Persistir en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts))
    } catch (e) {
      console.error('Error saving accounts:', e)
    }
  }, [accounts])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions))
    } catch (e) {
      console.error('Error saving transactions:', e)
    }
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories))
    } catch (e) {
      console.error('Error saving categories:', e)
    }
  }, [categories])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETUP, String(isSetupCompleted))
    } catch (e) {
      console.error('Error saving setup status:', e)
    }
  }, [isSetupCompleted])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency)
    } catch (e) {
      console.error('Error saving currency:', e)
    }
  }, [currency])

  const completeSetup = (initialAccounts: Account[], chosenCurrency: string) => {
    setAccounts(initialAccounts)
    setTransactions([]) // Todo en cero
    setCurrency(chosenCurrency)
    setIsSetupCompleted(true)
  }

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    }
    setTransactions(prev => [newTx, ...prev])
  }

  const editTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...acc,
      id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    }
    setAccounts(prev => [...prev, newAccount])
  }

  const editAccount = (updatedAcc: Account) => {
    setAccounts(prev => prev.map(a => (a.id === updatedAcc.id ? updatedAcc : a)))
  }

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const payCreditCard = (fromAccountId: string, creditAccountId: string, amount: number, notes?: string) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId)
    const creditAcc = accounts.find(a => a.id === creditAccountId)

    const paymentTx: Transaction = {
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'transfer',
      amount,
      accountId: fromAccountId,
      toAccountId: creditAccountId,
      category: 'Pago de Tarjeta',
      description: `Pago de resumen ${creditAcc?.name || 'Tarjeta'} desde ${fromAcc?.name || 'Cuenta'}`,
      notes: notes || 'Liquidación / Amortización de tarjeta de crédito',
    }

    setTransactions(prev => [paymentTx, ...prev])
  }

  const exportToJSON = () => {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      currency,
      accounts,
      transactions,
      categories,
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finflow_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFromJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString)
      if (Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
        setAccounts(parsed.accounts)
        setTransactions(parsed.transactions)
        if (parsed.currency) setCurrency(parsed.currency)
        if (Array.isArray(parsed.categories)) {
          setCategories(parsed.categories)
        }
        setIsSetupCompleted(true)
        return true
      }
      return false
    } catch (e) {
      console.error('Error importing backup:', e)
      return false
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Monto', 'Cuenta Origen', 'Cuenta Destino', 'Categoría', 'Descripción', 'Cuotas', 'Monto Cuota']
    const rows = transactions.map(t => {
      const acc = accounts.find(a => a.id === t.accountId)?.name || t.accountId
      const toAcc = t.toAccountId ? accounts.find(a => a.id === t.toAccountId)?.name || t.toAccountId : ''
      return [
        t.id,
        t.date,
        t.type,
        t.amount,
        `"${acc}"`,
        `"${toAcc}"`,
        `"${t.category}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.installmentsCount || 1,
        t.installmentAmount || t.amount,
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finflow_transacciones_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetToZero = () => {
    setAccounts([])
    setTransactions([])
    setCategories(DEFAULT_CATEGORIES)
    setIsSetupCompleted(false)
    localStorage.removeItem(STORAGE_KEY_ACCOUNTS)
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS)
    localStorage.removeItem(STORAGE_KEY_SETUP)
  }

  const loadDemoData = () => {
    setAccounts(DEFAULT_ACCOUNTS)
    setTransactions(generateSeedTransactions())
    setCategories(DEFAULT_CATEGORIES)
    setIsSetupCompleted(true)
  }

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        selectedMonth,
        currency,
        isSetupCompleted,
        setSelectedMonth,
        setCurrency,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        editAccount,
        deleteAccount,
        payCreditCard,
        exportToJSON,
        importFromJSON,
        exportToCSV,
        completeSetup,
        resetToZero,
        loadDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
