import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Image } from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  Rows,
  Columns,
  Trash,
} from 'lucide-react';
import { Modal } from './Modal';

interface WysiwygEditorProps {
  initialContent: string; // HTML string
  onChange: (html: string) => void;
  title: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  initialContent,
  onChange,
  title,
}) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const isUpdatingFromProps = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (!isUpdatingFromProps.current) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content prose max-w-none focus:outline-none min-h-[500px] text-slate-800',
      },
    },
  });

  // When initialContent changes from switching documents or importing
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      isUpdatingFromProps.current = true;
      editor.commands.setContent(initialContent, { emitUpdate: false });
      isUpdatingFromProps.current = false;
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
        Cargando editor...
      </div>
    );
  }

  // Handle link modal
  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    if (linkUrl.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.trim() })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkModalOpen(false);
  };

  // Handle image modal
  const handleApplyImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setImageModalOpen(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor.chain().focus().setImage({ src: reader.result }).run();
          setImageModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle table insertion
  const handleInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    setTableMenuOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Compact, clean WYSIWYG Toolbar */}
      <div className="border-b border-slate-200/90 bg-slate-50/80 px-4 py-1.5 flex flex-wrap items-center gap-1 shrink-0 select-none z-10 no-print">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Deshacer (Ctrl + Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Rehacer (Ctrl + Shift + Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('paragraph') &&
              !editor.isActive('heading')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Párrafo normal"
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Título H1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Título H2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Título H3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline styles: Bold, Italic, Strike, Inline Code */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Negrita (Ctrl + B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Cursiva (Ctrl + I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Tachado"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('code')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Código inline"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Blockquote */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Cita"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('codeBlock')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Bloque de código"
          >
            <span className="font-mono text-xs font-bold px-1">{'{}'}</span>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Línea horizontal"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Links, Images, Tables */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
          <button
            onClick={openLinkModal}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              editor.isActive('link')
                ? 'bg-slate-200 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Insertar o editar enlace"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive('link') && (
            <button
              onClick={handleRemoveLink}
              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Quitar enlace"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Insertar imagen"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Table menu */}
          <div className="relative">
            <button
              onClick={() => setTableMenuOpen(!tableMenuOpen)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                editor.isActive('table')
                  ? 'bg-slate-200 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Opciones de tabla"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>

            {tableMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                {!editor.isActive('table') ? (
                  <button
                    onClick={handleInsertTable}
                    className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Insertar tabla 3x3</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setTableMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Rows className="w-3.5 h-3.5 text-slate-500" />
                      <span>Agregar fila debajo</span>
                    </button>
                    <button
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setTableMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5 text-slate-500" />
                      <span>Agregar columna derecha</span>
                    </button>
                    <button
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setTableMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Rows className="w-3.5 h-3.5 text-rose-500" />
                      <span>Eliminar fila</span>
                    </button>
                    <button
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setTableMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5 text-rose-500" />
                      <span>Eliminar columna</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setTableMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5 text-rose-600" />
                      <span>Eliminar tabla</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clear formatting */}
        <div className="flex items-center gap-0.5 pl-1.5">
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Limpiar formato"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Link Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Insertar enlace"
        footer={
          <>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="mr-auto text-xs text-rose-600 hover:underline cursor-pointer"
              >
                Eliminar enlace
              </button>
            )}
            <button
              onClick={() => setLinkModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyLink}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 cursor-pointer"
            >
              Aplicar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            Dirección URL
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyLink();
              }
            }}
          />
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Insertar imagen"
        footer={
          <>
            <button
              onClick={() => setImageModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyImage}
              disabled={!imageUrl.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
            >
              Insertar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://imagenes.com/foto.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-xs text-slate-400">o subir archivo local</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Seleccionar imagen desde tu dispositivo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
