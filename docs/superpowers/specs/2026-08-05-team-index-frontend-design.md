# Team Index frontend — design

*2026-08-05 · approved in-session by Eli*

## What it is

A frontend scaffold for **Team Index** — a prediction-market index that tracks one team through its season — living at `/teamIndex/` on elijordan.me. Runs on labeled mock data until the backend (in progress) ships. Visual language matches the portfolio site (dark, green accent, glass panels, gradient blobs).

## Structure

Single page, URL-driven. `teamIndex/index.html` + `style.css` + `script.js` + `teams.js` + `vendor/lightweight-charts.standalone.production.js` (TradingView Lightweight Charts v4, Apache-2.0, vendored — no CDN dependency, no build step).

Two views swap in place; state lives in the query string so team pages are shareable and back-button works:

- `/teamIndex/` → selector view
- `/teamIndex/?league=nba&team=BOS` → fact-sheet view

Unknown league/team falls back to the selector.

## View 1 — Find your team

League tabs (NBA / NFL / MLB), a type-to-filter search box, and a division-grouped grid of team chips. All 92 teams hardcoded in `teams.js` (static reference data — never fetched).

## View 2 — Team fact sheet

Top to bottom:

1. **Header** — team name, league badge, current index value, day and season change.
2. **Chart** — season-long index value as a Lightweight Charts area series. Dates on the x-axis. Every game is a marker on the line: green above-bar arrow = win, red below-bar arrow = loss. A legend pinned top-left updates on crosshair move with `date · index value · record as of that date`, plus the game result when hovering a game day. Wins/losses visually connect to index moves.
3. **Metric tiles** — current value, season change %, season high, season low.
4. **Components table** — the markets composing the index: market name, weight, price, contribution.
5. Back link to the selector.

A visible "Sample data — backend in progress" banner sits on the page until real data ships. Page stays `noindex` and out of `sitemap.xml` until then.

## Data layer (backend contract)

One function is the seam: `fetchTeamIndex(league, teamCode)` → Promise of:

```json
{
  "team": "BOS",
  "league": "nba",
  "asOf": "2026-08-05",
  "series": [{ "date": "2025-10-22", "value": 100.0 }],
  "games": [{
    "date": "2025-10-22", "opponent": "NYK", "home": true,
    "result": "W", "score": "112-98", "recordAfter": "1-0"
  }],
  "components": [{
    "market": "Championship Winner", "weight": 0.4,
    "price": 0.12, "contribution": 38.2
  }]
}
```

The backend (delivery mechanism still undecided: live API vs published static JSON) should serve this shape; swapping the mock for a `fetch()` is a one-function change.

### Mock generator

Seeded PRNG per (league, team) so refreshes are stable. Generates a realistic season schedule (NBA 82 / NFL 17 / MLB 162 games over real season date windows, clipped at today), W/L results driven by a per-team strength with streak momentum, and an index random-walk *correlated with results* — wins push it up, losses down — so the demo shows the product story (losing streak ⇒ drawdown).

## Error handling

Fetch failure renders an inline error state in the chart area, not a broken page. Malformed URL params fall back to the selector.

## Out of scope (YAGNI)

Real data, playoffs handling, multiple seasons, comparisons between teams, sitemap/index status change.
