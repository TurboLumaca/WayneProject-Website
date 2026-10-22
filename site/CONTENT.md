# Adding and changing content

Everything he writes lives in files, not in code.

| What | Where | How to change it |
| --- | --- | --- |
| Case Files (journal, Monk Modes, video scripts) | `src/content/cases/*.md` | one file per entry; the body is the excerpt |
| Projects and their pages | `src/content/projects/*.md` | one file per project; a `slug` gives it its own page; no `progress` means no bar |
| Subscribers, share of $1.25M, pull-up numbers | `src/data/live.json` | by hand |
| Miles, runs, monthly chart | `src/data/running.json` | refreshed from the running sheet, do not edit |
| Years, phases, influences, channels | `src/data/wayne.ts` | still in code (changes rarely) |

The shape of each file is checked at build time (`src/content.config.ts`): a wrong date type or a missing field stops the build with a message instead of publishing a broken page.

## Editing from /admin

`/admin` is a form-based editor (Decap CMS). It saves by committing to GitHub, so it needs a login step:

1. Create a GitHub OAuth App (Settings > Developer settings) for the site's domain.
2. Run an OAuth proxy for Decap (for example the free `decap-cms-oauth-provider` on a small serverless host) and put its address in `public/admin/config.yml` as `base_url`.
3. He logs in at `/admin` with his GitHub account and needs write access to the repository.

Until then, use it locally: `npx decap-server` in one terminal, `npm run dev` in another, open `http://localhost:4321/admin`.

## The running sheet

Publish the running tab as CSV (File > Share > Publish to web). Columns: `date` (YYYY-MM-DD) and `miles`; optional `pace` and `five_mile` as `m:ss`. Then:

- once: `RUNNING_SHEET_CSV_URL="https://…" npm run fetch:sheets`
- every day: add the same URL as the GitHub secret `RUNNING_SHEET_CSV_URL`; `.github/workflows/refresh-numbers.yml` commits the new numbers, and the host rebuilds on that commit.

If the URL is missing or the sheet looks wrong, the script keeps the old numbers and the build still succeeds.

Pull-up numbers have no sheet yet: change them in `live.json` or in `/admin` under Numbers.
