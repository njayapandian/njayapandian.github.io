# Dr. Jayapandian N - Academic Profile Website

A single-page profile website. All publication and achievement lists load live
from a Google Sheet, so you update the sheet and the website updates by itself.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole website (design, photo and code). This is the file GitHub Pages serves. |
| `apps-script/Code.gs` | Backup copy of the Google Apps Script that feeds the sheet data. Not uploaded anywhere; it lives inside your Google Sheet. |
| `README.md` | These instructions. |

## Publish on GitHub Pages (free)

1. Sign in at https://github.com (create a free account if needed).
2. Click **+ > New repository**.
   - Repository name: `jayapandian.github.io` style (`<your-username>.github.io`) for a short address
     `https://<your-username>.github.io`, or any name (e.g. `profile`) for
     `https://<your-username>.github.io/profile/`.
   - Choose **Public**, tick **Add a README file**, click **Create repository**.
3. In the repository click **Add file > Upload files**. Drag in `index.html`
   (and the `apps-script` folder if you want the backup). Click **Commit changes**.
4. Go to **Settings > Pages**. Under **Build and deployment**, set **Source** to
   *Deploy from a branch*, **Branch** to `main` and folder `/ (root)`, then **Save**.
5. Wait 1 to 2 minutes and refresh. GitHub shows your live address at the top of the Pages screen.

## Updating the website

- **Publications, awards, projects and so on:** just edit your Google Sheet. Refresh the website to see changes.
  Each row is one entry in column A. A web link in column B (or at the end of the text) makes the box clickable.
- **Text, photo, links on the home page:** open `index.html` on GitHub, click the pencil icon, edit the `CONFIG`
  block near the top (`PROFILE` section), then **Commit changes**. The site updates in about a minute.
- **A new tab in the sheet:** add a matching line in the `TABS` list in `index.html`.

## Research Impact page

The "Research Impact" menu item reads the Google Sheet tab named **Research Impact** (16th tab) and shows
a Google Scholar box, a Scopus box and a publications-per-year chart (from 2015).

Suggested layout of that tab (other simple layouts also work):

| Source | Citations | h-index | i10-index | Documents |
|--------|-----------|---------|-----------|-----------|
| Google Scholar | ... | ... | ... | ... |
| Scopus | ... | ... | | ... |

| Year | Publications |
|------|--------------|
| 2015 | ... |
| 2016 | ... |

Optional: a cell such as `Updated: Nov 2026` shows an update date on the boxes.
For Scholar's "Since 2021" columns, add headings like `Citations (Since 2021)`.

Troubleshooting: open the website address with `?debug` before the `#`, for example
`https://<you>.github.io/?debug#impact`. A "Data check" box shows what the page read from the tab.

## Generate CV button

At the bottom of the **Experience** page, the **Generate CV** button builds a Word (.docx) CV in the visitor's browser
from all tabs of your Google Sheet (About, Research Impact, Qualification, Experience, Publication,
Intellectual property, Achievements) and downloads it. Name, email and phone come from the `CV` block near the top of `index.html`.

## Recent achievements carousel (home page)

The end of the home page shows a 3D photo carousel (previous photo on the left, current in the centre, next on the right) read from the sheet tab **Recent Achievement** (17th tab).
Each row: a **photo link** plus two text cells (line 1 = title, line 2 = short description). Row order = slide order.
Photo links can be a Google Drive share link (file shared as "Anyone with the link can view") or any direct image address.
Heading row is optional. Add a row and refresh the website to add a slide.

## Search engine (SEO) set-up

Upload **all** files to the repository root: `index.html`, `favicon.png`, `robots.txt`, `sitemap.xml`.
1. Replace `YOUR-USERNAME.github.io` in `robots.txt` and `sitemap.xml` with your real site address.
2. Optional: add `<link rel="canonical" href="https://YOUR-SITE/">` inside `<head>` of `index.html`.
3. Add the site in Google Search Console (search.google.com/search-console), submit `sitemap.xml`, and request indexing of the home page.
4. www / non-www redirects: GitHub Pages does this automatically when you use a custom domain
   (Settings > Pages > Custom domain, then the DNS records GitHub shows). With a `github.io` address nothing is needed.
5. The home page text inside `<main id="main">` and the menu links inside `id="navList"` are also stored as plain HTML
   so that search engines can read them without running scripts. If you change the About text or the key achievements
   in the `PROFILE` block, ask for the file to be refreshed, or update the same words in that plain HTML.

## Important notes

- The Apps Script web app shares **every tab** of the Google Sheet publicly (anyone with the link can read it).
  Do not keep private information in that sheet.
- If you ever change the Apps Script code, redeploy with **Deploy > Manage deployments > Edit > New version**
  so the web app address stays the same.
- If a tab shows an error, check its name in the sheet matches the `sheet:` name in `TABS`.
