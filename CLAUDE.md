# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/classes/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx`: `<Button variant size fullWidth>`. Variants:
  `primary` (grape fill, white text), `accent` (sunflower; use it for the one
  playful CTA on a colored band), `outline` (white with ink outline), `ghost`.
  Sizes `sm|md|lg`. **Fluently buttons are chunky pills** with a 2px ink
  outline and a hard "sticker" drop shadow that presses in on click. Don't
  reintroduce square buttons or soft shadows. Links that should look like buttons
  use `buttonClasses(variant, size, { fullWidth, className })`. Pass only layout
  classes via `className`.
- `components/ui/input.tsx` — `<Input>` / `<Textarea>` for text fields.
- Leave genuinely-different controls inline: selection/toggle chips with an
  active/selected state (staff/time/day/variant/location/department pickers, step
  indicator/progress, pagination), destructive buttons (no destructive variant),
  `<select>`, checkboxes/radios, icon-only controls, and navigation rendered as
  `next/link` `<Link>` (Button renders a `<button>` and has no anchor mode).

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones (`hooks/use-booking-flow.ts`).

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `location`, `timezone`, `cart`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/booking/step-indicator.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is loaded
  this way in `components/booking/booking-view.tsx` (`PaymentStep`, `ssr: false`)
  so it isn't in the initial bundle.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## Fluently: language school (New York + online, USD)

### Foundation files (owned by the template foundation; raise changes, don't fork them)
`lib/site-config.ts` (all copy: hero, formats, quiz, steps, testimonials, FAQ,
values), `app/globals.css` (tokens and utilities), `app/layout.tsx` (fonts,
providers, JSON-LD), `components/layout/*`, `components/motion/*`,
`components/ui/{button,safe-image,page-heading,faq-accordion}.tsx`,
`lib/catalog.ts`, `lib/subject-color.ts`, `lib/server-data.ts`.

### The catalog model (`lib/catalog.ts`): generic, derived from the data
Nothing about languages is hard-coded, so the same template works for a music,
coding or tutoring school.
- **Subject** = a visible product collection (a language), except
  `siteConfig.collections.starter` (`start-here`: trial + conversation club).
- **Class** = a product group. Its variants are **levels** for group classes
  (`levelCode()` pulls "A1"/"B2" out of the variant title) or **lengths** for
  private lessons.
- **Format** comes from the data, not slugs (`classFormat()`): `maxAttendees > 1`
  is a group, online when every location is `type: online`, otherwise campus; a
  1-seat class is private, or a free trial when it costs 0.
- **Teacher** = a staff member; their subjects, campuses and online flag come
  from the products and locations they're assigned to (`toTeachers()`). The staff
  DTO has no bio, so teacher pages are built from those relations.
- **Color**: each product's dashboard color (`ProductColorType`) maps to a
  swatch via `swatchFor()` in `lib/subject-color.ts`. Use it for cards, chips
  and timetable pills. Don't map subjects to colors by slug.
- Prices are major units (`formatPrice`, `formatWholePrice` shows "Free" for 0).
  Durations are seconds (`formatDuration`).

### Pages
- Home (`app/page.tsx`): every stat is derived from the API and zero values
  are hidden, so never put made-up numbers in copy. The "This week" timetable
  (`getTimetable`, `unstable_cache` 300 s, availability fan-out with concurrency
  6) streams inside `<Suspense>`.
- `/classes` filters (`language`, `format`, `level`) are read from
  `searchParams` and kept in sync with `history.replaceState`.
- `/languages/[slug]` and `/teachers/[slug]` are SSG (`generateStaticParams`).
- Contact uses real store contact data (`storeContact(settings)` in
  `lib/contact.ts`). There's no fake form.

### Booking deep links
`/booking/<slug>?date=YYYY-MM-DD&staff=<id>&location=<id>`. A **variant slug**
preselects that variant (level/length). `date`, `staff` and `location` are
applied once by `use-booking-flow` (`BookingPreselect`) and validated against
the active variant, so bad params are ignored rather than breaking the flow.
Timetable rows, class cards' variant chips and "Book with {teacher}" all use this.

### Online lessons
The Online location's `link` is the classroom URL. `JoinLessonButton` shows it
on online appointments (account and thank-you pages) and enables it from
`siteConfig.joinWindowMinutes` before the start until the end. Chat and shared
materials are a roadmap teaser in the account area; don't fake them.

### Design
- Fonts come from next/font: **Fredoka** (`.heading-display`) and **DM Sans**
  for body text. `.tabular` for times and prices.
- Warm paper background, ink `#16131F`, grape primary, and sunflower, coral,
  mint, sky and bubblegum accents. Big radii (`rounded-[28px]` cards), 2px ink
  outlines, hard offset shadows, and `sticker` / `sticker-sm` / `bubble`
  utilities for tilted chips and speech bubbles.
- **Timezone and hydration:** render times in `siteConfig.timezone` during SSR
  and hydration, then switch to the visitor's zone after `useHydrated()`. Import
  `useReducedMotion` from `@/components/motion/use-reduced-motion`, not
  framer-motion; it returns false while hydrating.
- **Images:** every image goes through `SafeImage` inside an
  `.image-placeholder` container, so a missing image falls back to the swatch.
  **Class images, teacher portraits, logo and banner come from the store, never
  `public/`.** Use `getListItemGallery` / `getProductImage`, never `images[0]`.
  Only decorative brand art lives in `public/`:
  - `images/mascot-{hero,wave,thinking,teacher,laptop,calendar}.png` (3D mascot)
  - `images/step-{pick,book,speak}.png` (How it works props)
  - `images/gallery-{classroom,group-class,online-lesson,conversation-club,private-lesson,campus-brooklyn}.jpg` (real photos, About page)
  - `videos/hero.mp4` + poster (video band)

  Generators live in `scripts/image-generation/` (`language_school_*` manifests).

## Verifying changes

- `npm run build` and `npm run lint` must pass. In the route summary, read-only
  pages should be `○` / `●` (static) or `ƒ` (dynamic) Server Components, not pure
  client pages.
- Smoke test: `/`, `/classes`, a language page and a teacher page render with
  data; a timetable row deep-links into booking with the date and teacher set;
  an online group class and the free trial both book end to end; the account
  shows "Join lesson" for the online booking.
