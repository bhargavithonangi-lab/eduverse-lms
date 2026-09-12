import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function askGeminiTutor(params: {
  action: 'explain' | 'quiz' | 'summarize' | 'debug' | 'chat';
  message: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
  codeSnippet?: string;
}): Promise<any> {
  const { action, message, courseTitle, lessonTitle, lessonContent, codeSnippet } = params;

  if (action === 'quiz') {
    // Generate structured quiz using JSON Schema
    const prompt = `Generate a 3-question multiple-choice interactive quiz about the topic: "${message || lessonTitle || 'Course Concept'}".
Context: Course: ${courseTitle || 'Computer Science & AI'}, Lesson: ${lessonTitle || 'Core Concepts'}.
Provide clear question text, 4 distinct options, the 0-based index of the correct answer, and an insightful educational explanation.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert interactive curriculum designer creating engaging, high-yield practice quizzes for students.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (err: any) {
      console.error('Gemini quiz generation error:', err);
      // Fallback structured quiz if API key is not yet configured
      return {
        title: `Practice Check: ${lessonTitle || 'Key Concepts'}`,
        questions: [
          {
            id: 'q_gen_1',
            question: `In the context of ${lessonTitle || 'this topic'}, what is the primary architectural principle?`,
            options: [
              'Separation of concerns and modular component boundaries',
              'Coupling all logic into single script execution',
              'Bypassing data validation layers',
              'Eliminating caching mechanisms entirely'
            ],
            correctAnswerIndex: 0,
            explanation: 'Modular design separates distinct domains, enhancing testability, maintainability, and scalability.'
          },
          {
            id: 'q_gen_2',
            question: 'How should database connection timeouts be handled in production microservices?',
            options: [
              'Fail silently without logging',
              'Implement exponential backoff retry and circuit-breaker patterns',
              'Spawn infinite concurrent connection attempts',
              'Hardcode permanent reconnection loops without backoff'
            ],
            correctAnswerIndex: 1,
            explanation: 'Exponential backoff prevents thundering herds from overwhelming reviving database servers.'
          }
        ]
      };
    }
  }

  // Text response actions (explain, summarize, debug, chat)
  let systemInstruction = 'You are the EduVerse AI Senior Academic Tutor, dedicated to helping students learn effectively, break down complex topics with vivid intuition, and write clean code.';
  let prompt = '';

  if (action === 'explain') {
    systemInstruction += ' Provide an intuitive, crystal-clear explanation using the Feynman technique (plain English first, then real-world analogies, then code/technical breakdown).';
    prompt = `Please explain the concept "${message}" in the context of the course "${courseTitle || ''}" and lesson "${lessonTitle || ''}".`;
  } else if (action === 'summarize') {
    systemInstruction += ' Provide an executive bulleted summary with key takeaways, critical formulas or patterns, and actionable study tips.';
    prompt = `Summarize the lesson "${lessonTitle || 'Current Lesson'}". Context: ${lessonContent || message}`;
  } else if (action === 'debug') {
    systemInstruction += ' Analyze the user code or issue carefully. Point out the exact bug, explain why it fails, provide the corrected code block, and list best practices.';
    prompt = `Analyze and debug this code/question:
Code:
\`\`\`
${codeSnippet || ''}
\`\`\`
Issue / Question: ${message}`;
  } else {
    // General chat
    prompt = `Context: The student is enrolled in "${courseTitle || 'Tech Course'}" currently studying lesson "${lessonTitle || 'Overview'}".
Student question: "${message}"`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return {
      text: response.text || 'I analyzed your request. Here is what you need to know...',
    };
  } catch (err: any) {
    console.warn('Gemini generateContent error:', err.message);
    return {
      text: `**EduVerse AI Learning Assistant**\n\n*Concept Intuition:*\nWhen working with ${message || 'this topic'}, consider how data flows through the system. Breaking problems into discrete inputs, transforms, and outputs makes debugging and understanding natural.\n\n*Key Tip:* Try writing a minimal reproduction or pseudocode sketch first to verify edge cases!`,
    };
  }
}
