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
  const steps = ['location', 'project', 'company', 'exactLocationDescription', 'observationDetails', 'actionsTaken', 'severityLevel', 'category'];
  const nextStep = steps[steps.indexOf(currentStep) + 1];

  let prompt = `Current step: ${currentStep}\nUser input: ${input}\n\n`;
  prompt += `Based on the user's input, extract the relevant information for the "${currentStep}" field.\n`;
  prompt += `Then, ask for information about the "${nextStep}" field.\n`;
  prompt += `Provide a friendly and engaging response.\n\n`;
  prompt += `Current observation data:\n${JSON.stringify(observationData, null, 2)}\n\n`;
  prompt += `Response format:\n{
    "message": "Your response to the user",
    "data": {
      "${currentStep}": "Extracted information"
    },
    "nextStep": "${nextStep}"
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