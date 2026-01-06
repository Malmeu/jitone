'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Components } from 'react-markdown';

interface MarkdownViewerProps {
    content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    // Composants personnalisés pour un meilleur rendu
    const components: Components = {
        // Titres avec ancres et styles améliorés
        h1: ({ children, ...props }) => (
            <h1 className="text-4xl font-black text-neutral-900 mt-12 mb-6 pb-4 border-b-4 border-primary/20 scroll-mt-20" {...props}>
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 className="text-3xl font-bold text-neutral-900 mt-10 mb-5 pb-3 border-b-2 border-neutral-200 scroll-mt-20" {...props}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 className="text-2xl font-bold text-neutral-800 mt-8 mb-4 scroll-mt-20" {...props}>
                {children}
            </h3>
        ),
        h4: ({ children, ...props }) => (
            <h4 className="text-xl font-bold text-neutral-800 mt-6 mb-3 scroll-mt-20" {...props}>
                {children}
            </h4>
        ),

        // Paragraphes avec espacement
        p: ({ children, ...props }) => (
            <p className="text-base text-neutral-700 leading-relaxed mb-4" {...props}>
                {children}
            </p>
        ),

        // Listes améliorées
        ul: ({ children, ...props }) => (
            <ul className="list-none space-y-2 mb-6 ml-0" {...props}>
                {children}
            </ul>
        ),
        ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 ml-4" {...props}>
                {children}
            </ol>
        ),
        li: ({ children, ...props }) => (
            <li className="text-neutral-700 leading-relaxed flex items-start gap-3" {...props}>
                <span className="text-primary mt-1.5 flex-shrink-0">●</span>
                <span className="flex-1">{children}</span>
            </li>
        ),

        // Liens stylisés
        a: ({ children, href, ...props }) => (
            <a
                href={href}
                className="text-primary font-semibold hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary transition-colors"
                {...props}
            >
                {children}
            </a>
        ),

        // Code inline
        code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
                return (
                    <code
                        className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md text-sm font-mono border border-neutral-200"
                        {...props}
                    >
                        {children}
                    </code>
                );
            }
            return <code className={className} {...props}>{children}</code>;
        },

        // Blocs de code
        pre: ({ children, ...props }) => (
            <pre
                className="bg-neutral-900 text-neutral-100 p-6 rounded-2xl overflow-x-auto mb-6 border border-neutral-700 shadow-lg"
                {...props}
            >
                {children}
            </pre>
        ),

        // Blockquotes
        blockquote: ({ children, ...props }) => (
            <blockquote
                className="border-l-4 border-primary bg-blue-50 pl-6 pr-4 py-4 my-6 rounded-r-xl italic text-neutral-700"
                {...props}
            >
                {children}
            </blockquote>
        ),

        // Tableaux
        table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-6 rounded-xl border border-neutral-200 shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200" {...props}>
                    {children}
                </table>
            </div>
        ),
        thead: ({ children, ...props }) => (
            <thead className="bg-neutral-50" {...props}>
                {children}
            </thead>
        ),
        tbody: ({ children, ...props }) => (
            <tbody className="bg-white divide-y divide-neutral-200" {...props}>
                {children}
            </tbody>
        ),
        th: ({ children, ...props }) => (
            <th
                className="px-6 py-4 text-left text-xs font-bold text-neutral-900 uppercase tracking-wider"
                {...props}
            >
                {children}
            </th>
        ),
        td: ({ children, ...props }) => (
            <td className="px-6 py-4 text-sm text-neutral-700" {...props}>
                {children}
            </td>
        ),
        tr: ({ children, ...props }) => (
            <tr className="hover:bg-neutral-50 transition-colors" {...props}>
                {children}
            </tr>
        ),

        // Séparateurs
        hr: ({ ...props }) => (
            <hr className="my-8 border-t-2 border-neutral-200" {...props} />
        ),

        // Images
        img: ({ src, alt, ...props }) => (
            <img
                src={src}
                alt={alt}
                className="rounded-2xl shadow-lg my-6 max-w-full h-auto border border-neutral-200"
                {...props}
            />
        ),

        // Strong/Bold
        strong: ({ children, ...props }) => (
            <strong className="font-bold text-neutral-900" {...props}>
                {children}
            </strong>
        ),

        // Emphasis/Italic
        em: ({ children, ...props }) => (
            <em className="italic text-neutral-700" {...props}>
                {children}
            </em>
        ),
    };

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>

            {/* Styles globaux pour le markdown */}
            <style jsx global>{`
                .markdown-content {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.7;
                }
                
                .markdown-content ol > li::marker {
                    color: #3b82f6;
                    font-weight: bold;
                }
                
                /* Amélioration des checkbox dans les listes */
                .markdown-content input[type="checkbox"] {
                    margin-right: 0.5rem;
                    width: 1.25rem;
                    height: 1.25rem;
                    accent-color: #3b82f6;
                }
                
                /* Smooth scroll pour les ancres */
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}
