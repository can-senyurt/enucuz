import { useId } from "react";

/**
 * Hand-drawn vector pictures for the round category stories, in the spirit of
 * iOS app icons: a bright two-tone background, one bold object that fills the
 * circle, a soft gloss on top. Illustration colours live here on purpose
 * (like the product drawings), not in the site's colour tokens.
 */

export type CategoryArtKey =
  | "erkek"
  | "kadin"
  | "anne-cocuk"
  | "ev"
  | "supermarket"
  | "kozmetik"
  | "saat"
  | "elektronik"
  | "spor"
  | "kitap"
  | "otomobil";

const BACKGROUNDS: Record<CategoryArtKey, [string, string]> = {
  erkek: ["#62b0ff", "#2a52d0"],
  kadin: ["#ff93be", "#c0399c"],
  "anne-cocuk": ["#ffd860", "#ff9440"],
  ev: ["#58d8c8", "#0e7469"],
  supermarket: ["#a5e86a", "#2c9f4d"],
  kozmetik: ["#ff82cc", "#8a38d0"],
  saat: ["#9a98ff", "#392c9a"],
  elektronik: ["#63ccff", "#3944d2"],
  spor: ["#ffa560", "#e63f2b"],
  kitap: ["#ffd25e", "#ee7129"],
  otomobil: ["#ff7a7a", "#a91d3a"],
};

/** A little four-point sparkle. */
function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -4 Q0.8 -0.8 4 0 Q0.8 0.8 0 4 Q-0.8 0.8 -4 0 Q-0.8 -0.8 0 -4Z"
      fill="#fff"
      opacity="0.95"
    />
  );
}

function Shadow({ y = 56, rx = 19 }: { y?: number; rx?: number }) {
  return <ellipse cx="32" cy={y} rx={rx} ry="2.6" fill="#000" opacity="0.16" />;
}

