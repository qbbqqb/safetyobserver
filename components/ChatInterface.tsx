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
      setObservationData(prev => {
        const updatedData = { ...prev, ...data.data };
        console.log('Updated observationData:', updatedData);
        return updatedData;
      })
      setCurrentStep(data.nextStep)
      console.log('Current step:', data.nextStep);

      if (data.nextStep === 'endConversation') {
        console.log('Conversation complete, preparing to save observation...');
        console.log('Final observationData:', observationData);
        await saveObservation()
        
        // Thank the user and confirm submission
        const thankYouMessage = { role: 'bot' as const, content: 'Thank you for submitting your safety observation. Your report has been successfully saved. Is there anything else I can help you with?' }
        setMessages(prev => [...prev, thankYouMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = { role: 'bot' as const, content: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const saveObservation = async () => {
    console.log('saveObservation function called');
    console.log('Attempting to save observation:', observationData);
    try {
      const finalObservationData = {
        ...observationData,
        timestamp: new Date(),
        severityLevel: observationData.severityLevel || 'medium',
        category: observationData.category || 'general',
        attachments: observationData.attachments || [],
        isAnonymous: !observationData.reporterName,
      };
      const docRef = await addDoc(collection(db, 'observations'), finalObservationData);
      console.log('Observation saved successfully. Document ID:', docRef.id);
      console.log('Saved data:', finalObservationData);
    } catch (error) {
      console.error('Error saving observation:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error:', error);
      }
      throw error; // Re-throw the error to be caught in handleSubmit
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