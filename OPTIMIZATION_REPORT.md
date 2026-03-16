# Toolz Optimization Report

Date: 2026-03-16
Scope: fork cleanup, UI/UX, SEO, stability, fallbacks, and implementation risks for the adblock tester in this repository.

## What Was Cleaned Up

- Updated stale upstream references to the current repository in package metadata, README links, generated host-list headers, and UI copy.
- Fixed the dev server opening the old `/toolz/` path.
- Fixed the mobile nav close handler so clicking nav links closes the menu again.
- Renamed a couple of leftover `d3*` UI ids/download names to project-neutral names.

## Highest Priority Findings

### 1. Analytics scripts contradict the product promise

The site says no trackers are activated during testing, but it loads both Umami and GoatCounter.

- Code: `src/partials/head.ejs`
- Code: `src/index.ejs`
- Impact: trust issue, extra third-party requests on a privacy-focused tool, possible blocker interference, avoidable performance cost.
- Recommendation: remove analytics from the test page, move them behind consent, or at minimum disable them while a test is running and update the copy.

### 2. Host checks turn many non-blocking failures into “blocked”

Any fetch error, timeout, abort, DNS problem, captive portal issue, or offline state is counted as blocked.

- Code: `src/js/index.js`
- Impact: inflated scores and low reliability when network conditions are bad.
- Recommendation: keep the current approach if you want simplicity, but add an `unknown` state and a connectivity warning instead of treating all failures as success.

### 3. Version metadata is inconsistent

The UI changelog says `3.2.0` while `package.json` still says `3.1.2`.

- Code: `src/partials/adblock/changelog.ejs`
- Code: `package.json`
- Impact: confusing release state and inaccurate version-based changelog behavior.
- Recommendation: make the changelog header derive from package metadata or update both together.

## UX and Product Improvements

- Replace the current orange warning with a clearer “known limitations” panel that separates false positives, unsupported setups, and suggested workarounds.
- Add a visible “test reliability” note near the score, not only inside dialogs.
- Show progress per phase: cosmetic, script, host checks. Right now the page feels busy but not very informative while the test is running.
- Add a manual “copy report summary” action, not only raw JSON download.
- Tighten the FAQ copy. The content is useful, but grammar and phrasing currently make the product feel less polished.

## SEO and Discoverability

- Serve preview images from your own domain instead of `raw.githubusercontent.com`.
  - Code: `src/partials/head.ejs`
  - Code: `src/index.ejs`
  - Code: `src/404.ejs`
- Avoid emitting `WebApplication` structured data on the `404` page.
  - Code: `src/partials/head.ejs`
  - Code: `src/404.ejs`
- Add a real visible hero heading and short intro copy above the test. The current `h1` is screen-reader-only, which is acceptable for accessibility but weak for on-page clarity and search snippet relevance.
  - Code: `src/index.ejs`
- Consider trimming the `keywords` meta usage. It is ignored by modern search engines and mostly adds noise.

## Stability and Maintenance

- Add guarded localStorage access with `try/catch`. Safari private mode, storage quota issues, or policy blocks can break assumptions.
  - Code: `src/js/components/localStorage.js`
  - Code: `src/js/components/themeManager.js`
- Replace deprecated Sass `@import` with `@use`/`@forward`. The build currently succeeds with warnings, but this will age poorly.
- Add one small smoke test suite for:
  - test boot
  - dialogs opening
  - settings persistence
  - result rendering
  - offline/timeout fallback behavior
- Consider a hard cap or batching for host fetch concurrency. Running all requests at once is fine on desktop, but a queue would be more predictable on slow mobile devices.

## Practical Next Steps

1. Remove or gate analytics on the test page.
2. Add an `unknown` result state for failed host checks and a visible network-health warning.
3. Fix version consistency between package metadata and changelog UI.
4. Move preview images to your own domain.
5. Migrate Sass imports before the next toolchain refresh.
