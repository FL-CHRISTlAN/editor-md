import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  Download,
  Calendar,
  X,
  FileCode,
} from 'lucide-react';
import { DocItem } from '../types/document';
import { Modal } from './Modal';

interface SidebarProps {
  documents: DocItem[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onImportDoc: (file: File) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onDeleteDoc: (id: string) => void;
  onDuplicateDoc: (id: string) => void;
  onDownloadDoc: (doc: DocItem) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onImportDoc,
  onRenameDoc,
  onDeleteDoc,
  onDuplicateDoc,
  onDownloadDoc,
  isOpen,
  onCloseMobile,
  searchQuery,
  setSearchQuery,
  searchRef,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocItem | null>(null);
  const [docToRename, setDocToRename] = useState<DocItem | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDoc(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  });

  const openRenameModal = (doc: DocItem) => {
    setDocToRename(doc);
    setRenameInputValue(doc.title);
    setMenuOpenId(null);
  };

  const handleConfirmRename = () => {
    if (docToRename && renameInputValue.trim()) {
      onRenameDoc(docToRename.id, renameInputValue.trim());
      setDocToRename(null);
    }
  };

  const openDeleteModal = (doc: DocItem) => {
    setDocToDelete(doc);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      onDeleteDoc(docToDelete.id);
      setDocToDelete(null);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'
        }`}
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">
                Markdown Editor
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                WYSIWYG & GFM Sync
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Cerrar barra lateral"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons: + Nuevo & Importar */}
        <div className="p-3 border-b border-slate-800/80 flex gap-2">
          <button
            onClick={onCreateDoc}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Importar archivo .md existente"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Importar</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.markdown,text/markdown,text/plain"
            className="hidden"
          />
        </div>

        {/* Search input */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" ref={menuContainerRef}>
          <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Documentos ({filteredDocs.length})
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {searchQuery ? 'No se encontraron documentos' : 'No hay documentos'}
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isActive = doc.id === activeDocId;
              const isMenuOpen = menuOpenId === doc.id;
              const dateFormatted = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={doc.id}
                  className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <FileText
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs leading-snug">{doc.title}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-2.5 h-2.5 shrink-0" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context menu button "..." */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpenId(isMenuOpen ? null : doc.id)}
                      className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ${
                        isMenuOpen ? 'bg-slate-700 text-white opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label="Opciones del documento"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-200">
                        <button
                          onClick={() => openRenameModal(doc)}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Renombrar</span>
                        </button>
                        <button
                          onClick={() => {
                            onDuplicateDoc(doc.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duplicar</span>
                        </button>
                        <button
                          onClick={() => {
                            onDownloadDoc(doc);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>Descargar .md</span>
                        </button>
                        <div className="my-1 border-t border-slate-700/80" />
                        <button
                          onClick={() => openDeleteModal(doc)}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-950/60 text-rose-300 text-left transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Almacenamiento Local</span>
          <span className="font-mono text-[10px] text-slate-400">v1.0</span>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="¿Eliminar documento?"
        footer={
          <>
            <button
              onClick={() => setDocToDelete(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Eliminar definitivamente
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Estás seguro de que deseas eliminar el documento{' '}
          <strong className="text-slate-900 font-semibold">
            "{docToDelete?.title}"
          </strong>
          ? Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Rename Document Modal */}
      <Modal
        isOpen={Boolean(docToRename)}
        onClose={() => setDocToRename(null)}
        title="Renombrar documento"
        footer={
          <>
            <button
              onClick={() => setDocToRename(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmRename}
              disabled={!renameInputValue.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Guardar nombre
            </button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmRename();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nombre del documento
            </label>
            <input
              type="text"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
        </form>
      </Modal>
    </>
  );
};
