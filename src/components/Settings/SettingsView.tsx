import React, { useRef, useState } from 'react'
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'

export const SettingsView: React.FC = () => {
  const { exportToJSON, importFromJSON, exportToCSV, resetToZero, loadDemoData } = useFinance()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async event => {
      const content = event.target?.result as string
      const success = await importFromJSON(content)
      if (success) {
        showNotification('success', '¡Datos restaurados con éxito desde el archivo de respaldo!')
      } else {
        showNotification('error', 'El archivo seleccionado no tiene un formato válido de respaldo de FinFlow.')
      }
    }
    reader.readAsText(file)
  }

  const handleStartSetup = () => {
    if (confirm('¿Deseas reiniciar la aplicación y abrir el asistente de configuración inicial? Se vaciarán los registros actuales para que configures tus cuentas reales.')) {
      resetToZero()
    }
  }

  const handleLoadDemo = () => {
    if (confirm('¿Deseas cargar las cuentas y movimientos de ejemplo? Esto te permitirá visualizar todas las funciones con datos de prueba.')) {
      loadDemoData()
      showNotification('success', 'Datos de prueba cargados con éxito.')
    }
  }

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de dejar la app completamente en cero (0 cuentas, 0 movimientos)?')) {
      resetToZero()
      showNotification('success', 'La aplicación se ha reiniciado a cero.')
    }
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight font-mono">Ajustes, Respaldo y PWA Movil</h1>
        <p className="text-xs text-ps-muted mt-1">
          Exporta tus datos a Excel, gestiona copias de seguridad o reinicia la configuracion
        </p>
      </div>

      {/* 1. Respaldo y Portabilidad de Datos */}
      <div className="bg-ps-surface border border-ps-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-ps-accent" />
          <h2 className="text-base font-bold text-white font-mono">Privacidad y Gestion de Datos</h2>
        </div>
        <p className="text-xs text-ps-muted">
          Tus datos residen exclusivamente en el almacenamiento seguro de tu navegador (<code className="text-ps-accent font-mono">LocalStorage</code> e <code className="text-ps-accent font-mono">IndexedDB</code>).
        </p>

        {statusMessage && (
          <div 
            role="status"
            className={`p-3 rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 border ${
              statusMessage.type === 'success'
                ? 'bg-ps-recessed border-ps-accent text-ps-accent'
                : 'bg-ps-recessed border-ps-danger text-ps-danger'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exportar CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-3 p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <div className="p-2 bg-ps-surface text-ps-accent border border-ps-border rounded-lg flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Exportar a Excel (CSV)</div>
              <div className="text-xs text-ps-muted">Descarga tu historial completo de movimientos</div>
            </div>
          </button>

          {/* Descargar JSON */}
          <button
            onClick={exportToJSON}
            className="flex items-center space-x-3 p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <div className="p-2 bg-ps-surface text-white border border-ps-border rounded-lg flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Copia de Seguridad (JSON)</div>
              <div className="text-xs text-ps-muted">Guarda archivo de respaldo con cuentas, cuotas y boletas</div>
            </div>
          </button>

          {/* Restaurar JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-3 p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <div className="p-2 bg-ps-surface text-ps-accent border border-ps-border rounded-lg flex-shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Restaurar Respaldo</div>
              <div className="text-xs text-ps-muted">Cargar archivo JSON para restaurar en este dispositivo</div>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Asistente de Setup Inicial */}
          <button
            onClick={handleStartSetup}
            className="flex items-center space-x-3 p-3.5 bg-ps-recessed hover:bg-ps-surface border border-ps-border rounded-xl transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <div className="p-2 bg-ps-surface text-ps-warning border border-ps-border rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Asistente de Setup Inicial</div>
              <div className="text-xs text-ps-muted">Reiniciar y configurar tus cuentas reales desde cero</div>
            </div>
          </button>
        </div>

        {/* Opciones avanzadas de datos */}
        <div className="pt-4 border-t border-ps-border/70 flex flex-wrap gap-3">
          <button
            onClick={handleLoadDemo}
            className="text-xs font-mono font-semibold px-3 py-2 bg-ps-recessed hover:bg-ps-surface text-ps-muted hover:text-white border border-ps-border rounded-xl transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-accent"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ps-muted" />
            <span>Cargar datos de prueba (Demo)</span>
          </button>

          <button
            onClick={handleClearAll}
            className="text-xs font-mono font-semibold px-3 py-2 bg-ps-recessed hover:bg-ps-danger text-ps-danger hover:text-ps-bg border border-ps-danger/50 rounded-xl transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ps-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dejar todo en cero</span>
          </button>
        </div>
      </div>

      {/* 2. Como anclar a la pantalla de inicio en tu Movil (PWA) */}
      <div className="bg-ps-surface border border-ps-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-ps-accent" />
          <h2 className="text-base font-bold text-white font-mono">Instalar en tu Telefono Movil (PWA)</h2>
        </div>
        <p className="text-xs text-ps-muted">
          FinFlow no requiere descargas de tiendas de apps. Puedes anclarla directamente a tu pantalla de inicio:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* iOS Safari */}
          <div className="p-4 bg-ps-recessed rounded-xl border border-ps-border space-y-2">
            <div className="text-xs font-bold font-mono text-white flex items-center space-x-1.5">
              <span>En iPhone (Safari):</span>
            </div>
            <ol className="text-xs text-ps-muted space-y-1.5 list-decimal list-inside font-mono">
              <li>Abre la URL en <strong className="text-white">Safari</strong>.</li>
              <li>Toca el boton de <strong className="text-white">Compartir</strong> (icono con flecha arriba).</li>
              <li>Baja y pulsa <strong className="text-white">"Agregar a pantalla de inicio"</strong>.</li>
              <li>Confirma en "Agregar". Se abrira en pantalla completa como app nativa.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 bg-ps-recessed rounded-xl border border-ps-border space-y-2">
            <div className="text-xs font-bold font-mono text-white flex items-center space-x-1.5">
              <span>En Android (Chrome):</span>
            </div>
            <ol className="text-xs text-ps-muted space-y-1.5 list-decimal list-inside font-mono">
              <li>Abre la URL en <strong className="text-white">Google Chrome</strong>.</li>
              <li>Toca los <strong className="text-white">tres puntos verticales</strong> arriba a la derecha.</li>
              <li>Elige <strong className="text-white">"Instalar aplicacion"</strong> o <strong className="text-white">"Agregar a la pantalla principal"</strong>.</li>
              <li>Confirma para anclarla al inicio.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
