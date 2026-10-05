import React, { useState } from 'react'
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { Account, AccountType } from '../../types'
import { 
  getAccountRealBalance, 
  getCreditCardStatement, 
  formatCurrency, 
  isCreditAccount 
} from '../../utils/financeCalculators'

interface AccountsViewProps {
  onOpenNewAccount: () => void
  onEditAccount: (account: Account) => void
  onOpenPayCredit: (cardId: string) => void
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenNewAccount,
  onEditAccount,
  onOpenPayCredit,
}) => {
  const { accounts, transactions, deleteAccount } = useFinance()
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  const liquidAccounts = accounts.filter(a => !isCreditAccount(a.type))
  const creditAccounts = accounts.filter(a => isCreditAccount(a.type))

  const toggleExpand = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id))
  }

  const handleDelete = (acc: Account) => {
    if (confirm(`¿Estás seguro de eliminar la cuenta "${acc.name}"? Sus movimientos continuarán en el historial pero la cuenta ya no estará disponible para nuevos registros.`)) {
      deleteAccount(acc.id)
    }
  }

  const getAccountTypeName = (type: AccountType) => {
    switch (type) {
      case 'checking': return 'Cuenta Corriente'
      case 'savings': return 'Caja de Ahorro / Inversión'
      case 'cash': return 'Efectivo / Billetera'
      case 'credit': return 'Tarjeta de Crédito'
      case 'credit_line': return 'Línea de Crédito'
      default: return 'Cuenta'
    }
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cuentas y Tarjetas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona tus saldos líquidos, límites de tarjetas de crédito y ciclos de facturación
          </p>
        </div>
        <button
          onClick={onOpenNewAccount}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cuenta o Tarjeta</span>
        </button>
      </div>

      {/* 1. Tarjetas de Crédito */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Tarjetas de Crédito & Líneas de Financiamiento</h2>
        </div>

        {creditAccounts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No tienes tarjetas de crédito configuradas. Pulsa "Nueva Cuenta o Tarjeta" para añadir una.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditAccounts.map(card => {
              const stmt = getCreditCardStatement(card, transactions)
              const isExpanded = expandedCardId === card.id
              const utilPercent = card.creditLimit
                ? Math.min(100, Math.round((stmt.totalDebt / card.creditLimit) * 100))
                : 0

              return (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Aspecto de tarjeta bancaria moderna */}
                  <div
                    className="p-6 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${card.color} 0%, #090d16 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300/80">
                          {card.institution || 'Tarjeta de Crédito'}
                        </span>
                        <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">{card.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditAccount(card)}
                          className="p-1.5 text-slate-300 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                          title="Editar tarjeta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(card)}
                          className="p-1.5 text-slate-300 hover:text-rose-300 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between relative z-10">
                      <div>
                        <div className="text-[11px] text-slate-300/90 font-medium uppercase">Deuda Total Comprometida</div>
                        <div className="text-2xl font-extrabold text-white tabular-nums">
                          {formatCurrency(stmt.totalDebt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-300/90 uppercase font-medium">Límite Total</div>
                        <div className="text-sm font-semibold text-slate-200 tabular-nums">
                          {formatCurrency(card.creditLimit || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta con ciclo de facturación y cuotas */}
                  <div className="p-6 space-y-4 bg-slate-900 flex-1 flex flex-col justify-between">
                    {/* Ciclo de facturación */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Corte de Facturación</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-100 mt-1">
                          {stmt.closingDateStr}
                        </div>
                        <div className="text-[10px] text-amber-400 font-medium">
                          {stmt.daysUntilClosing === 0 ? 'Cierra hoy' : `Faltan ${stmt.daysUntilClosing} días`}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>Vencimiento de Pago</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-100 mt-1">
                          {stmt.dueDateStr}
                        </div>
                        <div className="text-[10px] text-rose-400 font-medium">
                          {stmt.daysUntilDue === 0 ? 'Vence hoy' : `Faltan ${stmt.daysUntilDue} días`}
                        </div>
                      </div>
                    </div>

                    {/* Barra de límite disponible */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                        <span>Disponible: <strong className="text-emerald-400 tabular-nums">{formatCurrency(stmt.availableCredit)}</strong></span>
                        <span className="tabular-nums">Uso: {utilPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div
                          className={`h-full rounded-full transition-all ${
                            utilPercent > 80 ? 'bg-rose-500' : utilPercent > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Resumen a pagar y botón pagar */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a pagar este resumen</span>
                        <span className="text-lg font-bold text-rose-400 tabular-nums">
                          {formatCurrency(stmt.statementTotalToPay)}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenPayCredit(card.id)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        Pagar Resumen
                      </button>
                    </div>

                    {/* Desplegable de compras en cuotas activas */}
                    <div>
                      <button
                        onClick={() => toggleExpand(card.id)}
                        className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <span>
                          Compras en cuotas activas ({stmt.activeInstallments.length})
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-slate-800/70">
                          {stmt.activeInstallments.length === 0 ? (
                            <div className="text-xs text-slate-400 py-2 text-center">
                              No hay compras en cuotas activas en esta tarjeta
                            </div>
                          ) : (
                            stmt.activeInstallments.map(item => (
                              <div
                                key={item.transaction.id}
                                className="p-2.5 bg-slate-950 rounded-lg text-xs border border-slate-800/60 flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium text-slate-200">
                                    {item.transaction.description}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-indigo-400 font-semibold">
                                      Cuota {item.currentInstallment} de {item.totalInstallments}
                                    </span>
                                    <span>&bull;</span>
                                    <span>Resta pagar {formatCurrency(item.remainingAmount)}</span>
                                  </div>
                                </div>
                                <div className="text-right font-semibold text-slate-100 tabular-nums">
                                  {formatCurrency(item.monthlyAmount)}/mes
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Cuentas Líquidas y Efectivo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Cuentas Líquidas & Efectivo</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liquidAccounts.map(acc => {
            const balance = getAccountRealBalance(acc, transactions)

            return (
              <div
                key={acc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color }}></span>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-100">{acc.name}</h3>
                        <span className="text-[11px] text-slate-400">{getAccountTypeName(acc.type)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditAccount(acc)}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                        title="Editar cuenta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] text-slate-400 uppercase font-medium">Saldo Disponible</span>
                    <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(balance)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
