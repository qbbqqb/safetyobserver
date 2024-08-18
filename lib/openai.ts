import OpenAI from 'openai';
import { Observation } from '@/types';

let openai: OpenAI | null = null;

if (typeof window === 'undefined') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in the environment variables');
  }
  // Server-side initialization
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface ChatbotResponse {
  message: string;
  data: Partial<Observation>;
  nextStep: string;
}

export async function getChatbotResponse(input: string, currentStep: string, observationData: Partial<Observation>): Promise<ChatbotResponse> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized. This function should only be called server-side.');
  }

  try {
    if (currentStep === 'initial') {
      const initialMessage = "Welcome to SafetyObserver! I'm here to help you report a safety observation. Let's start with the location of the incident. Where did it occur?";
      return {
        message: initialMessage,
        data: {},
        nextStep: 'location'
      };
    }

    const prompt = generatePrompt(input, currentStep, observationData);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      n: 1,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response content from OpenAI API');
    }

    return parseResponse(content, currentStep);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

function generatePrompt(input: string, currentStep: string, observationData: Partial<Observation>): string {
  let prompt = `You are a helpful safety assistant whose task is to collect information from users about safety observations. Follow these instructions:

1. If this is the initial interaction (currentStep is 'initial'), ask the user which language they want to use. Suggest these languages: English, Gaeilge, Română, Magyar, Nederlands, Русский, Українська, Español, Polski, Eesti, or other.

2. Continue the conversation in the language selected by the user.

3. Collect the following information from the user:
   - Company they work for
   - Location of the observation
   - Description of the observation (if vague or one-word, ask for more details)
   - Action taken to respond to or correct the observation
   - Ask for their name (optional, as the observation can be anonymous)

4. After collecting all information, thank the user, provide a summary of the observation, and ask if they want to submit another observation or need any other help.

Current step: ${currentStep}
User input: ${input}

Current observation data:
${JSON.stringify(observationData, null, 2)}

Provide a friendly and engaging response. Format your response as follows:
{
  "message": "Your response to the user",
  "data": {
    "relevantField": "Extracted information"
  },
  "nextStep": "Next step in the conversation"
}`;

  return prompt;
}

function parseResponse(content: string, currentStep: string): ChatbotResponse {
  try {
    const parsedContent = JSON.parse(content);
    return {
      message: parsedContent.message,
      data: parsedContent.data,
      nextStep: parsedContent.nextStep,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      message: 'I apologize, but I encountered an error processing your input. Could you please try again?',
      data: {},
      nextStep: currentStep,
    };
  }
}