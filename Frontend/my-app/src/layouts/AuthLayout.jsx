export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-brand-300 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-300 text-slate-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 20V9.5L12 4l8 5.5V20H14v-6h-4v6H4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-2.5 text-sm font-semibold tracking-tight text-slate-900">
            Langdi CRM
          </p>
        </div>

        <div className="mb-5 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
