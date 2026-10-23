/**
 * Decorative inline-SVG doodles for the scrapbook theme.
 * Purely presentational: no state, no data, no event handlers.
 * Every doodle inherits `currentColor`, so tint them with Tailwind text utilities.
 */

const Doodle = ({ viewBox, strokeWidth = 2.4, className = '', children, ...rest }) => (
  <svg
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

/* Hand-drawn double squiggle used as an underline beneath marker headings. */
export function SquiggleUnderline(props) {
  return (
    <Doodle viewBox="0 0 300 22" strokeWidth="5" preserveAspectRatio="none" {...props}>
      <path d="M6 12C25 2 44 22 63 11S101 0 120 11s38 11 57 0 38-11 57-1 38 10 57-2" />
      <path d="M26 18c20-6 40 4 60-1s40-5 60 1" opacity=".5" strokeWidth="3" />
    </Doodle>
  );
}

export function Sun(props) {
  return (
    <Doodle viewBox="0 0 48 48" {...props}>
      <circle cx="24" cy="24" r="9.5" />
      <path d="M24 3v5.5M24 39.5V45M3 24h5.5M39.5 24H45M9.2 9.2l4 4M34.8 34.8l4 4M38.8 9.2l-4 4M13.2 34.8l-4 4" />
    </Doodle>
  );
}

export function Sparkle(props) {
  return (
    <Doodle viewBox="0 0 24 24" strokeWidth="1.6" {...props}>
      <path d="M12 2.5c1.5 5 2.7 6.2 7.7 7.7-5 1.5-6.2 2.7-7.7 7.7-1.5-5-2.7-6.2-7.7-7.7 5-1.5 6.2-2.7 7.7-7.7z" />
    </Doodle>
  );
}

export function Heart(props) {
  return (
    <Doodle viewBox="0 0 24 24" strokeWidth="1.9" {...props}>
      <path d="M20.6 8.6a4.9 4.9 0 0 0-8.6-3.1 4.9 4.9 0 0 0-8.6 3.1c0 4.9 8.6 10.1 8.6 10.1s8.6-5.2 8.6-10.1z" />
    </Doodle>
  );
}

export function Confetti(props) {
  return (
    <Doodle viewBox="0 0 64 64" strokeWidth="2.6" {...props}>
      <path d="M8 12h5M14 30h4M6 45h6M30 6v5M52 14h5M50 34h5M22 52h5" />
      <circle cx="34" cy="24" r="2.4" />
      <circle cx="44" cy="48" r="2.4" />
      <circle cx="18" cy="28" r="2" />
      <path d="M40 8c3 4 6 6 10 7" />
    </Doodle>
  );
}

/* Dashed curled arrow, e.g. pointing from the hero note to the upload zone. */
export function CurvyArrow(props) {
  return (
    <Doodle viewBox="0 0 64 64" strokeWidth="2.6" {...props}>
      <path d="M6 10C32 8 50 24 50 50" strokeDasharray="6 7" />
      <path d="M41 42l9 10 8-11" />
    </Doodle>
  );
}

/* Long dashed "flight path" rule with a dot at each end. */
export function DashedPath(props) {
  return (
    <Doodle viewBox="0 0 320 36" strokeWidth="2.2" preserveAspectRatio="none" {...props}>
      <path d="M4 18c46-22 92 22 138-2s92-16 138 6" strokeDasharray="8 10" />
      <circle cx="4" cy="18" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="316" cy="22" r="3.4" fill="currentColor" stroke="none" />
    </Doodle>
  );
}

export function CakeDoodle(props) {
  return (
    <Doodle viewBox="0 0 48 48" strokeWidth="2.2" {...props}>
      <path d="M11 41V28c0-2.9 2.3-5.2 5.2-5.2h15.6c2.9 0 5.2 2.3 5.2 5.2v13" />
      <path d="M8 41h32" />
      <path d="M11 32.5h26" opacity=".55" />
      <path d="M17 22.8v-6M24 22.8v-9M31 22.8v-6" />
      <circle cx="17" cy="14.4" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="24" cy="11.4" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="31" cy="14.4" r="1.9" fill="currentColor" stroke="none" />
    </Doodle>
  );
}

export function PartyHat(props) {
  return (
    <Doodle viewBox="0 0 48 48" strokeWidth="2.2" {...props}>
      <path d="M6 43L24 6l18 37z" />
      <path d="M13.5 27h21" />
      <circle cx="24" cy="6" r="3.2" />
      <path d="M18.5 17.5h11" opacity=".55" />
    </Doodle>
  );
}

export function Balloon(props) {
  return (
    <Doodle viewBox="0 0 48 48" strokeWidth="2.2" {...props}>
      <path d="M24 5c6.6 0 12 5.1 12 11.4C36 24.7 28.8 31.6 24 35c-4.8-3.4-12-10.3-12-18.6C12 10.1 17.4 5 24 5z" />
      <path d="M24 35v6.5" />
      <path d="M21 44c1.8 1.6 4.2 1.6 6 0" />
      <path d="M19 12.5c-1.4 1.4-2.2 3.2-2.4 5" opacity=".55" />
    </Doodle>
  );
}

export function Swirl(props) {
  return (
    <Doodle viewBox="0 0 48 48" strokeWidth="2.2" {...props}>
      <path d="M24 24c0-3.8 4.2-5.6 6.8-3.6s1.8 7.6-2.8 9.4-12.4-.4-14-7.2S17.8 6 27 5.4" />
    </Doodle>
  );
}

/* Small paper plane, parked at the end of a dashed flight path. */
export function PaperPlane(props) {
  return (
    <Doodle viewBox="0 0 32 32" strokeWidth="2" {...props}>
      <path d="M3 15L28 4l-9 25-4.5-9.5z" />
      <path d="M14.5 19.5L28 4" opacity=".55" />
    </Doodle>
  );
}

/* ==========================================================================
   Party ephemera — flat shapes with a single ink outline.
   Fill classes live in index.css (.art-pink, .art-yellow, ...).
   ========================================================================== */

/* Two balloons with strings. Used in the hero poster and empty states. */
export function BalloonCluster({ className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 240 290"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        className="art-shape art-pink"
        d="M72 14c28 0 48 22 48 49 0 31-26 58-48 74-22-16-48-43-48-74 0-27 20-49 48-49z"
      />
      <path className="art-shape art-red" d="M72 137l-9 15h18z" />
      <path className="art-line" d="M72 152c9 18-9 28 0 46" />
      <path
        className="art-shape art-yellow"
        d="M178 82c21 0 36 16 36 36 0 23-19 42-36 54-17-12-36-31-36-54 0-20 15-36 36-36z"
      />
      <path className="art-shape art-orange" d="M178 172l-7 12h14z" />
      <path className="art-line" d="M178 184c7 14-7 22 0 36" />
      <path className="art-line" d="M166 8l4 12M192 4l2 13M210 26l12 2" />
    </svg>
  );
}

/* Filled five-point star for the backdrop. */
export function StarArt({ className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        className="art-shape art-yellow"
        d="M50 4 61 36 96 36 68 56 78 90 50 70 22 90 32 56 4 36 39 36Z"
      />
    </svg>
  );
}

/* Cake slice, frosting side out. */
export function CakeSliceArt({ className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path className="art-shape art-cream" d="M10 104 68 18 102 104Z" />
      <path className="art-shape art-pink" d="M68 18 102 104 82 104Z" />
      <circle className="art-shape art-red" cx="68" cy="14" r="9" />
      <path className="art-line" d="M34 88h20M43 71h13" />
    </svg>
  );
}

/* Loose squiggle of frosting. */
export function SquiggleArt({ className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 220 60"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        className="art-line"
        style={{ stroke: 'var(--grape)', strokeWidth: 10 }}
        d="M8 42c16-34 34 34 50 0s34 34 50 0 34 34 50 0"
      />
    </svg>
  );
}
