/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DocItem, ViewMode, ToastMessage } from './types/document';
import {
  getStoredDocuments,
  saveStoredDocuments,
  getActiveDocId,
  setActiveDocId,
  createNewDocument,
  sanitizeFileName,
} from './utils/storage';
import {
  htmlToMarkdown,
  markdownToHtml,
  getDocumentStats,
} from './utils/markdownConverter';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WysiwygEditor } from './components/WysiwygEditor';
import { MarkdownViewer } from './components/MarkdownViewer';
import { PrintContainer } from './components/PrintContainer';
import { Toast } from './components/Toast';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  const [documents, setDocuments] = useState<DocItem[]>(() => getStoredDocuments());
  const [activeId, setActiveId] = useState<string>(() => {
    const savedActiveId = getActiveDocId();
    const stored = getStoredDocuments();
    if (savedActiveId && stored.some((d) => d.id === savedActiveId)) {
      return savedActiveId;
    }
    return stored[0]?.id || '';
  });

  const activeDoc = documents.find((d) => d.id === activeId) || documents[0];

  const [currentMarkdown, setCurrentMarkdown] = useState<string>(() => {
    return activeDoc ? activeDoc.content : '';
  });

  const [currentHtml, setCurrentHtml] = useState<string>(() => {
    return activeDoc ? markdownToHtml(activeDoc.content) : '';
  });

  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add toast notification
  const addToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state when active document changes
  useEffect(() => {
    if (activeDoc) {
      setCurrentMarkdown(activeDoc.content);
      setCurrentHtml(markdownToHtml(activeDoc.content));
      setActiveDocId(activeDoc.id);
    }
  }, [activeDoc?.id]);

  // Persist documents whenever documents array changes
  useEffect(() => {
    saveStoredDocuments(documents);
  }, [documents]);

  // Autosave when markdown changes with debounce
  const triggerAutoSave = useCallback((newMarkdown: string, docId: string) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === docId
            ? { ...doc, content: newMarkdown, updatedAt: Date.now() }
            : doc
        )
      );
      setIsSaving(false);
    }, 450);
  }, []);

  // Handle WYSIWYG editor changes
  const handleEditorChange = useCallback((newHtml: string) => {
    setCurrentHtml(newHtml);
    const convertedMd = htmlToMarkdown(newHtml);
    setCurrentMarkdown(convertedMd);
    if (activeDoc) {
      triggerAutoSave(convertedMd, activeDoc.id);
    }
  }, [activeDoc, triggerAutoSave]);

  // Handle direct Markdown edits (bidirectional sync)
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setCurrentMarkdown(newMarkdown);
    const convertedHtml = markdownToHtml(newMarkdown);
    setCurrentHtml(convertedHtml);
    if (activeDoc) {
      triggerAutoSave(newMarkdown, activeDoc.id);
    }
  }, [activeDoc, triggerAutoSave]);

  // Document creation
  const handleCreateDocument = () => {
    const newDoc = createNewDocument('Nuevo documento');
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveId(newDoc.id);
    setCurrentMarkdown(newDoc.content);
    setCurrentHtml(markdownToHtml(newDoc.content));
    addToast('Nuevo documento creado', 'info');
  };

  // Rename document
  const handleRenameDocument = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: trimmed, updatedAt: Date.now() } : d))
    );
    addToast('Nombre actualizado', 'info');
  };

  // Duplicate document
  const handleDuplicateDocument = (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    const duplicate: DocItem = {
      ...target,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [duplicate, ...prev]);
    setActiveId(duplicate.id);
    addToast('Documento duplicado', 'info');
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    const remaining = documents.filter((d) => d.id !== id);
    if (remaining.length === 0) {
      const fallback = createNewDocument('Documento vacío');
      setDocuments([fallback]);
      setActiveId(fallback.id);
    } else {
      setDocuments(remaining);
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
    }
    addToast('Documento eliminado', 'info');
  };

  // Import .md file
  const handleImportDocument = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Strip extension from file name
        const cleanName = file.name.replace(/\.(md|markdown|txt)$/i, '').trim();
        const newDoc: DocItem = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: cleanName || 'Documento importado',
          content: text,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setActiveId(newDoc.id);
        setCurrentMarkdown(text);
        setCurrentHtml(markdownToHtml(text));
        addToast(`"${newDoc.title}" importado con éxito`, 'success');
      } catch (err) {
        console.error('Error importing file:', err);
        addToast('Error al importar el archivo', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Download Markdown file
  const handleDownloadDoc = (doc?: DocItem) => {
    const targetDoc = doc || activeDoc;
    if (!targetDoc) return;

    const contentToDownload = doc ? doc.content : currentMarkdown;
    const blob = new Blob([contentToDownload], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFileName(targetDoc.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Descargado: ${sanitizeFileName(targetDoc.title)}.md`, 'success');
  };

  // Manual save
  const handleManualSave = () => {
    if (activeDoc) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDoc.id
            ? { ...d, content: currentMarkdown, updatedAt: Date.now() }
            : d
        )
      );
      addToast('Guardado correctamente', 'success');
    }
  };

  // Print & PDF
  const handlePrint = () => {
    const originalTitle = document.title;
    if (activeDoc) {
      document.title = activeDoc.title;
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleExportPdf = () => {
    handlePrint();
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      // Ctrl + Shift + S -> Download Markdown
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleDownloadDoc();
        return;
      }

      // Ctrl + S -> Save
      if (!e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleManualSave();
        return;
      }

      // Ctrl + P -> Print
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrint();
        return;
      }

      // Ctrl + N -> New Document
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleCreateDocument();
        return;
      }

      // Ctrl + F -> Focus search input
      if (e.key === 'f' || e.key === 'F') {
        // If sidebar is collapsed, open it
        if (!sidebarOpen) setSidebarOpen(true);
        if (searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeDoc, currentMarkdown, sidebarOpen]);

  const docStats = getDocumentStats(currentMarkdown);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        documents={documents}
        activeDocId={activeId}
        onSelectDoc={setActiveId}
        onCreateDoc={handleCreateDocument}
        onImportDoc={handleImportDocument}
        onRenameDoc={handleRenameDocument}
        onDeleteDoc={handleDeleteDocument}
        onDuplicateDoc={handleDuplicateDocument}
        onDownloadDoc={handleDownloadDoc}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchRef={searchInputRef}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          title={activeDoc?.title || 'Sin título'}
          onUpdateTitle={(newTitle) => activeDoc && handleRenameDocument(activeDoc.id, newTitle)}
          isSaving={isSaving}
          onSave={handleManualSave}
          onDownloadMd={() => handleDownloadDoc()}
          onPrint={handlePrint}
          onExportPdf={handleExportPdf}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          stats={docStats}
        />

        {/* Content Panes: WYSIWYG Editor and/or Markdown Viewer */}
        <main className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* WYSIWYG Editor Pane */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div
              className={`h-full flex flex-col min-w-0 ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <WysiwygEditor
                key={activeDoc?.id || 'default-editor'}
                title={activeDoc?.title || ''}
                initialContent={currentHtml}
                onChange={handleEditorChange}
              />
            </div>
          )}

          {/* Markdown Viewer Pane */}
          {(viewMode === 'markdown' || viewMode === 'split') && (
            <div
              className={`h-full flex flex-col min-w-0 ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <MarkdownViewer
                markdown={currentMarkdown}
                onMarkdownChange={handleMarkdownChange}
                onDownload={() => handleDownloadDoc()}
                isEditable={viewMode === 'markdown'}
              />
            </div>
          )}
        </main>
      </div>

      {/* Dedicated Print Container for Window Print & PDF Export */}
      <PrintContainer
        title={activeDoc?.title || 'Documento'}
        htmlContent={currentHtml}
        updatedAt={activeDoc?.updatedAt || Date.now()}
      />

      {/* Keyboard Shortcuts Reference Dialog */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Subtle Toast Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
