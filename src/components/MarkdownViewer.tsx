import React, { useState } from 'react';
import { Copy, Check, Download, FileCode2, Edit3, Eye } from 'lucide-react';

interface MarkdownViewerProps {
  markdown: string;
  onMarkdownChange: (newMarkdown: string) => void;
  onDownload: () => void;
  isEditable?: boolean;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  markdown,
  onMarkdownChange,
  onDownload,
  isEditable = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [editableMode, setEditableMode] = useState(isEditable);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown: ', err);
    }
  };

  const lines = markdown.split(/\r\n|\r|\n/);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden border-l border-slate-800 markdown-preview-pane">
      {/* Markdown viewer header */}
      <div className="h-10 bg-slate-950/80 px-4 flex items-center justify-between border-b border-slate-800/80 select-none shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono font-medium text-slate-200">MARKDOWN</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {lines.length} {lines.length === 1 ? 'línea' : 'líneas'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle editable raw markdown */}
          <button
            onClick={() => setEditableMode(!editableMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              editableMode
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={editableMode ? 'Cambiar a modo lectura' : 'Editar Markdown directamente'}
          >
            {editableMode ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
            <span className="hidden sm:inline">
              {editableMode ? 'Solo lectura' : 'Editar MD'}
            </span>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copiar contenido Markdown al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={onDownload}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Descargar archivo .md"
            aria-label="Descargar archivo Markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Markdown viewer body */}
      <div className="flex-1 flex overflow-hidden">
        {editableMode ? (
          <textarea
            value={markdown}
            onChange={(e) => onMarkdownChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-indigo-500/40"
            placeholder="Escribe o pega Markdown aquí..."
          />
        ) : (
          <div className="flex-1 flex overflow-y-auto p-4 select-text">
            {/* Line numbers */}
            <div
              className="pr-3 select-none text-right font-mono text-xs text-slate-600 space-y-0.5 leading-relaxed border-r border-slate-800/80 mr-3"
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code text */}
            <pre className="flex-1 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap break-words overflow-x-auto selection:bg-indigo-500/40">
              {markdown || <span className="text-slate-600 italic">Documento vacío</span>}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
