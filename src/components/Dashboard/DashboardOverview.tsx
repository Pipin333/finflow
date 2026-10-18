import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Calendar,
  Sparkles
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
  const { accounts, transactions, selectedMonth, currency } = useFinance()
  const [targetYear, targetMonth] = selectedMonth.split('-').map(Number)

  const fmt = (amount: number) => formatCurrency(amount, currency)

  const { liquidAssets, totalDebt, netWorth } = getNetWorth(accounts, transactions)
  const monthlyMetrics = getMonthlyMetrics(transactions, targetYear, targetMonth)

  // Tarjetas de crédito
  const creditCards = accounts.filter(a => isCreditAccount(a.type))
  const cardStatements = creditCards.map(card => getCreditCardStatement(card, transactions))

  // Transacciones recientes (máximo 6)
  const recentTransactions = transactions.slice(0, 6)

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. ATM Cockpit Banner (Signature Element) */}
      <section 
        aria-label="Resumen de posicion neta y estado de salud financiera"
        className="bg-ps-surface border-2 border-ps-border rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ps-border/70">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ps-accent animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-ps-accent uppercase">
              TERMINAL FINANCIERO EN LINEA
            </span>
          </div>
          <div className="text-xs font-mono text-ps-muted">
            PERIODO: <span className="text-white font-bold">{selectedMonth}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono uppercase tracking-wider text-ps-muted mb-1">
              Patrimonio Neto Real (Liquidez menos Deuda)
            </div>
            <div className={`text-3xl sm:text-fluid-hero font-bold font-mono tracking-tight tabular-nums ${
              netWorth >= 0 ? 'text-white' : 'text-ps-danger'
            }`}>
              {fmt(netWorth)}
            </div>
            <p className="text-xs text-ps-muted mt-2">
              Calculo consolidado al instante: saldos bancarios y efectivo disponibles descontando la deuda total acumulada.
            </p>
          </div>

          <div className="lg:col-span-5 bg-ps-recessed border border-ps-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ps-muted font-mono uppercase">Activos Liquidos:</span>
              <span className="font-mono font-bold text-ps-accent text-sm tabular-nums">
                {fmt(liquidAssets)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ps-muted font-mono uppercase">Deuda Tarjetas / Credito:</span>
              <span className="font-mono font-bold text-ps-danger text-sm tabular-nums">
                {fmt(totalDebt)}
              </span>
            </div>
            {totalDebt > 0 && (
              <div className="pt-2 border-t border-ps-border/70 flex items-center justify-between">
                <span className="text-[11px] text-ps-warning font-mono">
                  Saldos de credito pendientes
                </span>
                <button
                  onClick={() => onOpenPayCredit()}
                  className="px-3 py-1.5 text-xs font-mono font-bold text-ps-bg bg-ps-warning hover:bg-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Liquidar Deuda
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Metricas del Mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ingresos del Mes */}
        <div className="bg-ps-surface border border-ps-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-ps-muted mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <span className="p-1 rounded-lg bg-ps-recessed border border-ps-border text-ps-accent">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-fluid-stat font-bold font-mono tracking-tight text-ps-accent tabular-nums">
            {fmt(monthlyMetrics.totalIncome)}
          </div>
          <div className="mt-2 text-xs text-ps-muted">
            Acreditaciones en el periodo
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-ps-surface border border-ps-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-ps-muted mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Gastos del Mes</span>
            <span className="p-1 rounded-lg bg-ps-recessed border border-ps-border text-ps-danger">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-fluid-stat font-bold font-mono tracking-tight text-ps-danger tabular-nums">
            {fmt(monthlyMetrics.totalExpense)}
          </div>
          <div className="mt-2 text-xs text-ps-muted">
            Incluye cuotas activas del mes
          </div>
        </div>

        {/* Flujo Neto / Ahorro */}
        <div className="bg-ps-surface border border-ps-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-ps-muted mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Flujo Neto / Ahorro</span>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
              monthlyMetrics.netSavings >= 0 
                ? 'bg-ps-recessed text-ps-accent border-ps-accent/40' 
                : 'bg-ps-recessed text-ps-danger border-ps-danger/40'
            }`}>
              {monthlyMetrics.savingsRate}% ahorro
            </span>
          </div>
          <div className={`text-2xl sm:text-fluid-stat font-bold font-mono tracking-tight tabular-nums ${
            monthlyMetrics.netSavings >= 0 ? 'text-ps-accent' : 'text-ps-danger'
          }`}>
            {fmt(monthlyMetrics.netSavings)}
          </div>
          <div className="mt-2 text-xs text-ps-muted">
            {monthlyMetrics.netSavings >= 0 ? 'Superavit disponible' : 'Deficit del mes'}
          </div>
        </div>
      </div>

      {/* 3. Seccion de Tarjetas de Credito y Ciclos de Facturacion */}
      {cardStatements.length > 0 && (
        <div className="bg-ps-surface border border-ps-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-ps-accent" />
                <span>Resumen de Tarjetas y Ciclos de Cobro</span>
              </h2>
              <p className="text-xs text-ps-muted mt-0.5">
                Fechas de cierre de corte, vencimientos y compras en cuotas
              </p>
            </div>
            <button
              onClick={onGoToAccounts}
              className="text-xs font-mono font-semibold text-ps-accent hover:text-white self-start sm:self-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent rounded"
            >
              Ver detalle de cuentas &rarr;
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
                  className="bg-ps-recessed border border-ps-border rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stmt.account.color }}></span>
                        <h3 className="font-bold text-sm text-white font-mono">{stmt.account.name}</h3>
                      </div>
                      <p className="text-xs text-ps-muted mt-0.5">{stmt.account.institution || 'Tarjeta de Credito'}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-ps-muted block uppercase font-mono font-medium">A pagar este resumen</span>
                      <span className="text-lg font-bold font-mono text-ps-danger tabular-nums">
                        {fmt(stmt.statementTotalToPay)}
                      </span>
                    </div>
                  </div>

                  {/* Fechas de corte y cobro */}
                  <div className="grid grid-cols-2 gap-2 bg-ps-surface rounded-lg p-2.5 text-xs border border-ps-border/70">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-ps-warning flex-shrink-0" />
                      <div>
                        <div className="text-ps-muted text-[10px] font-mono">Cierre de Facturacion</div>
                        <div className="font-mono font-medium text-white">
                          {stmt.closingDateStr} <span className="text-ps-muted">({stmt.daysUntilClosing}d)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-ps-danger flex-shrink-0" />
                      <div>
                        <div className="text-ps-muted text-[10px] font-mono">Fecha de Vencimiento</div>
                        <div className="font-mono font-medium text-white">
                          {stmt.dueDateStr} <span className="text-ps-muted">({stmt.daysUntilDue}d)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de utilizacion de limite */}
                  <div>
                    <div className="flex justify-between text-xs text-ps-muted mb-1 font-mono">
                      <span>Limite utilizado ({utilPercent}%)</span>
                      <span className="tabular-nums">Disponible: {fmt(stmt.availableCredit)}</span>
                    </div>
                    <div className="w-full bg-ps-surface rounded-full h-2 overflow-hidden border border-ps-border/50">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilPercent > 80 ? 'bg-ps-danger' : utilPercent > 50 ? 'bg-ps-warning' : 'bg-ps-accent'
                        }`}
                        style={{ width: `${utilPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Boton Pagar Resumen */}
                  <div className="pt-1 flex items-center justify-between border-t border-ps-border/60">
                    <span className="text-xs text-ps-muted font-mono">
                      {stmt.activeInstallments.length} {stmt.activeInstallments.length === 1 ? 'compra en cuotas' : 'compras en cuotas'}
                    </span>
                    <button
                      onClick={() => onOpenPayCredit(stmt.account.id)}
                      className="text-xs font-mono font-bold px-3 py-1.5 bg-ps-surface hover:bg-ps-recessed text-ps-accent border border-ps-accent/60 hover:border-ps-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
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

      {/* 4. Accesos Rapidos y Ultimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones Rapidas */}
        <div className="bg-ps-surface border border-ps-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-white font-mono">Acciones Rapidas</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="flex items-center justify-between p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ps-surface text-ps-danger rounded-lg border border-ps-border">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Registrar Gasto</div>
                  <div className="text-xs text-ps-muted">Efectivo, cuenta o tarjeta en cuotas</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ps-muted" />
            </button>

            <button
              onClick={() => onOpenNewTransaction('income')}
              className="flex items-center justify-between p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ps-surface text-ps-accent rounded-lg border border-ps-border">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Registrar Ingreso</div>
                  <div className="text-xs text-ps-muted">Sueldo, honorarios o transferencias</div>
                </div>
              </div>
              <ArrowDownLeft className="w-4 h-4 text-ps-muted" />
            </button>

            <button
              onClick={() => onOpenNewTransaction('transfer')}
              className="flex items-center justify-between p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ps-surface text-white rounded-lg border border-ps-border">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Transferir entre Cuentas</div>
                  <div className="text-xs text-ps-muted">Mover saldo a ahorros o abonar tarjeta</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ps-muted" />
            </button>
          </div>
        </div>

        {/* Ultimos Movimientos */}
        <div className="lg:col-span-2 bg-ps-surface border border-ps-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white font-mono">Ultimos Movimientos</h2>
                <p className="text-xs text-ps-muted mt-0.5">Historial reciente de ingresos, gastos y cuotas</p>
              </div>
              {recentTransactions.length > 0 && (
                <button
                  onClick={onGoToTransactions}
                  className="text-xs font-mono font-semibold text-ps-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent rounded"
                >
                  Ver todos &rarr;
                </button>
              )}
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-ps-muted text-xs">
                <p className="font-semibold text-white">No hay movimientos registrados este mes.</p>
                <p className="mt-1 text-ps-muted">Utiliza las acciones rapidas para registrar tus primeros ingresos o gastos.</p>
              </div>
            ) : (
              <div className="divide-y divide-ps-border/70">
                {recentTransactions.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId)
                  const isExpense = tx.type === 'expense'
                  const isIncome = tx.type === 'income'

                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 border ${
                            isIncome
                              ? 'bg-ps-recessed text-ps-accent border-ps-accent/40'
                              : isExpense
                              ? 'bg-ps-recessed text-ps-danger border-ps-danger/40'
                              : 'bg-ps-recessed text-white border-ps-border'
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
                          <div className="text-sm font-semibold text-white flex items-center space-x-2">
                            <span>{tx.description}</span>
                            {tx.installmentsCount && tx.installmentsCount > 1 && (
                              <span className="text-[10px] font-mono font-bold bg-ps-recessed text-ps-accent border border-ps-accent/50 px-1.5 py-0.5 rounded">
                                {tx.installmentsCount} cuotas {tx.isInterestFree ? 's/int' : ''}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-ps-muted flex items-center space-x-2 mt-0.5 font-mono">
                            <span>{tx.date}</span>
                            <span>&bull;</span>
                            <span>{tx.category}</span>
                            <span>&bull;</span>
                            <span className="text-white">{acc?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-bold font-mono tabular-nums ${
                            isIncome ? 'text-ps-accent' : isExpense ? 'text-white' : 'text-ps-muted'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {fmt(tx.amount)}
                        </div>
                        {tx.installmentsCount && tx.installmentsCount > 1 && tx.installmentAmount && (
                          <div className="text-[10px] text-ps-muted font-mono tabular-nums">
                            ({fmt(tx.installmentAmount)}/mes)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
