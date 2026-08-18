/**
 * Speech evaluation utility for SwedishFlow A1 pronunciation exercises.
 * Evaluates transcribed speech against target phrases with Swedish language normalization.
 */

export type SpeechStatus =
  | 'correct'
  | 'almost'
  | 'incorrect'
  | 'empty'
  | 'permission_denied'
  | 'recorded_unverified'
  | 'unsupported';

export interface SpeechEvaluationResult {
  status: SpeechStatus;
  score?: number; // 0 - 100
  feedbackTitle: string;
  feedbackMessage: string;
  recognizedText: string;
  targetPhrase: string;
}

/**
 * Normalizes Swedish text for comparison:
 * - Lowercase
 * - Removes punctuation (. , ! ? - " : ;)
 * - Trims extra whitespace
 * - Preserves Swedish characters (å, ä, ö)
 */
export function normalizeSwedishText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,!?:;"'()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates word-level similarity between recognized transcript and target phrase.
 */
export function evaluateSpeechAccuracy(
  recognizedText: string,
  targetPhrase: string
): SpeechEvaluationResult {
  const cleanRecognized = normalizeSwedishText(recognizedText);
  const cleanTarget = normalizeSwedishText(targetPhrase);

  if (!cleanRecognized) {
    return {
      status: 'empty',
      score: 0,
      feedbackTitle: 'Inget ljud uppfattades',
      feedbackMessage: 'Mikrofonen uppfattade inget tal. Försök att tala lite högre och tydligare.',
      recognizedText: '',
      targetPhrase,
    };
  }

  // Exact normalized match
  if (cleanRecognized === cleanTarget) {
    return {
      status: 'correct',
      score: 100,
      feedbackTitle: 'Rätt!',
      feedbackMessage: 'Utmärkt! Ditt uttal matchar målfrasen.',
      recognizedText: cleanRecognized,
      targetPhrase,
    };
  }

  const targetWords = cleanTarget.split(' ').filter(Boolean);
  const recognizedWords = cleanRecognized.split(' ').filter(Boolean);

  if (targetWords.length === 0) {
    return {
      status: 'correct',
      score: 100,
      feedbackTitle: 'Rätt!',
      feedbackMessage: 'Bra jobbat!',
      recognizedText: cleanRecognized,
      targetPhrase,
    };
  }

  // Calculate matching words
  let matchedCount = 0;
  for (const tWord of targetWords) {
    if (recognizedWords.includes(tWord)) {
      matchedCount++;
    }
  }

  const matchRatio = matchedCount / targetWords.length;
  const score = Math.round(matchRatio * 100);

  if (matchRatio >= 0.8 || (targetWords.length <= 2 && matchedCount === targetWords.length)) {
    return {
      status: 'correct',
      score,
      feedbackTitle: 'Rätt!',
      feedbackMessage: 'Mycket bra uttal! Frasen uppfattades tydligt.',
      recognizedText: cleanRecognized,
      targetPhrase,
    };
  }

  if (matchRatio >= 0.5) {
    return {
      status: 'almost',
      score,
      feedbackTitle: 'Nästan rätt!',
      feedbackMessage: `Du fick med flera ord (${matchedCount}/${targetWords.length}). Lyssna på modelluttalet och prova igen!`,
      recognizedText: cleanRecognized,
      targetPhrase,
    };
  }

  return {
    status: 'incorrect',
    score,
    feedbackTitle: 'Försök igen',
    feedbackMessage: 'Systemet uppfattade inte målfrasen. Lyssna gärna på modelluttalet och säg frasen en gång till.',
    recognizedText: cleanRecognized,
    targetPhrase,
  };
}
