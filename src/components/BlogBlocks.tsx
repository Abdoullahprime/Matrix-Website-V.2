import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Align, Block, ButtonItem, ImageSize, TitleFont } from '../lib/blog';

const imageWidth = {
  small: 'max-w-sm',
  normal: 'max-w-2xl',
  wide: 'max-w-4xl',
} as const;

const alignClass: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
const flexAlign: Record<Align, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
// Paragraphs stay a readable width; centred or right-aligned ones sit at that side of the column.
const blockAlign: Record<Align, string> = { left: '', center: 'mx-auto', right: 'ml-auto' };

export const fontStyle: Record<TitleFont, React.CSSProperties | undefined> = {
  sans: undefined,
  serif: { fontFamily: "Georgia, 'Times New Roman', Times, serif" },
  handwritten: { fontFamily: "'Caveat', 'Segoe Script', 'Comic Sans MS', cursive", fontWeight: 700 },
};

const CAVEAT_ID = 'mx-font-caveat';

/** The handwritten font is only fetched when a page actually uses it (a title, or any block). */
export function useHandwrittenFont(blocks: Block[], titleFont?: TitleFont) {
  const needed =
    titleFont === 'handwritten' ||
    blocks.some((b) => (b.type === 'heading' && b.font === 'handwritten') || (b.type === 'split' && b.font === 'handwritten'));
  useEffect(() => {
    if (!needed || document.getElementById(CAVEAT_ID)) return;
    const link = document.createElement('link');
    link.id = CAVEAT_ID;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap';
    document.head.appendChild(link);
  }, [needed]);
}

/** Internal links stay in the app; others open in a new tab. Only / and https:// links are ever saved. */
function ButtonLink({ item }: { item: ButtonItem }) {
  const cls = item.style === 'secondary' ? 'btn-secondary' : 'btn-primary';
  if (item.url.startsWith('/')) {
    return (
      <Link to={item.url} className={cls}>
        {item.label}
      </Link>
    );
  }
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {item.label}
    </a>
  );
}

function Buttons({ items, align = 'center' }: { items: ButtonItem[]; align?: Align }) {
  if (items.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-4 ${flexAlign[align]}`}>
      {items.map((it, i) => (
        <ButtonLink key={i} item={it} />
      ))}
    </div>
  );
}

/** A title with one phrase marked, like the highlighted word in the reference design. */
function Title({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-matrix-blue-primary/25 text-inherit rounded-md px-2 -mx-1 box-decoration-clone">
        {text.slice(at, at + highlight.length)}
      </mark>
      {text.slice(at + highlight.length)}
    </>
  );
}

const headingSize = {
  1: 'text-4xl md:text-6xl leading-tight',
  2: 'text-3xl md:text-4xl leading-tight',
  3: 'text-2xl leading-snug',
} as const;

function Video({ id, title, size }: { id: string; title: string; size?: ImageSize }) {
  return (
    <div className={`aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-100 w-full ${size ? `mx-auto ${imageWidth[size] ?? imageWidth.wide}` : ''}`}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title || 'Video'}
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full h-full"
      />
    </div>
  );
}

/**
 * Draws a page's content blocks. Everything is shown as plain text (React escapes it), so
 * nothing an editor types can run as code on the page. `spacious` gives product pages more air.
 */
export default function BlogBlocks({ blocks, spacious = false }: { blocks: Block[]; spacious?: boolean }) {
  useHandwrittenFont(blocks);

  return (
    <div className={spacious ? 'space-y-16' : 'space-y-7'}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading': {
            const level = b.level === 1 || b.level === 3 ? b.level : 2;
            const Tag = level === 3 ? 'h3' : 'h2';
            return (
              <Tag
                key={i}
                style={fontStyle[b.font ?? 'sans']}
                className={`font-extrabold text-matrix-navy ${headingSize[level]} ${alignClass[b.align ?? 'left']} ${level === 1 ? '' : 'pt-4'}`}
              >
                <Title text={b.text} highlight={b.highlight} />
              </Tag>
            );
          }
          case 'paragraph': {
            const align = b.align ?? 'left';
            return (
              <p key={i} className={`text-lg leading-[1.8] text-slate-700 whitespace-pre-line max-w-3xl ${alignClass[align]} ${blockAlign[align]}`}>
                {b.text}
              </p>
            );
          }
          case 'buttons':
            return <Buttons key={i} items={b.items} align={b.align} />;
          case 'split':
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                <div className={b.side === 'right' ? 'md:order-2' : ''}>
                  {b.youtubeId ? (
                    <Video id={b.youtubeId} title={b.heading} />
                  ) : (
                    b.url && <img src={b.url} alt={b.alt} loading="lazy" decoding="async" className="w-full h-auto rounded-2xl border border-slate-100 shadow-xl shadow-matrix-navy/5" />
                  )}
                </div>
                <div className={`space-y-5 ${b.side === 'right' ? 'md:order-1' : ''}`}>
                  {b.heading && (
                    <h3 style={fontStyle[b.font ?? 'sans']} className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">
                      {b.heading}
                    </h3>
                  )}
                  {b.text && <p className="text-lg leading-[1.8] text-slate-700 whitespace-pre-line">{b.text}</p>}
                  {b.items && b.items.length > 0 &&
                    (() => {
                      const Tag = b.ordered ? 'ol' : 'ul';
                      return (
                        <Tag className={`pl-6 space-y-2 text-lg leading-[1.7] text-slate-700 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
                          {b.items.map((it, j) => (
                            <li key={j}>{it}</li>
                          ))}
                        </Tag>
                      );
                    })()}
                  <Buttons items={b.buttons ?? []} align="left" />
                </div>
              </div>
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
                <Video id={id} title={b.caption} size={b.size ?? 'wide'} />
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
