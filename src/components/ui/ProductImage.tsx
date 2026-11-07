import type { ImageKind } from "@/types";

/**
 * Generated placeholder illustrations. Real product photos arrive with real
 * data later; until then these are royalty-free and carry no brand imagery.
 */

const COLOR_HEX: Record<string, string> = {
  Siyah: "#26262b",
  Beyaz: "#f2f2ee",
  Gri: "#9a9aa0",
  Lacivert: "#1f3358",
  Mavi: "#3d7bd9",
  Kırmızı: "#d63a2f",
  Bordo: "#7a1f35",
  Pembe: "#ee9db8",
  Yeşil: "#2f8f5b",
  Haki: "#6f7550",
  Bej: "#d9c3a1",
  Kahverengi: "#7a5236",
  Sarı: "#f0c33c",
};

function hex(color: string): string {
  return COLOR_HEX[color] ?? "#9a9aa0";
}

/** Mixes a hex colour toward black (amt < 0) or white (amt > 0). */
function shade(color: string, amt: number): string {
  const n = parseInt(color.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * p);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function Shape({ kind, fill }: { kind: ImageKind; fill: string }) {
  const dark = shade(fill, -0.22);
  const light = shade(fill, 0.18);
  const line = {
    stroke: dark,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
  };
  switch (kind) {
    case "tshirt":
      return (
        <g>
          <path
            d="M62 52 L86 42 Q100 58 114 42 L138 52 L170 84 L148 104 L136 94 L136 192 L64 192 L64 94 L52 104 L30 84 Z"
            fill={fill}
          />
          <path d="M86 42 Q100 58 114 42" fill="none" {...line} />
        </g>
      );
    case "kids":
      return (
        <g transform="translate(20 28) scale(0.82)">
          <path
            d="M62 52 L86 42 Q100 58 114 42 L138 52 L170 84 L148 104 L136 94 L136 192 L64 192 L64 94 L52 104 L30 84 Z"
            fill={fill}
          />
          <path d="M86 42 Q100 58 114 42" fill="none" {...line} />
          <path
            d="M100 120 l5 11 12 1.5 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1.5z"
            fill={light}
          />
        </g>
      );
    case "shirt":
      return (
        <g>
          <path
            d="M62 50 L86 42 Q100 56 114 42 L138 50 L180 156 L158 164 L137 106 L137 198 L63 198 L63 106 L42 164 L20 156 Z"
            fill={fill}
          />
          <path d="M86 42 Q100 56 114 42 M100 56 V198" fill="none" {...line} />
          <circle cx="100" cy="90" r="2.4" fill={dark} />
          <circle cx="100" cy="124" r="2.4" fill={dark} />
          <circle cx="100" cy="158" r="2.4" fill={dark} />
        </g>
      );
    case "jacket":
      return (
        <g>
          <path
            d="M58 50 L82 40 L100 64 L118 40 L142 50 L182 154 L160 162 L141 112 L141 204 L59 204 L59 112 L40 162 L18 154 Z"
            fill={fill}
          />
          <path d="M82 40 L100 64 L118 40 M100 64 V204" fill="none" {...line} />
          <path d="M70 150 H90 M110 150 H130" fill="none" {...line} />
          <path
            d="M82 40 L100 64 L90 80 L72 56 Z M118 40 L100 64 L110 80 L128 56 Z"
            fill={light}
            opacity="0.55"
          />
        </g>
      );
    case "pants":
      return (
        <g>
          <path
            d="M62 30 H138 L148 212 H108 L100 96 L92 212 H52 Z"
            fill={fill}
          />
          <path d="M62 44 H138 M100 44 V96" fill="none" {...line} />
          <path d="M72 62 q8 6 8 20" fill="none" {...line} />
        </g>
      );
    case "dress":
      return (
        <g>
          <path
            d="M78 28 H90 Q100 46 110 28 H122 L128 84 L152 212 H48 L72 84 Z"
            fill={fill}
          />
          <path d="M72 84 H128" fill="none" {...line} />
          <path
            d="M84 100 L72 208 M100 100 V210 M116 100 L128 208"
            fill="none"
            stroke={dark}
            strokeWidth="1.5"
            opacity="0.45"
          />
        </g>
      );
    case "sneaker":
      return (
        <g>
          <path
            d="M22 156 V124 Q52 122 72 102 L98 92 Q120 112 152 114 Q186 118 186 144 V160 H22 Z"
            fill={fill}
          />
          <path
            d="M98 92 L112 104 M84 100 L98 114 M70 108 L84 122"
            fill="none"
            {...line}
          />
          <path
            d="M18 160 H190 V172 Q190 180 182 180 H26 Q18 180 18 172 Z"
            fill={light}
          />
          <path
            d="M22 156 Q60 150 100 152 Q150 150 186 144"
            fill="none"
            {...line}
          />
        </g>
      );
    case "boot":
      return (
        <g>
          <path d="M60 36 H114 V118 Q152 124 178 142 V176 H60 Z" fill={fill} />
          <path d="M60 52 H114 M60 74 H114" fill="none" {...line} />
          <path
            d="M56 176 H182 V190 Q182 198 174 198 H64 Q56 198 56 190 Z"
            fill={dark}
          />
          <path d="M60 176 H110 V198 H60 Z" fill={dark} opacity="0.6" />
        </g>
      );
    case "bag":
      return (
        <g>
          <path
            d="M82 52 Q82 26 100 26 Q118 26 118 52"
            fill="none"
            stroke={dark}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M54 76 Q54 52 100 52 Q146 52 146 76 L152 194 Q152 210 136 210 H64 Q48 210 48 194 Z"
            fill={fill}
          />
          <path
            d="M66 140 H134 V190 Q134 196 128 196 H72 Q66 196 66 190 Z"
            fill={light}
            opacity="0.5"
          />
          <path d="M66 140 H134" fill="none" {...line} />
          <path d="M100 100 V124" fill="none" {...line} strokeWidth={4} />
        </g>
      );
    case "beanie":
      return (
        <g>
          <circle cx="100" cy="48" r="11" fill={light} />
          <path d="M46 142 Q46 62 100 62 Q154 62 154 142 Z" fill={fill} />
          <rect x="38" y="132" width="124" height="32" rx="12" fill={dark} />
          <path
            d="M70 132 V164 M92 132 V164 M114 132 V164 M136 132 V164"
            fill="none"
            stroke={fill}
            strokeWidth="2"
            opacity="0.5"
          />
        </g>
      );
  }
}

export function ProductImage({
  kind,
  color,
  alt,
  className = "",
}: {
  kind: ImageKind;
  color: string;
  alt: string;
  className?: string;
}) {
  const fill = hex(color);
  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 200 240"
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <circle
        cx="100"
        cy="124"
        r="86"
        fill={shade(fill, 0.78)}
        opacity="0.55"
        className="dark:opacity-30"
      />
      <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity="0.08" />
      <Shape kind={kind} fill={fill} />
    </svg>
  );
}
