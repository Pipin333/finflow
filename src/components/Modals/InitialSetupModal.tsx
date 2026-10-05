import React, { useState } from 'react'
import { 
  Sparkles, 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2,
  ShieldCheck,
  Coins
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Account, AccountType } from '../../types'

interface InitialSetupModalProps {
  isOpen: boolean
  onComplete: (accounts: Account[], currency: string) => void
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1)

  // Paso 1: Moneda
  const [currency, setCurrency] = useState<string>('$')
  const [customCurrency, setCustomCurrency] = useState<string>('')

  // Paso 2: Cuentas Líquidas
  const [liquidAccounts, setLiquidAccounts] = useState<Array<{
    id: string
    name: string
    type: AccountType
    balance: string
    institution: string
    color: string
  }>>([
    {
      id: 'acc-init-1',
      name: 'Cuenta Corriente / Banco',
      type: 'checking',
      balance: '0',
      institution: 'Mi Banco Principal',
      color: '#3b82f6',
    },
    {
      id: 'acc-init-2',
      name: 'Efectivo / Billetera',
      type: 'cash',
      balance: '0',
      institution: 'Billetera física',
      color: '#f59e0b',
    },
  ])

  // Paso 3: Tarjetas de Crédito
  const [hasCreditCard, setHasCreditCard] = useState<boolean>(true)
  const [creditCards, setCreditCards] = useState<Array<{
    id: string
    name: string
    creditLimit: string
    statementClosingDay: number
    paymentDueDay: number
    initialDebt: string
    institution: string
    color: string
  }>>([
    {
      id: 'card-init-1',
      name: 'Tarjeta de Crédito Principal',
      creditLimit: '1000000',
      statementClosingDay: 20,
      paymentDueDay: 5,
      initialDebt: '0',
      institution: 'Mi Banco',
      color: '#6366f1',
    },
  ])

  if (!isOpen) return null

  // Manejo de cuentas líquidas
  const handleAddLiquidAccount = () => {
    setLiquidAccounts(prev => [
      ...prev,
      {
        id: 'acc-init-' + Date.now(),
        name: 'Nueva Cuenta',
        type: 'checking',
        balance: '0',
        institution: '',
        color: '#10b981',
      },
    ])
  }

  const handleRemoveLiquidAccount = (id: string) => {
    setLiquidAccounts(prev => prev.filter(a => a.id !== id))
  }

  // Manejo de tarjetas
  const handleAddCreditCard = () => {
    setCreditCards(prev => [
      ...prev,
      {
        id: 'card-init-' + Date.now(),
        name: 'Segunda Tarjeta',
        creditLimit: '800000',
        statementClosingDay: 15,
        paymentDueDay: 28,
        initialDebt: '0',
        institution: '',
        color: '#ec4899',
      },
    ])
  }

  const handleRemoveCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id))
  }

  const handleFinish = () => {
    const finalCurrency = currency === 'custom' ? (customCurrency.trim() || '$') : currency

    const formattedAccounts: Account[] = []

    // Cuentas líquidas
    liquidAccounts.forEach(acc => {
      if (acc.name.trim()) {
        formattedAccounts.push({
          id: acc.id,
          name: acc.name.trim(),
          type: acc.type,
          balance: parseFloat(acc.balance) || 0,
          color: acc.color,
          currency: finalCurrency,
          institution: acc.institution.trim() || undefined,
        })
      }
    })

    // Tarjetas de crédito
    if (hasCreditCard) {
      creditCards.forEach(card => {
        if (card.name.trim()) {
          formattedAccounts.push({
            id: card.id,
            name: card.name.trim(),
            type: 'credit',
            balance: parseFloat(card.initialDebt) || 0,
            creditLimit: parseFloat(card.creditLimit) || 0,
            statementClosingDay: card.statementClosingDay,
            paymentDueDay: card.paymentDueDay,
            color: card.color,
            currency: finalCurrency,
            institution: card.institution.trim() || undefined,
          })
        }
      })
    }

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      })
    } catch (e) {}

    onComplete(formattedAccounts, finalCurrency)
  }

  const currencyOptions = [
    { label: '$ (Peso / Dólar estándar)', value: '$' },
    { label: 'CLP $ (Chile)', value: 'CLP $' },
    { label: 'ARS $ (Argentina)', value: 'ARS $' },
    { label: 'USD $ (Dólar USA)', value: 'USD $' },
    { label: 'EUR € (Euro)', value: '€' },
    { label: 'MXN $ (México)', value: 'MXN $' },
    { label: 'COP $ (Colombia)', value: 'COP $' },
    { label: 'S/ (Perú)', value: 'S/' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-6 flex flex-col">
        {/* Cabecera del Setup */}
        <div className="p-6 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Bienvenido a FinFlow</h1>
                <p className="text-xs text-slate-400">Asistente de configuración inicial</p>
              </div>
            </div>

            {/* Indicador de pasos */}
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    step === s ? 'bg-emerald-500 w-8' : step > s ? 'bg-emerald-500/40' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contenido según el paso */}
        <div className="p-6 flex-1 space-y-6">
          {/* PASO 1: Moneda */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  <span>Elige tu Moneda Principal</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Se utilizará para mostrar los balances, presupuestos y reportes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCurrency(opt.value)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      currency === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center space-x-3 text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>
                  Privacidad total: Todo se almacena localmente en tu navegador. Tus números son sólo tuyos.
                </span>
              </div>
            </div>
          )}

          {/* PASO 2: Cuentas Líquidas */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>Configura tus Cuentas y Efectivo</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tus cuentas bancarias o cajas de ahorro y su saldo disponible actual.
                </p>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {liquidAccounts.map((acc, index) => (
                  <div key={acc.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">
                        Cuenta #{index + 1}
                      </span>
                      {liquidAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLiquidAccount(acc.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={acc.name}
                          onChange={e => {
                            const val = e.target.value
                            setLiquidAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, name: val } : a))
                          }}
                          placeholder="Ej: Banco Galicia, Efectivo..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipo</label>
                        <select
                          value={acc.type}
                          onChange={e => {
                            const val = e.target.value as AccountType
                            setLiquidAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, type: val } : a))
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="checking">Cuenta Corriente</option>
                          <option value="savings">Caja de Ahorro</option>
                          <option value="cash">Efectivo / Billetera</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Saldo Inicial Disponible ({currency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={acc.balance}
                        onChange={e => {
                          const val = e.target.value
                          setLiquidAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, balance: val } : a))
                        }}
                        placeholder="0"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddLiquidAccount}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Otra Cuenta Líquida</span>
              </button>
            </div>
          )}

          {/* PASO 3: Tarjetas de Crédito */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Tarjetas de Crédito & Ciclos de Cobro</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Lleva control de tus compras en cuotas, fechas de corte y vencimientos.
                </p>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  id="hasCC"
                  checked={hasCreditCard}
                  onChange={e => setHasCreditCard(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500/20"
                />
                <label htmlFor="hasCC" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  Sí, utilizo tarjetas de crédito para mis gastos
                </label>
              </div>

              {hasCreditCard && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {creditCards.map((card, index) => (
                    <div key={card.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 uppercase">
                          Tarjeta #{index + 1}
                        </span>
                        {creditCards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCreditCard(card.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={e => {
                              const val = e.target.value
                              setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, name: val } : c))
                            }}
                            placeholder="Ej: Visa Santander, Mastercard..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Límite de Crédito Total</label>
                          <input
                            type="number"
                            step="any"
                            value={card.creditLimit}
                            onChange={e => {
                              const val = e.target.value
                              setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, creditLimit: val } : c))
                            }}
                            placeholder="1000000"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Ciclo de facturación */}
                      <div className="grid grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                        <div>
                          <label className="block text-[10px] font-semibold text-amber-400 mb-1">
                            Día de Cierre (Corte)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={card.statementClosingDay}
                            onChange={e => {
                              const val = Number(e.target.value)
                              setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, statementClosingDay: val } : c))
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-rose-400 mb-1">
                            Día de Vencimiento
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={card.paymentDueDay}
                            onChange={e => {
                              const val = Number(e.target.value)
                              setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, paymentDueDay: val } : c))
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddCreditCard}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Otra Tarjeta de Crédito</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Resumen y Listo */}
          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">¡Todo Listo para Comenzar!</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tu sistema financiero está configurado desde cero y listo para registrar tus movimientos reales.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Moneda:</span>
                  <span className="font-bold text-slate-200">{currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cuentas Líquidas:</span>
                  <span className="font-bold text-emerald-400">{liquidAccounts.length} configuradas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarjetas de Crédito:</span>
                  <span className="font-bold text-indigo-400">
                    {hasCreditCard ? `${creditCards.length} con ciclos de facturación` : 'Ninguna'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de navegación entre pasos */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Comenzar a usar FinFlow</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
