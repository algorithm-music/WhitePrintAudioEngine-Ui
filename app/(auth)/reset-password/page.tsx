import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-white text-center">Set new password</h1>
      <p className="mt-2 text-sm text-zinc-400 text-center">
        Choose a new password for your account.
      </p>

      <form className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="8+ characters"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm"
            name="confirm"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Reset Password
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
          Back to login
        </Link>
      </p>
    </div>
  );
}
