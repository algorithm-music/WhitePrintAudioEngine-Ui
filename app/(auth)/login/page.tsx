import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-white text-center">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-400 text-center">Log in to your WhitePrint account</p>

      <form className="mt-8 space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Log In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
