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
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const content = event.target?.result as string
      const success = importFromJSON(content)
      if (success) {
        setImportStatus('¡Datos restaurados con éxito!')
        setTimeout(() => setImportStatus(null), 4000)
      } else {
        alert('El archivo seleccionado no tiene un formato válido de respaldo de FinFlow.')
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
      alert('Datos de prueba cargados con éxito.')
    }
  }

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de dejar la app completamente en cero (0 cuentas, 0 movimientos)?')) {
      resetToZero()
    }
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Ajustes, Respaldo & PWA Móvil</h1>
        <p className="text-xs text-slate-400 mt-1">
          Exporta tus datos a Excel, gestiona copias de seguridad o reinicia la configuración
        </p>
      </div>

      {/* 1. Respaldo y Portabilidad de Datos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Privacidad y Gestión de Datos</h2>
        </div>
        <p className="text-xs text-slate-400">
          Tus datos residen exclusivamente en el almacenamiento de tu navegador (<code className="text-emerald-400">LocalStorage</code>).
        </p>

        {importStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exportar CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-3 p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Exportar a Excel (CSV)</div>
              <div className="text-xs text-slate-400">Descarga tu historial completo de movimientos</div>
            </div>
          </button>

          {/* Descargar JSON */}
          <button
            onClick={exportToJSON}
            className="flex items-center space-x-3 p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
          >
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Copia de Seguridad (JSON)</div>
              <div className="text-xs text-slate-400">Guarda archivo de respaldo con cuentas, cuotas y movimientos</div>
            </div>
          </button>

          {/* Restaurar JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-3 p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
          >
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg flex-shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Restaurar Respaldo</div>
              <div className="text-xs text-slate-400">Cargar archivo JSON para restaurar en este dispositivo</div>
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
            className="flex items-center space-x-3 p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
          >
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Asistente de Setup Inicial</div>
              <div className="text-xs text-slate-400">Reiniciar y configurar tus cuentas reales desde cero</div>
            </div>
          </button>
        </div>

        {/* Opciones avanzadas de datos */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
          <button
            onClick={handleLoadDemo}
            className="text-xs font-semibold px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Cargar datos de prueba (Demo)</span>
          </button>

          <button
            onClick={handleClearAll}
            className="text-xs font-semibold px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Dejar todo en cero</span>
          </button>
        </div>
      </div>

      {/* 2. Cómo anclar a la pantalla de inicio en tu Móvil (PWA) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Instalar en tu Teléfono Móvil (PWA)</h2>
        </div>
        <p className="text-xs text-slate-400">
          FinFlow no requiere descargas de tiendas de apps. Puedes anclarla directamente a tu pantalla de inicio:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* iOS Safari */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>🍏</span>
              <span>En iPhone (Safari):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Abre la URL en <strong>Safari</strong>.</li>
              <li>Toca el botón de <strong>Compartir</strong> (ícono de caja con flecha arriba).</li>
              <li>Baja y pulsa <strong>"Agregar a pantalla de inicio"</strong>.</li>
              <li>Confirma en "Agregar". Se abrirá en pantalla completa como app nativa.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>🤖</span>
              <span>En Android (Chrome):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Abre la URL en <strong>Google Chrome</strong>.</li>
              <li>Toca los <strong>tres puntos verticales (⋮)</strong> arriba a la derecha.</li>
              <li>Elige <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
              <li>Confirma para anclarla al inicio.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
