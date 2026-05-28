export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-brand-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-brand-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-1 flex justify-center">
          <div
            className="h-20 w-60 bg-brand-500"
            style={{
              WebkitMaskImage: 'url(/LBD%20LOGO.PNG)',
              maskImage: 'url(/LBD%20LOGO.PNG)',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
            }}
            role="img"
            aria-label="Langdi Builders"
          />
        </div>

        <div className="mb-5 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
