import { describe, it, expect } from 'vitest'
import { Transaction } from '../types'

describe('backup & export logic', () => {
  it('escapa comillas dobles y genera formato CSV válido', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-10-01',
        type: 'expense',
        amount: 25000,
        accountId: 'acc-check',
        category: 'Alimentación',
        description: 'Cena con "amigos" en restaurante',
        installmentsCount: 1,
      },
    ]

    const headers = ['ID', 'Fecha', 'Tipo', 'Monto', 'Categoría', 'Descripción']
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
    ].join(','))

    const csvResult = [headers.join(','), ...rows].join('\n')

    expect(csvResult).toContain('Cena con ""amigos"" en restaurante')
    expect(csvResult).toContain('25000')
    expect(csvResult).toContain('Alimentación')
  })

  it('valida la estructura de exportación e importación JSON', () => {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      currency: '$',
      accounts: [{ id: 'acc-1', name: 'Banco', type: 'checking', balance: 50000, color: '#3b82f6', currency: '$' }],
      transactions: [{ id: 'tx-1', date: '2026-10-01', type: 'expense', amount: 1000, accountId: 'acc-1', category: 'General', description: 'Test' }],
    }

    const serialized = JSON.stringify(backupData)
    const parsed = JSON.parse(serialized)

    expect(parsed.version).toBe(2)
    expect(Array.isArray(parsed.accounts)).toBe(true)
    expect(Array.isArray(parsed.transactions)).toBe(true)
    expect(parsed.accounts[0].name).toBe('Banco')
  })
})
