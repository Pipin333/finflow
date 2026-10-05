import React, { useState, useEffect } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, AlertCircle } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Transaction, TransactionType } from '../../types'
import { isCreditAccount, formatCurrency } from '../../utils/financeCalculators'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: TransactionType
  transactionToEdit?: Transaction | null
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  transactionToEdit,
}) => {
  const { accounts, categories, addTransaction, editTransaction } = useFinance()

  const [type, setType] = useState<TransactionType>(initialType)
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState<string>('')
  const [toAccountId, setToAccountId] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Cuotas y convenios de tarjeta
  const [installmentsCount, setInstallmentsCount] = useState<number>(1)
  const [isInterestFree, setIsInterestFree] = useState<boolean>(true)
  const [surchargeRate, setSurchargeRate] = useState<string>('0')

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type)
      setAmount(String(transactionToEdit.amount))
      setDescription(transactionToEdit.description)
      setDate(transactionToEdit.date)
      setAccountId(transactionToEdit.accountId)
      setToAccountId(transactionToEdit.toAccountId || '')
      setCategory(transactionToEdit.category)
      setNotes(transactionToEdit.notes || '')
      setInstallmentsCount(transactionToEdit.installmentsCount || 1)
      setIsInterestFree(transactionToEdit.isInterestFree ?? true)
    } else {
      setType(initialType)
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setAccountId(accounts[0]?.id || '')
      setToAccountId(accounts[1]?.id || '')
      const firstCat = categories.find(c => c.type === (initialType === 'income' ? 'income' : 'expense'))
      setCategory(firstCat?.name || '')
      setNotes('')
      setInstallmentsCount(1)
      setIsInterestFree(true)
      setSurchargeRate('0')
    }
  }, [transactionToEdit, initialType, isOpen, accounts, categories])

  if (!isOpen) return null

  const selectedAccount = accounts.find(a => a.id === accountId)
  const isCredit = selectedAccount ? isCreditAccount(selectedAccount.type) : false

  // Cálculo en vivo de cuotas
  const parsedAmount = parseFloat(amount) || 0
  const parsedSurcharge = parseFloat(surchargeRate) || 0
  const totalWithInterest = isInterestFree ? parsedAmount : parsedAmount * (1 + parsedSurcharge / 100)
  const monthlyInstallment = installmentsCount > 0 ? totalWithInterest / installmentsCount : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parsedAmount <= 0) {
      alert('Por favor ingresa un monto válido.')
      return
    }
    if (!description.trim()) {
      alert('Por favor ingresa un concepto o descripción.')
      return
    }
    if (!accountId) {
      alert('Por favor selecciona una cuenta.')
      return
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      alert('Selecciona una cuenta de destino diferente a la de origen.')
      return
    }

    const txData: Omit<Transaction, 'id'> = {
      type,
      amount: parsedAmount,
      description: description.trim(),
      date,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      category: type === 'transfer' ? 'Transferencia' : category,
      notes: notes.trim() || undefined,
      installmentsCount: type === 'expense' && isCredit ? installmentsCount : 1,
      isInterestFree: type === 'expense' && isCredit ? isInterestFree : undefined,
      installmentAmount: type === 'expense' && isCredit && installmentsCount > 1 ? monthlyInstallment : undefined,
      totalWithInterest: type === 'expense' && isCredit && !isInterestFree ? totalWithInterest : undefined,
    }

    if (transactionToEdit) {
      editTransaction({ ...txData, id: transactionToEdit.id })
    } else {
      addTransaction(txData)
    }

    onClose()
  }

  // Filtrar categorías según tipo
  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {transactionToEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Tipo (Gasto / Ingreso / Transferencia) */}
        {!transactionToEdit && (
          <div className="grid grid-cols-3 p-3 gap-2 bg-slate-950 border-b border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense')
                const first = categories.find(c => c.type === 'expense')
                if (first) setCategory(first.name)
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Gasto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income')
                const first = categories.find(c => c.type === 'income')
                if (first) setCategory(first.name)
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Ingreso</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transferir</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Campo de Monto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Monto ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xl font-bold text-white tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto / Descripción
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Supermercado, Sueldo mensual, Monitor 4K..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Fecha y Cuenta Origen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'income' ? 'Cuenta de Depósito' : 'Cuenta de Origen'}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === 'credit' ? 'Tarjeta' : 'Saldo'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Si es Transferencia: Cuenta Destino */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cuenta de Destino
              </label>
              <select
                value={toAccountId}
                onChange={e => setToAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoría (solo para Gasto o Ingreso) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SECCIÓN ESPECIAL: Tarjeta de Crédito y Cuotas */}
          {type === 'expense' && isCredit && (
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Condiciones de Tarjeta & Cuotas
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedAccount?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Cantidad de Cuotas
                  </label>
                  <select
                    value={installmentsCount}
                    onChange={e => setInstallmentsCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value={1}>1 Pago (Sin cuotas)</option>
                    <option value={2}>2 Cuotas</option>
                    <option value={3}>3 Cuotas</option>
                    <option value={6}>6 Cuotas</option>
                    <option value={9}>9 Cuotas</option>
                    <option value={12}>12 Cuotas</option>
                    <option value={18}>18 Cuotas</option>
                    <option value={24}>24 Cuotas</option>
                  </select>
                </div>

                {installmentsCount > 1 && (
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Convenio de Cuotas
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsInterestFree(!isInterestFree)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        isInterestFree
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isInterestFree ? '✓ Sin Interés' : 'Con Recargo Financiero'}
                    </button>
                  </div>
                )}
              </div>

              {/* Si tiene recargo */}
              {installmentsCount > 1 && !isInterestFree && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Recargo Financiero Total (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={surchargeRate}
                    onChange={e => setSurchargeRate(e.target.value)}
                    placeholder="Ej: 15"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              )}

              {/* Resumen en vivo de la cuota */}
              {installmentsCount > 1 && (
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-indigo-500/20 text-xs flex items-center justify-between">
                  <span className="text-slate-300">Pagarás por mes:</span>
                  <span className="font-bold text-indigo-300 text-sm tabular-nums">
                    {formatCurrency(monthlyInstallment)} x {installmentsCount} meses
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notas opcionales */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalle o etiqueta..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              {transactionToEdit ? 'Actualizar' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
