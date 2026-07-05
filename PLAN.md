# Music Mini Games — Ear Training Game Plan

_Decided 2026-07-05, after a data review across GA (Migo Site, Migo itch, Note Tuning), App Store Connect (Migo, MMG, tuneUp Lite), fly-metrics, and Search Console._

## Vision

An ear-training game under the Music Mini Games brand: short drills that build a real
skill, one shared daily challenge that builds a habit. Native iOS app is the product;
the web is the funnel. Migo continues as a separate multiplayer arcade product line.

## Why this, why now (the evidence)

- **Note Tuning** (abandoned prototype, notetuning.com): still ~25 users/month with zero
  promotion, 1m17s avg engagement (7× any Migo surface), 207 levels passed in 90 days —
  but 0% week-1 retention because it has no reason-to-return loop. The core mechanic is
  validated; the loop is the missing piece.
- **tuneUp Lite**: 64.7K lifetime downloads. The 2017 spikes (~49K) were China App Store
  search waves; discount those. The durable signals: steady US organic App Store search
  downloads for a decade (76 in the last 90 days, in 2026, unmaintained), and a
  **4,000-seat US school district deployment via Apple School Manager on Nov 7, 2025**.
- **MMG app** (id 6752395649): dormant (8 sessions/90d) but pulls 1.8K organic
  music-keyword impressions/quarter at 0.9% conversion — double Migo's rate.
- **Migo comparison**: 89% monthly churn, 43s engaged bursts, all-branded search, and a
  multiplayer population problem no feature work can fix. MMG's bottleneck is product;
  Migo's is distribution. Solo hours convert better against the product bottleneck.
- **Channel conclusion**: every success signal in this genre is *search* (App Store
  search above all, some web search). Be the best answer to "ear training", not a
  games-chart lottery ticket.

## Product spec

- **Daily challenge**: one shared, server-published, ramping run (starts easy, gets
  hard; score = distance/accuracy). Same puzzle for everyone — comparability is the
  product. Streaks. No easy/medium/hard picker.
- **Drills (practice mode)**: offline adaptive ladder (interval/chord/tuning families
  unlock by accuracy). Personal, not comparative. This is why you get better at the daily.
- **Content delivery**: server publishes dated daily specs (small JSON); app prefetches
  ~7 days whenever online. Deterministic given the spec — no generator version skew.
- **Leaderboards: self-hosted, not Game Center.** GC is unavailable on Managed Apple IDs
  (the school channel) and can't include web players. Canonical board lives on our
  backend, day-scoped to the daily. Optional fire-and-forget GC mirror for consumers if
  it stays a few lines. Names are generated/curated handles (e.g. "BrassFalcon") — no
  free-text entry, no moderation queue, school-safe.
- **Anti-cheat**: daily spec is deterministic, so the server knows the max plausible
  score per day; sanity-check submissions server-side.

## Platform order

