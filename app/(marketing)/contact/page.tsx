import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the WhitePrint team for support, sales inquiries, or partnerships.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-white">Contact Us</h1>
      <p className="mt-4 text-zinc-400">
        Have a question, need support, or interested in a custom API plan? We would love to hear from you.
      </p>

      <form className="mt-12 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-2">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="sales">Sales / Enterprise</option>
            <option value="api">API Partnership</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            placeholder="How can we help?"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
