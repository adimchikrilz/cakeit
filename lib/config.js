export const EVENT = {
  title: "Cake it yourself",
  tagline: "Pick your seat, then decorate your own cake your way.",
  date: "12th December 2026",
  venue: "Venue to be confirmed",
  // Put your sister's real cake photo in /public (e.g. public/cake.jpg) and set photo: "/cake.jpg"
  photo: "/cake.jpg",
  holdMinutes: 5,
  // a tier stays locked until the tier it names is sold out
  unlockAfter: { "20k": "15k" },
  tiers: {
    "15k": { label: "Standard seat", note: "" },
    "20k": { label: "Premium seat", note: "" },
  },
};
