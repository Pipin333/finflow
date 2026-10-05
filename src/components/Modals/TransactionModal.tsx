import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Eye, 
  Loader2, 
  Receipt 
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Transaction, TransactionType } from '../../types'
import { isCreditAccount, formatCurrency } from '../../utils/financeCalculators'
import { compressReceiptImage } from '../../utils/imageCompressor'

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
  const { accounts, categories, addTransaction, editTransaction, currency } = useFinance()

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

  // Foto de boleta o comprobante
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)
  const [previewEnlarged, setPreviewEnlarged] = useState<boolean>(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setReceiptImage(transactionToEdit.receiptImage || null)
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
      setReceiptImage(null)
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

  // Procesar archivo de imagen (cámara o galería)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsCompressing(true)
      const compressedDataUrl = await compressReceiptImage(file)
      setReceiptImage(compressedDataUrl)
    } catch (err) {
      alert('Error al procesar la foto de la boleta: ' + (err as Error).message)
    } finally {
      setIsCompressing(false)
      e.target.value = ''
    }
  }

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
      receiptImage: receiptImage || undefined,
    }

    if (transactionToEdit) {
      editTransaction({ ...txData, id: transactionToEdit.id })
    } else {
      addTransaction(txData)
    }

    onClose()
  }

  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'))

  return (
    <>
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Campo de Monto */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Monto ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">{currency}</span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-white tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
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
                placeholder="Ej: Supermercado, Almuerzo, Monitor, etc..."
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

            {/* Categoría */}
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

            {/* SECCIÓN: Tarjeta de Crédito y Cuotas */}
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
                        {isInterestFree ? '✓ Sin Interés' : 'Con Recargo'}
                      </button>
                    </div>
                  )}
                </div>

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

                {installmentsCount > 1 && (
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-indigo-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Pagarás por mes:</span>
                    <span className="font-bold text-indigo-300 text-sm tabular-nums">
                      {formatCurrency(monthlyInstallment, currency)} x {installmentsCount} meses
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN NUEVA: Foto de Boleta / Comprobante */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Foto de Boleta / Comprobante</span>
                </span>
                {isCompressing && (
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizando imagen...</span>
                  </span>
                )}
              </div>

              {receiptImage ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div 
                      onClick={() => setPreviewEnlarged(true)}
                      className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden border border-slate-700 cursor-pointer relative group flex-shrink-0"
                    >
                      <img src={receiptImage} alt="Boleta" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Boleta Adjunta</div>
                      <button
                        type="button"
                        onClick={() => setPreviewEnlarged(true)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver foto completa</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Botón Cámara */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Tomar Foto</span>
                  </button>

                  {/* Botón Archivo */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                    <span>Subir Archivo</span>
                  </button>
                </div>
              )}

              {/* Inputs ocultos de archivo y cámara */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

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
                disabled={isCompressing}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition-all shadow-sm"
              >
                {transactionToEdit ? 'Actualizar' : 'Guardar Movimiento'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Lightbox para ver boleta en grande */}
      {previewEnlarged && receiptImage && (
        <div 
          onClick={() => setPreviewEnlarged(false)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-2">
            <button
              onClick={() => setPreviewEnlarged(false)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={receiptImage} 
              alt="Boleta en tamaño completo" 
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl" 
            />
            <div className="text-center text-xs text-slate-400 py-2">
              Haz clic en cualquier lugar para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  )
}
