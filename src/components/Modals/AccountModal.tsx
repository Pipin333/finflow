import React, { useState, useEffect } from 'react'
import { X, CreditCard, Wallet } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Account, AccountType } from '../../types'
import { isCreditAccount } from '../../utils/financeCalculators'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  accountToEdit?: Account | null
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, editAccount } = useFinance()

  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [balance, setBalance] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [statementClosingDay, setStatementClosingDay] = useState<number>(20)
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5)
  const [color, setColor] = useState('#3b82f6')
  const [institution, setInstitution] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setValidationError(null)
    if (accountToEdit) {
      setName(accountToEdit.name)
      setType(accountToEdit.type)
      setBalance(String(accountToEdit.balance || 0))
      setCreditLimit(accountToEdit.creditLimit ? String(accountToEdit.creditLimit) : '')
      setStatementClosingDay(accountToEdit.statementClosingDay || 20)
      setPaymentDueDay(accountToEdit.paymentDueDay || 5)
      setColor(accountToEdit.color || '#3b82f6')
      setInstitution(accountToEdit.institution || '')
    } else {
      setName('')
      setType('checking')
      setBalance('0')
      setCreditLimit('1000000')
      setStatementClosingDay(20)
      setPaymentDueDay(5)
      setColor('#3b82f6')
      setInstitution('')
    }
  }, [accountToEdit, isOpen])

  if (!isOpen) return null

  const isCredit = isCreditAccount(type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError('Por favor ingresa un nombre para la cuenta o tarjeta.')
      return
    }

    setValidationError(null)

    const accData: Omit<Account, 'id'> = {
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      creditLimit: isCredit ? parseFloat(creditLimit) || 0 : undefined,
      statementClosingDay: isCredit ? statementClosingDay : undefined,
      paymentDueDay: isCredit ? paymentDueDay : undefined,
      color,
      currency: '$',
      institution: institution.trim() || undefined,
    }

    if (accountToEdit) {
      editAccount({ ...accData, id: accountToEdit.id })
    } else {
      addAccount(accData)
    }

    onClose()
  }

  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6']

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ps-bg/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-ps-surface border-2 border-ps-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ps-border/70">
          <h2 id="account-modal-title" className="text-base font-bold text-white font-mono">
            {accountToEdit ? 'Editar Cuenta o Tarjeta' : 'Nueva Cuenta o Tarjeta'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana de cuenta"
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

          {/* Nombre */}
          <div>
            <label htmlFor="account-name" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              Nombre de la Cuenta / Tarjeta
            </label>
            <input
              id="account-name"
              type="text"
              required
              placeholder="Ej: Visa Signature, Cuenta Corriente Banco, Efectivo..."
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (validationError) setValidationError(null)
              }}
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
            />
          </div>

          {/* Tipo de Cuenta */}
          <div>
            <label htmlFor="account-type" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              Tipo
            </label>
            <select
              id="account-type"
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
            >
              <option value="checking">Cuenta Corriente (Bancaria)</option>
              <option value="savings">Caja de Ahorro / Inversion</option>
              <option value="cash">Efectivo / Billetera Fisica</option>
              <option value="credit">Tarjeta de Credito</option>
              <option value="credit_line">Linea de Credito</option>
            </select>
          </div>

          {/* Saldo Inicial */}
          <div>
            <label htmlFor="account-balance" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              {isCredit ? 'Deuda Inicial Base ($)' : 'Saldo Inicial Disponible ($)'}
            </label>
            <input
              id="account-balance"
              type="number"
              step="any"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
            />
          </div>

          {/* Configuracion de Tarjetas de Credito */}
          {isCredit && (
            <div className="p-4 bg-ps-recessed border border-ps-border rounded-xl space-y-3 font-mono">
              <span className="text-xs font-bold text-ps-accent uppercase tracking-wider block">
                Configuracion del Ciclo de la Tarjeta
              </span>

              <div>
                <label htmlFor="account-credit-limit" className="block text-xs text-ps-muted mb-1">
                  Limite de Credito Total ($)
                </label>
                <input
                  id="account-credit-limit"
                  type="number"
                  step="any"
                  value={creditLimit}
                  onChange={e => setCreditLimit(e.target.value)}
                  placeholder="Ej: 1500000"
                  className="w-full bg-ps-surface border border-ps-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="account-closing-day" className="block text-xs text-ps-muted mb-1">
                    Dia de Cierre (Corte)
                  </label>
                  <input
                    id="account-closing-day"
                    type="number"
                    min={1}
                    max={31}
                    value={statementClosingDay}
                    onChange={e => setStatementClosingDay(Number(e.target.value))}
                    className="w-full bg-ps-surface border border-ps-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                  />
                  <span className="text-[10px] text-ps-muted mt-0.5 block">Dia de fin de ciclo</span>
                </div>

                <div>
                  <label htmlFor="account-due-day" className="block text-xs text-ps-muted mb-1">
                    Dia de Vencimiento (Pago)
                  </label>
                  <input
                    id="account-due-day"
                    type="number"
                    min={1}
                    max={31}
                    value={paymentDueDay}
                    onChange={e => setPaymentDueDay(Number(e.target.value))}
                    className="w-full bg-ps-surface border border-ps-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                  />
                  <span className="text-[10px] text-ps-muted mt-0.5 block">Dia limite para pagar</span>
                </div>
              </div>
            </div>
          )}

          {/* Institucion o Banco */}
          <div>
            <label htmlFor="account-institution" className="block text-xs font-mono font-semibold text-ps-muted mb-1">
              Institucion / Banco Emisor (Opcional)
            </label>
            <input
              id="account-institution"
              type="text"
              placeholder="Ej: Santander, BBVA, Banco de Chile..."
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full bg-ps-recessed border border-ps-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent focus:border-ps-accent font-mono"
            />
          </div>

          {/* Selector de Color */}
          <div>
            <label className="block text-xs font-mono font-semibold text-ps-muted mb-2">
              Color Distintivo
            </label>
            <div className="flex items-center space-x-2">
              {palette.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-ps-surface' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ps-muted hover:text-white rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-ps-bg bg-ps-accent hover:bg-white rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {accountToEdit ? 'Actualizar' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
