/**
 * Fuzzy search utility — Levenshtein distance + token-aware word-level matching.
 *
 * Handles common typos such as:
 *   "aple"    → "Apple" / "Shimla Apple"   (missing letter)
 *   "bannana" → "Banana" / "Fresh Bananas" (extra letter)
 *   "choclate"→ "Chocolate"               (transposition / missing)
 *   "mikl"    → "Milk" / "Amul Toned Milk" (transposition / missing)
 */

/**
 * Compute the Levenshtein (edit) distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const row: number[] = Array.from({ length: bLen + 1 }, (_, i) => i);

  for (let i = 1; i <= aLen; i++) {
    let prev = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1,       // deletion
        prev + 1,         // insertion
        row[j - 1] + cost // substitution
      );
      row[j - 1] = prev;
      prev = val;
    }
    row[bLen] = prev;
  }

  return row[bLen];
}

/**
 * Compare a query against an individual word token and return a similarity score between 0 and 1.
 */
function scoreToken(query: string, token: string): number {
  const q = query.toLowerCase().trim();
  const t = token.toLowerCase().trim();

  if (!q || !t) return 0;
  if (q === t) return 1;

  // Exact prefix match
  if (t.startsWith(q)) {
    return 0.85 + 0.15 * (q.length / t.length);
  }

  // Exact substring
  if (t.includes(q)) {
    return 0.75 + 0.15 * (q.length / t.length);
  }

  // Edit distance check against token
  const dist = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const similarity = 1 - dist / maxLen;

  // Allow up to 2 edits for words >= 4 chars, 1 edit for 3-char words
  const maxAllowedEdits = q.length >= 6 ? 2 : q.length >= 4 ? 2 : 1;

  if (dist <= maxAllowedEdits) {
    // High fuzzy match
    return Math.max(0.4, similarity);
  }

  // Check prefix fuzzy match (e.g. "bannana" vs "bananas")
  if (t.length >= q.length - 1) {
    const prefix = t.substring(0, q.length);
    const prefixDist = levenshteinDistance(q, prefix);
    if (prefixDist <= maxAllowedEdits) {
      return Math.max(0.4, 1 - prefixDist / q.length);
    }
  }

  return 0;
}

/**
 * Return a similarity score between 0 and 1 for `query` against multi-word `target`.
 * Evaluates both full phrase matching and individual word tokens in the target.
 */
export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q || !t) return 0;
  if (q === t) return 1;

  // Check whole string exact prefix / substring
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.8;

  // Break target into individual words (e.g. "Shimla", "Apple", "Fresh", "Bananas")
  const tokens = t.split(/[\s,&/\\-]+/).filter(Boolean);

  let maxTokenScore = 0;
  for (const token of tokens) {
    const s = scoreToken(q, token);
    if (s > maxTokenScore) {
      maxTokenScore = s;
    }
  }

  // Also test sliding window over entire target string for multi-word queries
  const wholeDist = levenshteinDistance(q, t);
  const wholeSim = 1 - wholeDist / Math.max(q.length, t.length);
  if (wholeSim > maxTokenScore) {
    maxTokenScore = wholeSim;
  }

  return Math.min(maxTokenScore, 1);
}

/**
 * Given a query and candidate strings, return top matches ranked by score.
 */
export function findFuzzyMatches(
  query: string,
  candidates: string[],
  maxResults: number = 6
): string[] {
  const THRESHOLD = 0.4;

  const scored = candidates
    .map((c) => ({ name: c, score: fuzzyScore(query, c) }))
    .filter((s) => s.score >= THRESHOLD);

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map((s) => s.name);
}
