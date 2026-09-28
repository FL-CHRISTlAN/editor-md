import React from 'react';
import { Modal } from './Modal';
import { Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + S`, desc: 'Guardar documento actual' },
    { key: `${modKey} + Shift + S`, desc: 'Descargar archivo .md' },
    { key: `${modKey} + P`, desc: 'Imprimir o guardar como PDF' },
    { key: `${modKey} + N`, desc: 'Crear nuevo documento' },
    { key: `${modKey} + F`, desc: 'Buscar en la lista de documentos' },
    { key: `${modKey} + B`, desc: 'Formato negrita' },
    { key: `${modKey} + I`, desc: 'Formato cursiva' },
    { key: `${modKey} + Z`, desc: 'Deshacer cambio' },
    { key: `${modKey} + Shift + Z`, desc: 'Rehacer cambio' },
    { key: 'Tab', desc: 'Siguiente celda en tabla / Indentar lista' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atajos de Teclado"
      maxWidth="max-w-md"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Entendido
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Command className="w-3.5 h-3.5 text-slate-400" />
          <span>Combinaciones rápidas para escribir a máxima velocidad</span>
        </div>
        <div className="divide-y divide-slate-100 text-sm">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">{item.desc}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-800 font-semibold shadow-2xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
