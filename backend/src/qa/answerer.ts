import { searchDocuments, detectIntent, RetrievalResult } from './retriever';
import { QueryLog } from '../models/QueryLog';

export interface QAResponse {
  answer: string;
  sources: { recordId: string; snippet: string; sourceType: string; sourceName: string }[];
  confidence: number;
  intent: string;
}

/**
 * Generate an answer using retrieved context (template-based, fully offline)
 * No third-party API required — uses keyword retrieval + intelligent templating
 */
export const generateAnswer = async (question: string, userId?: string): Promise<QAResponse> => {
  const startTime = Date.now();
  const intent = detectIntent(question);

  // Retrieve relevant documents
  const results = await searchDocuments(question, 5);

  if (results.length === 0) {
    const response: QAResponse = {
      answer: "I couldn't find relevant information for your question in the AMYPO database. Please try rephrasing your question or ask about courses, placement eligibility, fees, policies, or student records.",
      sources: [],
      confidence: 0,
      intent
    };
    await logQuery(question, response, userId, Date.now() - startTime);
    return response;
  }

  // Build answer from top results based on intent
  let answer = '';
  const topResult = results[0];
  const confidence = Math.min(Math.round((topResult.score / 10) * 100) / 100, 0.98);

  switch (intent) {
    case 'course':
      answer = buildCourseAnswer(question, results);
      break;
    case 'placement':
      answer = buildPlacementAnswer(question, results);
      break;
    case 'policy':
      answer = buildPolicyAnswer(question, results);
      break;
    case 'faq':
      answer = buildFAQAnswer(question, results);
      break;
    default:
      answer = buildGeneralAnswer(question, results);
  }

  const sources = results.slice(0, 3).map(r => ({
    recordId: r.recordId,
    snippet: r.snippet,
    sourceType: r.sourceType,
    sourceName: r.sourceName
  }));

  const response: QAResponse = { answer, sources, confidence, intent };
  await logQuery(question, response, userId, Date.now() - startTime);
  return response;
};

// --- Answer Builders ---

const buildCourseAnswer = (question: string, results: RetrievalResult[]): string => {
  const courseResults = results.filter(r => r.sourceType === 'course');
  if (courseResults.length === 0) {
    return `Based on the available AMYPO records: ${results[0].snippet}`;
  }

  const q = question.toLowerCase();
  const topSnippets = courseResults.slice(0, 3).map(r => r.snippet).join('\n\n');

  if (/module|topic|syllabus|what.*learn|curriculum/.test(q)) {
    return `Here is the relevant course information from AMYPO records:\n\n${topSnippets}\n\nSource: ${courseResults.map(r => r.sourceName).join(', ')}`;
  }
  if (/duration|how long|weeks/.test(q)) {
    return `According to AMYPO course records:\n\n${topSnippets}\n\nFor detailed schedule information, please check the Course Duration and Schedule FAQ.`;
  }
  if (/skill/.test(q)) {
    return `Based on AMYPO course data, here are the relevant skills:\n\n${topSnippets}`;
  }
  return `From AMYPO course database:\n\n${topSnippets}`;
};

const buildPlacementAnswer = (question: string, results: RetrievalResult[]): string => {
  const companyResults = results.filter(r => r.sourceType === 'company');
  const studentResults = results.filter(r => r.sourceType === 'student_record');
  const policyResults = results.filter(r => r.sourceType === 'policy' || r.sourceType === 'faq');

  const parts: string[] = [];

  if (companyResults.length > 0) {
    parts.push(`**Company & Role Information:**\n${companyResults.slice(0, 2).map(r => r.snippet).join('\n\n')}`);
  }
  if (studentResults.length > 0) {
    parts.push(`**Relevant Student Records:**\n${studentResults.slice(0, 2).map(r => r.snippet).join('\n\n')}`);
  }
  if (policyResults.length > 0) {
    parts.push(`**Placement Policy:**\n${policyResults.slice(0, 1).map(r => r.snippet).join('\n')}`);
  }
  if (parts.length === 0) {
    parts.push(results.slice(0, 2).map(r => r.snippet).join('\n\n'));
  }

  return `Based on AMYPO placement records:\n\n${parts.join('\n\n---\n\n')}\n\nNote: For personalized eligibility checks, please use the placement eligibility feature.`;
};

const buildPolicyAnswer = (question: string, results: RetrievalResult[]): string => {
  const policyResults = results.filter(r => r.sourceType === 'policy');
  const relevantResults = policyResults.length > 0 ? policyResults : results;
  const topSnippets = relevantResults.slice(0, 2).map(r => `**${r.sourceName}:**\n${r.snippet}`).join('\n\n');
  return `According to AMYPO policies:\n\n${topSnippets}`;
};

const buildFAQAnswer = (question: string, results: RetrievalResult[]): string => {
  const faqResults = results.filter(r => r.sourceType === 'faq');
  const relevantResults = faqResults.length > 0 ? faqResults : results;
  const topSnippets = relevantResults.slice(0, 2).map(r => `**${r.sourceName}:**\n${r.snippet}`).join('\n\n');
  return `From AMYPO FAQs:\n\n${topSnippets}`;
};

const buildGeneralAnswer = (question: string, results: RetrievalResult[]): string => {
  const topSnippets = results.slice(0, 3).map(r => `**${r.sourceName}:**\n${r.snippet}`).join('\n\n');
  return `Here is the most relevant information from AMYPO records:\n\n${topSnippets}`;
};

// --- Query Logger ---

const logQuery = async (question: string, response: QAResponse, userId: string | undefined, responseTimeMs: number) => {
  try {
    await QueryLog.create({
      question,
      answer: response.answer,
      sources: response.sources,
      confidence: response.confidence,
      userId,
      intent: response.intent,
      responseTimeMs
    });
  } catch (err) {
    console.error('Failed to log QA query:', err);
  }
};
