/**
 * Turkish-aware text normalisation for search.
 *
 * Plain toLowerCase() breaks Turkish: "I".toLowerCase() is "i" but should be "ı",
 * and "İ" should become "i". We lower-case with the tr-TR locale first, then
 * fold the Turkish letters to ASCII so "ceket", "Çeket" and "ÇEKET" all match.
 */
const TR_FOLD: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

export function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (ch) => TR_FOLD[ch] ?? ch)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const normalized = normalizeText(input);
  return normalized === "" ? [] : normalized.split(" ");
}

/** Levenshtein edit distance, used for light typo tolerance ("ayakabi" ~ "ayakkabi"). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Scores how well one query token matches a list of haystack words.
 * 3 = exact word, 2 = word starts with token, 1.5 = substring, 1 = typo match, 0 = none.
 */
export function matchToken(token: string, words: string[]): number {
  let best = 0;
  for (const word of words) {
    if (word === token) return 3;
    if (word.startsWith(token)) best = Math.max(best, 2);
    else if (token.length >= 3 && word.includes(token))
      best = Math.max(best, 1.5);
    else if (token.length >= 5 && Math.abs(word.length - token.length) <= 1) {
      if (editDistance(word, token) <= 1) best = Math.max(best, 1);
    }
  }
  return best;
}
