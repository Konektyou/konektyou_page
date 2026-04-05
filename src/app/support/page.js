import SupportContactForm from '@/components/SupportContactForm';

export const revalidate = 1800; // Revalidate every 30 min — picks up FAQ updates from backend

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.konektly.ca';

// FAQs require an authenticated token. Set BACKEND_SERVICE_TOKEN in your Vercel env vars
// (server-side only — never prefixed with NEXT_PUBLIC_).
async function getFAQs() {
  const token = process.env.BACKEND_SERVICE_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/support/faq/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.faqs ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  return {
    title: 'Support — Konektly',
    description: 'Get help with your Konektly account, payments, jobs, and more. Browse FAQs or contact our team.',
  };
}

const CATEGORY_META = {
  account: { label: 'Account', icon: '👤' },
  payment: { label: 'Payment', icon: '💳' },
  verification: { label: 'Verification', icon: '✅' },
  job: { label: 'Job / Service', icon: '🔧' },
  subscription: { label: 'Subscription', icon: '📋' },
  bug: { label: 'Bug Report', icon: '🐛' },
  other: { label: 'Other', icon: '💬' },
};

export default async function SupportPage() {
  const faqs = await getFAQs();

  // Group FAQs by category
  const faqsByCategory = faqs
    ? faqs.reduce((acc, faq) => {
        const cat = faq.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
      }, {})
    : {};

  const hasLiveFAQs = faqs && faqs.length > 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-black text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Help &amp; Support</h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Browse frequently asked questions or reach out to our team — we typically respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Quick contact strip */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📧</span>
              <a href="mailto:info@konektly.ca" className="text-black font-medium hover:underline underline-offset-2">
                info@konektly.ca
              </a>
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>Mon – Fri, 9 AM – 6 PM ET</span>
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>In-app ticket support available in the Konektly app</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              {hasLiveFAQs
                ? 'Content below is pulled live from our backend — always up to date.'
                : 'Common questions about using Konektly.'}
            </p>
          </div>

          {hasLiveFAQs ? (
            <LiveFAQs faqsByCategory={faqsByCategory} />
          ) : (
            <StaticFAQs />
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200" />
      </div>

      {/* Contact Form */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: info */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Contact Support</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Fill out the form and our team will get back to you within
                24–48 hours. For urgent account issues, please use the in-app support ticket system.
              </p>

              <div className="space-y-4">
                <InfoRow icon="📧" label="Email" value="info@konektly.ca" href="mailto:info@konektly.ca" />
                <InfoRow icon="🌐" label="Website" value="www.konektly.ca" href="https://www.konektly.ca" />
              </div>

              <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-black mb-1">Need faster support?</p>
                <p className="text-sm text-gray-600">
                  Download the Konektly app and open a support ticket directly from your account for the fastest
                  response times.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <SupportContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ icon, label, value, href }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-medium text-black hover:underline underline-offset-2">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-black">{value}</p>
        )}
      </div>
    </div>
  );
}

function LiveFAQs({ faqsByCategory }) {
  return (
    <div className="space-y-10">
      {Object.entries(faqsByCategory).map(([cat, items]) => {
        const meta = CATEGORY_META[cat] ?? { label: cat, icon: '❓' };
        return (
          <div key={cat}>
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-black mb-4">
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </h3>
            <div className="space-y-3">
              {items.map((faq) => (
                <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StaticFAQs() {
  const items = [
    {
      category: 'account',
      question: 'How do I create a Konektly account?',
      answer:
        'Download the Konektly app on iOS or Android, tap "Sign Up", choose your role (Client, Provider, or Business), and follow the on-screen instructions to complete registration.',
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer:
        'On the login screen, tap "Forgot Password", enter your registered email address, and follow the link sent to your inbox.',
    },
    {
      category: 'verification',
      question: 'Why do I need to verify my identity?',
      answer:
        'Identity verification helps keep the platform safe for everyone. Providers must pass verification before accepting jobs. Clients may also be asked to verify for certain service types.',
    },
    {
      category: 'payment',
      question: 'How does payment work?',
      answer:
        'Payments are processed securely through our platform. Funds are held in escrow and released to the provider after the job is completed and confirmed.',
    },
    {
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit and debit cards. Additional payment methods may be available in your region.',
    },
    {
      category: 'job',
      question: 'How do I book a service?',
      answer:
        'Open the app, enter your location and the service you need, and you\'ll see nearby available providers in real time. Tap a provider to view their profile and request the service.',
    },
    {
      category: 'subscription',
      question: 'What subscription plans are available?',
      answer:
        'Konektly offers flexible subscription plans for providers and businesses. Visit the Subscriptions section in the app or contact us at info@konektly.ca for current pricing.',
    },
  ];

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([cat, catItems]) => {
        const meta = CATEGORY_META[cat] ?? { label: cat, icon: '❓' };
        return (
          <div key={cat}>
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-black mb-4">
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </h3>
            <div className="space-y-3">
              {catItems.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-gray-50 transition-colors">
        <span className="text-sm sm:text-base font-medium text-black">{question}</span>
        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 text-xs">
          ▼
        </span>
      </summary>
      <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100">
        {answer}
      </div>
    </details>
  );
}
