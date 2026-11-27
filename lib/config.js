export const EVENT = {
  title: "Cake it yourself",
  tagline: "Pick your seat, then decorate your own cake your way.",
  date: "14th December 2026",
  venue: "Venue shown on your ticket",
  // Put your sister's real cake photo in /public (e.g. public/cake.jpg) and set photo: "/cake.jpg"
  photo: "/cake.jpg",
  holdMinutes: 10,
  // a tier stays locked until the tier it names is sold out
 tiers: {
    "20k": { label: "Event ticket", note: "" },
  },
};
