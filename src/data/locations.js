export const LOCATIONS = [
  {
    id: 1,
    slug: "rome",
    city: "Rome",
    region: "Lazio",
    badge: "Ancient Steps",
    fact:
      "Rome is a living timeline where ancient engineering, Renaissance ambition, and modern city life meet in one place. A standout example is the Colosseum, opened in 80 CE, where tens of thousands once gathered for massive public events and where Roman design still shapes stadium architecture today.",
    video: { type: "youtube", id: "WgP7b1Gz2Qk", title: "Rome in 2 minutes (quick vibe)" },
    game: { type: "quiz" },
    ethics:
      "Respect shared spaces: in historic places, small choices (trash, noise, touching) protect everyone’s experience."
  },
  {
    id: 2,
    slug: "florence",
    city: "Florence",
    region: "Tuscany",
    badge: "Art Spotter",
    fact:
      "Florence is known for art, architecture, and workshops—craft traditions that still inspire makers today.",
    video: { type: "youtube", id: "Jp7fJwqQwWc", title: "Florence highlights (short)" },
    game: { type: "wordScramble", word: "FLORENCE" },
    ethics:
      "Give credit to creators: celebrate artists and makers by acknowledging their work and effort."
  },
  {
    id: 3,
    slug: "venice",
    city: "Venice",
    region: "Veneto",
    badge: "Canal Navigator",
    fact:
      "Venice is built on water, with canals instead of roads in many areas—navigation is a daily art.",
    video: { type: "youtube", id: "xjV2n7k2p4U", title: "Venice in under 3 minutes" },
    game: { type: "pathTap" },
    ethics:
      "Move with awareness: crowded places work better when everyone takes turns and stays considerate."
  },
  {
    id: 4,
    slug: "milan",
    city: "Milan",
    region: "Lombardy",
    badge: "Style Sense",
    fact:
      "Milan blends design, fashion, and innovation—many ideas start as sketches before they become real.",
    video: { type: "youtube", id: "w8Z2b9i9lE0", title: "Milan quick tour" },
    game: { type: "patternMemory" },
    ethics:
      "Respect differences: great teams make space for different styles, preferences, and strengths."
  },
  {
    id: 5,
    slug: "naples",
    city: "Naples",
    region: "Campania",
    badge: "Pizza Origins",
    fact:
      "Naples is famous for classic Neapolitan pizza—simple ingredients, big flavor, and lots of tradition.",
    video: { type: "youtube", id: "7g1a0b3wXo8", title: "Neapolitan pizza basics (short)" },
    game: { type: "dragBuild" },
    ethics:
      "Share fairly: when resources are limited, taking turns and sharing keeps things fun for everyone."
  },
  {
    id: 6,
    slug: "bologna",
    city: "Bologna",
    region: "Emilia-Romagna",
    badge: "Food Mapper",
    fact:
      "Bologna is known for rich food traditions and long portico walkways—great for gathering and community.",
    video: { type: "youtube", id: "qC8b8n3dM6g", title: "Bologna food + city (short)" },
    game: { type: "ingredientMatch" },
    ethics:
      "Be inclusive: invite others in—good communities notice who’s left out and make room."
  },
  {
    id: 7,
    slug: "pisa",
    city: "Pisa",
    region: "Tuscany",
    badge: "Balance Master",
    fact:
      "The Leaning Tower of Pisa is famous worldwide—an engineering story that became an icon.",
    video: { type: "youtube", id: "mW8oYjv7t9Q", title: "Pisa in 2 minutes" },
    game: { type: "tiltBalance" },
    ethics:
      "Do things safely: fun stunts are best when everyone stays aware of boundaries and safety."
  },
  {
    id: 8,
    slug: "verona",
    city: "Verona",
    region: "Veneto",
    badge: "Language Light",
    fact:
      "Italian phrases can be simple and friendly—small greetings go a long way in respectful culture.",
    video: { type: "youtube", id: "P6m6tB3cH5A", title: "Basic Italian greetings (short)" },
    game: { type: "phraseOrder" },
    ethics:
      "Speak with care: words can build trust—choose respectful language, especially under pressure."
  },
  {
    id: 9,
    slug: "palermo",
    city: "Palermo",
    region: "Sicily",
    badge: "Market Rhythm",
    fact:
      "Sicily has lively markets and bold flavors—music and rhythm show up in daily life and celebrations.",
    video: { type: "youtube", id: "qX9fC2D2a1M", title: "Sicily vibes (short)" },
    game: { type: "rhythmTap" },
    ethics:
      "Cheer each other on: competition can still be kind—support others while you play to win."
  },
  {
    id: 10,
    slug: "amalfi",
    city: "Amalfi Coast",
    region: "Campania",
    badge: "Coastal Explorer",
    fact:
      "The Amalfi Coast is known for dramatic seaside towns and warm colors—classic postcard Italy.",
    video: { type: "youtube", id: "5uY9xjz7c2w", title: "Amalfi Coast in under 3 min" },
    game: { type: "finalCode" },
    ethics:
      "Finish with integrity: winning feels best when you play fair and respect the rules."
  }
];

export function getLocationById(id) {
  return LOCATIONS.find((l) => l.id === Number(id));
}

