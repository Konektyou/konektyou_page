import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic'; // Always fetch fresh — privacy policy must reflect the latest version immediately

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.konektly.ca';

async function getPrivacyPolicy() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/legal/privacy/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const policy = await getPrivacyPolicy();
  return {
    title: `${policy?.title ?? 'Privacy Policy'} — Konektly`,
    description: 'Read how Konektly collects, uses, and protects your personal information.',
  };
}

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-black text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {policy?.title ?? 'Privacy Policy'}
          </h1>
          {policy && (
            <p className="text-gray-300 text-sm sm:text-base">
              Version {policy.version}&nbsp;&middot;&nbsp;Effective{' '}
              {new Date(policy.effective_date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {policy ? (
            <MarkdownContent content={policy.content} />
          ) : (
            <p className="text-gray-500 text-center py-12">
              Unable to load the Privacy Policy at this time. Please try again later or email{' '}
              <a href="mailto:hello@konektly.ca" className="text-black underline">
                hello@konektly.ca
              </a>
              .
            </p>
          )}
        </div>
      </section>

      {/* Contact footer */}
      <section className="bg-gray-50 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-black mb-3">
            Questions about our privacy practices?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Contact our privacy team at{' '}
            <a href="mailto:hello@konektly.ca" className="text-black font-medium underline underline-offset-2">
              hello@konektly.ca
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function MarkdownContent({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-black mt-10 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-semibold text-black mt-8 mb-3 border-b border-gray-200 pb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-black mt-6 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-1.5 mb-4 text-gray-700 text-sm sm:text-base">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-1.5 mb-4 text-gray-700 text-sm sm:text-base">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} className="text-black underline underline-offset-2 hover:text-gray-600">
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-black border border-gray-200 text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-gray-700 border border-gray-200 text-sm">{children}</td>
          ),
          tr: ({ children }) => <tr className="even:bg-gray-50">{children}</tr>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black pl-4 italic text-gray-600 my-4">{children}</blockquote>
          ),
          code: ({ inline, children }) =>
            inline ? (
              <code className="bg-gray-100 text-black px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ) : (
              <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
                <code className="text-xs font-mono text-black">{children}</code>
              </pre>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
