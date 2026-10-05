/**
 * Comprime y escala una imagen para almacenamiento eficiente en LocalStorage.
 * Reduce fotos de cámara pesadas (de 5MB-15MB) a aproximadamente 50KB-90KB
 * preservando la legibilidad de textos, montos y fechas de la boleta.
 */
export const compressReceiptImage = (file: File, maxDimension: number = 960, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const img = new Image()

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calcular proporciones manteniendo relación de aspecto
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto 2D para comprimir la imagen'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a JPEG con compresión óptima
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.onerror = err => {
        reject(new Error('Error al cargar la imagen seleccionada'))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = err => {
      reject(new Error('Error al leer el archivo de la boleta'))
    }

    reader.readAsDataURL(file)
  })
}
