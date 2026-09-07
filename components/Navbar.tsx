'use client';

import React from 'react';
import { Wallet, User, Users, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { UserFilter, UserProfile } from '@/types';

interface NavbarProps {
  activeUser: UserFilter;
  onSelectUser: (user: UserFilter) => void;
  isLiveFirebase: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  onSelectUser,
  isLiveFirebase,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Titulo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Finanzas
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                T & M
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Tomas & Miranda • Splitwise & Ahorro
            </p>
          </div>
        </div>

        {/* Indicador de Conexión + Switcher de Perfil */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Indicador de estado de Firebase */}
          <div
            title={
              isLiveFirebase
                ? 'Conectado en tiempo real a Firebase Cloud Firestore'
                : 'Modo Local / Demo (Faltan variables en .env.local)'
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-900/80 cursor-default transition-all"
            style={{
              borderColor: isLiveFirebase ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
            }}
          >
            {isLiveFirebase ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline text-emerald-400 text-[11px]">Firestore Online</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="hidden md:inline text-amber-400 text-[11px]">Modo Demo</span>
              </>
            )}
          </div>

          {/* Selector de Perfil */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => onSelectUser('Tomas')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeUser === 'Tomas'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
              <span>Tomas</span>
            </button>

            <button
              onClick={() => onSelectUser('Miranda')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeUser === 'Miranda'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-pink-300"></div>
              <span>Miranda</span>
            </button>

            <button
              onClick={() => onSelectUser('Todos')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeUser === 'Todos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hogar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
