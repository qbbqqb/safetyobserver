import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatbotResponse(prompt: string): Promise<string> {
  try {
    console.log('Sending request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      n: 1,
      temperature: 0.7,
    });

    console.log('Received response from OpenAI API:', response);

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices returned from OpenAI API');
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response content from OpenAI API');
    }

    return content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}