import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="font-mono text-6xl font-bold text-zinc-600">404</div>
        <h1 className="text-xl font-mono text-zinc-300">Page Not Found</h1>
        <p className="text-sm text-zinc-500 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-sm font-mono text-indigo-400 hover:text-indigo-300 transition-colors px-4 py-2 border border-indigo-500/30 rounded-lg hover:border-indigo-500/60"
          >
            Back to Home
          </Link>
          <Link
            href="/app"
            className="text-sm font-mono text-zinc-400 hover:text-white transition-colors px-4 py-2 border border-zinc-800 rounded-lg hover:border-zinc-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
