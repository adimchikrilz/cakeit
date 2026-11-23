# Cake It Yourself tickets
1. `npm i`, copy `.env.example` to `.env.local` and fill it in, then `npm run dev`.
2. Edit event name, date, venue and tier notes in `lib/config.js`.
3. Deploy to Vercel (add the same env vars). Tiers are created in MongoDB automatically on first request.
4. Host: open /admin on the phone you will scan with, log in once. Then scan each guest's QR with the normal camera app. Her phone must open the link in the same browser she logged in with.
