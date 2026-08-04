# SEO-CHECKLIST.md

The goal (§9) is **entity SEO**: make Google understand that `4dan.dev`, the LinkedIn profile, the GitHub profile, and the Devpost profile are all *one person*, so the site becomes a candidate for the knowledge panel rather than a competitor to LinkedIn.

---

## Part 1 — On-site. Done.

| # | Item | Status | Where |
|---|---|---|---|
| 1 | Per-route `title` + `description` | ✅ | every `page.tsx` |
| 2 | Homepage title leads with the name | ✅ | `Adan Rojas — Software Engineer \| 4dan.dev` |
| 3 | Canonical URL per route | ✅ | `alternates.canonical` |
| 4 | `metadataBase` set | ✅ | `app/layout.tsx` |
| 5 | `Person` structured data with `sameAs` | ✅ | `app/layout.tsx` |
| 6 | `SoftwareApplication` per project | ✅ | `app/projects/[slug]/page.tsx` |
| 7 | `BreadcrumbList` on detail routes | ✅ | projects + experience |
| 8 | Sitemap covers every route | ✅ | 13 URLs, was 1 |
| 9 | `robots.txt` generated, not static | ✅ | `app/robots.ts` |
| 10 | `/llms.txt` | ✅ | `app/llms.txt/route.ts` |
| 11 | OG + Twitter cards per route | ✅ | `app/layout.tsx`, per-route overrides |
| 12 | OG image via `next/og` | ✅ | 32.9 KiB, was a 27 MB PNG |
| 13 | Favicon | ✅ | `app/icon.png` — was a 404 on every page load |
| 14 | Semantic HTML + one `<h1>` per page | ✅ | verified by axe |
| 15 | Crawlable per-project and per-role routes | ✅ | 8 detail pages |
| 16 | Content readable without JS | ✅ | full corpus server-rendered on `/` |
| 17 | `rel="me"` on identity links | ✅ | footer + `/about` |
| 18 | Zero console errors | ✅ | Best Practices 100 |

### `sameAs` — the mechanism that matters

```json
"sameAs": [
  "https://github.com/adanjoserrojas",
  "https://www.linkedin.com/in/adan-rojas/",
  "https://devpost.com/adanjoserrojas"
]
```

This is the specific signal that links the profiles into one entity. It only works if the links **reciprocate** — see Part 2.

### Deliberately absent

- **`worksFor`.** The Publix internship ended July 2026 and the AWS role is a program affiliation, not employment. `worksFor: Amazon` would read as a claim Adan is not making. §9.1 calls this out directly.
- **`award` on anything but iPalo.** iPalo won 1st of 22 teams for Best Use of ElevenLabs at Knight Hacks VIII — a real, verifiable award on the right entity. No other project claims one, because no other project won one.
- **Ratings, review counts, `FAQPage`.** No fabricated rich-result bait.

### Search Console — do these after deploy

- [ ] Verify the property (DNS TXT or the `google-site-verification` meta tag).
- [ ] Submit `https://www.4dan.dev/sitemap.xml`.
- [ ] Request indexing for `/`, `/about`, `/experience/publix`, `/experience/aws`.
- [ ] After ~2 weeks, check the Pages report for anything unexpectedly excluded.
- [ ] Confirm **one** host is canonical. The site declares `https://www.4dan.dev`; the apex must 301 to it (or vice versa) at the DNS/Vercel level — Next cannot do host redirects in `next.config.ts`. **Serving both is the single most common way a personal site splits its own authority.**

---

## Part 2 — Off-site. Adan's to do. ⚠️

**This is the half that actually moves the ranking, and none of it can be done from the codebase.** §9.2 is blunt: "The technical work above is necessary but not sufficient."

Google links entities when the links point back. One-directional `sameAs` is a claim; reciprocated links are evidence.

### Reciprocal links — highest impact

- [ ] **LinkedIn** → add `4dan.dev` to the *Website* field **and** to the About section. The profile is the strongest existing signal; it must point here.
- [ ] **GitHub** → set `4dan.dev` as the profile website, and link it from the profile README.
- [ ] **Devpost** → add `4dan.dev` to the profile.
- [ ] Confirm all three URLs exactly match the `sameAs` entries above — trailing slashes and `www` included. A mismatch weakens the link.

### Third-party mentions

- [ ] **Knight Hacks** — ask to be listed on the organizer/team page with a link. A `.org`-adjacent university-org domain is a strong signal, and Adan is a current organizer.
- [ ] **AWS Builder Center** — link `4dan.dev` from the Student Builder Campus Leader profile if the program allows it.
- [ ] **Devpost project pages** — iPalo, Face2Learn, ReCueCareer: link each to its `/projects/[slug]` page.
- [ ] **UCF** — any department, club, or course page that lists Adan.

### Consistency

- [ ] Use **"Adan Rojas"** identically everywhere. Not "Adan J. Rojas", not "Adan Jose Rojas". Name variants split the entity.
- [ ] Keep the role line consistent with the site: *Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development*.
- [ ] Keep dates consistent between LinkedIn and the site. **They currently disagree** — see `OPEN-QUESTIONS.md` §Q10 #1 and #2 for the Knight Hacks titles and the ReCueCareer date.

### Realistic expectations

Ranking above LinkedIn for `"Adan Rojas"` takes **months**, not days, and depends far more on the reciprocal links above than on anything in this repo. The technical work removes every obstacle; it does not by itself create authority.

---

## Part 3 — Verify after deploy

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/projects/ipalo`, `/experience/publix`.
- [ ] [Schema validator](https://validator.schema.org/) on the `Person` JSON-LD.
- [ ] OG preview: paste the URL into LinkedIn, Slack, and iMessage. **The old 27 MB image meant most crawlers timed out and showed no preview at all** — this is the fix worth confirming visually.
- [ ] `curl https://www.4dan.dev/llms.txt` — confirm it renders and contains no withheld figures.
- [ ] `curl -I https://4dan.dev` — confirm the apex 301s to `www`.
- [ ] Lighthouse SEO = 100 on the deployed URL, not just locally.
- [ ] Confirm no `/lab/*` route is reachable — they are deleted, but check.
