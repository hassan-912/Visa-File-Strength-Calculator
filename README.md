This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Visa portals

- `/` — Tourism visa file assessment.
- `/immigration` — Canada and Australia immigration calculators.
- `/job-seeker` — Germany Opportunity Card, Austria Job Seeker Visa, Sweden work/business search, and Germany vocational training search.

The job seeker portal uses the shared MG theme. Its assessments run locally in the browser and do not submit applications. Official source links are included beside each pathway; requirements were checked on 28 October 2026. Germany uses €1,091/month (2026), and Sweden uses SEK 13,000/month plus return travel. Austria's €7,850.34 is a client-provided planning estimate that requires consular confirmation.

Each portal has a standalone URL with no shared portal navigation. Job Seeker is English only. Its proof-of-funds card also shows an EGP equivalent using daily indicative ExchangeRate-API rates. `/api/exchange-rates` validates the provider data, caches the upstream fetch for one hour and rejects rates older than 48 hours. The open page checks every 15 minutes and when refocused; changing the program or stay length recalculates the EGP amount immediately. No fixed conversion rate or API key is used. If the provider is unavailable, the original currency amount remains and EGP is shown as unavailable.

Run `npm run test:job-seeker` for scoring, age boundary, document and funding checks. Run `npm run build` for the production build. Publishing the existing app makes the new portal available at `<your-app-domain>/job-seeker`.

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
