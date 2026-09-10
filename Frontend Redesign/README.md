# Handoff: CRD Leads Dashboard — Visual Redesign

## Overview
Executive-grade visual redesign of the internal CRD Leads analytics dashboard (advertising/sponsorship sales performance across 4 territories). Same information architecture and data model as the existing app — this is a restyle + layout/hierarchy pass, not a new feature. Target: React + Vite + TypeScript + Tailwind (existing codebase).

## About the Design Files
The bundled file (`dashboard-reference.html`) is a **design reference built in HTML** — a static prototype demonstrating the intended look, layout, and interaction pattern (territory nav → overview / detail). It is NOT production code. Recreate this design in the existing React/Vite/TypeScript/Tailwind codebase, using existing data-loading (pre-generated monthly JSON), existing routing (`/` and `/territory/:manager`), and existing component patterns — porting the inline styles below into Tailwind config + component classes, not copy-pasting raw HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing, and component treatments below are final. Numbers/labels in the reference file are illustrative mock data — replace with the real data pipeline; do not hardcode them.

## Design Tokens

### Colors (add to `tailwind.config` theme.extend.colors, e.g. under a `crd` namespace)
- `ink` (primary text / dark surfaces): `#241f18`
- `ink-soft` (secondary text): `#4a4238`
- `muted` (tertiary text / labels): `#8a8071` and `#a39a8a`
- `app-bg` (page background): `#f2ece0`
- `surface` (card background): `#fffdf9`
- `hairline` (borders): `rgba(36,31,24,0.10)` (use `0.06`–`0.12` depending on emphasis)
- `gold` (brand accent, primary bars/highlights/active states): `#b8862e`
- `gold-soft` (secondary bar fill, muted brand tint): `#e0d5bd` / `#d8cdb8`
- `gold-link`: `#8a5a1e`
- `terracotta` (secondary accent, used for "bad" delta / negative in one warm accent, not pure red): `#a3312a`
- `good` (positive delta / A grade): `#2f6b46`, bg tint `rgba(47,107,70,0.13)`
- `warn` (B grade / amber): `#8a5a1e` on bg tint `rgba(184,134,46,0.16)`
- `bad` (C grade / negative delta): `#a3312a` on bg tint `rgba(163,49,42,0.13)`

Grade color mapping is fixed and reused everywhere: A+/A → green, B → gold/amber, C → terracotta/red. Never recolor grades per-context.

### Typography
- Headings / large numbers / section titles: **Newsreader** (serif), weights 500–700. Google Font.
- UI text, labels, body: **IBM Plex Sans**, weights 400–700.
- Tabular numbers (currency, %, table cells): **IBM Plex Mono**, weight 500–600.
- Scale used: 34px (KPI number), 26px (card number / page title), 24px (section stat), 15px (section header, serif), 13.5px (table primary text), 12–13px (table secondary / labels), 11–12px (uppercase micro-labels, letter-spacing 0.03–0.04em).

### Spacing / shape
- Card radius: 14px. Small badges/chips: 5–8px. Pills: 20px (full).
- Card padding: 22–24px. Section gap: 16px. Grid gaps: 14–16px.
- Card shadow: `0 2px 10px rgba(36,31,24,0.05)`; hover elevation: `0 6px 20px rgba(36,31,24,0.12)`.
- Card border: `1px solid rgba(36,31,24,0.1)`.

## Screens / Views

### 1. Top bar (persistent, both pages)
Full-width charcoal (`#241f18`) bar, 64px tall. Left: "PVR" (white) + "INOX" (gold `#d6a94b`) wordmark, a 1px vertical divider, then "CRD LEADS DASHBOARD" uppercase label (62% white opacity). Right: last-refreshed text (50% white opacity) + a circular gold avatar chip with initials.

### 2. Territory nav (persistent, both pages)
Row of pill buttons: All / Gaurav / Rajesh / Shalini / Sharda. Active pill: solid `#241f18` fill, white text. Inactive: transparent, 1px hairline border, `#4a4238` text. "All" navigates to the Overview page; each name navigates to that territory's Detail page.

### 3. Filter row (persistent, both pages)
Left: "Months" label + a chip-group control (rounded card, each selected month as a small filled chip — default all 3 months selected, dropdown caret). Right: "Compare" label + a 4-way segmented control (None/MoM/QoQ/YoY) — active segment gets a white pill with subtle shadow inside a light-gray track.

