'use client';

/**
 * WordPress-style WYSIWYG editor for event descriptions. A contentEditable
 * surface that stores sanitized HTML (not markdown). Supports bold/italic/
 * headings/lists/quotes/links, real image upload (Cloudflare R2), YouTube &
 * Vimeo embeds, and a paste handler that preserves formatting when copying
 * content in from another site or app.
 */
import React, {useRef, useState, useEffect} from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Quote, List, ListOrdered,
  Link2, Image as ImageIcon, Play, Undo2, Redo2, RemoveFormatting, Loader2,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {sanitizeRichHtml} from '@/lib/rich-text';
import {useToast} from '@/hooks/use-toast';

type Props = {value: string; onChange: (v: string) => void; placeholder?: string};

/** Turn a YouTube/Vimeo watch URL into a privacy-enhanced embed iframe. */
function embedHtml(raw: string): string | null {
  const url = (raw || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([\w-]{6,20})/i);
  if (yt) {
    return `<div class="rd-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d{6,12})/i);
  if (vimeo) {
    return `<div class="rd-embed"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Vimeo video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  return null;
}

export function RichTextEditor({value, onChange, placeholder}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {toast} = useToast();
  const [uploading, setUploading] = useState(false);

  // Sync external value changes (edit-mode load, AI generation) into the DOM,
  // but never clobber the user's live typing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== (value || '')) el.innerHTML = value || '';
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (el) onChange(el.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  // WordPress-style paste: keep rich formatting, strip anything unsafe.
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const content = html
      ? sanitizeRichHtml(html)
      : text.split(/\n+/).map((line) => `<p>${line}</p>`).join('');
    document.execCommand('insertHTML', false, content);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^https?:\/\/|^mailto:/i.test(url)) exec('createLink', url);
  };

  const addImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'events');
      const res = await fetch('/api/upload', {method: 'POST', body: form});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      ref.current?.focus();
      document.execCommand('insertImage', false, data.url);
      emit();
      toast({title: 'Image Added', description: 'Your photo was uploaded to Cloudflare R2.'});
    } catch (err) {
      toast({variant: 'destructive', title: 'Upload Failed', description: err instanceof Error ? err.message : 'Please try again.'});
    }
    setUploading(false);
  };

  const addVideo = () => {
    const url = window.prompt('YouTube or Vimeo video URL (https://…)');
    if (!url) return;
    const html = embedHtml(url);
    if (!html) {
      toast({variant: 'destructive', title: 'Unsupported Link', description: 'Paste a YouTube or Vimeo video URL.'});
      return;
    }
    ref.current?.focus();
    document.execCommand('insertHTML', false, html);
    emit();
  };

  const tools: {icon: typeof Bold; label: string; action: () => void}[] = [
    {icon: Bold, label: 'Bold', action: () => exec('bold')},
    {icon: Italic, label: 'Italic', action: () => exec('italic')},
    {icon: Underline, label: 'Underline', action: () => exec('underline')},
    {icon: Strikethrough, label: 'Strikethrough', action: () => exec('strikeThrough')},
    {icon: Heading2, label: 'Heading', action: () => exec('formatBlock', 'h2')},
    {icon: Quote, label: 'Quote', action: () => exec('formatBlock', 'blockquote')},
    {icon: List, label: 'Bullet list', action: () => exec('insertUnorderedList')},
    {icon: ListOrdered, label: 'Numbered list', action: () => exec('insertOrderedList')},
    {icon: Link2, label: 'Link', action: addLink},
    {icon: ImageIcon, label: 'Image', action: () => fileInputRef.current?.click()},
    {icon: Play, label: 'Video (YouTube/Vimeo)', action: addVideo},
    {icon: Undo2, label: 'Undo', action: () => exec('undo')},
    {icon: Redo2, label: 'Redo', action: () => exec('redo')},
    {icon: RemoveFormatting, label: 'Clear formatting', action: () => exec('removeFormat')},
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
        {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'What can attendees expect?'}
        className="rd-editor min-h-[220px] p-4 text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2 [&_img]:rounded-xl [&_img]:my-3 [&_.rd-embed]:my-4 [&_.rd-embed_iframe]:aspect-video [&_.rd-embed_iframe]:w-full [&_.rd-embed_iframe]:rounded-xl [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_li]:my-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addImage(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
