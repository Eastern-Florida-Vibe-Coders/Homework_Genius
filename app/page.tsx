import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          No FOMO. Just Focus.
        </div>

        <h1 className="text-5xl font-bold text-[#1e293b] dark:text-[#f1f5f9] tracking-tight mb-6">
          Study smarter with{' '}
          <span className="text-indigo-600">Homework Genius</span>
        </h1>

        <p className="text-lg text-[#64748b] dark:text-[#94a3b8] mb-10 leading-relaxed">
          Tell us your classes, commitments, and free time — we&apos;ll build a
          schedule you can actually trust. Study when it&apos;s time to study.
          Relax when it&apos;s time to relax.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border-2 border-[#e2e8f0] dark:border-[#334155] text-[#1e293b] dark:text-[#f1f5f9] font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:border-indigo-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
