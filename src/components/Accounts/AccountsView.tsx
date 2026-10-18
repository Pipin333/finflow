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
  ChevronUp
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
  const { accounts, transactions, deleteAccount, currency } = useFinance()
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  const fmt = (amount: number) => formatCurrency(amount, currency)

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
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">Cuentas y Tarjetas</h1>
          <p className="text-xs text-ps-muted mt-1">
            Gestiona tus saldos liquidos, limites de tarjetas de credito y ciclos de facturacion
          </p>
        </div>
        <button
          onClick={onOpenNewAccount}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-ps-accent hover:bg-white text-ps-bg font-bold font-mono rounded-xl text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cuenta o Tarjeta</span>
        </button>
      </div>

      {/* 1. Tarjetas de Credito */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-ps-accent" />
          <h2 className="text-base font-bold text-white font-mono">Tarjetas de Credito y Lineas de Financiamiento</h2>
        </div>

        {creditAccounts.length === 0 ? (
          <div className="bg-ps-surface border border-ps-border rounded-2xl p-8 text-center text-ps-muted text-xs">
            No tienes tarjetas de credito configuradas. Pulsa "Nueva Cuenta o Tarjeta" si utilizas tarjeta.
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
                  className="bg-ps-surface border border-ps-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Aspecto de tarjeta bancaria terminal */}
                  <div
                    className="p-6 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${card.color} 0%, #061d47 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-ps-muted">
                          {card.institution || 'Tarjeta de Credito'}
                        </span>
                        <h3 className="text-lg font-bold font-mono tracking-tight text-white mt-0.5">{card.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditAccount(card)}
                          className="p-1.5 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          title="Editar tarjeta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(card)}
                          className="p-1.5 text-white/80 hover:text-ps-danger bg-black/30 hover:bg-black/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between relative z-10">
                      <div>
                        <div className="text-[11px] text-ps-muted font-mono font-medium uppercase">Deuda Total Comprometida</div>
                        <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
                          {fmt(stmt.totalDebt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-ps-muted font-mono uppercase font-medium">Limite Total</div>
                        <div className="text-sm font-semibold font-mono text-white tabular-nums">
                          {fmt(card.creditLimit || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta con ciclo de facturacion y cuotas */}
                  <div className="p-6 space-y-4 bg-ps-surface flex-1 flex flex-col justify-between">
                    {/* Ciclo de facturacion */}
                    <div className="grid grid-cols-2 gap-3 bg-ps-recessed p-3 rounded-xl border border-ps-border/70">
                      <div>
                        <div className="flex items-center space-x-1 text-ps-muted text-[11px] font-mono">
                          <Clock className="w-3.5 h-3.5 text-ps-warning" />
                          <span>Corte de Facturacion</span>
                        </div>
                        <div className="text-sm font-semibold font-mono text-white mt-1">
                          {stmt.closingDateStr}
                        </div>
                        <div className="text-[10px] font-mono text-ps-warning font-medium">
                          {stmt.daysUntilClosing === 0 ? 'Cierra hoy' : `Faltan ${stmt.daysUntilClosing} dias`}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 text-ps-muted text-[11px] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-ps-danger" />
                          <span>Vencimiento de Pago</span>
                        </div>
                        <div className="text-sm font-semibold font-mono text-white mt-1">
                          {stmt.dueDateStr}
                        </div>
                        <div className="text-[10px] font-mono text-ps-danger font-medium">
                          {stmt.daysUntilDue === 0 ? 'Vence hoy' : `Faltan ${stmt.daysUntilDue} dias`}
                        </div>
                      </div>
                    </div>

                    {/* Barra de limite disponible */}
                    <div>
                      <div className="flex justify-between text-xs text-ps-muted mb-1.5 font-mono">
                        <span>Disponible: <strong className="text-ps-accent tabular-nums">{fmt(stmt.availableCredit)}</strong></span>
                        <span className="tabular-nums">Uso: {utilPercent}%</span>
                      </div>
                      <div className="w-full bg-ps-recessed rounded-full h-2 overflow-hidden border border-ps-border/60">
                        <div
                          className={`h-full rounded-full transition-all ${
                            utilPercent > 80 ? 'bg-ps-danger' : utilPercent > 50 ? 'bg-ps-warning' : 'bg-ps-accent'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Resumen a pagar y boton pagar */}
                    <div className="p-3 bg-ps-recessed border border-ps-border rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-ps-muted block">Total a pagar este resumen</span>
                        <span className="text-lg font-bold font-mono text-ps-danger tabular-nums">
                          {fmt(stmt.statementTotalToPay)}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenPayCredit(card.id)}
                        className="px-3.5 py-2 bg-ps-surface hover:bg-ps-recessed text-ps-accent border border-ps-accent font-mono rounded-lg text-xs font-bold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                      >
                        Pagar Resumen
                      </button>
                    </div>

                    {/* Desplegable de compras en cuotas activas */}
                    <div>
                      <button
                        onClick={() => toggleExpand(card.id)}
                        className="w-full flex items-center justify-between py-2 text-xs font-mono font-semibold text-ps-muted hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent rounded"
                      >
                        <span>
                          Compras en cuotas activas ({stmt.activeInstallments.length})
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-ps-border/70">
                          {stmt.activeInstallments.length === 0 ? (
                            <div className="text-xs text-ps-muted py-2 text-center font-mono">
                              No hay compras en cuotas activas en esta tarjeta
                            </div>
                          ) : (
                            stmt.activeInstallments.map(item => (
                              <div
                                key={item.transaction.id}
                                className="p-2.5 bg-ps-recessed rounded-lg text-xs border border-ps-border/70 flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-semibold text-white">
                                    {item.transaction.description}
                                  </div>
                                  <div className="text-[10px] text-ps-muted flex items-center space-x-1.5 mt-0.5 font-mono">
                                    <span className="text-ps-accent font-semibold">
                                      Cuota {item.currentInstallment} de {item.totalInstallments}
                                    </span>
                                    <span>&bull;</span>
                                    <span>Resta pagar {fmt(item.remainingAmount)}</span>
                                  </div>
                                </div>
                                <div className="text-right font-bold font-mono text-white tabular-nums">
                                  {fmt(item.monthlyAmount)}/mes
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

      {/* 2. Cuentas Liquidas y Efectivo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-ps-accent" />
          <h2 className="text-base font-bold text-white font-mono">Cuentas Liquidas y Efectivo</h2>
        </div>

        {liquidAccounts.length === 0 ? (
          <div className="bg-ps-surface border border-ps-border rounded-2xl p-8 text-center text-ps-muted text-xs font-mono">
            No tienes cuentas liquidas registradas. Pulsa "Nueva Cuenta o Tarjeta" para anadir una.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liquidAccounts.map(acc => {
              const balance = getAccountRealBalance(acc, transactions)

              return (
                <div
                  key={acc.id}
                  className="bg-ps-surface border border-ps-border rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color }}></span>
                        <div>
                          <h3 className="font-bold text-sm text-white font-mono">{acc.name}</h3>
                          <span className="text-[11px] text-ps-muted font-mono">{getAccountTypeName(acc.type)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditAccount(acc)}
                          className="p-1 text-ps-muted hover:text-white rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
                          title="Editar cuenta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc)}
                          className="p-1 text-ps-muted hover:text-ps-danger rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-danger"
                          title="Eliminar cuenta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] text-ps-muted uppercase font-mono font-medium">Saldo Disponible</span>
                      <div className="text-2xl font-bold font-mono text-ps-accent tabular-nums">
                        {fmt(balance)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
