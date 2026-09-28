import { DocItem } from '../types/document';

const STORAGE_KEY = 'markdown_editor_documents_v1';
const ACTIVE_DOC_ID_KEY = 'markdown_editor_active_doc_id';

const INITIAL_DEMO_MARKDOWN = `# Bienvenido a Markdown Editor

**Markdown Editor** es una herramienta rápida, moderna y libre de distracciones diseñada para escribir documentación técnica, notas, especificaciones y prompts.

Escribe con el formato visual de un procesador de textos tradicional mientras se genera en tiempo real código **Markdown estándar, limpio y válido**.

---

## Características Principales

- **Editor WYSIWYG completo**: Aplica formatos sin recordar comandos ni etiquetas.
- **Sincronización en tiempo real**: Visualiza el Markdown resultante al instante.
- **Exportación versátil**: Descarga en formato \`.md\`, imprime o genera PDF profesional.
- **Sin backend**: Todos tus documentos se guardan de forma segura en tu navegador localmente.
- **Importación directa**: Carga cualquier archivo \`.md\` arrastrándolo o con el botón *Importar*.

---

## Ejemplos de Formato Soportado

Puedes aplicar estilos seleccionando texto o usando la barra de herramientas:

### 1. Énfasis y Texto
- Texto en **negrita** para resaltar conceptos clave.
- Texto en *cursiva* para términos y definiciones.
- Texto ~~tachado~~ para revisiones.
- \`código inline\` para nombres de variables y comandos cortos.

### 2. Citas y Notas
> "La simplicidad es la máxima sofisticación."
> — Leonardo da Vinci

### 3. Bloques de Código Técnico
\`\`\`typescript
interface DocumentItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export function saveDocument(doc: DocumentItem): void {
  localStorage.setItem(doc.id, JSON.stringify(doc));
}
\`\`\`

### 4. Tablas Estructuradas

| Característica | Soporte | Modo de uso |
| :--- | :--- | :--- |
| WYSIWYG | Nativo | Barra de herramientas |
| Markdown GFM | Sí | Sincronización continua |
| Exportación PDF | Sí | Vista de impresión limpia |
| Atajos de teclado | Sí | Ctrl+S, Ctrl+P, Ctrl+N |

---

## Atajos de Teclado Útiles

- \`Ctrl / Cmd + S\` → Guardar documento
- \`Ctrl / Cmd + Shift + S\` → Descargar archivo Markdown
- \`Ctrl / Cmd + P\` → Imprimir / Exportar a PDF
- \`Ctrl / Cmd + N\` → Crear nuevo documento
- \`Ctrl / Cmd + F\` → Buscar entre documentos

Comienza a editar este documento o crea uno nuevo con el botón **+ Nuevo** en el panel lateral.`;

export function getStoredDocuments(): DocItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialDoc: DocItem = {
        id: 'doc-welcome-guide',
        title: 'Guía de Inicio',
        content: INITIAL_DEMO_MARKDOWN,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now(),
      };
      saveStoredDocuments([initialDoc]);
      return [initialDoc];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading documents from localStorage:', e);
  }

  const fallbackDoc: DocItem = {
    id: `doc-${Date.now()}`,
    title: 'Mi primer documento',
    content: INITIAL_DEMO_MARKDOWN,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveStoredDocuments([fallbackDoc]);
  return [fallbackDoc];
}

export function saveStoredDocuments(docs: DocItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving documents to localStorage:', e);
  }
}

export function getActiveDocId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_DOC_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveDocId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_DOC_ID_KEY, id);
  } catch (e) {
    console.error('Error saving active doc ID:', e);
  }
}

export function createNewDocument(title: string = 'Sin título', initialContent: string = ''): DocItem {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim() || 'Sin título',
    content: initialContent || `# ${title.trim() || 'Sin título'}\n\nComienza a escribir aquí...`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function sanitizeFileName(name: string): string {
  const clean = name.replace(/[/\\?%*:|"<>]/g, '-').trim();
  return clean || 'documento';
}
