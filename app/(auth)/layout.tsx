import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center px-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-wider text-zinc-200">
            WhitePrint <span className="text-zinc-500 font-normal">AudioEngine</span>
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
