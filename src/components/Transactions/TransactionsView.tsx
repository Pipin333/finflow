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
  ChevronDown, 
  Receipt, 
  X 
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Transaction, TransactionType } from '../../types'
import { formatCurrency } from '../../utils/financeCalculators'
import { getReceiptImage } from '../../utils/receiptStorage'

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

  // Visor Lightbox de boleta
  const [viewingReceiptImage, setViewingReceiptImage] = useState<string | null>(null)

  const handleOpenReceipt = async (receiptRef: string) => {
    const dataUrl = await getReceiptImage(receiptRef)
    if (dataUrl) {
      setViewingReceiptImage(dataUrl)
    }
  }

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
    <>
      <div className="space-y-6 pb-20 md:pb-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">Movimientos y Transacciones</h1>
            <p className="text-xs text-ps-muted mt-1">
              Consulta, filtra y clasifica cada ingreso, gasto, cuota y boleta adjunta
            </p>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-ps-accent hover:bg-white text-ps-bg font-bold font-mono rounded-xl text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-ps-surface border border-ps-border rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-ps-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por concepto o detalle..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-white placeholder-ps-muted/60 focus:outline-none focus:border-ps-accent focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors font-mono"
              />
            </div>

            {/* Tipo de Movimiento */}
            <div>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-ps-accent focus-visible:ring-2 focus-visible:ring-ps-accent font-mono"
              >
                <option value="all">Todos los tipos (Ingresos / Gastos / Transf)</option>
                <option value="income">Solo Ingresos</option>
                <option value="expense">Solo Gastos</option>
                <option value="transfer">Solo Transferencias</option>
              </select>
            </div>

            {/* Cuenta */}
            <div>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-ps-accent focus-visible:ring-2 focus-visible:ring-ps-accent font-mono"
              >
                <option value="all">Todas las cuentas</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-ps-accent focus-visible:ring-2 focus-visible:ring-ps-accent font-mono"
              >
                <option value="all">Todas las categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.type === 'income' ? 'Ingreso' : 'Gasto'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle para ver solo el mes actual o historico completo */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ps-border/70 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filterMonth"
                checked={filterByMonthOnly}
                onChange={e => setFilterByMonthOnly(e.target.checked)}
                className="rounded bg-ps-recessed border-ps-border text-ps-accent focus:ring-ps-accent focus:ring-offset-0"
              />
              <label htmlFor="filterMonth" className="text-white font-medium cursor-pointer">
                Limitar a periodo activo ({selectedMonth})
              </label>
            </div>

            <div className="flex items-center space-x-4 text-ps-muted">
              <span>Resultados: <strong className="text-white">{filteredTransactions.length}</strong></span>
              <span>Ingresos: <strong className="text-ps-accent tabular-nums">{fmt(totals.income)}</strong></span>
              <span>Gastos: <strong className="text-ps-danger tabular-nums">{fmt(totals.expense)}</strong></span>
            </div>
          </div>
        </div>

        {/* Lista de Movimientos */}
        <div className="bg-ps-surface border border-ps-border rounded-2xl overflow-hidden shadow-sm">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-ps-muted font-mono text-xs">
              No se encontraron movimientos con los filtros seleccionados.
            </div>
          ) : (
            <div className="divide-y divide-ps-border/70">
              {filteredTransactions.map(tx => {
                const fromAcc = accounts.find(a => a.id === tx.accountId)
                const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null
                const isIncome = tx.type === 'income'
                const isExpense = tx.type === 'expense'

                return (
                  <div
                    key={tx.id}
                    className="p-4 hover:bg-ps-recessed/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Icono de tipo */}
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 border ${
                          isIncome
                            ? 'bg-ps-recessed text-ps-accent border-ps-accent/40'
                            : isExpense
                            ? 'bg-ps-recessed text-ps-danger border-ps-danger/40'
                            : 'bg-ps-recessed text-white border-ps-border'
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
                          <span className="font-semibold text-sm text-white">{tx.description}</span>
                          {tx.installmentsCount && tx.installmentsCount > 1 && (
                            <span className="text-[11px] font-mono font-bold bg-ps-recessed text-ps-accent border border-ps-accent/50 px-2 py-0.5 rounded-full">
                              {tx.installmentsCount} cuotas {tx.isInterestFree ? 'sin interes' : ''}
                            </span>
                          )}
                          {tx.receiptImage && (
                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(tx.receiptImage!)}
                              className="text-[10px] font-mono font-bold bg-ps-recessed hover:bg-ps-accent hover:text-ps-bg text-ps-accent border border-ps-accent/50 px-2 py-0.5 rounded-full inline-flex items-center space-x-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                              title="Ver foto de la boleta"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Boleta</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ps-muted font-mono">
                          <span className="text-white">{tx.date}</span>
                          <span>&bull;</span>
                          <span className="font-medium text-ps-accent">{tx.category}</span>
                          <span>&bull;</span>
                          <span className="flex items-center space-x-1">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: fromAcc?.color || '#94a3b8' }}
                            ></span>
                            <span className="text-white">{fromAcc?.name}</span>
                            {toAcc && (
                              <>
                                <span className="text-ps-muted">&rarr;</span>
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: toAcc?.color || '#94a3b8' }}
                                ></span>
                                <span className="text-white">{toAcc.name}</span>
                              </>
                            )}
                          </span>
                          {tx.notes && (
                            <>
                              <span>&bull;</span>
                              <span className="italic text-ps-muted">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Montos y Acciones */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 pl-12 sm:pl-0">
                      <div className="text-right">
                        <div
                          className={`text-base font-bold font-mono tabular-nums ${
                            isIncome ? 'text-ps-accent' : isExpense ? 'text-white' : 'text-ps-muted'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {fmt(tx.amount)}
                        </div>
                        {tx.installmentsCount && tx.installmentsCount > 1 && tx.installmentAmount && (
                          <div className="text-xs text-ps-muted font-mono tabular-nums">
                            {fmt(tx.installmentAmount)} por mes
                          </div>
                        )}
                      </div>

                      {/* Boton rapido ver boleta si existe */}
                      {tx.receiptImage && (
                        <button
                          onClick={() => handleOpenReceipt(tx.receiptImage!)}
                          className="p-1.5 text-ps-accent hover:text-white bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                          title="Ver boleta adjunta"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 text-ps-muted hover:text-white hover:bg-ps-recessed rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                          title="Editar movimiento"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 text-ps-muted hover:text-ps-danger hover:bg-ps-recessed rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-danger"
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

      {/* Lightbox Modal para visualizar boletas guardadas */}
      {viewingReceiptImage && (
        <div 
          onClick={() => setViewingReceiptImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-ps-surface border-2 border-ps-border p-4 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-ps-border">
              <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-ps-accent" />
                <span>Comprobante / Boleta Adjunta</span>
              </span>
              <button
                onClick={() => setViewingReceiptImage(null)}
                className="p-1.5 text-ps-muted hover:text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 overflow-auto max-h-[75vh] flex items-center justify-center">
              <img 
                src={viewingReceiptImage} 
                alt="Boleta" 
                className="max-h-[72vh] w-auto object-contain rounded-xl shadow-md border border-ps-border" 
              />
            </div>

            <div className="pt-2 border-t border-ps-border flex justify-between items-center text-xs text-ps-muted font-mono">
              <span>Guardada localmente</span>
              <a 
                href={viewingReceiptImage} 
                download="boleta.jpg" 
                className="text-ps-accent hover:text-white font-bold"
              >
                Descargar imagen
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
