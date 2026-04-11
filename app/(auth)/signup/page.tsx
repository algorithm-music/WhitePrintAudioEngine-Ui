import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-white text-center">Create your account</h1>
      <p className="mt-2 text-sm text-zinc-400 text-center">Start mastering with AI for free</p>

      <form className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="8+ characters"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Create Account
        </button>
        <p className="text-xs text-zinc-500 text-center">
          By signing up, you agree to our{' '}
          <Link href="/legal/terms" className="text-indigo-400 hover:text-indigo-300">Terms</Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
