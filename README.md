# Riad Mamiche · Évaluation de satisfaction

Version 1: French mobile questionnaire, anonymous submission, reusable sessions, protected trainer dashboard, and downloadable QR codes. Static Vite build works at a GitHub Pages repository subpath. Supabase provides PostgreSQL storage and password authentication. No application server is needed.

## Quick local preview

Use Node.js 22.12 or newer (Node 22 LTS recommended).

```sh
npm ci
npm test
npm run dev
```

Open `http://127.0.0.1:5173/?demo=1` for the questionnaire and `http://127.0.0.1:5173/trainer.html?demo=1` for the dashboard. Demo is explicitly labeled, has eight fictional dashboard responses, never contacts the database, and never saves submissions. Without credentials, normal mode blocks collection rather than pretending to save.

## 1. Configure Supabase

1. Create your Supabase project. Run **supabase/schema.sql** once in SQL Editor. It creates the initial session `RM-PDP-5J-CTMC-2026`, tables, indexes, access policies, and validated submission function. A second run intentionally fails rather than overwriting existing data.
2. In Authentication → Users, create the trainer account with email and a strong password. Confirm the email through the administrative interface. Disable public signups in Authentication settings; the app has no signup flow.
3. Copy that user's UUID, then authorize them **only in SQL Editor**:

```sql
insert into public.trainers(user_id) values ('REPLACE_WITH_AUTH_USER_UUID');
```

4. Set the actual course dates before sharing the form:

```sql
update public.sessions set dates='Du … au …' where code='RM-PDP-5J-CTMC-2026';
```

5. Copy `.env.example` to `.env.local`. Put the project URL and **publishable** (`sb_publishable_…`) key there. A legacy public `anon` key also works. Never use a secret (`sb_secret_…`), service-role key, database password, or trainer password in frontend config or GitHub. The two VITE values are public and appear in the built JavaScript; authorization comes from database policies and the authenticated user's token.
6. Restart the local server. Sign in at `/trainer.html` and send a test response from the normal form. The dashboard should update within 10 seconds. Run `supabase/security-tests.sql` in SQL Editor before real collection; it rolls back its fixtures. Verify policies independently in your project.

Official references: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [row level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 2. Put the project on GitHub and publish

Upload **the contents of this project folder** at the repository root, including `.github/workflows/pages.yml`, `package-lock.json`, and the source files. Exclude `node_modules`, `.env.local`, and `dist`. Create a `main` branch.

1. Repository → Settings → Secrets and variables → Actions → **Variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the public values above. No secret key is required.
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main` or run “Deploy evaluation app” from Actions. It runs tests, builds, and publishes `dist`. View the deployment link in Actions or Settings → Pages.
4. Form: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/index.html?session=RM-PDP-5J-CTMC-2026`.
5. Dashboard: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/trainer.html`. Sign in, select the session, and download its QR image. Generate the QR on the deployed domain, so it points to the public form rather than localhost. Scan it with a phone and verify one submission before the training.

Both HTML pages are publicly downloadable; the private response data is protected by Supabase, not by hiding the dashboard URL. Deployment guide: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Reuse and close sessions

The dashboard creates new session codes and lets you open or close collection. New sessions reuse the PDF's exact PDP questionnaire, including its five-day wording. Change dates/location in SQL Editor as above (or via authorized database access). The questionnaire version is fixed so ratings keep their meaning. Supporting a different questionnaire requires a new immutable version, frontend questions, database validation, and tests; changing only a session title does not change the questionnaire.

Closed sessions reject new submissions and disappear from public session reads. Trainers can still read their historical results. The retained UUID makes retrying the same committed submission idempotent even if the first reply was lost. It is not a one-person-one-response guarantee: anonymous participants can open a fresh page and submit again. No name, email, IP address, or device identifier is added to the response record. Supabase/hosting providers may have infrastructure logs. Function and comments may voluntarily identify a participant, matching the original anonymity statement. Avoid collecting sensitive information in free text.

## Dashboard calculations

- Overall /4 = average of **Note globale de la formation** (`s5q1`), not an average of unrelated criteria.
- Sections 1–5 = equally weighted average of their individual ratings across responses. Section 6 has comments, no numerical average.
- Question table = average and counts for ratings 1, 2, 3, 4.
- Recommendation % = Oui / all submitted evaluations × 100.
- Before/after = counts in Débutant, Intermédiaire, Avancé; these are ordinal categories and are not presented as a numeric proficiency score.
- Zero responses show a dash for averages and percentages. Dashboard paginates all responses in blocks of 1,000 and polls every 10 seconds while the tab is visible. Manual refresh is available; failed refresh keeps the previous display and shows an error.

## Security and operating limits

Only UUIDs added to `trainers` can read responses or create/update sessions. Ordinary authenticated accounts are not trainers. Anonymous users cannot select response records or directly insert/update/delete them. All submissions go through the narrowly scoped database function: it validates all 17 integer ratings, required categorical fields, lengths, version, and an open session. Rendered comments are escaped against HTML injection. Trainer sessions are stored by Supabase Auth in browser storage; use your own trusted device and sign out after use. Reset a forgotten trainer password through Supabase's administrative interface (the app does not implement a password reset flow).

The public submission function can be called by anyone with the session URL and public project key; there is no CAPTCHA, identity verification, or server-side per-IP rate limit in this V1. Close collection after each course, monitor response counts and Supabase usage, and add an Edge Function with rate limiting/CAPTCHA before exposing collection to a large untrusted audience. Do not assume browser form validation prevents API abuse.

Back up the database and choose a response retention period. To remove a session, first delete its responses in SQL Editor; the app deliberately provides no destructive delete button. Remove a trainer's row from `trainers` to revoke data access immediately. Keep dependencies updated; run `npm audit` before deployment.

## Source fidelity

The questionnaire was transcribed from both pages of `Evaluation_Satisfaction_RM-PDP-5J-CTMC-2026.pdf`. All six section titles, 17 criteria, 1–4 scale, recommendation, before/after labels, optional Fonction, anonymity paragraph, and three comments preserve the PDF's wording. Mobile instructions and completion messaging are additional interface text. The PDF's blank dates are represented as a configurable session field. Branding uses Riad Mamiche's name and green/white/red palette with an RM monogram; the CTMC logo is not recreated as a Riad Mamiche logo.

See **TESTING.md** for completed checks and checks requiring a configured Supabase project.
