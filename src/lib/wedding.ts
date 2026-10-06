import { GuestRole } from "@/generated/prisma/enums";

export const WEDDING = {
  bride: "Tailany",
  groom: "Jeffson",
  date: "10 de outubro de 2026",
  quote: "O amor é a única coisa que cresce quando compartilhado",
} as const;

export const PALETTE = {
  cream: "#F9F5EE",
  creamDark: "#EDE7D9",
  gold: "#C4870C",
  goldLight: "#E8B84B",
  goldDark: "#8B5E08",
  brown: "#2C1810",
  mutedBrown: "#7A6452",
  polaroid: "#FFFFFF",
  silver: "#7A9BB5",
  bronze: "#A67C5B",
} as const;

/** Insignias das tres primeiras posicoes, em qualquer ranking do app. */
export const MEDALS = ["🥇", "🥈", "🥉"] as const;
export const PODIUM_COLORS = [
  PALETTE.gold,
  PALETTE.silver,
  PALETTE.bronze,
] as const;

export const FONTS = {
  display: "var(--font-playfair), Georgia, serif",
  body: "var(--font-lora), Georgia, serif",
  script: "var(--font-dancing), cursive",
} as const;

export interface Character {
  role: GuestRole;
  emoji: string;
  label: string;
  sublabel: string;
}

// Dados fixos de design: 6 papeis e 24 avatares. Nao viram tabela no banco —
// nao mudam, nao precisam de seed e evitam um join em toda listagem.
export const CHARACTERS: Character[] = [
  {
    role: GuestRole.NOIVO,
    emoji: "💍",
    label: "Noivo",
    sublabel: "O grande dia!",
  },
  {
    role: GuestRole.NOIVA,
    emoji: "👰",
    label: "Noiva",
    sublabel: "A mais linda!",
  },
  {
    role: GuestRole.PADRINHO,
    emoji: "🥂",
    label: "Padrinho",
    sublabel: "Celebrando juntos",
  },
  {
    role: GuestRole.MADRINHA,
    emoji: "💐",
    label: "Madrinha",
    sublabel: "Com muito amor",
  },
  {
    role: GuestRole.FAMILIA,
    emoji: "👨‍👩‍👧‍👦",
    label: "Família",
    sublabel: "Laços eternos",
  },
  {
    role: GuestRole.CONVIDADO,
    emoji: "🎉",
    label: "Convidado",
    sublabel: "Feliz por estar aqui",
  },
];

const AVATAR_SEEDS: [id: string, seed: string, bg: string][] = [
  ["a1", "Mia", "ffd5dc"],
  ["a2", "Leo", "d5e8d4"],
  ["a3", "Luna", "dae8fc"],
  ["a4", "Max", "fff2cc"],
  ["a5", "Bella", "f8d7da"],
  ["a6", "Oliver", "d4edda"],
  ["a7", "Sofia", "cce5ff"],
  ["a8", "Jack", "ffeeba"],
  ["a9", "Iris", "f5c6cb"],
  ["a10", "Noah", "b8daff"],
  ["a11", "Zara", "c3e6cb"],
  ["a12", "Finn", "ffd5dc"],
  ["a13", "Clara", "e8d5f5"],
  ["a14", "Bruno", "d5eaf5"],
  ["a15", "Ava", "fce4d6"],
  ["a16", "Luca", "d6f5e3"],
  ["a17", "Nina", "fdf3d0"],
  ["a18", "Felix", "d0e8fd"],
  ["a19", "Sara", "fde8f0"],
  ["a20", "Diego", "e8fde8"],
  ["a21", "Layla", "f5e6d3"],
  ["a22", "Pedro", "d3e8f5"],
  ["a23", "Elena", "f5d3e8"],
  ["a24", "Mateo", "d3f5e8"],
];

export interface Avatar {
  id: string;
  src: string;
  label: string;
}

export const AVATARS: Avatar[] = AVATAR_SEEDS.map(([id, seed, bg]) => ({
  id,
  label: seed,
  src: `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}`,
}));

const AVATAR_BY_ID = new Map(AVATARS.map((a) => [a.id, a]));
const CHARACTER_BY_ROLE = new Map(CHARACTERS.map((c) => [c.role, c]));

export const AVATAR_IDS = AVATARS.map((a) => a.id);

export function avatarSrc(id: string | null | undefined): string | undefined {
  return id ? AVATAR_BY_ID.get(id)?.src : undefined;
}

export function emojiForRole(role: GuestRole): string {
  return CHARACTER_BY_ROLE.get(role)?.emoji ?? "🎉";
}

export function labelForRole(role: GuestRole): string {
  return CHARACTER_BY_ROLE.get(role)?.label ?? "Convidado";
}
