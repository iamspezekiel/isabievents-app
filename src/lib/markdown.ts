/**
 * Minimal, XSS-safe markdown renderer for event descriptions.
 *
 * All source text is HTML-escaped FIRST, then a small markdown subset is
 * converted to a whitelisted set of tags. Only http(s) URLs are allowed for
 * links, images and YouTube embeds, so no user input can inject scripts.
 */

const YT_BLOCK =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{6,20})\s*$/gm;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMarkdown(src: string): string {
  if (!src) return '';
  let s = escapeHtml(src);

  // YouTube links on their own line become responsive embeds.
  s = s.replace(
    YT_BLOCK,
    (_m, id: string) =>
      `<div class="md-embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" allowfullscreen allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" loading="lazy"></iframe></div>`
  );

  // Images: ![alt](https://url)
  s = s.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" />'
  );
  // Links: [text](https://url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Headings
  s = s.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  s = s.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  s = s.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // Horizontal rule
  s = s.replace(/^---$/gm, '<hr />');
  // Blockquote
  s = s.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Emphasis (bold/italic/strikethrough)
  s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Lists
  s = s.replace(/(?:^|\n)((?:- [^\n]+\n?)+)/g, (_m, block: string) => {
    const items = block
      .trim()
      .split('\n')
      .map((li) => `<li>${li.replace(/^-\s+/, '')}</li>`)
      .join('');
    return `\n<ul>${items}</ul>`;
  });
  s = s.replace(/(?:^|\n)((?:(?:\d+\.) [^\n]+\n?)+)/g, (_m, block: string) => {
    const items = block
      .trim()
      .split('\n')
      .map((li) => `<li>${li.replace(/^\d+\.\s+/, '')}</li>`)
      .join('');
    return `\n<ol>${items}</ol>`;
  });

  // Paragraphs & line breaks
  s = s.replace(/\n{2,}/g, '</p><p>');
  s = s.replace(/\n/g, '<br />');
  s = `<p>${s}</p>`;
  // Don't nest block elements inside <p>
  s = s.replace(/<p>\s*(<(?:h\d|ul|ol|blockquote|div|hr|img))/g, '$1');
  s = s.replace(/(<\/(?:h\d|ul|ol|blockquote|div)>)\s*<\/p>/g, '$1');
  s = s.replace(/<p>\s*(<(?:h\d|ul|ol|blockquote|div|hr|img)[^>]*>)/g, '$1');
  s = s.replace(/<p>\s*<\/p>/g, '');
  s = s.replace(/<\/(ul|ol)><br \/>/g, '</$1>');
  return s;
}
