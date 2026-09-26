export interface MistakeExplanation {
  source: 'gemini' | 'deterministic_tutor';
  model?: string;
  chosenSummary: string;
  correctSummary: string;
  trapOrigin: string;
  bulletPoints: string[];
  keyTakeaway: string;
}

export interface SimilarQuestionOption {
  id: string;
  letter: string;
  text: string;
}

export interface SimilarQuestion {
  source: 'gemini' | 'deterministic_tutor';
  model?: string;
  prompt: string;
  codeSnippet?: string;
  options: SimilarQuestionOption[];
  correctOptionId: string;
  explanation: string;
  takeaway: string;
}

export async function checkGeminiStatus(): Promise<{ available: boolean; model: string }> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch {
    return { available: false, model: 'gemini-3.8-flash' };
  }
}

export async function fetchMistakeExplanation({
  questionPrompt,
  codeSnippet,
  chosenLetter,
  chosenText,
  correctLetter,
  correctText,
  conceptName,
  explanation,
  lang = 'fr',
}: {
  questionPrompt: string;
  codeSnippet?: string;
  chosenLetter: string;
  chosenText: string;
  correctLetter: string;
  correctText: string;
  conceptName?: string;
  explanation?: string;
  lang?: 'fr' | 'en';
}): Promise<MistakeExplanation> {
  try {
    const res = await fetch('/api/gemini/explain-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionPrompt,
        codeSnippet,
        chosenLetter,
        chosenText,
        correctLetter,
        correctText,
        conceptName,
        explanation,
        lang,
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Gemini Tutor Service] Falling back to local diagnostic:', err);
    // Fallback client direct
    const isFr = lang === 'fr';
    return {
      source: 'deterministic_tutor',
      chosenSummary: isFr ? `Tu as choisi ${chosenLetter}.` : `You chose ${chosenLetter}.`,
      correctSummary: isFr ? `La bonne réponse est ${correctLetter}.` : `The correct answer is ${correctLetter}.`,
      trapOrigin: isFr
        ? 'Le piège vient de la distinction fondamentale entre filtrage des lignes et filtrage des agrégats.'
        : 'The trap lies in the core distinction between row-level predicates and aggregate grouping.',
      bulletPoints: isFr ? [
        'WHERE s\'évalue avant le GROUP BY sur les enregistrements individuels.',
        'HAVING s\'évalue après le regroupement sur les agrégats (COUNT, SUM, AVG).',
        'Une fonction d\'agrégation ne peut pas figurer dans la clause WHERE.',
      ] : [
        'WHERE evaluates prior to GROUP BY on raw rows.',
        'HAVING evaluates post aggregation on group sets.',
        'Aggregate functions cannot appear within a WHERE clause.',
      ],
      keyTakeaway: isFr ? '💡 À retenir :\nWHERE → lignes\nHAVING → groupes' : '💡 Key Takeaway:\nWHERE → rows\nHAVING → groups',
    };
  }
}

export async function fetchSimilarQuestion({
  conceptName,
  trapOrigin,
  originalPrompt,
  lang = 'fr',
}: {
  conceptName: string;
  trapOrigin: string;
  originalPrompt: string;
  lang?: 'fr' | 'en';
}): Promise<SimilarQuestion> {
  try {
    const res = await fetch('/api/gemini/similar-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptName,
        trapOrigin,
        originalPrompt,
        lang,
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Gemini Tutor Service] Falling back to local question generator:', err);
    const isFr = lang === 'fr';
    return {
      source: 'deterministic_tutor',
      prompt: isFr 
        ? 'Quelle clause SQL devez-vous utiliser pour restreindre les résultats aux services dont la masse salariale moyenne (AVG(salary)) dépasse 4 500 € ?'
        : 'Which SQL clause must you use to restrict results to departments whose average salary (AVG(salary)) exceeds $4,500?',
      codeSnippet: 'SELECT department_id, AVG(salary) FROM employees GROUP BY department_id ... ;',
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'WHERE AVG(salary) > 4500' : 'WHERE AVG(salary) > 4500' },
        { id: 'B', letter: 'B', text: isFr ? 'HAVING AVG(salary) > 4500' : 'HAVING AVG(salary) > 4500' },
        { id: 'C', letter: 'C', text: isFr ? 'QUALIFY AVG(salary) > 4500' : 'QUALIFY AVG(salary) > 4500' },
        { id: 'D', letter: 'D', text: isFr ? 'ON AVG(salary) > 4500' : 'ON AVG(salary) > 4500' },
      ],
      correctOptionId: 'B',
      explanation: isFr 
        ? 'AVG(salary) est une fonction d\'agrégat. Le filtrage sur le résultat d\'un agrégat s\'effectue obligatoirement avec la clause HAVING après le GROUP BY.'
        : 'AVG(salary) is an aggregate function. Filtering on aggregate results requires the HAVING clause evaluated after GROUP BY.',
      takeaway: isFr ? 'Agrégats (AVG, SUM, COUNT) → toujours filtrés dans HAVING' : 'Aggregates (AVG, SUM, COUNT) → always in HAVING',
    };
  }
}

export async function fetchTargetedSession({
  topics = [
    { id: 'join', name: 'JOIN', count: 5, currentScore: 54 },
    { id: 'subqueries', name: 'Subqueries', count: 3, currentScore: 47 },
    { id: 'indexes', name: 'Indexes', count: 2, currentScore: 61 },
  ],
  totalQuestions = 10,
  difficulty = 'progressive',
  lang = 'fr',
}: {
  topics?: { id: string; name: string; count: number; currentScore: number }[];
  totalQuestions?: number;
  difficulty?: 'progressive';
  lang?: 'fr' | 'en';
} = {}): Promise<import('../types').TargetedSessionPayload> {
  const activeLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
  try {
    const res = await fetch('/api/gemini/generate-targeted-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics,
        totalQuestions,
        difficulty,
        lang: activeLang,
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Gemini Tutor Service] Error generating session, using local engine:', err);
    // En cas d'erreur réseau, appel direct au fallback
    const res = await fetch('/api/gemini/generate-targeted-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics,
        totalQuestions,
        difficulty,
        lang: activeLang,
      }),
    });
    return await res.json();
  }
}
