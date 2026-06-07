/**
 * Inline-SVG version of ill-variance (fundamentals · module 1 · step 1),
 * converted from public/academy/illustrations/ill-variance.svg so the diagram
 * lives in the DOM and can be animated.
 *
 * Prototype for migrating the illustrations to React (easier to manage +
 * animate). Animations are CSS (globals.css, `.ill-variance`) and play on
 * mount. Positioning <g transform> stays on outer groups; animated transforms
 * live on inner wrappers so they don't clobber the SVG transform attributes.
 * Everything is disabled under prefers-reduced-motion.
 */
export function IllVariance({ className }: { className?: string }) {
  return (
    <svg
      className={`ill-variance ${className ?? ''}`}
      viewBox="0 0 900 430"
      width="100%"
      height="auto"
      role="img"
      aria-label="Same sheet, three shifts, three different verdicts"
      fontFamily="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif"
    >
      <rect width="900" height="430" fill="#ffffff" />

      {/* the sheet */}
      <g transform="translate(330,28)">
        <g className="ivx-sheet">
          <rect width="240" height="64" rx="12" fill="#f4f6f8" stroke="#e8ecf0" />
          <rect x="18" y="18" width="40" height="28" rx="4" fill="#00b3d6" />
          <text x="74" y="32" fontSize="12.5" fontWeight="700" fill="#111418">
            Same sheet, same job
          </text>
          <text x="74" y="49" fontSize="11.5" fill="#6b7480">
            measured after the fact: ΔE00 = 2.6
          </text>
        </g>
      </g>

      {/* arrows down */}
      <g className="ivx-arrows" stroke="#c8d0d9" strokeWidth="2.5" fill="none">
        <path d="M450 96 V 120 M450 120 H 160 V 142 M450 120 H 740 V 142 M450 120 V 142" />
      </g>

      {/* three operator verdicts */}
      <g transform="translate(60,150)">
        <g className="ivx-card ivx-card-1">
          <rect width="200" height="170" rx="16" fill="#ffffff" stroke="#e8ecf0" strokeWidth="1.5" />
          <circle cx="100" cy="44" r="22" fill="#f4f6f8" stroke="#c8d0d9" />
          <circle cx="100" cy="38" r="8" fill="#9aa3ae" />
          <path d="M84 58 q16 -14 32 0" fill="#9aa3ae" />
          <text x="100" y="92" fontSize="11.5" fontWeight="700" letterSpacing="1.2" fill="#9aa3ae" textAnchor="middle">
            NIGHT SHIFT
          </text>
          <rect x="48" y="106" width="104" height="30" rx="15" fill="#e9f7ef" />
          <text x="100" y="126" fontSize="13" fontWeight="700" fill="#14702f" textAnchor="middle">
            PASS ✓
          </text>
          <text x="100" y="156" fontSize="11.5" fill="#6b7480" textAnchor="middle" fontStyle="italic">
            &quot;Looks good to me.&quot;
          </text>
        </g>
      </g>
      <g transform="translate(350,150)">
        <g className="ivx-card ivx-card-2">
          <rect width="200" height="170" rx="16" fill="#ffffff" stroke="#e8ecf0" strokeWidth="1.5" />
          <circle cx="100" cy="44" r="22" fill="#f4f6f8" stroke="#c8d0d9" />
          <circle cx="100" cy="38" r="8" fill="#9aa3ae" />
          <path d="M84 58 q16 -14 32 0" fill="#9aa3ae" />
          <text x="100" y="92" fontSize="11.5" fontWeight="700" letterSpacing="1.2" fill="#9aa3ae" textAnchor="middle">
            DAY SHIFT
          </text>
          <rect x="48" y="106" width="104" height="30" rx="15" fill="#fdeaea" />
          <text x="100" y="126" fontSize="13" fontWeight="700" fill="#b33" textAnchor="middle">
            FAIL ✕
          </text>
          <text x="100" y="156" fontSize="11.5" fill="#6b7480" textAnchor="middle" fontStyle="italic">
            &quot;Needs more cyan.&quot;
          </text>
        </g>
      </g>
      <g transform="translate(640,150)">
        <g className="ivx-card ivx-card-3">
          <rect width="200" height="170" rx="16" fill="#ffffff" stroke="#e8ecf0" strokeWidth="1.5" />
          <circle cx="100" cy="44" r="22" fill="#f4f6f8" stroke="#c8d0d9" />
          <circle cx="100" cy="38" r="8" fill="#9aa3ae" />
          <path d="M84 58 q16 -14 32 0" fill="#9aa3ae" />
          <text x="100" y="92" fontSize="11.5" fontWeight="700" letterSpacing="1.2" fill="#9aa3ae" textAnchor="middle">
            WEEKEND SHIFT
          </text>
          <rect x="48" y="106" width="104" height="30" rx="15" fill="#e9f7ef" />
          <text x="100" y="126" fontSize="13" fontWeight="700" fill="#14702f" textAnchor="middle">
            PASS ✓
          </text>
          <text x="100" y="156" fontSize="11.5" fill="#6b7480" textAnchor="middle" fontStyle="italic">
            &quot;Customer won&apos;t notice.&quot;
          </text>
        </g>
      </g>

      {/* bottom band */}
      <g className="ivx-band">
        <rect x="60" y="352" width="780" height="44" rx="10" fill="#fff7ed" stroke="#fed7aa" />
        <text x="450" y="379" fontSize="14" fontWeight="600" fill="#9a3412" textAnchor="middle">
          Three verdicts, zero data — this is the variance your brand owner finds before you do.
        </text>
      </g>
    </svg>
  );
}
