/**
 * Repositorio de Almacenamiento Seguro para Boletas y Comprobantes en IndexedDB.
 * 
 * Desacopla el almacenamiento de imágenes binarias (base64) del LocalStorage,
 * protegiendo a la aplicación de la cuota estricta de ~5MB de los navegadores móviles y desktop.
 * Cuenta con fallback transparente en memoria para entornos de testing (Node/Vitest)
 * y navegación privada estricta.
 */

const DB_NAME = 'finflow_receipts_db'
const DB_VERSION = 1
const STORE_NAME = 'receipts'

// Fallback en memoria para testing (Vitest/Node) o navegadores sin IndexedDB
const memoryStore = new Map<string, string>()

/**
 * Inicializa y obtiene la instancia de conexión con IndexedDB.
 * @returns {Promise<IDBDatabase | null>} Conexión activa a IndexedDB o null si no está soportado.
 */
const getDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        resolve(null)
      }
    } catch {
      resolve(null)
    }
  })
}

/**
 * Guarda una imagen de boleta o comprobante en IndexedDB.
 * Si el entorno no soporta IndexedDB, la persiste en el almacén de memoria.
 * 
 * @param {string} id - Identificador único de la boleta (ej: `rcpt-tx-123456`).
 * @param {string} dataUrl - Imagen en formato Data URL Base64 comprimida.
 * @returns {Promise<void>}
 */
export const saveReceiptImage = async (id: string, dataUrl: string): Promise<void> => {
  if (!id || !dataUrl) return

  // Siempre mantener copia en memoria para velocidad y tests
  memoryStore.set(id, dataUrl)

  const db = await getDB()
  if (!db) return

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(dataUrl, id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    } catch (e) {
      // Fallback a memoria si la transacción falla
      resolve()
    }
  })
}

/**
 * Recupera una imagen de boleta a partir de su ID o string Data URL.
 * Si el parámetro ya es un Data URL legacy (`data:image/...`), lo retorna directamente.
 * 
 * @param {string} idOrDataUrl - ID de la boleta o string Data URL legado.
 * @returns {Promise<string | null>} Data URL de la imagen o null si no se encuentra.
 */
export const getReceiptImage = async (idOrDataUrl: string): Promise<string | null> => {
  if (!idOrDataUrl) return null

  // Si ya es un dataUrl legado, retornarlo directamente
  if (idOrDataUrl.startsWith('data:image/')) {
    return idOrDataUrl
  }

  // Buscar en fallback de memoria
  if (memoryStore.has(idOrDataUrl)) {
    return memoryStore.get(idOrDataUrl) || null
  }

  const db = await getDB()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(idOrDataUrl)

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          memoryStore.set(idOrDataUrl, result)
          resolve(result)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

/**
 * Elimina una boleta de IndexedDB y del almacén de memoria.
 * 
 * @param {string} id - Identificador de la boleta a eliminar.
 * @returns {Promise<void>}
 */
export const deleteReceiptImage = async (id: string): Promise<void> => {
  if (!id) return
  memoryStore.delete(id)

  const db = await getDB()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    } catch {
      resolve()
    }
  })
}

/**
 * Exporta todas las boletas almacenadas como un diccionario clave-valor para respaldos JSON.
 * 
 * @returns {Promise<Record<string, string>>} Diccionario { [receiptId]: dataUrl }
 */
export const exportAllReceipts = async (): Promise<Record<string, string>> => {
  const result: Record<string, string> = {}

  // Añadir primero lo que esté en memoria
  memoryStore.forEach((value, key) => {
    result[key] = value
  })

  const db = await getDB()
  if (!db) return result

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const cursorRequest = store.openCursor()

      cursorRequest.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          result[cursor.key as string] = cursor.value
          cursor.continue()
        } else {
          resolve(result)
        }
      }

      cursorRequest.onerror = () => resolve(result)
    } catch {
      resolve(result)
    }
  })
}

/**
 * Restaura boletas desde un diccionario clave-valor (ej: al importar un respaldo JSON).
 * 
 * @param {Record<string, string>} receipts - Diccionario { [receiptId]: dataUrl }
 * @returns {Promise<void>}
 */
export const importAllReceipts = async (receipts: Record<string, string>): Promise<void> => {
  if (!receipts || typeof receipts !== 'object') return

  const entries = Object.entries(receipts)
  for (const [id, dataUrl] of entries) {
    if (id && dataUrl) {
      await saveReceiptImage(id, dataUrl)
    }
  }
}

/**
 * Limpia todas las boletas de la base de datos (ej: al reiniciar la app a cero).
 * 
 * @returns {Promise<void>}
 */
export const clearAllReceipts = async (): Promise<void> => {
  memoryStore.clear()

  const db = await getDB()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    } catch {
      resolve()
    }
  })
}
