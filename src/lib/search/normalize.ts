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

/**
 * Splits `text` into pieces and marks the parts that match the typed query, so
 * the UI can bold them. Matching ignores case and Turkish accents ("ayak"
 * highlights "Ayak" in "Spor Ayakkabı"). Works on the original characters, so
 * the original spelling is always what is shown.
 */
export function highlightSegments(
  text: string,
  query: string,
): { text: string; hit: boolean }[] {
  const chars = Array.from(text);
  // One folded character per original character, so positions line up.
  const folded = chars.map((ch) => {
    const lower = ch.toLocaleLowerCase("tr-TR");
    const f = TR_FOLD[lower] ?? lower;
    return f.length === 1 ? f : ch.toLowerCase().charAt(0);
  });
  const haystack = folded.join("");
  const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/.test(c);

  const marked = new Array<boolean>(chars.length).fill(false);
  for (const token of tokenize(query)) {
    // Prefer a match at the start of a word, otherwise the first match anywhere.
    let at = -1;
    for (
      let i = haystack.indexOf(token);
      i !== -1;
      i = haystack.indexOf(token, i + 1)
    ) {
      if (!isWordChar(haystack[i - 1])) {
        at = i;
        break;
      }
      if (at === -1) at = i;
    }
    if (at !== -1)
      for (let k = at; k < at + token.length; k++) marked[k] = true;
  }

  const segments: { text: string; hit: boolean }[] = [];
  chars.forEach((ch, i) => {
    const last = segments[segments.length - 1];
    if (last && last.hit === marked[i]) last.text += ch;
    else segments.push({ text: ch, hit: marked[i] });
  });
  return segments;
}
