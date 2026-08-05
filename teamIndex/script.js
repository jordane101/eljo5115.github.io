/* Team Index frontend.
   Data comes through fetchTeamIndex(league, code) — currently a seeded mock
   generator so the UI can be built ahead of the backend. Swap the body of
   fetchTeamIndex for a real fetch() once the backend ships (see
   docs/superpowers/specs/2026-08-05-team-index-frontend-design.md for the
   JSON contract). */

document.addEventListener('DOMContentLoaded', () => {

    // --- Seeded PRNG (stable mock data per team across reloads) ---

    function hashString(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        let a = seed;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // --- Mock season definitions ---

    const SEASONS = {
        nba: { start: '2025-10-21', end: '2026-04-12', games: 82 },
        nfl: { start: '2025-09-07', end: '2026-01-04', games: 17 },
        mlb: { start: '2026-03-26', end: '2026-09-27', games: 162 }
    };

    const COMPONENT_MARKETS = {
        nba: ['Championship Winner', 'Conference Winner', 'Division Winner', 'Makes Playoffs', 'Win Total Over'],
        nfl: ['Super Bowl Winner', 'Conference Winner', 'Division Winner', 'Makes Playoffs', 'Win Total Over'],
        mlb: ['World Series Winner', 'Pennant Winner', 'Division Winner', 'Makes Playoffs', 'Win Total Over']
    };
    const COMPONENT_WEIGHTS = [0.35, 0.25, 0.15, 0.15, 0.10];

    function isoDate(d) {
        return d.toISOString().slice(0, 10);
    }

    function addDays(d, n) {
        const c = new Date(d);
        c.setUTCDate(c.getUTCDate() + n);
        return c;
    }

    /* Generate a deterministic mock season for one team. */
    function generateMock(league, code) {
        const rng = mulberry32(hashString(league + ':' + code));
        const season = SEASONS[league];
        const start = new Date(season.start + 'T00:00:00Z');
        const end = new Date(season.end + 'T00:00:00Z');
        const today = new Date(isoDate(new Date()) + 'T00:00:00Z');
        const lastDay = today < end ? today : end;

        const totalDays = Math.round((end - start) / 86400000) + 1;

        // Pick game days spread across the season.
        const gameDays = [];
        if (league === 'nfl') {
            const bye = 4 + Math.floor(rng() * 10); // bye in weeks 5–14
            for (let w = 0; w < 18; w++) {
                if (w === bye) continue;
                gameDays.push(addDays(start, w * 7));
            }
        } else {
            const target = season.games;
            let placed = 0;
            for (let i = 0; i < totalDays && placed < target; i++) {
                const remainingDays = totalDays - i;
                const remainingGames = target - placed;
                if (rng() < remainingGames / remainingDays) {
                    gameDays.push(addDays(start, i));
                    placed++;
                }
            }
        }

        // Team quality drives results; momentum makes streaks (and drawdowns).
        const strength = 0.35 + rng() * 0.3;
        const opponents = tiAllTeams(league).filter(t => t.code !== code);

        const games = [];
        let wins = 0, losses = 0, streak = 0;
        for (const day of gameDays) {
            if (day > lastDay) break;
            const winProb = Math.min(0.85, Math.max(0.15, strength + streak * 0.02));
            const won = rng() < winProb;
            streak = won ? Math.max(1, streak + 1) : Math.min(-1, streak - 1);
            if (won) wins++; else losses++;

            const opp = opponents[Math.floor(rng() * opponents.length)];
            const ranges = { nba: [92, 132], nfl: [9, 38], mlb: [1, 10] };
            const [lo, hi] = ranges[league];
            let a = lo + Math.floor(rng() * (hi - lo));
            let b = lo + Math.floor(rng() * (hi - lo));
            if (a === b) a++;
            const winScore = Math.max(a, b), loseScore = Math.min(a, b);

            games.push({
                date: isoDate(day),
                opponent: opp.code,
                home: rng() < 0.5,
                result: won ? 'W' : 'L',
                score: won ? `${winScore}-${loseScore}` : `${loseScore}-${winScore}`,
                recordAfter: `${wins}-${losses}`
            });
        }

        // Index series: random walk correlated with game results.
        const gameByDate = new Map(games.map(g => [g.date, g]));
        const series = [];
        let value = 100;
        for (let d = new Date(start); d <= lastDay; d = addDays(d, 1)) {
            const key = isoDate(d);
            const game = gameByDate.get(key);
            let pct = (rng() - 0.5) * 0.6; // quiet-day drift
            if (game) {
                const move = 0.8 + rng() * 2.2;
                pct += game.result === 'W' ? move : -move;
            }
            value = Math.max(5, value * (1 + pct / 100));
            series.push({ date: key, value: Math.round(value * 100) / 100 });
        }

        // Components: weights × prices that reconcile to the current level.
        const markets = COMPONENT_MARKETS[league];
        const level = series.length ? series[series.length - 1].value : 100;
        const quality = Math.min(0.95, Math.max(0.02, (level - 60) / 120 + strength * 0.3));
        const comps = markets.map((market, i) => {
            const spread = [0.25, 0.45, 0.7, 0.95, 0.85][i]; // longshot → likely
            const price = Math.min(0.98, Math.max(0.01, quality * spread + (rng() - 0.5) * 0.06));
            return { market, weight: COMPONENT_WEIGHTS[i], price };
        });
        const rawSum = comps.reduce((s, c) => s + c.weight * c.price, 0);
        const components = comps.map(c => ({
            market: c.market,
            weight: c.weight,
            price: Math.round(c.price * 100) / 100,
            contribution: Math.round((c.weight * c.price / rawSum) * level * 10) / 10
        }));

        return {
            team: code,
            league,
            asOf: isoDate(lastDay),
            series,
            games,
            components
        };
    }

    /* Data layer seam — replace this body with a real fetch() when the
       backend ships. The mock delay keeps the loading state honest. */
    function fetchTeamIndex(league, code) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(generateMock(league, code));
                } catch (e) {
                    reject(e);
                }
            }, 250);
        });
    }

    // --- DOM references ---

    const selectorView = document.getElementById('selector-view');
    const teamView = document.getElementById('team-view');
    const leagueTabs = document.getElementById('league-tabs');
    const searchInput = document.getElementById('team-search');
    const teamGrid = document.getElementById('team-grid');

    let activeLeague = 'nba';
    let chart = null;
    let areaSeries = null;
    let resizeObserver = null;

    // --- Selector view ---

    function renderTabs() {
        leagueTabs.innerHTML = '';
        for (const [key, l] of Object.entries(TI_LEAGUES)) {
            const btn = document.createElement('button');
            btn.className = 'ti-tab' + (key === activeLeague ? ' active' : '');
            btn.textContent = l.label;
            btn.setAttribute('aria-pressed', key === activeLeague ? 'true' : 'false');
            btn.addEventListener('click', () => {
                activeLeague = key;
                renderTabs();
                renderGrid();
            });
            leagueTabs.appendChild(btn);
        }
    }

    function renderGrid() {
        const filter = searchInput.value.trim().toLowerCase();
        teamGrid.innerHTML = '';
        const divisions = TI_LEAGUES[activeLeague].divisions;
        for (const [division, teams] of Object.entries(divisions)) {
            const matches = teams.filter(t =>
                !filter ||
                t.name.toLowerCase().includes(filter) ||
                t.code.toLowerCase().includes(filter)
            );
            if (!matches.length) continue;

            const section = document.createElement('div');
            section.className = 'ti-division';
            const h = document.createElement('h3');
            h.textContent = division;
            section.appendChild(h);

            const list = document.createElement('div');
            list.className = 'ti-chip-list';
            for (const t of matches) {
                const a = document.createElement('a');
                a.className = 'ti-chip';
                a.href = `?league=${activeLeague}&team=${t.code}`;
                a.innerHTML = `<span class="ti-chip-name"></span><span class="ti-chip-code"></span>`;
                a.querySelector('.ti-chip-name').textContent = t.name;
                a.querySelector('.ti-chip-code').textContent = t.code;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigate(activeLeague, t.code);
                });
                list.appendChild(a);
            }
            section.appendChild(list);
            teamGrid.appendChild(section);
        }
        if (!teamGrid.children.length) {
            teamGrid.innerHTML = '<p class="ti-empty">No teams match that search.</p>';
        }
    }

    searchInput.addEventListener('input', renderGrid);

    // --- Routing ---

    function navigate(league, code) {
        const url = code ? `?league=${league}&team=${code}` : location.pathname;
        history.pushState({}, '', url);
        route();
    }

    function route() {
        const params = new URLSearchParams(location.search);
        const league = (params.get('league') || '').toLowerCase();
        const code = (params.get('team') || '').toUpperCase();
        const team = tiFindTeam(league, code);

        if (team) {
            activeLeague = league;
            showTeam(league, team);
        } else {
            showSelector();
        }
    }

    window.addEventListener('popstate', route);

    function showSelector() {
        destroyChart();
        teamView.hidden = true;
        selectorView.hidden = false;
        renderTabs();
        renderGrid();
    }

    // --- Team view ---

    const fmt = (n, digits = 1) => n.toLocaleString('en-US', {
        minimumFractionDigits: digits, maximumFractionDigits: digits
    });

    function setChange(el, pct) {
        el.textContent = `${pct >= 0 ? '+' : ''}${fmt(pct)}%`;
        el.classList.toggle('up', pct >= 0);
        el.classList.toggle('down', pct < 0);
    }

    async function showTeam(league, team) {
        selectorView.hidden = true;
        teamView.hidden = false;

        document.getElementById('team-name').textContent = team.name;
        document.getElementById('team-league').textContent = TI_LEAGUES[league].label;
        document.getElementById('team-record').textContent = '';
        document.getElementById('team-value').textContent = '—';
        document.getElementById('team-asof').textContent = 'Loading index…';
        document.title = `${team.name} — Team Index — Eli Jordan`;

        const chartEl = document.getElementById('ti-chart');
        chartEl.classList.remove('error');
        destroyChart();

        let data;
        try {
            data = await fetchTeamIndex(league, team.code);
        } catch (e) {
            console.error('Failed to load team index:', e);
            chartEl.classList.add('error');
            chartEl.innerHTML = '<p>Couldn’t load the index for this team. Please try again.</p>';
            document.getElementById('team-asof').textContent = '';
            return;
        }

        // Guard against a stale response after quick back/forward navigation.
        const params = new URLSearchParams(location.search);
        if ((params.get('team') || '').toUpperCase() !== team.code) return;

        renderTeamData(team, data);
    }

    function renderTeamData(team, data) {
        const { series, games, components } = data;
        const first = series[0], last = series[series.length - 1];
        const values = series.map(p => p.value);
        const high = Math.max(...values), low = Math.min(...values);
        const record = games.length ? games[games.length - 1].recordAfter : '0-0';

        // Header
        document.getElementById('team-record').textContent = record;
        document.getElementById('team-value').textContent = fmt(last.value);
        document.getElementById('team-asof').textContent = `as of ${data.asOf}`;
        setChange(document.getElementById('team-season-change'),
            (last.value / first.value - 1) * 100);

        // Tiles
        document.getElementById('tile-current').textContent = fmt(last.value);
        setChange(document.getElementById('tile-change'), (last.value / first.value - 1) * 100);
        document.getElementById('tile-high').textContent = fmt(high);
        document.getElementById('tile-low').textContent = fmt(low);

        buildChart(series, games, record);
        buildComponents(components, last.value);
    }

    // --- Chart ---

    function destroyChart() {
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
        if (chart) { chart.remove(); chart = null; areaSeries = null; }
        const el = document.getElementById('ti-chart');
        el.innerHTML = '';
    }

    function timeToKey(t) {
        if (typeof t === 'string') return t;
        const p = (n) => String(n).padStart(2, '0');
        return `${t.year}-${p(t.month)}-${p(t.day)}`;
    }

    function buildChart(series, games, finalRecord) {
        const container = document.getElementById('ti-chart');
        const legend = document.getElementById('ti-legend');

        chart = LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: 'rgba(255, 255, 255, 0.55)',
                fontSize: 12,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            rightPriceScale: { borderVisible: false },
            timeScale: { borderVisible: false },
            crosshair: {
                vertLine: { labelBackgroundColor: '#00b359' },
                horzLine: { labelBackgroundColor: '#00b359' }
            }
        });

        areaSeries = chart.addAreaSeries({
            lineColor: '#00ff87',
            topColor: 'rgba(0, 255, 135, 0.22)',
            bottomColor: 'rgba(0, 255, 135, 0)',
            lineWidth: 2,
            priceLineVisible: false,
            priceFormat: { type: 'price', precision: 1, minMove: 0.1 }
        });
        areaSeries.setData(series.map(p => ({ time: p.date, value: p.value })));

        // Win/loss markers: shape + position encode the result, not just color.
        areaSeries.setMarkers(games.map(g => ({
            time: g.date,
            position: g.result === 'W' ? 'aboveBar' : 'belowBar',
            color: g.result === 'W' ? '#00ff87' : '#ff5470',
            shape: g.result === 'W' ? 'arrowUp' : 'arrowDown',
            size: 1
        })));

        chart.timeScale().fitContent();

        // Crosshair legend: date · value · record as of that date (+ game).
        const gameByDate = new Map(games.map(g => [g.date, g]));
        const recordByDate = new Map();
        {
            let rec = '0-0';
            let gi = 0;
            for (const p of series) {
                if (gi < games.length && games[gi].date === p.date) {
                    rec = games[gi].recordAfter;
                    gi++;
                }
                recordByDate.set(p.date, rec);
            }
        }
        const lastPoint = series[series.length - 1];

        function legendHTML(dateKey, value) {
            const game = gameByDate.get(dateKey);
            const rec = recordByDate.get(dateKey) || finalRecord;
            let html = `<span class="ti-legend-date"></span>` +
                `<span class="ti-legend-value"></span>` +
                `<span class="ti-legend-record"></span>`;
            legend.innerHTML = html;
            legend.querySelector('.ti-legend-date').textContent = dateKey;
            legend.querySelector('.ti-legend-value').textContent = fmt(value);
            legend.querySelector('.ti-legend-record').textContent = rec;
            if (game) {
                const g = document.createElement('span');
                g.className = 'ti-legend-game ' + (game.result === 'W' ? 'up' : 'down');
                g.textContent = `${game.home ? 'vs' : '@'} ${game.opponent} · ${game.result} ${game.score}`;
                legend.appendChild(g);
            }
        }

        legendHTML(lastPoint.date, lastPoint.value);

        chart.subscribeCrosshairMove(param => {
            const point = param.time && param.seriesData.get(areaSeries);
            if (point) {
                legendHTML(timeToKey(param.time), point.value);
            } else {
                legendHTML(lastPoint.date, lastPoint.value);
            }
        });

        resizeObserver = new ResizeObserver(() => {
            if (chart) {
                chart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        });
        resizeObserver.observe(container);
    }

    // --- Components table ---

    function buildComponents(components, level) {
        const tbody = document.querySelector('#ti-components tbody');
        tbody.innerHTML = '';
        for (const c of components) {
            const row = tbody.insertRow();
            row.insertCell().textContent = c.market;
            row.insertCell().textContent = `${Math.round(c.weight * 100)}%`;
            row.insertCell().textContent = `${Math.round(c.price * 100)}¢`;
            row.insertCell().textContent = fmt(c.contribution);
        }
        document.getElementById('ti-components-total').textContent = fmt(level);
    }

    // --- Back link ---

    document.getElementById('back-to-selector').addEventListener('click', (e) => {
        e.preventDefault();
        document.title = 'Team Index — Eli Jordan';
        navigate(null, null);
    });

    // --- Boot ---
    route();
});
