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

  useEffect(() => {
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
      alert('Por favor ingresa un nombre para la cuenta o tarjeta.')
      return
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {accountToEdit ? 'Editar Cuenta o Tarjeta' : 'Nueva Cuenta o Tarjeta'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de la Cuenta / Tarjeta
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Visa Signature, Cuenta Corriente Banco, Efectivo..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tipo de Cuenta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="checking">Cuenta Corriente (Bancaria)</option>
              <option value="savings">Caja de Ahorro / Inversión</option>
              <option value="cash">Efectivo / Billetera Física</option>
              <option value="credit">Tarjeta de Crédito</option>
              <option value="credit_line">Línea de Crédito</option>
            </select>
          </div>

          {/* Saldo Inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isCredit ? 'Deuda Inicial Base ($)' : 'Saldo Inicial Disponible ($)'}
            </label>
            <input
              type="number"
              step="any"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Configuración de Tarjetas de Crédito */}
          {isCredit && (
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                Configuración del Ciclo de la Tarjeta
              </span>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Límite de Crédito Total ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={creditLimit}
                  onChange={e => setCreditLimit(e.target.value)}
                  placeholder="Ej: 1500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Día de Cierre (Corte)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={statementClosingDay}
                    onChange={e => setStatementClosingDay(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Día de fin de ciclo</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Día de Vencimiento (Pago)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={paymentDueDay}
                    onChange={e => setPaymentDueDay(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Día límite para pagar</span>
                </div>
              </div>
            </div>
          )}

          {/* Institución o Banco */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Institución / Banco Emisor (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Santander, BBVA, Mercado Pago..."
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Selector de Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Color Distintivo
            </label>
            <div className="flex items-center space-x-2">
              {palette.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              {accountToEdit ? 'Actualizar' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
