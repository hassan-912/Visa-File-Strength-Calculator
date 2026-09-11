"use client";

export default function AustraliaPlaceholder() {
  return (
    <div className="animate-fadeInUp flex flex-col items-center justify-center py-20 px-4">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulse rings */}
        <div
          className="absolute w-40 h-40 rounded-full"
          style={{
            border: "2px solid rgba(40,56,64,0.12)",
            animation: "pulse-ring 2.8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-28 h-28 rounded-full"
          style={{
            border: "2px solid rgba(40,56,64,0.18)",
            animation: "pulse-ring 2.8s ease-in-out infinite 0.4s",
          }}
        />

        {/* Icon card */}
        <div
          className="relative z-10 flex items-center justify-center w-24 h-24 rounded-3xl"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 20px 60px rgba(40,56,64,0.35)",
          }}
        >
          {/* Gear / processing SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-11 h-11 animate-spin-slow"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655 1.114 2.649L4 18l2 2 1.791-1.46 2.654 1.082.641 2.378h1.841l.682-2.405 2.654-1.098 1.726 1.488 2-2-1.483-1.76 1.097-2.648L22 13v-2l-2.378-.605Z" />
          </svg>
        </div>
      </div>

      {/* Text content */}
      <div className="text-center max-w-sm">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5"
          style={{
            backgroundColor: "var(--color-accent-bg)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-accent-border)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "var(--color-primary)",
              animation: "pulse-ring 1.6s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          Under Processing
        </div>

        <h2
          className="text-2xl font-bold mb-3"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          Australia Immigration Assessment
        </h2>

        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          We are actively building the Australia skilled migration calculator —
          covering the points-tested visa subclasses (189, 190, 491) and the
          General Skilled Migration stream. Please check back soon.
        </p>

        {/* Progress indicator */}
        <div
          className="rounded-2xl p-5 text-left"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            What&apos;s coming
          </p>
          {[
            "Points-based skilled migrant calculator (subclasses 189 / 190 / 491)",
            "Age, education, English proficiency & work experience scoring",
            "State nomination and regional area bonuses",
            "PDF assessment report",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 mb-2.5">
              <div
                className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-accent-bg)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="var(--color-primary)"
                  className="w-2.5 h-2.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.354 5.646a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7 10.293l3.646-3.647a.5.5 0 0 1 .708 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <p
          className="text-xs mt-5 leading-relaxed"
          style={{ color: "var(--color-text-light)" }}
        >
          In the meantime, contact an MG Visa advisor for a personalised
          Australian immigration consultation.
        </p>
      </div>
    </div>
  );
}
