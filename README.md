# elijordan.me

Source for [elijordan.me](https://elijordan.me), Eli Jordan's portfolio site covering algorithmic trading, market making, and sports analytics projects.

It is plain static HTML, CSS, and vanilla JavaScript. There is no build step, package manager, or test suite.

## Structure

| Path | What it is |
| --- | --- |
| `index.html`, `style.css`, `script.js` | Homepage: intro stock-graph animation and the project cards |
| `projects/<slug>/` | Long-form project write-ups (shared styles in `projects/project-page.css`; start new ones from `projects/_template/`) |
| `dataStory/` | "Is the NBA Pay to Win?" NBA salary data story |
| `teamIndex/` | Team Index prediction-market index (sample data; `noindex` until its backend ships) |
| `sportsModel/` | Archived NFL betting model frontend. Retired in favour of [edgealert.app](https://edgealert.app); each page shows a notice and redirects there |
| `legacyPage/` | Old version of the site, kept for reference and not linked |
| `favicon.svg`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png` | Site icons and the Open Graph share image |
| `sitemap.xml`, `robots.txt`, `CNAME` | SEO files and the custom domain |
| `_config.yml` | GitHub Pages (Jekyll) settings, used only to keep repo docs out of the published site |

## Local preview

```bash
python3 -m http.server 5501
# then open http://localhost:5501/
```

Serve the pages over HTTP rather than opening them as `file://` URLs, because some pages fetch external data.

## Deploying

GitHub Pages serves the site from the `main` branch of the **`upstream`** remote (`eljo5115/eljo5115.github.io`). `origin` (`jordane101/eljo5115.github.io`) is a fork, so pushing only to it deploys nothing.

```bash
git fetch upstream            # upstream sometimes gets commits directly
git push origin main
git push upstream main
```

Pages rebuilds the site within a minute or two of a push to `upstream`.
