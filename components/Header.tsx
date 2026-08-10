export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Top accent stripe — blue, not gold */}
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover), var(--color-accent))",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo mark + wordmark */}
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/Logo W.png"
            alt="MG Visa Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Centre label */}
        <div className="hidden md:block text-center">
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-montserrat)" }}>
            Visa File Strength Calculator
          </p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            Powered by MG AI Scoring Engine
          </p>
        </div>

        {/* CTA — blue button, no gold */}
        <a
          href="https://mg-visa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-white"
          style={{
            backgroundColor: "var(--color-accent)",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          Visit mg-visa.com
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </header>
  );
}
