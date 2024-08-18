'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { Observation } from '@/types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([])
  const [input, setInput] = useState('')
  const [observationData, setObservationData] = useState<Partial<Observation>>({})
  const [currentStep, setCurrentStep] = useState('location')
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'start', currentStep: 'initial', observationData: {} }),
        });

        if (!response.ok) throw new Error('Failed to get initial message');

        const data = await response.json();
        setMessages([{ role: 'bot', content: data.message }]);
        setCurrentStep(data.nextStep);
      } catch (error) {
        console.error('Error fetching initial message:', error);
        setMessages([{ role: 'bot', content: 'Welcome! Let\'s report a safety observation. What\'s the location of the incident?' }]);
      }
    };

    fetchInitialMessage();
  }, [])

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, currentStep, observationData }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const botMessage = { role: 'bot' as const, content: data.message }
      setMessages(prev => [...prev, botMessage])

      // Update observation data and move to next step
      setObservationData(prev => ({ ...prev, ...data.data }))
      setCurrentStep(data.nextStep)

      if (data.nextStep === 'complete') {
        await saveObservation()
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = { role: 'bot' as const, content: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const saveObservation = async () => {
    try {
      const docRef = await addDoc(collection(db, 'observations'), {
        ...observationData,
        timestamp: new Date(),
        attachments: [], // Implement file upload functionality separately
      })
      setMessages(prev => [...prev, { role: 'bot', content: `Thank you for your report. Your observation has been saved with ID: ${docRef.id}` }])
    } catch (error) {
      console.error('Error saving observation:', error)
      setMessages(prev => [...prev, { role: 'bot', content: 'There was an error saving your observation. Please try again.' }])
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-lg">
      <div ref={chatWindowRef} className="bg-gray-800 rounded-lg shadow-md p-4 h-[28rem] overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${
              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-gray-700 text-gray-100 border border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your response..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}