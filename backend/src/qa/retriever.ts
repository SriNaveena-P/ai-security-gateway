import { QADocument } from '../models/QADocument';

/**
 * TF-IDF style keyword-based retriever (fully offline, no external APIs)
 * Searches QA documents using keyword matching and scoring
 */

// Tokenize and normalize text
const tokenize = (text: string): string[] => {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
};

// Stop words to ignore
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'has', 'have', 'been', 'will', 'with', 'this',
  'that', 'from', 'they', 'which', 'their', 'what', 'there', 'about', 'each',
  'more', 'also', 'into', 'than', 'them', 'some', 'when', 'who', 'how', 'its'
]);

// Calculate relevance score between query and document
const calculateRelevance = (queryTokens: string[], docTokens: string[]): number => {
  const docTokenSet = new Set(docTokens);
  let score = 0;
  let matchedTerms = 0;

  for (const token of queryTokens) {
    if (STOP_WORDS.has(token)) continue;
    if (docTokenSet.has(token)) {
      // Count occurrences in document for TF component
      const occurrences = docTokens.filter(t => t === token).length;
      score += 1 + Math.log(1 + occurrences);
      matchedTerms++;
    }
  }

  // Bonus for matching a higher percentage of query terms
  const coverageBonus = queryTokens.length > 0 ? (matchedTerms / queryTokens.length) * 2 : 0;
  return score + coverageBonus;
};

export interface RetrievalResult {
  recordId: string;
  snippet: string;
  sourceType: string;
  sourceName: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Search for the most relevant documents matching the query
 */
export const searchDocuments = async (query: string, topK: number = 5): Promise<RetrievalResult[]> => {
  const allDocs = await QADocument.find({}).lean();
  const queryTokens = tokenize(query).filter(t => !STOP_WORDS.has(t));

  if (queryTokens.length === 0) return [];

  const scored = allDocs.map(doc => {
    const docTokens = tokenize(doc.chunk);
    const score = calculateRelevance(queryTokens, docTokens);
    return {
      recordId: doc.sourceId,
      snippet: doc.chunk.substring(0, 300),
      sourceType: doc.sourceType,
      sourceName: doc.sourceName,
      score,
      metadata: doc.metadata || {}
    };
  });

  // Sort by score descending and return top K
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

/**
 * Detect the intent of the question
 */
export const detectIntent = (question: string): 'placement' | 'course' | 'policy' | 'faq' | 'general' => {
  const q = question.toLowerCase();

  if (/eligib|placement|placed|company|hire|hiring|job|salary|recruit|tcs|infosys|wipro|amazon|google/.test(q)) {
    return 'placement';
  }
  if (/course|module|topic|syllabus|curriculum|duration|learn|skill|training|certificate/.test(q)) {
    return 'course';
  }
  if (/policy|rule|conduct|integrity|privacy|plagiarism|refund/.test(q)) {
    return 'policy';
  }
  if (/fee|admission|attend|schedule|batch|weekend|lab|certif/.test(q)) {
    return 'faq';
  }
  return 'general';
};
