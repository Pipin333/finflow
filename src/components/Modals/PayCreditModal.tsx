import React, { useState, useEffect } from 'react'
import { X, CreditCard, Wallet, CheckCircle, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useFinance } from '../../context/FinanceContext'
import { 
  isCreditAccount, 
  getCreditCardStatement, 
  getAccountRealBalance, 
  formatCurrency 
} from '../../utils/financeCalculators'

interface PayCreditModalProps {
  isOpen: boolean
  onClose: () => void
  initialCardId?: string
}

export const PayCreditModal: React.FC<PayCreditModalProps> = ({
  isOpen,
  onClose,
  initialCardId,
}) => {
  const { accounts, transactions, payCreditCard } = useFinance()

  const creditCards = accounts.filter(a => isCreditAccount(a.type))
  const liquidAccounts = accounts.filter(a => !isCreditAccount(a.type))

  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [selectedFromId, setSelectedFromId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [notes, setNotes] = useState<string>('Liquidación mensual resumen de tarjeta')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setValidationError(null)
    if (initialCardId && creditCards.some(c => c.id === initialCardId)) {
      setSelectedCardId(initialCardId)
    } else if (creditCards.length > 0) {
      setSelectedCardId(creditCards[0].id)
    }

    if (liquidAccounts.length > 0) {
      setSelectedFromId(liquidAccounts[0].id)
    }
  }, [initialCardId, creditCards.length, liquidAccounts.length, isOpen])

  if (!isOpen) return null

  const targetCard = creditCards.find(c => c.id === selectedCardId)
  const fromAccount = liquidAccounts.find(a => a.id === selectedFromId)

  const cardSummary = targetCard ? getCreditCardStatement(targetCard, transactions) : null
  const fromBalance = fromAccount ? getAccountRealBalance(fromAccount, transactions) : 0

  const handleQuickAmount = (val: number) => {
    setAmount(String(val))
    if (validationError) setValidationError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount) || 0
    if (parsedAmount <= 0) {
      setValidationError('Por favor ingresa un monto mayor a cero.')
      return
    }
    if (!selectedCardId || !selectedFromId) {
      setValidationError('Por favor selecciona la tarjeta a pagar y la cuenta de origen.')
      return
    }

    setValidationError(null)
    payCreditCard(selectedFromId, selectedCardId, parsedAmount, notes)

    // Lanzar confeti respetando preferencias vestibulares de movimiento reducido
    try {
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    } catch {
      // Ignorar si no está disponible
    }

    onClose()
  }

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="pay-credit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h2 id="pay-credit-modal-title" className="text-base font-bold text-white">
              Pagar Tarjeta de Crédito
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de pago de tarjeta"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div role="alert" className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
              {validationError}
            </div>
          )}

          {/* Tarjeta a Pagar */}
          <div>
            <label htmlFor="pay-card-select" className="block text-xs font-semibold text-slate-300 mb-1">
              Tarjeta o Línea de Crédito a Amortizar
            </label>
            <select
              id="pay-card-select"
              value={selectedCardId}
              onChange={e => {
                setSelectedCardId(e.target.value)
                if (validationError) setValidationError(null)
                const card = creditCards.find(c => c.id === e.target.value)
                if (card) {
                  const s = getCreditCardStatement(card, transactions)
                  setAmount(String(s.statementTotalToPay || s.totalDebt))
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:border-indigo-500"
            >
              {creditCards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de la tarjeta */}
          {cardSummary && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Resumen próximo a pagar:</span>
                <strong className="text-rose-400 tabular-nums">
                  {formatCurrency(cardSummary.statementTotalToPay)}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deuda Total acumulada:</span>
                <strong className="text-slate-200 tabular-nums">
                  {formatCurrency(cardSummary.totalDebt)}
                </strong>
              </div>

              {/* Botones de montos sugeridos */}
              <div className="flex space-x-2 pt-2 border-t border-slate-800/80">
                {cardSummary.statementTotalToPay > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(cardSummary.statementTotalToPay)}
                    className="flex-1 py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Pagar Resumen ({formatCurrency(cardSummary.statementTotalToPay)})
                  </button>
                )}
                {cardSummary.totalDebt > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(cardSummary.totalDebt)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Pagar Todo ({formatCurrency(cardSummary.totalDebt)})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cuenta Pagadora */}
          <div>
            <label htmlFor="pay-from-select" className="block text-xs font-semibold text-slate-300 mb-1">
              Pagar desde Cuenta Líquida
            </label>
            <select
              id="pay-from-select"
              value={selectedFromId}
              onChange={e => {
                setSelectedFromId(e.target.value)
                if (validationError) setValidationError(null)
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:border-indigo-500"
            >
              {liquidAccounts.map(a => {
                const bal = getAccountRealBalance(a, transactions)
                return (
                  <option key={a.id} value={a.id}>
                    {a.name} (Disponible: {formatCurrency(bal)})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Monto a transferir/pagar */}
          <div>
            <label htmlFor="pay-amount-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Monto del Pago ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                id="pay-amount-input"
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xl font-bold text-white tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Pago de Tarjeta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
