/**
 * Rich-text (HTML) helpers for event descriptions — WordPress-style editing.
 *
 * The Detailed Description field is stored as sanitized HTML (produced by the
 * contentEditable editor in @/components/rich-text-editor). Older events store
 * markdown, so `renderRichText` auto-detects the format and renders either
 * sanitized HTML or legacy markdown.
 *
 * The sanitizer is a pure function (no DOM) so it runs identically in the
 * browser (on paste) and on the server (on render) — no XSS can slip through.
 */
import {renderMarkdown} from './markdown';

/** Tags we keep. Anything else is dropped (its inner text is preserved). */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'ins', 'mark', 'small', 'sub', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'blockquote', 'hr', 'a', 'img', 'iframe',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'pre', 'code', 'figure',
  'figcaption',
]);

/** Tags whose content (not just the tag) must be discarded. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'head', 'noscript', 'svg', 'math', 'template', 'object', 'embed',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img', 'iframe']);

function isSafeUrl(raw: string, extraSchemes: string[] = []): boolean {
  const u = (raw || '').trim();
  if (!u) return false;
  const lower = u.toLowerCase();
  if (lower.startsWith('//')) return true; // protocol-relative → https
  const m = lower.match(/^([a-z][a-z0-9+.-]*):/);
  if (m) return ['https:', 'http:', ...extraSchemes].includes(m[1]);
  return true; // relative URL — resolves against the site
}

/** https iframes are a separate origin — safe once on* attrs/styles are stripped. */
function safeIframeSrc(raw: string): boolean {
  if (!isSafeUrl(raw)) return false;
  try {
    const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

type Attr = {name: string; value: string};

function parseAttrs(attrStr: string): Attr[] {
  const out: Attr[] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrStr))) {
    out.push({name: m[1].toLowerCase(), value: m[2] ?? m[3] ?? m[4] ?? ''});
  }
  return out;
}

const esc = (v: string) => v.replace(/"/g, '&quot;');

function filterAttrs(tag: string, attrs: Attr[]): string {
  const kept: string[] = [];
  for (const {name, value} of attrs) {
    if (name.startsWith('on')) continue; // onclick etc.
    if (name === 'style' || name === 'srcdoc' || name === 'formaction' || name === 'class' || name === 'id') continue;

    if (tag === 'a') {
      if (name === 'href') {
        if (!isSafeUrl(value, ['mailto:'])) continue;
        kept.push(`href="${esc(value)}"`, 'target="_blank"', 'rel="noopener noreferrer"');
      }
      continue;
    }
    if (tag === 'img') {
      if (name === 'src') {
        if (!isSafeUrl(value)) continue;
        kept.push(`src="${esc(value)}"`);
      } else if (name === 'width' || name === 'height') {
        if (/^\d{1,4}$/.test(value)) kept.push(`${name}="${value}"`);
      } else if (name === 'alt') {
        kept.push(`alt="${esc(value)}"`);
      }
      continue;
    }
    if (tag === 'iframe') {
      if (name === 'src') {
        if (!safeIframeSrc(value)) continue;
        kept.push(`src="${esc(value)}"`);
      } else if (name === 'width' || name === 'height') {
        if (/^\d{1,4}$/.test(value)) kept.push(`${name}="${value}"`);
      } else if (name === 'allowfullscreen') {
        kept.push('allowfullscreen');
      } else if (name === 'frameborder') {
        kept.push('frameborder="0"');
      } else if (name === 'allow') {
        kept.push('allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"');
      } else if (name === 'title') {
        kept.push(`title="${esc(value)}"`);
      }
      continue;
    }
    if ((tag === 'td' || tag === 'th') && (name === 'colspan' || name === 'rowspan')) {
      if (/^\d{1,2}$/.test(value)) kept.push(`${name}="${value}"`);
      continue;
    }
    if (tag === 'ol' && name === 'start') {
      if (/^\d{1,6}$/.test(value)) kept.push(`start="${value}"`);
      continue;
    }
  }
  return kept.length ? ' ' + kept.join(' ') : '';
}

/**
 * Sanitize arbitrary HTML down to a safe, styled subset. Keeps text, structure
 * (headings, lists, quotes, tables), links, images and video iframes. Strips
 * scripts, styles, event handlers, and any javascript:/data: URLs.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return '';
  let s = String(html);

  // 1) Drop comments and dangerous blocks (with their content).
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  for (const tag of DROP_WITH_CONTENT) {
    const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, 'gi');
    s = s.replace(re, '');
    s = s.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
  }
  s = s.replace(/<\/?(?:meta|link|base|title|html|body)\b[^>]*>/gi, '');

  // 2) Token-walk remaining tags, keeping only allowed ones.
  let out = '';
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s))) {
    out += s.slice(last, m.index);
    last = tagRe.lastIndex;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrStr = m[3] || '';
    if (!ALLOWED_TAGS.has(tag)) continue; // drop tag, keep surrounding text
    if (closing) {
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`;
      continue;
    }
    const selfClose = attrStr.trim().endsWith('/');
    const attrs = filterAttrs(tag, parseAttrs(attrStr));
    if (VOID_TAGS.has(tag)) {
      out += `<${tag}${attrs}>`;
    } else if (selfClose) {
      out += `<${tag}${attrs}></${tag}>`;
    } else {
      out += `<${tag}${attrs}>`;
    }
  }
  out += s.slice(last);
  return out.trim();
}

/** True when the content already looks like stored HTML (vs legacy markdown). */
export function looksLikeHtml(src: string): boolean {
  return /<\s*(p|div|h[1-6]|ul|ol|li|strong|em|b|i|blockquote|img|iframe|figure|table|pre|br|span|a)\b/i.test(src);
}

/** Convert any stored description into HTML safe to load into the editor. */
export function toRichHtml(src: string): string {
  if (!src) return '';
  return looksLikeHtml(src) ? sanitizeRichHtml(src) : renderMarkdown(src);
}

/**
 * Render a stored description for display. HTML is sanitized; legacy markdown
 * still renders exactly as before.
 */
export function renderRichText(src: string): string {
  if (!src) return '';
  return looksLikeHtml(src) ? sanitizeRichHtml(src) : renderMarkdown(src);
}
