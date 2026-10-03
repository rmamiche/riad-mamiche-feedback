# Validation and remaining setup

## Completed locally

- Extracted and visually reviewed both pages of the supplied PDF. All 27 checks for section names, criteria, comments, and the complete anonymity/instructions paragraph matched the PDF text.
- Production build succeeded both with no config and with a fictional public Supabase config. No real credentials were used.
- `npm test`: calculation tests and a PostgreSQL/PGlite execution of the schema and access-control SQL passed. The local database simulates Supabase's `auth.users`, roles, and `auth.uid()` interface; this tests PostgreSQL validation and policies, not Supabase's actual authentication service.
- Database tests cover public open-session reads, hidden closed sessions, hidden trainer membership, anonymous validated submission, same-ID retry without duplication, blocked anonymous response reads/direct insertion/self-authorization, malformed/missing ratings, missing fields, invalid categorical answers, oversized comments, closed-session rejection, ordinary-account data restrictions, trainer reads, session creation, and closing collection. All fixtures roll back.
- Browser tests passed at 390 × 844 (mobile) and 1440 × 1000 (desktop): all six sections, 76 choices across 20 required questions, incomplete-form blocking, progress count, completion, unknown session, no-config gates, dashboard metrics, no page overflow, QR canvas generation and PNG download.
- With intercepted fake Supabase HTTP responses: form failure retained answers; retry used the identical submission UUID and payload; success displayed only after the API reply; trainer login loaded responses; comments containing a script displayed as text; failed refresh retained prior metrics; session closure and logout worked; a non-trainer account was denied the dashboard. These checks are frontend integration tests, not live cloud tests.
- Reviewed mobile form and desktop dashboard screenshots for layout and clipping.
- Dependency audit: zero known vulnerabilities at the time of creation.

## Repeat checks

```sh
npm ci
npm test
npm run build
npm run preview
```

For browser tests, keep preview running in another terminal:

```sh
npx playwright install chromium --no-shell
npm run test:browser
```

Browser tests expect an unconfigured build by default. For the mocked configured tests, build with these **fictional** values, then set `TEST_CONFIGURED=1` when running the test (use your shell's environment variable syntax):

```text
VITE_SUPABASE_URL=https://feedback.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test_not_a_real_key
```

`TEST_BASE_URL` can override the default `http://127.0.0.1:4173/`. Browser tests write screenshots under ignored `test-results/`. Restore your real public project config and rebuild before deployment. Mock tests do not contact Supabase.

The Windows sandbox prevented Vite's development dependency optimizer from scanning parent folders. Production build and preview worked, and all browser checks ran against the production preview. On a normal local installation `npm run dev` remains available; `npm run build` plus `npm run preview` is the tested alternative.

## Verify after configuring your accounts

1. Execute schema and security-tests SQL in your Supabase project. Confirm public signups are disabled and the trainer UUID is explicitly allowlisted.
2. Verify a real trainer login, an anonymous phone submission, and its appearance in the dashboard. Verify a signed-in non-trainer cannot read responses through the API. Check that an anonymous API request cannot read responses.
3. Create a session, scan its deployed-domain QR with a physical phone, and confirm the response belongs to that session only. Close it and confirm new submissions fail.
4. Deploy to GitHub Pages and check both HTML pages and assets at the repository subpath. The build uses relative paths; no SPA fallback is required.
5. Check dates, retention, backup, and database usage before distributing the QR.

No Supabase project or GitHub repository was supplied, so live cloud configuration and publication were not performed.
