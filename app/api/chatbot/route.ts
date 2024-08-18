import { NextResponse } from 'next/server'
import { getChatbotResponse } from '@/lib/openai'
import { Observation } from '@/types'

export async function POST(req: Request) {
  try {
    const { message, currentStep, observationData } = await req.json();
    
    const response = await getChatbotResponse(message, currentStep, observationData as Partial<Observation>);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chatbot API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}