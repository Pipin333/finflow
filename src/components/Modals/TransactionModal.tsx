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
import { getReceiptImage } from '../../utils/receiptStorage'

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
  const [validationError, setValidationError] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValidationError(null)
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
      if (transactionToEdit.receiptImage) {
        getReceiptImage(transactionToEdit.receiptImage).then(img => {
          setReceiptImage(img || null)
        })
      } else {
        setReceiptImage(null)
      }
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
      setValidationError(null)
      const compressedDataUrl = await compressReceiptImage(file)
      setReceiptImage(compressedDataUrl)
    } catch (err) {
      setValidationError('Error al procesar la foto de la boleta: ' + (err as Error).message)
    } finally {
      setIsCompressing(false)
      e.target.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parsedAmount <= 0) {
      setValidationError('Por favor ingresa un monto válido mayor a cero.')
      return
    }
    if (!description.trim()) {
      setValidationError('Por favor ingresa un concepto o descripción.')
      return
    }
    if (!accountId) {
      setValidationError('Por favor selecciona una cuenta.')
      return
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setValidationError('Selecciona una cuenta de destino diferente a la de origen.')
      return
    }

    setValidationError(null)

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
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="tx-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ps-bg/85 backdrop-blur-sm overflow-y-auto"
      >
        <div className="bg-ps-surface border-2 border-ps-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
          {/* Cabecera del Modal */}
          <div className="flex items-center justify-between p-5 border-b border-ps-border/70">
            <h2 id="tx-modal-title" className="text-base font-bold text-white font-mono">
              {transactionToEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar ventana de movimiento"
              className="p-1.5 text-ps-muted hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Tipo (Gasto / Ingreso / Transferencia) */}
          {!transactionToEdit && (
            <div className="grid grid-cols-3 p-3 gap-2 bg-ps-recessed border-b border-ps-border/70">
              <button
                type="button"
                onClick={() => {
                  setType('expense')
                  if (validationError) setValidationError(null)
                  const first = categories.find(c => c.type === 'expense')
                  if (first) setCategory(first.name)
                }}
                className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-danger transition-all ${
                  type === 'expense'
                    ? 'bg-ps-surface text-ps-danger border border-ps-danger/60'
                    : 'text-ps-muted hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Gasto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('income')
                  if (validationError) setValidationError(null)
                  const first = categories.find(c => c.type === 'income')
                  if (first) setCategory(first.name)
                }}
                className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-all ${
                  type === 'income'
                    ? 'bg-ps-surface text-ps-accent border border-ps-accent/60'
                    : 'text-ps-muted hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Ingreso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('transfer')
                  if (validationError) setValidationError(null)
                }}
                className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all ${
                  type === 'transfer'
                    ? 'bg-ps-surface text-white border border-ps-borderLight'
                    : 'text-ps-muted hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Transferir</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {validationError && (
              <div role="alert" className="p-3 bg-ps-recessed border border-ps-danger rounded-xl text-xs text-ps-danger font-mono font-medium">
                {validationError}
              </div>
            )}

            {/* Campo de Monto */}
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-mono font-semibold text-ps-muted uppercase tracking-wider mb-1">
                Monto ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ps-muted font-bold text-lg font-mono">{currency}</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value)
                    if (validationError) setValidationError(null)
                  }}
                  className="w-full bg-ps-recessed border border-ps-border rounded-xl pl-10 pr-4 py-3 text-xl font-bold font-mono text-white tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Concepto / Descripcion */}
            <div>
              <label htmlFor="tx-description" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                Concepto / Descripcion
              </label>
              <input
                id="tx-description"
                type="text"
                required
                placeholder="Ej: Supermercado, Almuerzo, Monitor, etc..."
                value={description}
                onChange={e => {
                  setDescription(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent transition-colors font-mono"
              />
            </div>

            {/* Fecha y Cuenta Origen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="tx-date" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                  Fecha
                </label>
                <input
                  id="tx-date"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent transition-colors font-mono"
                />
              </div>

              <div>
                <label htmlFor="tx-account" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                  {type === 'income' ? 'Cuenta de Deposito' : 'Cuenta de Origen'}
                </label>
                <select
                  id="tx-account"
                  value={accountId}
                  onChange={e => {
                    setAccountId(e.target.value)
                    if (validationError) setValidationError(null)
                  }}
                  className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
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
                <label htmlFor="tx-to-account" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                  Cuenta de Destino
                </label>
                <select
                  id="tx-to-account"
                  value={toAccountId}
                  onChange={e => {
                    setToAccountId(e.target.value)
                    if (validationError) setValidationError(null)
                  }}
                  className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Categoria */}
            {type !== 'transfer' && (
              <div>
                <label htmlFor="tx-category" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                  Categoria
                </label>
                <select
                  id="tx-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
                >
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SECCION: Tarjeta de Credito y Cuotas */}
            {type === 'expense' && isCredit && (
              <div className="p-4 bg-ps-recessed border border-ps-border rounded-xl space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ps-accent uppercase tracking-wider">
                    Condiciones de Tarjeta y Cuotas
                  </span>
                  <span className="text-[10px] text-ps-muted">
                    {selectedAccount?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tx-installments-count" className="block text-xs text-ps-muted mb-1">
                      Cantidad de Cuotas
                    </label>
                    <select
                      id="tx-installments-count"
                      value={installmentsCount}
                      onChange={e => setInstallmentsCount(Number(e.target.value))}
                      className="w-full bg-ps-surface border border-ps-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
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
                      <span className="block text-xs text-ps-muted mb-1">
                        Convenio de Cuotas
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsInterestFree(!isInterestFree)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-all ${
                          isInterestFree
                            ? 'bg-ps-surface text-ps-accent border-ps-accent'
                            : 'bg-ps-surface text-ps-warning border-ps-warning'
                        }`}
                      >
                        {isInterestFree ? '✓ Sin Interes' : 'Con Recargo'}
                      </button>
                    </div>
                  )}
                </div>

                {installmentsCount > 1 && !isInterestFree && (
                  <div>
                    <label htmlFor="tx-surcharge-rate" className="block text-xs text-ps-muted mb-1">
                      Recargo Financiero Total (%)
                    </label>
                    <input
                      id="tx-surcharge-rate"
                      type="number"
                      step="any"
                      value={surchargeRate}
                      onChange={e => setSurchargeRate(e.target.value)}
                      placeholder="Ej: 15"
                      className="w-full bg-ps-surface border border-ps-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                    />
                  </div>
                )}

                {installmentsCount > 1 && (
                  <div className="bg-ps-surface p-2.5 rounded-lg border border-ps-border text-xs flex items-center justify-between">
                    <span className="text-ps-muted">Pagaras por mes:</span>
                    <span className="font-bold text-ps-accent text-sm tabular-nums">
                      {formatCurrency(monthlyInstallment, currency)} x {installmentsCount} meses
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* SECCION: Foto de Boleta / Comprobante */}
            <div className="p-3.5 bg-ps-recessed border border-ps-border rounded-xl space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-ps-accent" />
                  <span>Foto de Boleta / Comprobante</span>
                </span>
                {isCompressing && (
                  <span className="text-[11px] text-ps-accent flex items-center space-x-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizando imagen...</span>
                  </span>
                )}
              </div>

              {receiptImage ? (
                <div className="flex items-center justify-between p-2.5 bg-ps-surface rounded-xl border border-ps-border">
                  <div className="flex items-center space-x-3">
                    <div 
                      onClick={() => setPreviewEnlarged(true)}
                      className="w-12 h-12 rounded-lg bg-ps-recessed overflow-hidden border border-ps-border cursor-pointer relative group flex-shrink-0"
                    >
                      <img src={receiptImage} alt="Boleta" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Boleta Adjunta</div>
                      <button
                        type="button"
                        onClick={() => setPreviewEnlarged(true)}
                        className="text-[11px] text-ps-accent hover:text-white flex items-center space-x-1 mt-0.5 focus:outline-none focus-visible:underline"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver foto completa</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    aria-label="Eliminar foto de boleta"
                    className="p-1.5 text-ps-muted hover:text-ps-danger bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-danger transition-colors"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Boton Camara */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-ps-surface hover:bg-ps-recessed border border-ps-border rounded-xl text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
                  >
                    <Camera className="w-4 h-4 text-ps-accent" />
                    <span>Tomar Foto</span>
                  </button>

                  {/* Boton Archivo */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-ps-surface hover:bg-ps-recessed border border-ps-border rounded-xl text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-white" />
                    <span>Subir Archivo</span>
                  </button>
                </div>
              )}

              {/* Inputs ocultos de archivo y camara */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Tomar foto con la camara"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Seleccionar archivo de imagen"
              />
            </div>

            {/* Notas opcionales */}
            <div>
              <label htmlFor="tx-notes" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
                Notas Adicionales (Opcional)
              </label>
              <input
                id="tx-notes"
                type="text"
                placeholder="Detalle o etiqueta..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent transition-colors font-mono"
              />
            </div>

            {/* Botones de accion */}
            <div className="pt-2 flex items-center justify-end space-x-3 font-mono">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-ps-muted hover:text-white rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCompressing}
                className="px-5 py-2.5 text-xs font-bold text-ps-bg bg-ps-accent hover:bg-white disabled:opacity-50 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all shadow-sm"
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
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa ampliada de boleta"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-ps-surface border-2 border-ps-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3.5 border-b border-ps-border bg-ps-surface">
              <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-ps-accent" />
                <span>Comprobante Adjunto</span>
              </span>
              <button
                onClick={() => setPreviewEnlarged(false)}
                aria-label="Cerrar vista previa ampliada"
                className="p-1.5 text-ps-muted hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img src={receiptImage} alt="Comprobante ampliado" className="max-w-full max-h-[75vh] object-contain rounded-lg border border-ps-border" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
