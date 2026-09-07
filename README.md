# Niccolò Parlanti

An Astro website for niccoloparlanti.com. Source, content, static support files, and the publishing workflow live together. No Hugo or remote content service is required.

## Local use

Node 22.12+ and npm 9.6.5+ are recommended.

```sh
npm ci
npm run dev
```

Open http://localhost:4321. Production checks: `npm run check`, `npm run build`, `npm test`. Preview the production output with `npm run preview`.

With the production preview running on port 4321, `node scripts/browser-check.mjs` checks all current pages and 13 archive entries at four viewport widths, images, research filters, no-JavaScript behavior, and automated WCAG A/AA rules. It uses `/usr/bin/google-chrome`; override with `CHROME_PATH` if needed. Screenshots are saved to the ignored `artifacts/` directory. These automated checks do not replace a complete manual accessibility audit.

## Writing

Add Markdown files to `src/content/research`. Required frontmatter: `title`, `description`, `category` (Advisory, Field notes, Archive), and `date`. Set `draft: false` explicitly to publish; omission defaults to draft. Optional: `featured`, `cve`, `product`. Every article links to its sources. The initial CVE articles are new editorial walkthroughs dated September 2026, not original disclosure dates.

The ignored `editorial/` directory holds private local drafts. Never put private raw reports in `public/`. Do not describe unaccepted submissions as confirmed findings or invent discovery history, awards, customers, or fix status.

### Editorial workbench

Six reviewed articles are published. `node scripts/check-editorial-examples.mjs` validates HTTP/JSON examples in the published content and any local editorial copies, and executes the cookie encoding demonstration locally.

Casebook reading order uses optional numeric `order` frontmatter, lower first, with a default of 50. Article numbers and URLs stay stable. The invitation article uses 900 to place it after the selected technical cases. Use `src/lib/casebook-order.ts` consistently when presenting the casebook.

Run `npm run dev -- --port 4322 --force` and open http://127.0.0.1:4322/drafts/ for The Bug Code: three anonymized case studies with numbered article headings, code models, state tables, and flows. This server binds to loopback. Draft Markdown lives in `editorial/field-rules/`; it is read by the local content collection, but draft routes are generated only in development. Production routes, RSS, and sitemap omit these drafts. `npm test` checks their absence from built HTML, scripts, JSON, and XML. The preview uses `noindex` as an additional signal, not as access control. Because editorial files are Git-ignored, after editing them restart the dev server with `--force` if the content watcher does not refresh.

`node scripts/draft-browser-check.mjs` checks the three case studies and the casebook index on port 4322, including rendered code blocks and flow steps. `python3 scripts/check-article-models.py` exercises the six reconstructed Python code blocks locally with fictional data and an in-memory storage stub; it makes no external requests. These models illustrate individual checks, not complete production handlers. The regular production preview and checks continue to use port 4321. Avoid running a build concurrently with development checks because Astro shares its content cache between modes.

The six reviewed Bug Code articles are published from `src/content/bug-code/`, with explicit `draft: false` and a publication `date`. Edit these public copies for subsequent releases. Private source reports and editorial provenance remain outside Git. Publication was authorized by the site owner for these versions; this is not a claim of program approval. New articles remain draft by default.

## Legacy compatibility

The entire presentation has been migrated to Astro. Thirteen substantive archive entries (eight projects, four CTF articles, one certification article) use the new layout. Old article URLs redirect to their specific migrated articles; old indexes and taxonomy pages redirect to `/archive/`; old biography aliases redirect to `/about/`. Legacy XML feed URLs return the current feed. `legacy-redirects.json` records all 89 compatibility mappings.

Twenty-eight original support/assets files remain byte-identical, checked by `legacy-manifest.json`: proof/support JavaScript and HTML, CNAME, fonts, images, and the CV. No support scripts are executed in tests. The old student CV is retained for URL compatibility but not promoted as current. Empty pages, duplicate bios, and a theme demonstration are not presented as articles.

Old presentation files and styles were moved to the ignored local `editorial/legacy-presentation-backup/` folder; the original repository snapshot is also retained in `/tmp/niccoparla-review-20260906`. `scripts/migrate-archive.py` documents the migration and requires BeautifulSoup plus that snapshot. The original importer refuses to restore the retired presentation after migration. Normal builds do not need Python or that checkout.

The main site includes the six public case studies under `/bug-code/<slug>/`, the research index, RSS, and sitemap. Reading order: template injection, SAML XXE, account identity confusion, cloud API authentication, password-cookie storage, invitation hijacking. Development mode also displays any unpublished local drafts not already represented by a public article. The `/drafts/` workbench remains local only. Production checks assert public article presence and exclude unpublished private slugs and editorial notices.

## Publishing

The repository uses `main` for editable Astro source and `master` for generated static files. GitHub Pages continues publishing from the existing branch configuration. The custom domain remains `niccoloparlanti.com`. Private editorial drafts are not committed or published.

The source workflow verifies the build and saves a downloadable artifact; it does not deploy automatically. To release, fetch the current `master`, reconcile utility files against the manifest, run `npm run check`, `npm run build`, and `npm test`, then commit exactly the contents of `dist/` (including `.nojekyll` and `CNAME`) as a normal successor of `master`. Never force-push a deployment or copy private editorial files. Verify the live site and utility-file hashes after publishing.

The old Hugo release is retained at tag `legacy-hugo-2026-09-06` and in `master` history. Rollback by making a new `master` commit with that tag's tree; no history rewrite or domain change is necessary. Pages settings access is unavailable with the current credential, so deployment does not depend on changing those settings.
