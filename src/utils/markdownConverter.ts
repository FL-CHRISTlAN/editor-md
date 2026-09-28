import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm lacks explicit ESM typescript exports
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';

// Configure Turndown for clean, valid, standard GitHub Flavored Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Enable GFM (tables, strikethrough, task lists)
try {
  turndownService.use(gfm);
} catch (e) {
  console.warn('Failed to load turndown-plugin-gfm:', e);
}

// Custom rule for code blocks to preserve language
turndownService.addRule('fencedCodeBlockWithLang', {
  filter: (node: HTMLElement) => {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild !== null &&
      node.firstChild.nodeName === 'CODE'
    );
  },
  replacement: (_content: string, node: HTMLElement) => {
    const codeNode = node.firstChild as HTMLElement;
    const className = codeNode.getAttribute('class') || '';
    const langMatch = className.match(/language-(\S+)/);
    const lang = langMatch ? langMatch[1] : '';
    const code = codeNode.textContent || '';
    return `\n\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\n`;
  },
});

/**
 * Converts HTML from WYSIWYG editor into clean Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>' || html === '<p><br></p>') {
    return '';
  }
  try {
    const md = turndownService.turndown(html);
    return md;
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return html;
  }
}

/**
 * Converts Markdown text into HTML for the WYSIWYG editor
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return '<p></p>';
  }
  try {
    const parsed = marked.parse(markdown, {
      async: false,
      gfm: true,
      breaks: false,
    });
    return typeof parsed === 'string' ? parsed : '';
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    return `<p>${escapeHtml(markdown)}</p>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Computes document statistics
 */
export function getDocumentStats(markdown: string) {
  const characters = markdown.length;
  const charactersWithoutSpaces = markdown.replace(/\s+/g, '').length;
  const words = markdown
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const lines = markdown.split(/\r\n|\r|\n/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    characters,
    charactersWithoutSpaces,
    words,
    lines,
    readingTimeMinutes,
  };
}
