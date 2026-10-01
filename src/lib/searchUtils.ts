import { Product } from '@/lib/supabase/types';

/**
 * Calculates the Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Common baby store typo & synonym mappings.
 */
const SYNONYMS: Record<string, string[]> = {
  dress: ['frock', 'gown', 'outfit', 'dresses', 'onesie'],
  dresses: ['frock', 'frocks', 'dress', 'outfit'],
  frock: ['dress', 'dresses', 'gown'],
  frocks: ['dress', 'dresses', 'frock'],
  onesie: ['romper', 'bodysuit', 'jumpsuit', 'pastel', 'cotton'],
  romper: ['onesie', 'bodysuit', 'jumpsuit'],
  toy: ['toys', 'stacker', 'bear', 'plush', 'montessori', 'rattle'],
  toys: ['toy', 'stacker', 'bear', 'plush', 'montessori', 'rattle'],
  bear: ['teddy', 'plush', 'snuggle'],
  teddy: ['bear', 'plush', 'stuffed'],
  plush: ['teddy', 'bear', 'stuffed'],
  beanie: ['cap', 'hat', 'booties'],
  booties: ['shoes', 'socks', 'beanie'],
  accessory: ['accessories', 'beanie', 'booties', 'teether', 'rattle'],
  accessories: ['accessory', 'beanie', 'booties', 'teether', 'rattle'],
  teether: ['rattle', 'silicone', 'feeder', 'teething'],
  stacker: ['rings', 'montessori', 'wooden'],
};

/**
 * Normalizes a word for comparison (lowercase, alphanumeric only).
 */
function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a single search word matches a candidate word with typo tolerance.
 */
function wordMatchesFuzzy(queryWord: string, candidateWord: string): boolean {
  const q = cleanWord(queryWord);
  const c = cleanWord(candidateWord);

  if (!q || !c) return false;

  // 1. Exact match
  if (q === c) return true;

  // 2. Prefix or substring match
  if (c.includes(q) || q.includes(c)) return true;

  // 3. Synonym match
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (q === key || syns.includes(q)) {
      if (c === key || syns.includes(c)) return true;
    }
  }

  // 4. Typo tolerance via Levenshtein edit distance
  const maxDistance = q.length <= 3 ? 1 : q.length <= 6 ? 2 : 3;
  const dist = levenshteinDistance(q, c);

  if (dist <= maxDistance) {
    return true;
  }

  // 5. Check if query is an edit of any synonym
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (levenshteinDistance(q, key) <= 1) {
      if (c === key || syns.includes(c)) return true;
    }
  }

  return false;
}

/**
 * Determines whether a product matches a search query with spelling tolerance.
 */
export function matchesSearchSpelling(product: Product, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const queryWords = trimmed.split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return true;

  // Extract all searchable text from the product
  const name = product.name?.toLowerCase() || '';
  const desc = product.description?.toLowerCase() || '';
  const slug = product.slug?.toLowerCase() || '';
  const catName =
    typeof product.categories === 'object' && product.categories && 'name' in product.categories
      ? (product.categories as any).name?.toLowerCase() || ''
      : '';
  const ages = (product.suitable_ages || []).join(' ').toLowerCase();
  const extraTags = `${product.is_toy ? 'toy toys montessori plush' : ''} ${
    product.is_accessory ? 'accessory accessories beanie booties teether' : ''
  }`;

  const allProductText = `${name} ${desc} ${slug} ${catName} ${ages} ${extraTags}`;
  const productTokens = allProductText
    .split(/[\s,.\-_/]+/)
    .map(cleanWord)
    .filter((w) => w.length > 1);

  // Every word in query should find at least one fuzzy-matching token in the product
  return queryWords.every((qWord) => {
    // Fast path: direct inclusion in full text
    if (allProductText.includes(cleanWord(qWord))) return true;

    // Check fuzzy match against all product tokens
    return productTokens.some((pToken) => wordMatchesFuzzy(qWord, pToken));
  });
}

/**
 * Filters and ranks products according to match relevance:
 * 1. Exact title match
 * 2. Title substring match
 * 3. Description / category match
 * 4. Fuzzy spelling match
 */
export function searchAndRankProducts(products: Product[], query: string): Product[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return products;

  const scored: { product: Product; score: number }[] = [];

  for (const p of products) {
    if (!matchesSearchSpelling(p, trimmed)) continue;

    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();

    let score = 0;
    if (name === trimmed) {
      score += 100;
    } else if (name.startsWith(trimmed)) {
      score += 80;
    } else if (name.includes(trimmed)) {
      score += 60;
    } else if (desc.includes(trimmed)) {
      score += 40;
    } else {
      score += 20; // Fuzzy spelling match
    }

    scored.push({ product: p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.product);
}
