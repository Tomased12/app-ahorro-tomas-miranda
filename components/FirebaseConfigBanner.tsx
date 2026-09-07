'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Database, ExternalLink, Sparkles } from 'lucide-react';

interface FirebaseConfigBannerProps {
  onLoadMockData: () => void;
  hasMockData: boolean;
}

export const FirebaseConfigBanner: React.FC<FirebaseConfigBannerProps> = ({
  onLoadMockData,
  hasMockData,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-xs shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Modo Demo Local Activado</p>
            <p className="text-amber-300/80 text-xs">
              La aplicación está funcionando localmente. Conecta Firebase para guardar tus datos en la nube en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasMockData && (
            <button
              onClick={onLoadMockData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Datos de Ejemplo</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/20 transition-all text-xs"
          >
            <span>Ver Instrucciones</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2 text-slate-300">
          <p className="font-semibold text-white">Para conectar tu propia base de datos Firebase:</p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>
              Entra en{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline inline-flex items-center gap-1"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>{' '}
              y crea un proyecto (ej: &quot;finanzas-tomas-miranda&quot;).
            </li>
            <li>Habilita <strong>Cloud Firestore</strong> en modo de prueba (o pega las reglas de <code className="text-amber-200">firestore.rules</code>).</li>
            <li>Ve a <strong>Configuración del proyecto &gt; General &gt; Tus apps &gt; Web (icono &lt;/&gt;)</strong> y copia las credenciales en tu archivo <code className="text-amber-200">.env.local</code>.</li>
            <li>Reinicia el servidor con <code className="text-amber-200">npm run dev</code> ¡y listo! Tus datos se sincronizarán en tiempo real.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
