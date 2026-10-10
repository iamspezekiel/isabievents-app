'use client';

/**
 * Lightweight rich-text editor for event descriptions. Markdown-powered:
 * bold / italic / headings / lists / quotes / links, plus image and YouTube
 * video embedding. A live preview shows exactly what attendees will see.
 */
import {useRef, useState} from 'react';
import {
  Bold, Heading, Image as ImageIcon, Italic, Link2, List, ListOrdered,
  Play, Quote, Strikethrough, Eye, EyeOff,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {renderMarkdown} from '@/lib/markdown';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function RichTextEditor({value, onChange, placeholder}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const surround = (before: string, after = '') => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const insertBlock = (text: string) => {
    const ta = ref.current;
    const at = ta ? ta.selectionStart : value.length;
    const needsBreak = at > 0 && !value.slice(0, at).endsWith('\n');
    const next = value.slice(0, at) + (needsBreak ? '\n\n' : '') + text + '\n' + value.slice(at);
    onChange(next);
  };

  const addImage = () => {
    const url = window.prompt('Image URL (https://…)');
    if (url && /^https?:\/\//i.test(url)) insertBlock(`![Event photo](${url})`);
  };

  const addVideo = () => {
    const url = window.prompt('YouTube video URL (https://youtube.com/watch?v=…)');
    if (url && /(?:youtube\.com|youtu\.be)/i.test(url)) insertBlock(url);
  };

  const tools: {icon: typeof Bold; label: string; action: () => void}[] = [
    {icon: Bold, label: 'Bold', action: () => surround('**', '**')},
    {icon: Italic, label: 'Italic', action: () => surround('*', '*')},
    {icon: Strikethrough, label: 'Strikethrough', action: () => surround('~~', '~~')},
    {icon: Heading, label: 'Heading', action: () => surround('## ')},
    {icon: Quote, label: 'Quote', action: () => surround('> ')},
    {icon: List, label: 'Bullet list', action: () => surround('- ')},
    {icon: ListOrdered, label: 'Numbered list', action: () => surround('1. ')},
    {icon: Link2, label: 'Link', action: () => surround('[', '](https://)')},
    {icon: ImageIcon, label: 'Image', action: addImage},
    {icon: Play, label: 'YouTube video', action: addVideo},
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {tools.map((t) => (
          <Button
            key={t.label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={t.label}
            onClick={t.action}
          >
            <t.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-xs"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>
      {preview ? (
        <div
          className="min-h-[200px] p-4 text-sm [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:text-xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2 [&_h3]:font-bold [&_h3]:my-1 [&_img]:rounded-xl [&_img]:my-3 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_li]:my-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_.md-embed]:my-4 text-foreground"
          dangerouslySetInnerHTML={{__html: renderMarkdown(value)}}
        />
      ) : (
        <Textarea
          ref={ref}
          id="description"
          placeholder={placeholder || 'What can attendees expect?'}
          className="min-h-[200px] border-0 focus-visible:ring-0 bg-transparent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
