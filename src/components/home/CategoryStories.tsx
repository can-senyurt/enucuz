"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import {
  Baby,
  BookOpen,
  Car,
  Dumbbell,
  Handbag,
  Shirt,
  ShoppingBasket,
  Smartphone,
  SprayCan,
  Sofa,
  Watch,
  type LucideIcon,
} from "lucide-react";

/**
 * Round, story-style category row (like the top of Instagram): a soft ring,
 * a vector symbol and the name below. The row glides sideways with the finger
 * on a phone and can be dragged with the mouse on a computer.
 *
 * `slug` is set only for categories that already have products; the others
 * show a short "coming soon" note when tapped (new categories: Phase 7).
 */

interface Story {
  name: string;
  Icon: LucideIcon;
  /** Soft background of the circle, built only from palette tokens. */
  tint: string;
  slug?: string;
}

const stories: Story[] = [
  { name: "Erkek", Icon: Shirt, tint: "bg-mint", slug: "erkek" },
  { name: "Kadın", Icon: Handbag, tint: "bg-sage/35", slug: "kadin" },
  { name: "Anne & Çocuk", Icon: Baby, tint: "bg-warn/20", slug: "cocuk" },
  { name: "Ev & Mobilya", Icon: Sofa, tint: "bg-accent/15" },
  { name: "Süpermarket", Icon: ShoppingBasket, tint: "bg-deal/20" },
  { name: "Kozmetik", Icon: SprayCan, tint: "bg-sage/35" },
  { name: "Saat & Aksesuar", Icon: Watch, tint: "bg-mint", slug: "aksesuar" },
  { name: "Elektronik", Icon: Smartphone, tint: "bg-accent/15" },
  { name: "Spor & Outdoor", Icon: Dumbbell, tint: "bg-deal/20" },
  { name: "Kitap & Kırtasiye", Icon: BookOpen, tint: "bg-warn/20" },
  { name: "Otomobil & Motosiklet", Icon: Car, tint: "bg-sage/35" },
];

function Circle({ story, live }: { story: Story; live: boolean }) {
  const { Icon, tint } = story;
  return (
    <span
      className={`block rounded-full p-[3px] transition-transform duration-300 ease-out group-active:scale-95 motion-safe:group-hover:scale-[1.04] ${
        live ? "from-accent via-sage to-mint bg-gradient-to-tr" : "bg-line"
      }`}
    >
      {/* Gap between ring and picture, as on Instagram. */}
      <span className="bg-bg block rounded-full p-[3px]">
        <span
          className={`${tint} text-accent-text flex size-[4.25rem] items-center justify-center rounded-full sm:size-[4.5rem]`}
        >
          <Icon
            className="size-8 sm:size-9"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </span>
      </span>
    </span>
  );
}

export function CategoryStories() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // The note disappears by itself after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Mouse users cannot swipe: let them drag the row. Touch keeps native scrolling.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const el = scroller.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  }
  function endDrag() {
    if (!drag.current) return;
    // Keep `moved` until the click that follows the release has been swallowed.
    const moved = drag.current.moved;
    drag.current = moved ? { ...drag.current } : null;
    setDragging(false);
    if (moved) window.setTimeout(() => (drag.current = null), 0);
  }
  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const labelClass =
    "mt-2 block w-[5.25rem] text-center text-xs leading-tight font-medium text-balance sm:w-[5.25rem] sm:text-[13px]";

  return (
    <div>
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={`no-scrollbar edge-fade-x relative -mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [-webkit-overflow-scrolling:touch] xl:[mask-image:none] xl:[-webkit-mask-image:none] ${
          dragging
            ? "cursor-grabbing select-none"
            : "cursor-grab snap-x snap-proximity scroll-smooth"
        }`}
      >
        <ul className="mx-auto flex w-max gap-3.5 sm:gap-4">
          {stories.map((story) => (
            <li key={story.name} className="snap-start scroll-mx-4">
              {story.slug ? (
                <Link
                  href={`/kategori/${story.slug}`}
                  draggable={false}
                  className="group block min-h-11 rounded-2xl"
                >
                  <Circle story={story} live />
                  <span className={labelClass}>{story.name}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setNotice(`${story.name} çok yakında geliyor.`)
                  }
                  className="group block min-h-11 rounded-2xl"
                >
                  <Circle story={story} live={false} />
                  <span className={`${labelClass} text-muted`}>
                    {story.name}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Announced to screen readers; floats at the bottom of the screen. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center"
      >
        {notice && (
          <p className="animate-toast-in bg-ink text-bg max-w-sm rounded-2xl px-4 py-3 text-sm shadow-2xl">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
