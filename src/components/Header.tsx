import React from 'react'
import { Plus, CreditCard, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

interface HeaderProps {
  onOpenNewTransaction: (type?: 'expense' | 'income' | 'transfer') => void
  onOpenPayCredit: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenPayCredit }) => {
  const { selectedMonth, setSelectedMonth } = useFinance()

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const prevDate = new Date(y, m - 2, 1)
    const newMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(newMonthStr)
  }

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const nextDate = new Date(y, m, 1)
    const newMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(newMonthStr)
  }

  const formatMonthTitle = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number)
    const date = new Date(y, m - 1, 1)
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  }

  return (
    <header className="sticky top-0 z-30 bg-ps-bg/95 backdrop-blur-md border-b border-ps-border px-4 py-2.5 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ps-surface border border-ps-border flex items-center justify-center text-ps-accent">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-base md:text-lg tracking-tight text-white font-mono">FinFlow</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ps-surface text-ps-accent border border-ps-border">v2.0</span>
          </div>
        </div>

        {/* Center: Month Navigator (Compact on mobile, expanded on desktop) */}
        <div className="flex items-center space-x-1 bg-ps-surface border border-ps-border rounded-xl p-1 shadow-sm">
          <button 
            onClick={handlePrevMonth} 
            className="p-1 md:p-1.5 rounded-lg text-ps-muted hover:text-white hover:bg-ps-recessed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            title="Mes anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          
          <div className="flex items-center space-x-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-ps-accent hidden sm:block" />
            <span className="text-xs md:text-sm font-semibold capitalize text-white min-w-[76px] sm:min-w-[110px] text-center select-none font-mono">
              {formatMonthTitle(selectedMonth)}
            </span>
          </div>

          <button 
            onClick={handleNextMonth} 
            className="p-1 md:p-1.5 rounded-lg text-ps-muted hover:text-white hover:bg-ps-recessed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            title="Mes siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Pagar Tarjeta (Desktop/Tablet) */}
          <button
            onClick={onOpenPayCredit}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-ps-accent bg-ps-surface hover:bg-ps-recessed border border-ps-accent/60 hover:border-ps-accent rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
            title="Pagar o amortizar tarjeta de crédito"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagar Tarjeta</span>
          </button>

          {/* Botón Nuevo Movimiento */}
          <button
            onClick={() => onOpenNewTransaction('expense')}
            className="inline-flex items-center justify-center space-x-1 p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-ps-bg bg-ps-accent hover:bg-white active:scale-95 rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Nuevo Movimiento"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Movimiento</span>
          </button>
        </div>
      </div>
    </header>
  )
}
