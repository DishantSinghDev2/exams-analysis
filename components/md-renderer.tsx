import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw'; // Make sure you trust your HTML source if using this
import remarkGfm from 'remark-gfm';

// Define a type for the code props to satisfy TypeScript and access ReactMarkdown specific props
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any; // Add node here if you might use it, or handle it per-component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other props passed by ReactMarkdown
}


const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const headingBaseClasses = "font-bold text-slate-800 dark:text-slate-100";

    return (
        <div
            className="prose prose-slate lg:prose-lg max-w-full
                        p-2 sm:p-3
                       overflow-auto scrollbar-thin scrollbar-thumb-slate-400
                       dark:scrollbar-thumb-slate-600 scrollbar-track-slate-200
                       dark:scrollbar-track-slate-700
                       transition-all duration-300 dark:prose-invert"
        >
            <ReactMarkdown
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                skipHtml={false} // Be cautious with this if content is user-generated
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: (props) => <h1 className={`${headingBaseClasses} text-4xl pb-2 mb-4 mt-6 border-b border-slate-300 dark:border-slate-700`} {...props} />,
                    h2: (props) => <h2 className={`${headingBaseClasses} text-3xl pb-2 mb-3 mt-5 border-b border-slate-300 dark:border-slate-700`} {...props} />,
                    h3: (props) => <h3 className={`${headingBaseClasses} text-2xl mb-3 mt-5`} {...props} />,
                    h4: (props) => <h4 className={`${headingBaseClasses} text-xl mb-2 mt-4`} {...props} />,
                    h5: (props) => <h5 className={`${headingBaseClasses} text-lg mb-2 mt-3`} {...props} />,
                    h6: (props) => <h6 className={`${headingBaseClasses} text-base mb-2 mt-3`} {...props} />,
                    p: (props) => <p className="my-4 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
                    a: ({ href, children, ...props }) => ( // node is not typically passed to 'a' unless explicitly
                        <a
                            href={href}
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-150"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    ul: (props) => <ul className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
                    ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
                    li: (props) => <li className="pb-1" {...props} />,
                    blockquote: ({ children, ...props }) => (
                        <blockquote
                            className="border-l-4 border-blue-500 dark:border-blue-400
                                       bg-blue-50 dark:bg-slate-800
                                       p-4 my-6 italic
                                       text-slate-700 dark:text-slate-300
                                       rounded-r-md shadow"
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),
                    code: (props: CodeProps) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { node: _node, inline, className, children, ...rest } = props;
                        // const match = /language-(\w+)/.exec(className || ''); // For syntax highlighting later
                        return !inline ? (
                            <pre className="bg-slate-900 dark:bg-opacity-75 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto my-5 shadow-md scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                                <code className={`${className || ''} font-mono`} {...rest}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code
                                className={`${className || ''} bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-sm text-pink-600 dark:text-pink-400 font-mono`}
                                {...rest}
                            >
                                {children}
                            </code>
                        );
                    },
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto my-6 shadow-md rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children, ...props }) => <thead className="bg-slate-100 dark:bg-slate-800" {...props}>{children}</thead>,
                    th: ({ children, ...props }) => (
                        <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                            {...props}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children, ...props }) => (
                        <td className="px-4 py-3 whitespace-normal text-sm text-slate-700 dark:text-slate-300" {...props}>
                            {children}
                        </td>
                    ),
                    hr: (props) => <hr className="my-8 border-slate-300 dark:border-slate-700" {...props} />,
                    img: ({ alt, src, title, ...props }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt={alt}
                            src={src}
                            title={title}
                            className="my-6 rounded-lg shadow-md max-w-full h-auto mx-auto block"
                            {...props}
                        />
                    ),
                    // strong: ({node: _node, ...props}) => <strong className="font-bold text-slate-800 dark:text-slate-200" {...props} />,
                    // em: ({node: _node, ...props}) => <em className="italic text-slate-600 dark:text-slate-400" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;