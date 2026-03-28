const AVATAR_STYLES = [
  "bottts", "bottts-neutral", "shapes", "identicon", "thumbs", "fun-emoji", "adventurer-neutral", "avataaars-neutral",
];

export function getAvatarUrl(seed: string, style?: string): string {
  const s = style || AVATAR_STYLES[Math.abs(hashCode(seed)) % AVATAR_STYLES.length];
  return `https://api.dicebear.com/9.x/${s}/svg?seed=${encodeURIComponent(seed)}&size=128&backgroundColor=transparent`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const AVATAR_OVERRIDES: Record<string, string> = {
  hermes: getAvatarUrl("hermes-v2", "bottts"),
  ledger: getAvatarUrl("ledger-v2", "bottts"),
  atlas: getAvatarUrl("atlas-regen-7x", "fun-emoji"),
};

export function resolveAvatarUrl(avatarUrl: string | null | undefined, slug: string): string {
  return avatarUrl || AVATAR_OVERRIDES[slug] || getAvatarUrl(slug);
}

export { AVATAR_STYLES };
