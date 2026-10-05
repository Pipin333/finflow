import React, { useState } from 'react'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import { Header } from './components/Header'
import { Navigation, TabType } from './components/Navigation'
import { DashboardOverview } from './components/Dashboard/DashboardOverview'
import { AccountsView } from './components/Accounts/AccountsView'
import { TransactionsView } from './components/Transactions/TransactionsView'
import { AnalyticsView } from './components/Analytics/AnalyticsView'
import { SettingsView } from './components/Settings/SettingsView'
import { TransactionModal } from './components/Modals/TransactionModal'
import { PayCreditModal } from './components/Modals/PayCreditModal'
import { AccountModal } from './components/Modals/AccountModal'
import { InitialSetupModal } from './components/Modals/InitialSetupModal'
import { Transaction, Account, TransactionType } from './types'

const AppContent: React.FC = () => {
  const { isSetupCompleted, completeSetup } = useFinance()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [txModalInitialType, setTxModalInitialType] = useState<TransactionType>('expense')
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null)

  const [isPayCreditOpen, setIsPayCreditOpen] = useState(false)
  const [payCreditInitialCardId, setPayCreditInitialCardId] = useState<string | undefined>(undefined)

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)

  // Abrir nuevo movimiento
  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setTxToEdit(null)
    setTxModalInitialType(type)
    setIsTxModalOpen(true)
  }

  // Editar movimiento
  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx)
    setIsTxModalOpen(true)
  }

  // Abrir pago de tarjeta
  const handleOpenPayCredit = (cardId?: string) => {
    setPayCreditInitialCardId(cardId)
    setIsPayCreditOpen(true)
  }

  // Abrir modal de cuenta
  const handleOpenNewAccount = () => {
    setAccountToEdit(null)
    setIsAccountModalOpen(true)
  }

  const handleEditAccount = (acc: Account) => {
    setAccountToEdit(acc)
    setIsAccountModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de cabecera */}
      <Header
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenPayCredit={() => handleOpenPayCredit()}
      />

      {/* Navegación Desktop */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            onGoToTransactions={() => setActiveTab('transactions')}
            onGoToAccounts={() => setActiveTab('accounts')}
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenPayCredit={handleOpenPayCredit}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            onOpenNewAccount={handleOpenNewAccount}
            onEditAccount={handleEditAccount}
            onOpenPayCredit={handleOpenPayCredit}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modal de Onboarding / Setup Inicial */}
      <InitialSetupModal
        isOpen={!isSetupCompleted}
        onComplete={completeSetup}
      />

      {/* Modales globales de operación */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalInitialType}
        transactionToEdit={txToEdit}
      />

      <PayCreditModal
        isOpen={isPayCreditOpen}
        onClose={() => setIsPayCreditOpen(false)}
        initialCardId={payCreditInitialCardId}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

export default App
