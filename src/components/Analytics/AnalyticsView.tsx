import React, { useMemo } from 'react'
import { PieChart, TrendingUp, TrendingDown, ArrowUpRight, Award, Layers } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { formatCurrency } from '../../utils/financeCalculators'

export const AnalyticsView: React.FC = () => {
  const { transactions, selectedMonth, currency } = useFinance()
  const fmt = (amount: number) => formatCurrency(amount, currency)
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)

  // Gastos por categoría en el mes seleccionado
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    let totalExpenses = 0

    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(selectedMonth)) {
        const amount = t.installmentsCount && t.installmentsCount > 1
          ? (t.installmentAmount || (t.amount / t.installmentsCount))
          : t.amount

        totalExpenses += amount
        map.set(t.category, (map.get(t.category) || 0) + amount)
      }
    })

    const categories = Array.from(map.entries()).map(([name, amount], index) => {
      const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#64748b']
      return {
        name,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        color: colors[index % colors.length],
      }
    }).sort((a, b) => b.amount - a.amount)

    return { categories, totalExpenses }
  }, [transactions, selectedMonth])

  // Evolución de los últimos 6 meses
  const monthlyHistory = useMemo(() => {
    const monthsData = []
    const now = new Date(selectedYear, selectedMonthNum - 1, 1)

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = d.toLocaleDateString('es-ES', { month: 'short' })

      let income = 0
      let expense = 0

      transactions.forEach(t => {
        if (t.date.startsWith(monthKey)) {
          if (t.type === 'income') {
            income += t.amount
          } else if (t.type === 'expense') {
            const amount = t.installmentsCount && t.installmentsCount > 1
              ? (t.installmentAmount || (t.amount / t.installmentsCount))
              : t.amount
            expense += amount
          }
        }
      })

      monthsData.push({
        monthKey,
        monthLabel,
        income,
        expense,
        balance: income - expense,
      })
    }

    return monthsData
  }, [transactions, selectedYear, selectedMonthNum])

  const maxChartValue = Math.max(
    ...monthlyHistory.map(m => Math.max(m.income, m.expense)),
    1000
  )

  // Mayores gastos individuales
  const topExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [transactions, selectedMonth])

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Análisis & Gráficos</h1>
        <p className="text-xs text-slate-400 mt-1">
          Distribución de gastos por categoría y evolución histórica de tus finanzas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Gráfico de Categorías */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Distribución de Gastos</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Período {selectedMonth}</span>
            </div>

            {categoryBreakdown.categories.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No hay gastos registrados en este período.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Donut / Segmented bar representation */}
                <div className="w-full bg-slate-950 rounded-xl h-4 flex overflow-hidden border border-slate-800/80">
                  {categoryBreakdown.categories.map(cat => (
                    <div
                      key={cat.name}
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      title={`${cat.name}: ${cat.percentage}%`}
                      className="h-full transition-all"
                    />
                  ))}
                </div>

                {/* Lista de Categorías */}
                <div className="divide-y divide-slate-800/80 mt-4">
                  {categoryBreakdown.categories.map(cat => (
                    <div key={cat.name} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span className="text-slate-200 font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 tabular-nums">{cat.percentage}%</span>
                        <span className="font-semibold text-slate-100 tabular-nums">
                          {fmt(cat.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total Gastos del Período:</span>
            <strong className="text-rose-400 font-bold text-sm tabular-nums">
              {fmt(categoryBreakdown.totalExpenses)}
            </strong>
          </div>
        </div>

        {/* 2. Evolución Semestral (Barras Ingresos vs Gastos) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Evolución de Últimos 6 Meses</h2>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-300">Ingresos</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-slate-300">Gastos</span>
                </span>
              </div>
            </div>

            {/* Gráfico de barras personalizado SVG / CSS */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800">
              {monthlyHistory.map(m => {
                const incomeHeight = maxChartValue > 0 ? (m.income / maxChartValue) * 100 : 0
                const expenseHeight = maxChartValue > 0 ? (m.expense / maxChartValue) * 100 : 0

                return (
                  <div key={m.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Barra Ingreso */}
                      <div
                        className="w-3.5 sm:w-4 bg-emerald-500 rounded-t transition-all group-hover:brightness-110"
                        style={{ height: `${Math.max(4, incomeHeight)}%` }}
                        title={`${m.monthLabel} - Ingresos: ${fmt(m.income)}`}
                      ></div>

                      {/* Barra Gasto */}
                      <div
                        className="w-3.5 sm:w-4 bg-rose-500 rounded-t transition-all group-hover:brightness-110"
                        style={{ height: `${Math.max(4, expenseHeight)}%` }}
                        title={`${m.monthLabel} - Gastos: ${fmt(m.expense)}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 capitalize mt-2">
                      {m.monthLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Mes actual vs Mes previo</span>
            <span className="text-emerald-400 font-medium">Control de flujo en tiempo real</span>
          </div>
        </div>
      </div>

      {/* 3. Top Gastos Individuales */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white mb-4">Mayores Gastos del Mes</h2>
        {topExpenses.length === 0 ? (
          <div className="text-slate-400 text-xs py-4 text-center">No hay gastos en el período</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {topExpenses.map((exp, idx) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 font-bold w-4">{idx + 1}.</span>
                  <div>
                    <span className="font-medium text-slate-200">{exp.description}</span>
                    <span className="text-slate-400 ml-2">({exp.category})</span>
                  </div>
                </div>
                <div className="font-bold text-rose-400 tabular-nums">
                  {fmt(exp.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
