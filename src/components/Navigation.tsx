import React from 'react'
import { LayoutDashboard, WalletCards, ArrowLeftRight, PieChart, Settings } from 'lucide-react'

export type TabType = 'dashboard' | 'accounts' | 'transactions' | 'analytics' | 'settings'

interface NavigationProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as TabType, label: 'Cuentas & Tarjetas', icon: WalletCards },
    { id: 'transactions' as TabType, label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'analytics' as TabType, label: 'Análisis', icon: PieChart },
    { id: 'settings' as TabType, label: 'Ajustes & PWA', icon: Settings },
  ]

  return (
    <>
      {/* Desktop Navigation (Tabs at top under header) */}
      <nav className="hidden md:block bg-slate-950 border-b border-slate-800/80 px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Fixed with safe-area padding) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pt-2 safe-bottom">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium mt-0.5 tracking-tight">{tab.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
