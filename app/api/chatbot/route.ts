import { NextResponse } from 'next/server'
import { getChatbotResponse } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await getChatbotResponse(message)
    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Error in chatbot API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}