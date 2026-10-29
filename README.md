This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Visa portals

- `/` — Tourism visa file assessment.
- `/immigration` — Canada and Australia immigration calculators.
- `/job-seeker` — Germany Opportunity Card, Austria Job Seeker Visa, Sweden work/business search, and Germany vocational training search.

The job seeker portal uses the shared MG theme. Its assessments run locally in the browser and do not submit applications. The Opportunity Card pathway has two live Anabin autocomplete fields: university and degree/specialisation. Suggestions refresh after a short typing pause, and choosing a university narrows degree results by its country. Results distinguish degrees explicitly linked to that university from country-level records; only an H+ institution and a comparable, explicitly linked degree establish recognition for this screening. Editing a selection clears its recognition result. An unavailable search or missing result does not mean a qualification is unrecognised. Source links remain beside selected records; the former sidebar checklist and resource cards are removed. Germany uses €1,091/month (2026), and Sweden uses SEK 13,000/month plus return travel. Austria's €7,850.34 is a client-provided planning estimate requiring consular confirmation.

The portal implements the user's simplified MG screening requested on 29 October 2026. Germany always displays age, experience and one selected language's points, including on the recognised-qualification route; its requested age policy gives two points through age 35. Removed bonus categories do not contribute. Full institution-and-degree recognition still has no official points threshold. Austria excludes salary and Austrian-study scoring and accepts one selected language. Training uses the requested MG B2 minimum (the official training-search source says B1); the school choices are Diploma, Secondary school, and None, with certificate equivalence subject to review. Sweden records experience in the field of study without inventing a minimum. This screening does not replace the complete official eligibility assessment.

Stay/document questionnaires have been removed. Germany's funding period is fixed at 12 months; Austria's at six; training and Sweden offer only six or nine months. The bank statement input accepts EGP, EUR or SEK and reports sufficient funds or an exact shortfall. One automatically refreshed FX snapshot drives both the EGP display and balance comparison. Cross-currency checks cannot pass when the rate is unavailable or older than 48 hours. Native-currency balances work without conversion, and required amounts are rounded up to a whole cent before comparison. Balances remain in memory for the open page only.

Each portal has a standalone URL with no shared portal navigation. Job Seeker is English only. Its proof-of-funds card also shows an EGP equivalent using daily indicative ExchangeRate-API rates. `/api/exchange-rates` validates the provider data, caches the upstream fetch for one hour and rejects rates older than 48 hours. The open page checks every 15 minutes and when refocused; changing the program or stay length recalculates the EGP amount immediately. No fixed conversion rate or API key is used. If the provider is unavailable, the original currency amount remains and EGP is shown as unavailable.

The funding card stays visible while scrolling in the desktop sidebar. Results show selected answers and points, with outstanding requirements framed for attention. Generate PDF report asks for a client name, then opens the browser print dialog with the MG letterhead, recognition and funding details, and a logo watermark on each page. The former processing banner, sidebar resource cards, per-value explanatory notes and report footer are removed.

Run `npm run test:job-seeker` for scoring, age boundaries, funding durations, bank balances, Anabin search and report checks. Run `npm run build` for the production build. Publishing the existing app makes the new portal available at `<your-app-domain>/job-seeker`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
