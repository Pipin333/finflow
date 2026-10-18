import { describe, it, expect, beforeEach } from 'vitest'
import { 
  saveReceiptImage, 
  getReceiptImage, 
  deleteReceiptImage, 
  exportAllReceipts, 
  importAllReceipts, 
  clearAllReceipts 
} from './receiptStorage'

describe('receiptStorage (IndexedDB & in-memory fallback)', () => {
  beforeEach(async () => {
    await clearAllReceipts()
  })

  it('guarda y recupera correctamente una imagen de boleta por ID', async () => {
    const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...'
    const receiptId = 'rcpt-test-123'

    await saveReceiptImage(receiptId, mockImage)
    const retrieved = await getReceiptImage(receiptId)

    expect(retrieved).toBe(mockImage)
  })

  it('retorna directamente strings data:image/ legacy sin consultar la base de datos', async () => {
    const legacyDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...'
    const retrieved = await getReceiptImage(legacyDataUrl)

    expect(retrieved).toBe(legacyDataUrl)
  })

  it('retorna null para IDs inexistentes o cadenas vacías', async () => {
    const empty = await getReceiptImage('')
    const notFound = await getReceiptImage('rcpt-inexistente-999')

    expect(empty).toBeNull()
    expect(notFound).toBeNull()
  })

  it('elimina una boleta de forma limpia', async () => {
    const receiptId = 'rcpt-delete-test'
    await saveReceiptImage(receiptId, 'data:image/jpeg;base64,delete-me')
    
    expect(await getReceiptImage(receiptId)).not.toBeNull()

    await deleteReceiptImage(receiptId)
    expect(await getReceiptImage(receiptId)).toBeNull()
  })

  it('exporta e importa paquetes completos de boletas para respaldos JSON', async () => {
    await saveReceiptImage('rcpt-1', 'data:image/jpeg;base64,first')
    await saveReceiptImage('rcpt-2', 'data:image/jpeg;base64,second')

    const exported = await exportAllReceipts()
    expect(exported['rcpt-1']).toBe('data:image/jpeg;base64,first')
    expect(exported['rcpt-2']).toBe('data:image/jpeg;base64,second')

    await clearAllReceipts()
    expect(await getReceiptImage('rcpt-1')).toBeNull()

    // Restaurar desde el backup
    await importAllReceipts(exported)
    expect(await getReceiptImage('rcpt-1')).toBe('data:image/jpeg;base64,first')
    expect(await getReceiptImage('rcpt-2')).toBe('data:image/jpeg;base64,second')
  })
})
