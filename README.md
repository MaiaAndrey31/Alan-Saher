# Alan Saher — The Experience

Premium, cinematic one-page website for DJ/producer **Alan Saher**. Built with Next.js
(App Router), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis smooth scroll and a
single React Three Fiber effect in the Hero.

## 1. Install

```bash
npm install
```

## 2. Run (development)

```bash
npm run dev
```

Opens at `http://localhost:3000`.

## 3. Build (production)

```bash
npm run build
npm run start
```

Always run `npm run lint` and `npm run build` after content or code changes — the build
fails on TypeScript errors, so it doubles as a type check.

## 4. Where to edit text

All editorial content lives in `src/data/*.ts` — nothing is hardcoded inside components.

| File | Controls |
| --- | --- |
| `src/data/artist.ts` | Name, roles, tagline, bio (short/full), start year, signature phrase |
| `src/data/timeline.ts` | "The Story" milestones |
| `src/data/worldStages.ts` | "World Stages" entries (also feeds the Numbers section) |
| `src/data/shows.ts` | Upcoming shows |
| `src/data/releases.ts` | Music releases |
| `src/data/gallery.ts` | Gallery images |
| `src/data/press.ts` | Press mentions |
| `src/data/social.ts` | Social links + WhatsApp booking number |

Only facts confirmed by the artist's team are included by default — several fields are
intentionally empty (shows, releases, press) rather than invented. See §9 below.

## 5. Where to put photos

Real photography replaces the generated placeholders in `public/images/`
(`placeholder-hero.png`, `placeholder-story.png`, `placeholder-stage.png`,
`placeholder-transition.png`, `placeholder-experience-*.png`) and `public/gallery/` for the
Gallery section (update the `src` paths in `src/data/gallery.ts` to match). Prefer WebP or
AVIF, already sized close to their rendered dimensions (the Hero image should be at least
1920px wide). The placeholders were generated locally with
`node scripts/generate-placeholders.mjs` — safe to delete that script once real assets are
in place.

## 6. Where to put videos

Drop files into `public/videos/`. To enable the optional Hero background video, set
`HERO_VIDEO_SRC` at the top of `src/sections/Hero.tsx` to e.g. `"/videos/hero.mp4"` — the
hero image remains the poster/fallback and the LCP element either way.

## 7. How to add shows

Edit `src/data/shows.ts`:

```ts
export const shows: Show[] = [
  {
    date: "2026-12-31",
    city: "Alfenas",
    venue: "Venue name",
    country: "Brazil",
    ticketUrl: "https://...", // optional
    soldOut: false, // optional
  },
];
```

An empty array renders an appropriate "no dates announced" state instead of fabricated
events.

## 8. How to add releases

Edit `src/data/releases.ts`:

```ts
export const releases: Release[] = [
  {
    title: "Track name",
    year: "2026",
    cover: "/releases/track-cover.jpg",
    spotifyUrl: "https://open.spotify.com/...",
    appleMusicUrl: "https://music.apple.com/...",
    type: "single",
  },
];
```

Cover art goes in `public/releases/`. An empty array shows a "connect on Spotify/Apple
Music" state instead of invented discography.

## 9. How to change social links

Edit `src/data/social.ts`. Each link ships with `configured: false` and `url: "#"` until a
real URL is confirmed — set `configured: true` once the link is live, otherwise the UI
treats it as a disabled "coming soon" state rather than a broken link. The WhatsApp booking
number (`whatsappBookingNumber`) is also set here.

## 10. How to configure the booking form

The form (`src/sections/Booking.tsx`) posts to `POST /api/booking`
(`src/app/api/booking/route.ts`), which currently validates the payload with Zod and logs
it server-side — there is no email/CRM integration yet. To connect one:

1. Choose a provider (e.g. [Resend](https://resend.com), SMTP, or a CRM webhook).
2. Add the required secret(s) to `.env.local` (copy `.env.example` first — never commit
   real secrets).
3. Implement the send inside `src/app/api/booking/route.ts` where the `TODO` comment is.

## 11. Deploy

The project is a standard Next.js app — deploy to Vercel (recommended, zero-config) or any
Node hosting that supports the Next.js App Router. Set `NEXT_PUBLIC_SITE_URL` (and any
booking-provider secrets) as environment variables on the host. Run `npm run build` before
deploying to catch type errors early.

---

## Project structure

```
src/
  app/            routes, layout, metadata, sitemap/robots, API route
  components/      shared UI (Header, Footer, Preloader, cursor, lightbox, three/)
  sections/        one component per home-page section
  animations/      (reserved for shared GSAP animation helpers)
  hooks/           useMediaQuery, usePrefersReducedMotion, useInView, useAppReady
  lib/             gsap setup, Lenis store, analytics, structured data, validations
  data/            all editable content (see §4)
  types/           shared content types
```

## Motion & animation infrastructure

- **Lenis + GSAP** are wired once in `src/components/SmoothScrollProvider.tsx`: a single
  GSAP ticker drives both Lenis' `raf` loop and every `ScrollTrigger`, avoiding duplicate
  RAF loops or desynced triggers. Cleaned up on unmount.
- **`@gsap/react`'s `useGSAP`** is used throughout instead of raw `useEffect` for GSAP code —
  it scopes selectors and automatically reverts tweens/ScrollTriggers on unmount or
  dependency change.
- **`prefers-reduced-motion`** is respected everywhere motion-heavy code runs (see
  `usePrefersReducedMotion`): Lenis is skipped, pinned/scrubbed sequences are replaced with
  static or simple-fade equivalents, and the Hero's WebGL layer is not mounted.
- **Mobile** gets a deliberately different experience, not a shrunk desktop one: the Story
  timeline swaps from a pinned horizontal scroll to a vertical list, WebGL never loads
  below `lg`, and pinned sequences are reduced.

## The one WebGL experience

The Hero (`src/components/three/HeroCanvas.tsx`) has the site's only Three.js/React Three
Fiber canvas: a fullscreen plane sampling the hero photo with a subtle mouse-reactive
ripple + hairline chromatic split. It's a progressive-enhancement layer over the real
`next/image` underneath (which remains the actual LCP element) — desktop + fine pointer +
no reduced-motion only, capped device pixel ratio, and paused (`frameloop="never"`) when
the Hero scrolls out of view.

## SEO

- Metadata API (`src/app/layout.tsx`): title template, description, canonical, Open Graph,
  Twitter card, robots.
- `src/app/opengraph-image.tsx` / `twitter-image.tsx` generate the branded social preview
  image on the fly with `next/og` — no static image file to keep in sync.
- `src/app/sitemap.ts` / `robots.ts` — file-convention routes, no manual XML.
- Structured data (`src/lib/structuredData.ts`): `Person` schema always, `Event` schema only
  for real confirmed shows in `src/data/shows.ts` (nothing is inferred or invented).

## Analytics

No analytics provider is wired up. `src/lib/analytics.ts` exports a single `track()`
function called at the key moments listed in the brief (`hero_booking_click`,
`booking_open`, `booking_submit`, `spotify_click`, `instagram_click`, `press_click`,
`show_click`) — plug a provider (GA4, Plausible, Meta Pixel, etc.) into that one file.

## Known placeholders to replace before launch

- All `public/images/placeholder-*.png` files (generated gradients, not real photography).
- Gallery images in `src/data/gallery.ts`.
- Hero video (optional) — see §6.
- Social links in `src/data/social.ts`.
- Releases, shows and press — currently empty by design (see §9 of the brief: no invented
  content).
- `src/data/artist.ts` → `bioFull` is marked `TODO` for final artist approval.
