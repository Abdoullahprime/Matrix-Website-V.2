import React from 'react';
import { Block } from '../lib/blog';

const imageWidth = {
  small: 'max-w-sm',
  normal: 'max-w-2xl',
  wide: 'max-w-4xl',
} as const;

/**
 * Draws a post's content blocks. Everything is shown as plain text (React escapes it), so
 * nothing an editor types can run as code on the page.
 */
export default function BlogBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return b.level === 3 ? (
              <h3 key={i} className="text-2xl font-extrabold text-matrix-navy pt-4">{b.text}</h3>
            ) : (
              <h2 key={i} className="text-3xl md:text-4xl font-extrabold text-matrix-navy pt-6">{b.text}</h2>
            );
          case 'paragraph':
            return (
              <p key={i} className="text-lg leading-[1.8] text-slate-700 whitespace-pre-line">
                {b.text}
              </p>
            );
          case 'image':
            return (
              <figure key={i} className={`mx-auto ${imageWidth[b.size] ?? imageWidth.normal} my-10`}>
                {b.url && (
                  <img
                    src={b.url}
                    alt={b.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto rounded-xl border border-slate-100"
                  />
                )}
                {b.caption && <figcaption className="mt-3 text-sm text-slate-500 text-center">{b.caption}</figcaption>}
              </figure>
            );
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag
                key={i}
                className={`pl-6 space-y-2 text-lg leading-[1.8] text-slate-700 ${b.ordered ? 'list-decimal' : 'list-disc'}`}
              >
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </Tag>
            );
          }
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-matrix-blue-primary pl-6 py-2 my-8">
                <p className="text-2xl font-bold text-matrix-navy leading-snug whitespace-pre-line">“{b.text}”</p>
                {b.cite && <footer className="mt-3 text-sm font-bold text-slate-500 uppercase tracking-widest">{b.cite}</footer>}
              </blockquote>
            );
          case 'video': {
            const id = b.youtubeId;
            if (!id) return null;
            return (
              <figure key={i} className="my-10">
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title={b.caption || 'Video'}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                  />
                </div>
                {b.caption && <figcaption className="mt-3 text-sm text-slate-500 text-center">{b.caption}</figcaption>}
              </figure>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
