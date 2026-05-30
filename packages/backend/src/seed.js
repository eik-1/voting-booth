// Two pre-created demo identities. `referenceImageUrl` is fetched by the
// frontend on first load, run through face-api.js, and the resulting
// descriptor is cached locally — so scanning these people actually matches.
//
// The party list is FICTIONAL. The UAE does not hold partisan elections;
// the Federal National Council uses non-partisan candidates. These names
// are invented purely so the demo has something to click on.

export const seedUsers = [
  {
    id: "u_aisha",
    name: "Aisha Al Mansouri",
    age: 34,
    emirate: "Abu Dhabi",
    nationalId: "784-1991-0000001-2",
    referenceImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
  },
  {
    id: "u_omar",
    name: "Omar Al Hashimi",
    age: 41,
    emirate: "Dubai",
    nationalId: "784-1984-0000002-7",
    referenceImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
  },
];

export const seedParties = [
  {
    id: "p_unity",
    name: "Emirates Unity Front",
    slogan: "One nation, seven emirates, one future.",
    color: "#1f6feb",
  },
  {
    id: "p_green",
    name: "Green Falcon Alliance",
    slogan: "Net-zero by 2050 — starting today.",
    color: "#22c55e",
  },
  {
    id: "p_youth",
    name: "Youth Majlis Movement",
    slogan: "Education, AI, and opportunity for every Emirati.",
    color: "#a855f7",
  },
  {
    id: "p_heritage",
    name: "Heritage & Trade Party",
    slogan: "Honour the past, lead the global market.",
    color: "#f59e0b",
  },
  {
    id: "p_progress",
    name: "Progress & Innovation Bloc",
    slogan: "Smart cities, smarter government.",
    color: "#ef4444",
  },
];