function Art({ name }: { name: CategoryArtKey }) {
  switch (name) {
    case "erkek":
      return (
        <g>
          <Shadow />
          <path
            d="M19 17 L27 12 Q32 20 37 12 L45 17 L56 27 L50 35 L44 30 L44 55 L20 55 L20 30 L14 35 L8 27 Z"
            fill="#fff"
          />
          <path
            d="M44 30 L44 55 L36 55 L38 22 L45 17 L56 27 L50 35Z"
            fill="#9db4e8"
            opacity="0.28"
          />
          <path d="M27 12 L32 22 L24 27 L19.5 18 Z" fill="#dfe8fb" />
          <path d="M37 12 L32 22 L40 27 L44.5 18 Z" fill="#cdd9f5" />
          <path d="M29.5 22 H34.5 L36 27 H28 Z" fill="#ff5d4f" />
          <path d="M28 27 H36 L38.5 46 L32 51.5 L25.5 46 Z" fill="#ff5d4f" />
          <path d="M32 27 L38.5 46 L32 51.5Z" fill="#d83f35" />
          <rect
            x="35.5"
            y="37"
            width="6"
            height="6.5"
            rx="1"
            fill="none"
            stroke="#b8c8ee"
            strokeWidth="1.2"
          />
        </g>
      );
    case "kadin":
      return (
        <g>
          <Shadow y={57} />
          <path
            d="M23 8 L26 8 L27 17 M41 8 L38 8 L37 17"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M24 14 L29 14 L32 22 L35 14 L40 14 L42 31 L22 31 Z"
            fill="#fff"
          />
          <path d="M22 31 H42 L53 57 H11 Z" fill="#fff" />
          <path
            d="M32 31 L32 57 M27 31 L22 57 M37 31 L42 57"
            stroke="#f3c6dc"
            strokeWidth="1.4"
            fill="none"
          />
          <path d="M37 31 L53 57 H42 Z" fill="#c0399c" opacity="0.13" />
          <rect x="21" y="29" width="22" height="4.6" rx="2.3" fill="#ffd45e" />
          <Sparkle x={51} y={14} s={1.5} />
          <Sparkle x={13} y={26} s={1} />
        </g>
      );
    case "anne-cocuk":
      return (
        <g>
          <Shadow />
          <path
            d="M23 12 Q32 22 41 12 L53 21 L47 31 L42 28 L42 42 Q42 49 37 50 L37 54 L27 54 L27 50 Q22 49 22 42 L22 28 L17 31 L11 21 Z"
            fill="#fff"
          />
          <path
            d="M42 28 L42 42 Q42 49 37 50 L37 54 L33 54 L36 24 L41 12 L53 21 L47 31Z"
            fill="#ffb347"
            opacity="0.22"
          />
          <path
            d="M24 12.5 Q32 24 40 12.5"
            fill="none"
            stroke="#ffd0a6"
            strokeWidth="2"
          />
          <path
            d="M32 43 C23 37 25 29.5 29.5 30.2 C31.2 30.5 32 31.8 32 32.6 C32 31.8 32.8 30.5 34.5 30.2 C39 29.5 41 37 32 43Z"
            fill="#ff5d73"
          />
          <circle cx="29.5" cy="52" r="0.9" fill="#ffb347" />
          <circle cx="34.5" cy="52" r="0.9" fill="#ffb347" />
          <Sparkle x={50} y={11} s={1.3} />
          <Sparkle x={14} y={13} s={1} />
        </g>
      );
    case "ev":
      return (
        <g>
          <Shadow y={55} rx={23} />
          <rect
            x="21"
            y="7"
            width="22"
            height="14"
            rx="2.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
          />
          <path
            d="M24 18 L29 12 L33 16 L36 13 L40 18Z"
            fill="#fff"
            opacity="0.85"
          />
          <rect x="14" y="22" width="36" height="20" rx="8" fill="#fff6ea" />
          <rect x="7" y="31" width="12" height="22" rx="6" fill="#ffe0b8" />
          <rect x="45" y="31" width="12" height="22" rx="6" fill="#ffe0b8" />
          <rect x="15" y="34" width="34" height="15" rx="6" fill="#fff6ea" />
          <rect x="18" y="31" width="13" height="11" rx="4.5" fill="#ff9b45" />
          <rect x="33" y="33" width="13" height="9" rx="4" fill="#ffd38a" />
          <rect x="15" y="49" width="34" height="3" fill="#f3d3a8" />
          <rect x="13" y="52" width="4" height="5" rx="1.5" fill="#7a4a24" />
          <rect x="47" y="52" width="4" height="5" rx="1.5" fill="#7a4a24" />
        </g>
      );
    case "supermarket":
      return (
        <g>
          <Shadow y={57} rx={20} />
          <path
            d="M16 31 Q32 2 48 31"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="23.5" cy="26" r="8" fill="#ff4d4d" />
          <path
            d="M23.5 18.5 Q24 14 28 13 Q27.5 17.5 23.5 18.5Z"
            fill="#2fbf4f"
          />
          <circle cx="21" cy="23.5" r="2" fill="#fff" opacity="0.4" />
          <path
            d="M36 33 L46 15 Q48 12.5 50.5 14.5 Q52.5 16.5 50 19 L40 34Z"
            fill="#ff8a1f"
          />
          <path
            d="M47 13.5 Q46 8.5 50 7 Q50.5 11 49 13.5Z M50.5 14.5 Q54 11 57 12.5 Q54.5 16.5 51 17Z"
            fill="#35c35a"
          />
          <path
            d="M11 31 H53 L48 54 Q47.4 57 44.5 57 H19.5 Q16.6 57 16 54 Z"
            fill="#ffd36e"
          />
          <path d="M11 31 H53 L52.2 35 H11.8Z" fill="#ffbf3d" />
          <path
            d="M22 36 L24 56 M32 36 V57 M42 36 L40 56 M13.5 43 H50.5 M15 50 H49"
            stroke="#f0a92c"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      );
    case "kozmetik":
      return (
        <g>
          <Shadow y={57} rx={17} />
          <rect x="23" y="36" width="18" height="21" rx="3.5" fill="#23203a" />
          <rect
            x="23"
            y="36"
            width="6"
            height="21"
            rx="3"
            fill="#fff"
            opacity="0.1"
          />
          <rect x="22.5" y="31" width="19" height="7" rx="2" fill="#f6c66b" />
          <rect
            x="22.5"
            y="31"
            width="19"
            height="2.4"
            rx="1.2"
            fill="#fff"
            opacity="0.35"
          />
          <path d="M26 31 V21 L36 8 Q38.5 5.5 39 9 V31Z" fill="#ff3f73" />
          <path d="M26 21 L36 8 L36 10 L26 23Z" fill="#fff" opacity="0.35" />
          <Sparkle x={14} y={20} s={1.5} />
          <Sparkle x={52} y={30} s={1.1} />
          <Sparkle x={49} y={12} s={0.9} />
        </g>
      );
    case "saat":
      return (
        <g>
          <rect x="23" y="2" width="18" height="20" rx="4" fill="#f0b98a" />
          <rect x="23" y="42" width="18" height="20" rx="4" fill="#f0b98a" />
          <path
            d="M26 6 H38 M26 10 H38 M26 52 H38 M26 56 H38"
            stroke="#d99a68"
            strokeWidth="1.1"
          />
          <rect x="46" y="29.5" width="4" height="5" rx="1.5" fill="#d7d8e6" />
          <circle cx="32" cy="32" r="16.5" fill="#dfe0ee" />
          <circle cx="32" cy="32" r="13.2" fill="#fff" />
          <path
            d="M32 21.5 V24 M32 40 V42.5 M21.5 32 H24 M40 32 H42.5"
            stroke="#392c9a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M32 32 V24.5"
            stroke="#23203a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M32 32 L38.5 35.5"
            stroke="#23203a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M32 32 L27 38.5"
            stroke="#ff4d5e"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="1.7" fill="#ff4d5e" />
        </g>
      );
    case "elektronik":
      return (
        <g>
          <Shadow y={58} rx={14} />
          <rect x="19" y="6" width="26" height="52" rx="7" fill="#1d1d2e" />
          <rect x="21.5" y="9" width="21" height="46" rx="5" fill="#bcd0ff" />
          <rect
            x="21.5"
            y="9"
            width="21"
            height="46"
            rx="5"
            fill="#ffd2ef"
            opacity="0.5"
          />
          <rect
            x="28.5"
            y="10.8"
            width="7"
            height="2.6"
            rx="1.3"
            fill="#1d1d2e"
          />
          <rect x="24" y="18" width="7" height="7" rx="2" fill="#ff5d73" />
          <rect x="33" y="18" width="7" height="7" rx="2" fill="#ffc933" />
          <rect x="24" y="27" width="7" height="7" rx="2" fill="#35c3a0" />
          <rect x="33" y="27" width="7" height="7" rx="2" fill="#4f7bff" />
          <rect
            x="24"
            y="36"
            width="16"
            height="7"
            rx="2.5"
            fill="#fff"
            opacity="0.85"
          />
          <path
            d="M51 20 Q56 26 51 32 M55 16 Q62 26 55 36"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      );
    case "spor":
      return (
        <g>
          <path
            d="M-2 50 L14 30 L24 42 L38 24 L66 54 V66 H-2Z"
            fill="#a8271a"
            opacity="0.4"
          />
          <circle cx="52" cy="13" r="5" fill="#ffe27a" />
          <Shadow y={56} rx={15} />
          <defs>
            <clipPath id="spor-ball-clip">
              <circle cx="32" cy="35" r="18.5" />
            </clipPath>
          </defs>
          <circle cx="32" cy="35" r="18.5" fill="#fff" />
          <g
            clipPath="url(#spor-ball-clip)"
            fill="#2a2150"
            stroke="#2a2150"
            strokeWidth="1.1"
            strokeLinejoin="round"
          >
            <path d="M32.0 29.4 L37.3 33.3 L35.3 39.5 L28.7 39.5 L26.7 33.3Z" />
            <path
              d="M32.0 29.4 L32.0 22.4 M37.3 33.3 L44.0 31.1 M35.3 39.5 L39.4 45.2 M28.7 39.5 L24.6 45.2 M26.7 33.3 L20.0 31.1"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M40.3 23.5 L38.5 17.7 L43.4 14.1 L48.3 17.7 L46.5 23.5Z M45.5 39.4 L50.5 35.8 L55.4 39.4 L53.5 45.2 L47.4 45.2Z M32.0 49.2 L36.9 52.8 L35.1 58.6 L28.9 58.6 L27.1 52.8Z M18.5 39.4 L16.6 45.2 L10.5 45.2 L8.6 39.4 L13.5 35.8Z M23.7 23.5 L17.5 23.5 L15.7 17.7 L20.6 14.1 L25.5 17.7Z" />
          </g>
          <circle
            cx="32"
            cy="35"
            r="18.5"
            fill="none"
            stroke="#d9d2e8"
            strokeWidth="1.2"
          />
          <path
            d="M21 22 Q25 18 31 17.2"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
        </g>
      );
    case "kitap":
      return (
        <g>
          <Shadow y={57} rx={24} />
          <rect x="9" y="42" width="46" height="13" rx="3" fill="#2f5cff" />
          <rect x="51" y="43.5" width="5" height="10" rx="1.5" fill="#fff" />
          <rect x="12" y="46" width="30" height="2" rx="1" fill="#ffd45e" />
          <rect x="13" y="29" width="42" height="12.5" rx="3" fill="#ff4f6a" />
          <rect x="51" y="30.5" width="5" height="9.5" rx="1.5" fill="#fff" />
          <rect x="17" y="33" width="26" height="2" rx="1" fill="#ffd45e" />
          <rect x="10" y="16" width="44" height="12.5" rx="3" fill="#2fbf71" />
          <rect x="50" y="17.5" width="5" height="9.5" rx="1.5" fill="#fff" />
          <rect x="14" y="20" width="24" height="2" rx="1" fill="#ffd45e" />
          <g transform="rotate(38 46 12)">
            <rect
              x="43.2"
              y="-4"
              width="5.6"
              height="5"
              rx="2"
              fill="#ff7a8a"
            />
            <rect x="43.2" y="0.5" width="5.6" height="2.4" fill="#c9ccd8" />
            <rect x="43.2" y="2.9" width="5.6" height="18" fill="#ffd23f" />
            <rect
              x="43.2"
              y="2.9"
              width="2"
              height="18"
              fill="#fff"
              opacity="0.35"
            />
            <path d="M43.2 20.9 H48.8 L46 27 Z" fill="#f3d9b4" />
            <path d="M45.1 24.8 H46.9 L46 27Z" fill="#3b3b4f" />
          </g>
        </g>
      );
    case "otomobil":
      return (
        <g>
          <Shadow y={52} rx={25} />
          <path
            d="M6 40 L8 33 Q9.5 29 15 28 L22 21 Q24 19 28 19 H38 Q42 19 44 21 L50 28 Q56 29 58 33 V40 Q58 42.5 55.5 42.5 H8.5 Q6 42.5 6 40Z"
            fill="#fff"
          />
          <path
            d="M6 36 H58 V40 Q58 42.5 55.5 42.5 H8.5 Q6 42.5 6 40Z"
            fill="#d9dcea"
          />
          <path d="M23.5 22.5 L29.5 22 V28 H18 Z" fill="#78b9ff" />
          <path d="M33 22 H38 Q40 22 41.5 23.5 L46.5 28 H33Z" fill="#5aa4f5" />
          <rect x="55" y="31" width="3.5" height="3.4" rx="1" fill="#ffe27a" />
          <rect x="5.5" y="31" width="2.6" height="3.4" rx="1" fill="#ff3f4f" />
          <circle cx="19" cy="43" r="7" fill="#1b1b28" />
          <circle cx="19" cy="43" r="3" fill="#d9dde8" />
          <circle cx="46" cy="43" r="7" fill="#1b1b28" />
          <circle cx="46" cy="43" r="3" fill="#d9dde8" />
        </g>
      );
  }
}

export function CategoryArt({ name }: { name: CategoryArtKey }) {
  const uid = useId();
  const [top, bottom] = BACKGROUNDS[name];
  const gradient = `${uid}-bg`;
  return (
    <svg
      viewBox="0 0 64 64"
      className="block size-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={`url(#${gradient})`} />
      <Art name={name} />
      {/* Soft gloss, like a glass icon. */}
      <ellipse cx="32" cy="-4" rx="40" ry="24" fill="#fff" opacity="0.15" />
    </svg>
  );
}
