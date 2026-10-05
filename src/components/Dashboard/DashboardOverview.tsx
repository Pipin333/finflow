import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { 
  getNetWorth, 
  getMonthlyMetrics, 
  getCreditCardStatement, 
  formatCurrency, 
  isCreditAccount 
} from '../../utils/financeCalculators'

interface DashboardOverviewProps {
  onGoToTransactions: () => void
  onGoToAccounts: () => void
  onOpenNewTransaction: (type?: 'expense' | 'income' | 'transfer') => void
  onOpenPayCredit: (cardId?: string) => void
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onGoToTransactions,
  onGoToAccounts,
  onOpenNewTransaction,
  onOpenPayCredit,
}) => {
  const { accounts, transactions, selectedMonth } = useFinance()
  const [targetYear, targetMonth] = selectedMonth.split('-').map(Number)

  const { liquidAssets, totalDebt, netWorth } = getNetWorth(accounts, transactions)
  const monthlyMetrics = getMonthlyMetrics(transactions, targetYear, targetMonth)

  // Tarjetas de crédito
  const creditCards = accounts.filter(a => isCreditAccount(a.type))
  const cardStatements = creditCards.map(card => getCreditCardStatement(card, transactions))

  // Transacciones recientes (máximo 6)
  const recentTransactions = transactions.slice(0, 6)

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patrimonio Neto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patrimonio Neto</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {formatCurrency(netWorth)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Activos: <strong className="text-emerald-400 tabular-nums">{formatCurrency(liquidAssets)}</strong></span>
            <span>Deuda: <strong className="text-rose-400 tabular-nums">{formatCurrency(totalDebt)}</strong></span>
          </div>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400 tabular-nums">
            {formatCurrency(monthlyMetrics.totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Acreditaciones en el período
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gastos del Mes</span>
            <span className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-400 tabular-nums">
            {formatCurrency(monthlyMetrics.totalExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Incluye cuotas activas del mes
          </div>
        </div>

        {/* Balance / Ahorro Neto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Flujo Neto / Ahorro</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              monthlyMetrics.netSavings >= 0 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {monthlyMetrics.savingsRate}% ahorro
            </span>
          </div>
          <div className={`text-2xl font-bold tracking-tight tabular-nums ${
            monthlyMetrics.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(monthlyMetrics.netSavings)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {monthlyMetrics.netSavings >= 0 ? 'Superávit disponible' : 'Déficit del mes'}
          </div>
        </div>
      </div>

      {/* 2. Sección de Tarjetas de Crédito y Ciclos de Facturación */}
      {cardStatements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Resumen de Tarjetas & Ciclos de Cobro</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fechas de cierre de corte, vencimientos y compras en cuotas
              </p>
            </div>
            <button
              onClick={onGoToAccounts}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium self-start sm:self-auto"
            >
              Ver detalle completo de cuentas &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cardStatements.map(stmt => {
              const utilPercent = stmt.account.creditLimit
                ? Math.min(100, Math.round((stmt.totalDebt / stmt.account.creditLimit) * 100))
                : 0

              return (
                <div
                  key={stmt.account.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stmt.account.color }}></span>
                        <h3 className="font-semibold text-sm text-slate-100">{stmt.account.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stmt.account.institution || 'Tarjeta de Crédito'}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block uppercase font-medium">A pagar este resumen</span>
                      <span className="text-lg font-bold text-rose-400 tabular-nums">
                        {formatCurrency(stmt.statementTotalToPay)}
                      </span>
                    </div>
                  </div>

                  {/* Fechas de corte y cobro */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 rounded-lg p-2.5 text-xs border border-slate-800/50">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Cierre de Facturación</div>
                        <div className="font-medium text-slate-200">
                          {stmt.closingDateStr} <span className="text-slate-400">({stmt.daysUntilClosing}d)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Fecha de Vencimiento</div>
                        <div className="font-medium text-slate-200">
                          {stmt.dueDateStr} <span className="text-slate-400">({stmt.daysUntilDue}d)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de utilización de límite */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Límite utilizado ({utilPercent}%)</span>
                      <span className="tabular-nums">Disponible: {formatCurrency(stmt.availableCredit)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilPercent > 80 ? 'bg-rose-500' : utilPercent > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${utilPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botón Pagar Resumen */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-800/60">
                    <span className="text-xs text-slate-400">
                      {stmt.activeInstallments.length} {stmt.activeInstallments.length === 1 ? 'compra en cuotas' : 'compras en cuotas'}
                    </span>
                    <button
                      onClick={() => onOpenPayCredit(stmt.account.id)}
                      className="text-xs font-semibold px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors"
                    >
                      Pagar Resumen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Accesos Rápidos y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-white">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-100">Registrar Gasto</div>
                  <div className="text-xs text-slate-400">Efectivo, cuenta o tarjeta en cuotas</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onOpenNewTransaction('income')}
              className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-100">Registrar Ingreso</div>
                  <div className="text-xs text-slate-400">Sueldo, honorarios o rendimientos</div>
                </div>
              </div>
              <ArrowDownLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onOpenNewTransaction('transfer')}
              className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-100">Transferir entre Cuentas</div>
                  <div className="text-xs text-slate-400">Mover saldo a ahorros o pagar cuentas</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Últimas Transacciones */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Últimos Movimientos</h2>
                <p className="text-xs text-slate-400 mt-0.5">Historial reciente de ingresos, gastos y cuotas</p>
              </div>
              <button
                onClick={onGoToTransactions}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Ver todos &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-800/70">
              {recentTransactions.map(tx => {
                const acc = accounts.find(a => a.id === tx.accountId)
                const isExpense = tx.type === 'expense'
                const isIncome = tx.type === 'income'

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isExpense
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : isExpense ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-slate-100 flex items-center space-x-2">
                          <span>{tx.description}</span>
                          {tx.installmentsCount && tx.installmentsCount > 1 && (
                            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full">
                              {tx.installmentsCount} cuotas {tx.isInterestFree ? 's/int' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>{tx.date}</span>
                          <span>&bull;</span>
                          <span>{tx.category}</span>
                          <span>&bull;</span>
                          <span className="text-slate-300">{acc?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold tabular-nums ${
                          isIncome ? 'text-emerald-400' : isExpense ? 'text-slate-100' : 'text-blue-400'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </div>
                      {tx.installmentsCount && tx.installmentsCount > 1 && tx.installmentAmount && (
                        <div className="text-[10px] text-slate-400 tabular-nums">
                          ({formatCurrency(tx.installmentAmount)}/mes)
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
