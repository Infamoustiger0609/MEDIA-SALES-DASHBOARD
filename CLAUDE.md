# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # tsc -b (type-check) then vite build -- must pass before considering a change done
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

There is no test runner configured in this project. Type-checking (`tsc -b`, run as part of `npm run build`) is the primary correctness gate — always run a build after non-trivial changes.

To regenerate a month's JSON from the source Excel workbook:

```bash
python scripts/extract_crd_report.py "<path_to_xlsx>" <YYYY-MM> [output_dir]
# writes ./data/<YYYY-MM>.json by default
```

## Architecture

This is a static, client-only dashboard (React + Vite + TypeScript + Tailwind v4) reading pre-generated monthly JSON files from `/data` — there is no backend or API layer.

**Data pipeline**: `scripts/extract_crd_report.py` parses the monthly "Report CRD_Leads" Excel workbook (one sheet per manager: Gaurav, Rajesh, Shalini, Sharda) using anchor-based text search rather than fixed row/column offsets, because sheet layouts shift between months (e.g. Gaurav's sheet has an extra sub-region block). It outputs `data/<YYYY-MM>.json` matching the shape in `src/types.ts`.

**Data loading (`src/lib/loadData.ts`)**: uses `import.meta.glob('/data/*.json', { eager: true })` to auto-discover every month file at build time — dropping a new `data/<YYYY-MM>.json` in requires no code changes. Only filenames matching `YYYY-MM.json` are picked up (this excludes ad hoc files like `2026-06_sample_output.json`). `monthlyData` is sorted ascending by month; `getTerritory(month, manager)` and `getMonthData(month)` are the main lookup points used throughout the app.

**Filter state (`src/store/filterStore.ts`)**: a single Zustand store holds the cross-page filter bar state — selected territory (for the Overview grid), selected month, and comparison mode (`MoM | QoQ | YoY | None`). Both pages and most section components read from this store directly rather than receiving filters as props.

**Comparison logic (`src/lib/useComparison.ts` + `src/lib/periods.ts`)**: `useComparison(manager, metricFn, mode)` looks up the current month's territory via the filter store, computes the prior period's `YYYY-MM` with `date-fns` (`priorPeriod`), and looks up that territory too. It returns `{ current, prior, delta, deltaPct, available }` — `available` is `false` (never a fabricated 0%) whenever the prior month isn't loaded or either value is null. Every KPI-with-comparison in the app is wired through this one hook; `<DeltaBadge>` renders `available: false` as "No prior data".

**Null handling**: virtually every numeric/grade field in the schema can be `null` (missing Excel data). Formatters in `src/lib/format.ts` (`fmtNum`, `fmtPct`, `fmtCr`, `fmtInt`) all render `"—"` for `null`/`undefined` instead of throwing or showing `NaN`. Section components (e.g. `SalesQualitySection`) filter out sub-entries where every field is null rather than rendering an empty card.

**Page structure**:
- `/` (`src/pages/Overview.tsx`) — grid of `TerritoryCard`s for the 4 fixed managers (`MANAGERS` / `MANAGER_TERRITORY_LABEL` in `src/types.ts`), filtered by the store's territory selection.
- `/territory/:manager` (`src/pages/TerritoryDetail.tsx`) — composes the seven section components in `src/pages/sections/` (Business Planning, A/c Bucket, Price Control, Sales Quality, Productivity, Financial Control, Billing Challenges), each taking the resolved `Territory` object (and `comparisonMode` where relevant) as props.
- A territory can have multiple `subRegions` (only Gaurav/Delhi+East currently does); sections that render per-sub-region also render a combined-total block when `subRegions.length > 1`.

**Charts and tables**: Recharts (`BarChart`) for the A/c Bucket, Price Control discount, and Productivity charts, colored from the fixed categorical palette in `src/lib/chartColors.ts` (do not introduce ad hoc colors — pull from this file, order matters for colorblind-safety). `@tanstack/react-table` (v8 API — `useReactTable`/`getCoreRowModel`/`flexRender`) drives the Price Control channel table. Because subregion counts can vary, table/chart-per-subregion logic lives in small subcomponents (e.g. `PriceControlSubBlock`) rather than looping `useReactTable`/`useComparison` calls directly inside a `.map`, to keep hook call counts stable per component instance.

**Grades**: `planningGrade`/`controlGrade`/ranking fields are one of `A+ | A | B | C`, rendered via the shared `<GradeBadge>` (green/amber/red) everywhere — don't reimplement grade-to-color logic elsewhere.
