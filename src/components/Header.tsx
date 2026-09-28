import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Save,
  Download,
  Printer,
  FileDown,
  Columns2,
  FileEdit,
  Code2,
  Check,
  Loader2,
  HelpCircle,
  Pencil,
} from 'lucide-react';
import { ViewMode } from '../types/document';

interface HeaderProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onDownloadMd: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
  stats: {
    words: number;
    characters: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onUpdateTitle,
  isSaving,
  onSave,
  onDownloadMd,
  onPrint,
  onExportPdf,
  viewMode,
  onChangeViewMode,
  onToggleSidebar,
  onOpenShortcuts,
  stats,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== title) {
      onUpdateTitle(trimmed);
    } else {
      setTitleInput(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleInput(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between gap-3 shrink-0 select-none no-print">
      {/* Left side: Toggle sidebar + Editable Title + Save status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Alternar barra lateral"
          aria-label="Alternar barra lateral"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Editable document title */}
        <div className="relative flex items-center min-w-0 max-w-xs md:max-w-md">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="text-sm font-semibold text-slate-900 px-2 py-1 bg-slate-50 border border-indigo-400 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs w-full"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-slate-100 transition-colors text-left truncate cursor-pointer"
              title="Haz clic para editar el nombre del documento"
            >
              <span className="text-sm font-semibold text-slate-900 truncate">
                {title || 'Sin título'}
              </span>
              <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>

        {/* Status indicator: Guardado / Guardando... (Clean, unboxed text per guidelines) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 ml-1">
          <span aria-hidden="true" className="text-slate-300">·</span>
          {isSaving ? (
            <div className="flex items-center gap-1 text-amber-600 font-medium text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span>Guardando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
              <Check className="w-3 h-3 shrink-0" />
              <span>Guardado</span>
            </div>
          )}
        </div>
      </div>

      {/* Center/Right: View mode tabs & Stats */}
      <div className="flex items-center gap-2">
        {/* Typographic stats */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 mr-2">
          <span>{stats.words} palabras</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{stats.characters} caracteres</span>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
          <button
            onClick={() => onChangeViewMode('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              viewMode === 'editor'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista solo Editor WYSIWYG"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Editor</span>
          </button>
          <button
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista dividida (Editor | Markdown)"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dividido</span>
          </button>
          <button
            onClick={() => onChangeViewMode('markdown')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              viewMode === 'markdown'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista solo Markdown"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Markdown</span>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Action buttons: Guardar, Descargar MD, PDF, Imprimir */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Guardar documento (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Guardar</span>
          </button>

          <button
            onClick={onDownloadMd}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title={`Descargar archivo ${title}.md (Ctrl + Shift + S)`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar MD</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Exportar a PDF profesional"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">PDF</span>
          </button>

          <button
            onClick={onPrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Imprimir documento (Ctrl + P)"
            aria-label="Imprimir documento"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenShortcuts}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Ver atajos de teclado"
            aria-label="Ver atajos de teclado"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
