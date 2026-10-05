import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Trash2, 
  Edit3,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Transaction, TransactionType } from '../../types'
import { formatCurrency } from '../../utils/financeCalculators'

interface TransactionsViewProps {
  onOpenNewTransaction: () => void
  onEditTransaction: (tx: Transaction) => void
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const { transactions, accounts, categories, deleteTransaction, selectedMonth, currency } = useFinance()
  const fmt = (amount: number) => formatCurrency(amount, currency)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [filterByMonthOnly, setFilterByMonthOnly] = useState<boolean>(true)

  // Filtrado de transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filtro de mes actual si está activo
      if (filterByMonthOnly) {
        if (!t.date.startsWith(selectedMonth)) {
          return false
        }
      }

      // Filtro de tipo
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false
      }

      // Filtro de cuenta
      if (selectedAccountId !== 'all') {
        if (t.accountId !== selectedAccountId && t.toAccountId !== selectedAccountId) {
          return false
        }
      }

      // Filtro de categoría
      if (selectedCategoryId !== 'all' && t.category !== selectedCategoryId) {
        return false
      }

      // Filtro de texto
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const descMatch = t.description.toLowerCase().includes(q)
        const catMatch = t.category.toLowerCase().includes(q)
        const notesMatch = t.notes?.toLowerCase().includes(q) || false
        if (!descMatch && !catMatch && !notesMatch) {
          return false
        }
      }

      return true
    })
  }, [transactions, selectedMonth, filterByMonthOnly, selectedType, selectedAccountId, selectedCategoryId, searchQuery])

  // Totales de las transacciones filtradas
  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount
      if (t.type === 'expense') {
        if (t.installmentsCount && t.installmentsCount > 1) {
          expense += t.installmentAmount || (t.amount / t.installmentsCount)
        } else {
          expense += t.amount
        }
      }
    })
    return { income, expense, balance: income - expense }
  }, [filteredTransactions])

  const handleDelete = (tx: Transaction) => {
    if (confirm(`¿Eliminar movimiento "${tx.description}" por ${fmt(tx.amount)}?`)) {
      deleteTransaction(tx.id)
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Movimientos y Transacciones</h1>
          <p className="text-xs text-slate-400 mt-1">
            Consulta, filtra y categoriza cada ingreso, egreso o transferencia
          </p>
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto o detalle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Tipo de Movimiento */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los tipos (Ingresos / Gastos / Transf)</option>
              <option value="income">Sólo Ingresos</option>
              <option value="expense">Sólo Gastos</option>
              <option value="transfer">Sólo Transferencias</option>
            </select>
          </div>

          {/* Cuenta */}
          <div>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las cuentas</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.type === 'income' ? 'Ingreso' : 'Gasto'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle para ver solo el mes actual o histórico completo */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="filterMonth"
              checked={filterByMonthOnly}
              onChange={e => setFilterByMonthOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500/20"
            />
            <label htmlFor="filterMonth" className="text-slate-300 font-medium cursor-pointer">
              Limitar a período activo ({selectedMonth})
            </label>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Resultados: <strong className="text-slate-200">{filteredTransactions.length}</strong></span>
            <span>Ingresos: <strong className="text-emerald-400 tabular-nums">{fmt(totals.income)}</strong></span>
            <span>Gastos: <strong className="text-rose-400 tabular-nums">{fmt(totals.expense)}</strong></span>
          </div>
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No se encontraron movimientos con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTransactions.map(tx => {
              const fromAcc = accounts.find(a => a.id === tx.accountId)
              const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null
              const isIncome = tx.type === 'income'
              const isExpense = tx.type === 'expense'

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Icono de tipo */}
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isExpense
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : isExpense ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowLeftRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-100">{tx.description}</span>
                        {tx.installmentsCount && tx.installmentsCount > 1 && (
                          <span className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                            {tx.installmentsCount} cuotas {tx.isInterestFree ? 'sin interés' : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="text-slate-300">{tx.date}</span>
                        <span>&bull;</span>
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: fromAcc?.color || '#94a3b8' }}
                          ></span>
                          <span>{fromAcc?.name}</span>
                          {toAcc && (
                            <>
                              <span className="text-slate-500">&rarr;</span>
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: toAcc?.color || '#94a3b8' }}
                              ></span>
                              <span>{toAcc.name}</span>
                            </>
                          )}
                        </span>
                        {tx.notes && (
                          <>
                            <span>&bull;</span>
                            <span className="italic text-slate-400">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Montos y Acciones */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 pl-12 sm:pl-0">
                    <div className="text-right">
                      <div
                        className={`text-base font-bold tabular-nums ${
                          isIncome ? 'text-emerald-400' : isExpense ? 'text-slate-100' : 'text-blue-400'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {fmt(tx.amount)}
                      </div>
                      {tx.installmentsCount && tx.installmentsCount > 1 && tx.installmentAmount && (
                        <div className="text-xs text-indigo-300 font-medium tabular-nums">
                          {fmt(tx.installmentAmount)} por mes
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar movimiento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
