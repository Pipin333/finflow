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
  const { accounts, transactions, payCreditCard, currency } = useFinance()

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ps-bg/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-ps-surface border-2 border-ps-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ps-border/70">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-ps-accent" />
            <h2 id="pay-credit-modal-title" className="text-base font-bold text-white font-mono">
              Pagar Tarjeta de Credito
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de pago de tarjeta"
            className="p-1.5 text-ps-muted hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div role="alert" className="p-3 bg-ps-recessed border border-ps-danger rounded-xl text-xs text-ps-danger font-mono font-medium">
              {validationError}
            </div>
          )}

          {/* Tarjeta a Pagar */}
          <div>
            <label htmlFor="pay-card-select" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              Tarjeta o Linea de Credito a Amortizar
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
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
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
            <div className="bg-ps-recessed p-3.5 rounded-xl border border-ps-border/70 text-xs font-mono space-y-2">
              <div className="flex justify-between text-ps-muted">
                <span>Resumen proximo a pagar:</span>
                <strong className="text-ps-warning tabular-nums">
                  {formatCurrency(cardSummary.statementTotalToPay)}
                </strong>
              </div>
              <div className="flex justify-between text-ps-muted">
                <span>Deuda Total acumulada:</span>
                <strong className="text-white tabular-nums">
                  {formatCurrency(cardSummary.totalDebt)}
                </strong>
              </div>

              {/* Botones de montos sugeridos */}
              <div className="flex space-x-2 pt-2 border-t border-ps-border/70">
                {cardSummary.statementTotalToPay > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(cardSummary.statementTotalToPay)}
                    className="flex-1 py-1.5 px-2 bg-ps-surface hover:bg-ps-recessed text-ps-accent border border-ps-accent/50 rounded-lg text-[11px] font-mono font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                  >
                    Pagar Resumen ({formatCurrency(cardSummary.statementTotalToPay)})
                  </button>
                )}
                {cardSummary.totalDebt > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(cardSummary.totalDebt)}
                    className="flex-1 py-1.5 px-2 bg-ps-surface hover:bg-ps-recessed text-white border border-ps-border rounded-lg text-[11px] font-mono font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                  >
                    Pagar Todo ({formatCurrency(cardSummary.totalDebt)})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cuenta Pagadora */}
          <div>
            <label htmlFor="pay-from-select" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              Pagar desde Cuenta Liquida
            </label>
            <select
              id="pay-from-select"
              value={selectedFromId}
              onChange={e => {
                setSelectedFromId(e.target.value)
                if (validationError) setValidationError(null)
              }}
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
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
            <label htmlFor="pay-amount-input" className="block text-xs font-mono font-semibold text-ps-muted uppercase tracking-wider mb-1">
              Monto del Pago ({currency})
            </label>
            <div className="flex rounded-xl overflow-hidden border border-ps-border bg-ps-recessed focus-within:ring-2 focus-within:ring-ps-accent focus-within:border-ps-accent transition-all">
              <span className="inline-flex items-center px-3.5 bg-ps-surface border-r border-ps-border text-ps-muted font-bold text-sm font-mono select-none">
                {currency}
              </span>
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
                className="w-full bg-transparent px-4 py-3 text-xl font-bold font-mono text-white tabular-nums focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-semibold text-ps-muted hover:text-white rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-mono font-bold text-ps-bg bg-ps-accent hover:bg-white rounded-xl transition-all shadow-sm flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