### 4. Overview page (`/`)
Order top to bottom:
1. **3 KPI tiles** (Combined AOP Target, Actual Revenue, Achievement %) — big serif number, small delta chip (arrow + color, up-arrow green when direction is favorable) top-right of the number, sub-caption below.
2. **Two-column row**: (a) grouped bar chart, Actual vs AOP Target per month (Jun/Jul/Aug), gold bars = Actual, pale tan bars = Target, legend above; (b) discount-by-territory table (Territory / LM / CM / Δ), Combined row bold, delta colored by direction (decrease in discount = good = green).
3. **Sales Quality contribution** card: one continuous segmented horizontal bar (6 categories, gold-tone palette) + a legend grid below with swatch, category name, ₹ value, % of revenue.
4. **Territory cards grid** (4, one per manager): manager name + territory name, grade badge top-right, big "% of AOP" number, thin progress bar colored by grade, revenue + delta chip at bottom. Entire card is a click target → navigates to that territory's Detail page (hover: shadow lift + gold-tinted border).

### 5. Territory detail page (`/territory/:manager`)
Header: manager name (serif, large) + territory name, sub-regions list top-right. Then 7 stacked section cards, each with a numbered serif section title:
1. **Business Planning & Control** — table: Sub-region / AOP Target / Confirmed / Actual / Achv% / Grade badge. One row per sub-region + a bold "Combined Total" row **only when the territory has 2+ sub-regions** (Gaurav only); single-sub-region territories show one row, no combined row.
2. **A/c Bucket** — left: one stacked horizontal bar per sub-region (gold = Key+Growth, pale tan = Rotating, % labels inside segments) + legend; right: matching data table.
3. **Price Control / Discount** — table: Channel / LY / CM / Δ / inline two-segment mini-bar comparing LY (pale) vs CM (gold) magnitude.
4. **Sales Quality** — grid of 6 tiles (one per category: Off Screen, Innovations, Format Sponsorships, IP Sales Deals, Zeouk Box Deal, Brandscap Deal), each showing LY/LM/CM values in a 3-column mono-number row, CM value in gold-link color to draw the eye to "current".
5. **Productivity per Head** — table: Sub-region / Actual / Target / Nat'l Benchmark / inline bar (bar length = actual vs benchmark, color green if actual≥target else gold; a dark vertical tick marks the target position on the bar).
6. **Financial Control** — 3 stacked stats: YTD Income Billed, Outstanding (both serif numbers), Collection % with its own progress bar colored by threshold (≥85% green, 75–85% gold, <75% terracotta).
7. **Billing Challenges** — paired bar+line-style chart per month: wide gold bar = Income Billed, thin colored bar = Billing Challenges % (color by threshold: ≤5% green, 5–7% gold, >7% terracotta — lower is better here, opposite of most metrics).

## Interactions & Behavior
- Nav pills and territory cards are the only navigation — clicking a territory name/card always shows that territory's full 7-section detail; clicking "All" returns to Overview.
- Compare-mode segmented control and month chip control are visual/state-only in the reference (no recompute wired) — implement real recompute against the JSON data source in the real app.
- Card hover: shadow lift + border tint (150ms transition), used on clickable territory cards.
- No modals, no multi-step flows.

## Null-value & data-quality rules (critical)
- **Any missing numeric field renders as an em dash "—"**, never a blank cell, 0, or broken layout. Apply this formatter everywhere a number is displayed (currency, %, per-head figures).
- Currency format: `₹{value.toFixed(1)} Cr` (e.g. `₹7.6 Cr`). Percent format: `{value.toFixed(1)}%` (0 decimals for Collection %).
- Delta chips: arrow (▲/▼) + colored label. Direction of "good" is metric-specific — pass a `goodDirection: 'up'|'down'` per metric (discount %, billing-challenges % are `'down'`; revenue, achievement, collection are `'up'`). Never hardcode "up = green".
- Grade badges (A+/A/B/C) always use the same 3-color mapping (green/gold/terracotta) regardless of context.

## State Management (for the real app)
- Route state: current territory (`'all' | manager-key`) drives Overview vs Detail.
- Filter state: selected months (multi-select, default all available), comparison mode (None/MoM/QoQ/YoY) — both should filter/recompute the JSON-sourced data, not just restyle.
- All page content derives from the monthly JSON export; component tree should treat every metric as `number | null`.

## Assets
No external images/icons. Google Fonts: Newsreader, IBM Plex Sans, IBM Plex Mono (all loaded via standard Google Fonts `<link>` in the reference — use whatever font-loading approach the existing app already uses, e.g. self-hosted or `next/font` equivalent).

## Files
- `dashboard-reference.html` — full interactive HTML reference (Overview + all 4 territories' Detail views, built with real mock numbers per territory including intentional null cells).