1. **Native iOS app first** (update the existing MMG app, don't ship a new one).
   Rationale: daily habits live on phones (streak notifications, pocket, home screen);
   App Store search is the proven channel; founder will dogfood daily — the first
   retention cohort is Calvin's own streak. Native AVAudioEngine audio: no gesture-unlock
   shims, no silent-switch hacks, ~15ms latency.
2. **Web = funnel + taste**: musicminigames.com keeps marketing + eventually a browser
   version of the daily for search traffic. Desktop-quality Web Audio only; **mobile web
   is explicitly skipped** (that's where all the audio hacks live — phones get the App
   Store badge).
3. **notetuning.com**: keep running as-is (control group) until the new daily ships on
   web, then 301 to musicminigames.com to consolidate its users and search equity.

## Offline-first (personal + school requirement)

School networks category-block "Games" domains and sometimes unknown domains; managed
iPads may have DNS filters. Same architecture serves both the practice-anywhere user and
the filtered classroom:

- Drills 100% offline; dailies prefetched; scores/streaks written locally, queued, and
  synced when any request succeeds.
- Never fail or nag on network absence: no launch spinner, no error toasts, silent
  short-timeout retries. No cert pinning (SSL-inspecting districts). Plain HTTPS on one
  first-party domain; no websockets; no third-party analytics calls in-app.
- After launch: submit the domain to filter vendors (Lightspeed, zScaler, Securly…) for
  **Education** categorization.

## Schools channel

A district deployed 4,000 seats of tuneUp Lite eight months ago, unprompted. Inherit that:

- Free tier genuinely classroom-usable; no forced accounts; COPPA-clean privacy label;
  no ads, ever.
- "For music educators" line on the listing and site.
- Schools are distribution, not revenue: kids bring the habit (and the paid tier) home,
  teachers recommend. Later niceties: class-friendly drills, no-login boards.
- Update tuneUp Lite's listing/description to point at the new MMG release — those 4,000
  students are a warm audience for "same developer's modern ear trainer."

## Monetization

Principles: no ads (school-clean, premium feel); the growth engine stays free forever
(daily + streak + first drill tiers); pay for depth, not for the habit.

1. **MMG Pro (IAP)** — subscription with lifetime escape hatch, priced for a niche
   education audience, e.g. $2.99/mo, $14.99/yr, **$34.99 lifetime** (lifetime matters:
   musicians distrust subscriptions; tuneUp Pro was a paid app and worked).
   Pro unlocks: full drill ladder, custom drill builder (choose intervals, ranges,
   instrument timbres), progress stats/history, practice reminders.
2. **Web checkout via Migo's Stripe infrastructure** — `Myapp.WebStore` already does
   hosted Stripe checkout + entitlement grants. Sell Pro on musicminigames.com for web
   users, and (US) consider the external-purchase link path later. One entitlement,
   two storefronts.
3. **StoreKit verification** — the Fly backend already has `/api/v1/ios/purchases/*`;
   extend the same pattern to the MMG Pro product so entitlements are server-side and
   shared across devices/web.
4. **Explicitly rejected**: ads, selling to schools as the primary revenue line (channel
   is distribution), paywalling the daily or streaks, coin/gem economies.

## Using Migo's Fly infrastructure for MMG

The Phoenix app (`migo-mono/elixir`, `myapp-music-mini-games` on Fly — the name was
always a hint) becomes MMG's backend too. Greenfield endpoints — no `client_version`
dual-shape needed (nothing has shipped).

- **Identity**: reuse the device register/JWT flow (`/api/v1/user/register`,
  `/api/v1/auth/token`) — it's app-agnostic. Anonymous device identity + chosen handle;
  no Migo account import.
- **Daily specs**: new context (e.g. `Myapp.MMG.Daily`) + `GET /api/v1/mmg/daily`
  returning a ~7-day window of dated specs. Authored/curated via mix task or seeds;
  fixable server-side without app releases.
- **Scores & streaks**: reuse the `scores` table with new `mode` values (e.g.
  `"mmg_daily"`), day-scoped leaderboard endpoint, server-side streak computation on
  sync. Score sanity-checks against the day's spec.
- **Entitlements/purchases**: reuse `Myapp.Inventory`/entitlements + StoreKit endpoints +
  `Myapp.WebStore` (Stripe) for Pro, per Monetization above.
- **Metrics**: reuse the Prometheus/Grafana pipeline — a new `migo_mmg_*` (or
  `mmg_*`) metric family kept separate from `migo_client_*`/`migo_web_*`, same
  running_sum(increase()) discipline (Fly autostop resets in-memory counters), new
  Grafana dashboard rows. Server-side event beacons instead of in-app GA.
- **CORS**: allow musicminigames.com origin for the web daily; web client hits the Fly
  API directly.
- **Cloudflare side**: the worker serves the marketing site only — the legacy
  Matter.js game and its D1 scores were removed (not a music game). New game state
  lives in Postgres on Fly. One backend of record.
- **Hygiene**: GA `?internal=1` flag pattern already exists for web pages; keep using
  it on musicminigames.com (needs the same snippet added there).

## Listing & ASO (ships with the app update)

- Category: **Music primary, Games/Music secondary** (out of the Games chart, into
  intent-driven browse).
- Screenshot pass: first 2–3 = real gameplay with benefit captions, portrait-composed;
  app preview video; plain-language subtitle (no keyword stuffing).
- Campaign links per channel (`ct=` tokens; pt=1534960). tuneUp Lite listing points here.

## Validation & metrics

- **Founder streak**: Calvin uses it daily from the first TestFlight build. If the app
  can't hold its own maker for three weeks, iterate before marketing.
- **The one launch metric**: % of new users who play a second daily within 7 days.
  (Note Tuning's baseline: 0%. Anything meaningfully above zero validates the loop.)
- TestFlight cohort = friendly-biased upper bound; treat accordingly.
- Server-configurable tunables from day one (drill difficulty, ramp curve in the daily
  spec) so balance changes don't need app releases.

## Sequenced roadmap

1. Extract drill mechanic + level tuning from `note-tuning-updated`. *(days)*
2. Fly backend: daily specs endpoint, mmg score mode + leaderboard, metrics family. *(days)*
3. iOS: drill ladder + daily + streaks + offline sync in the MMG app; TestFlight;
   founder dogfooding starts. *(the main build)*
4. Listing overhaul + category change + Pro IAP ship with the App Store release.
5. Post-launch: web daily on musicminigames.com (desktop), notetuning 301, Stripe web
   Pro, filter-vendor categorization requests, tuneUp Lite cross-pointer.

## Non-goals (v1)

Realtime multiplayer; mobile web play; itch; ads; school-specific SKUs; Game Center as
canonical anything; Migo account integration; difficulty pickers.
