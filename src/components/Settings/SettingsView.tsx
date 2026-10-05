import React, { useRef, useState } from 'react'
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'

export const SettingsView: React.FC = () => {
  const { exportToJSON, importFromJSON, exportToCSV, resetAllData } = useFinance()
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

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todos los datos a la demostración inicial? Esto reemplazará tus registros actuales.')) {
      resetAllData()
      alert('Datos restablecidos correctamente.')
    }
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Ajustes, Respaldo & PWA Móvil</h1>
        <p className="text-xs text-slate-400 mt-1">
          Exporta tus datos a Excel, crea copias de seguridad e instala la app en tu teléfono
        </p>
      </div>

      {/* 1. Respaldo y Portabilidad de Datos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Privacidad y Gestión de Datos</h2>
        </div>
        <p className="text-xs text-slate-400">
          Tus datos financieros residen exclusivamente en el almacenamiento seguro de tu propio navegador (<code className="text-emerald-400">LocalStorage</code>). Ningún dato se envía a servidores externos.
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
              <div className="text-xs text-slate-400">Descarga tu historial completo compatible con hojas de cálculo</div>
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
              <div className="text-xs text-slate-400">Guarda un archivo de respaldo con cuentas, cuotas y movimientos</div>
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
              <div className="text-xs text-slate-400">Cargar archivo JSON para sincronizar en otro dispositivo</div>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Restablecer demo */}
          <button
            onClick={handleReset}
            className="flex items-center space-x-3 p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors text-left"
          >
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Restablecer Datos Demo</div>
              <div className="text-xs text-slate-400">Recargar las cuentas y transacciones iniciales de ejemplo</div>
            </div>
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
          FinFlow está configurada como una Progressive Web App. No necesitas descargar nada desde App Store ni Google Play; puedes anclarla directamente a tu pantalla de inicio y se comportará como una aplicación nativa:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* iOS Safari */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>🍏</span>
              <span>En iPhone (Safari):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Abre la URL de la app en <strong>Safari</strong>.</li>
              <li>Toca el botón de <strong>Compartir</strong> (ícono de caja con flecha arriba).</li>
              <li>Baja y selecciona <strong>"Agregar a pantalla de inicio"</strong>.</li>
              <li>Toca "Agregar" arriba a la derecha. ¡Listo! Se abrirá en pantalla completa con su propio icono.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>🤖</span>
              <span>En Android (Chrome):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Abre la URL de la app en <strong>Google Chrome</strong>.</li>
              <li>Toca los <strong>tres puntos verticales (⋮)</strong> arriba a la derecha.</li>
              <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
              <li>Confirma y ya la tendrás en tu lista de apps como cualquier otra.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 3. Despliegue Gratuito en Vercel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Despliegue a la Nube (Hosting Gratuito en Vercel)</h2>
        </div>
        <p className="text-xs text-slate-400">
          El proyecto ya incluye <code className="text-emerald-400">vercel.json</code> y los scripts de compilación listos. Para tener tu propia URL permanente con HTTPS (ejemplo: <code className="text-indigo-400">mi-finflow.vercel.app</code>) puedes ejecutar desde la terminal del proyecto:
        </p>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
          <span>npx vercel</span>
          <span className="text-[11px] text-slate-500 font-sans">Despliegue guiado automático</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Vercel te pedirá iniciar sesión una sola vez (con GitHub, Google o email) y en 30 segundos te entregará tu enlace público seguro para acceder desde cualquier dispositivo móvil o computadora.
        </p>
      </div>
    </div>
  )
}
