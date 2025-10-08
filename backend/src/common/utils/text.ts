const accentMap: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ö: 'o',
  ő: 'o',
  ú: 'u',
  ü: 'u',
  ű: 'u',
};

export const hungarianVowels = new Set('aáeéiíoóöőuúüű');
export const hungarianConsonants = new Set('bcdfghjklmnpqrstvwxyz');

export function normalizeHungarianText(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => accentMap[char as keyof typeof accentMap] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function estimateSyllableCount(value: string): number {
  return value
    .toLowerCase()
    .split('')
    .filter((char) => hungarianVowels.has(char)).length;
}

export function scoreNameForLastName(givenName: string, lastName: string): number {
  const normalizedGiven = normalizeHungarianText(givenName);
  const normalizedLast = normalizeHungarianText(lastName);

  if (!normalizedGiven || !normalizedLast) {
    return 0;
  }

  let score = 0;
  const givenFirst = normalizedGiven[0];
  const lastFirst = normalizedLast[0];
  const givenLast = normalizedGiven.at(-1) ?? '';

  if (givenFirst !== lastFirst) {
    score += 1.2;
  } else {
    score -= 0.8;
  }

  const givenEndsWithVowel = hungarianVowels.has(givenLast);
  const lastStartsWithVowel = hungarianVowels.has(lastFirst);

  if (lastStartsWithVowel === givenEndsWithVowel) {
    score += 1;
  } else {
    score -= 0.4;
  }

  const syllables = estimateSyllableCount(givenName);
  if (syllables >= 2 && syllables <= 3) {
    score += 1.5;
  } else if (syllables === 1) {
    score += 0.5;
  } else {
    score -= 0.3 * Math.abs(syllables - 3);
  }

  const lengthDiff = Math.abs(normalizedGiven.replace(/\s+/g, '').length - 5);
  score -= lengthDiff * 0.1;

  const repeatedBigramPenalty = computeRepeatedBigramPenalty(normalizedGiven, normalizedLast);
  score -= repeatedBigramPenalty;

  return Number(score.toFixed(3));
}

function computeRepeatedBigramPenalty(given: string, last: string): number {
  const bigrams = new Set<string>();
  for (let i = 0; i < last.length - 1; i += 1) {
    bigrams.add(last.slice(i, i + 2));
  }

  let penalty = 0;
  for (let i = 0; i < given.length - 1; i += 1) {
    const pair = given.slice(i, i + 2);
    if (bigrams.has(pair)) {
      penalty += 0.2;
    }
  }
  return penalty;
}
