'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Observation } from '@/types'

export default function DashboardStats() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        console.log('Attempting to fetch observations');
        const querySnapshot = await getDocs(collection(db, 'observations'));
        console.log('Query snapshot:', querySnapshot);
        const fetchedObservations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Observation));
        console.log('Fetched observations:', fetchedObservations);
        setObservations(fetchedObservations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching observations:', error);
        setError('Failed to fetch observations');
        setLoading(false);
      }
    }

    fetchObservations()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">Total Observations</h2>
        <p className="text-3xl font-bold text-white">{observations.length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">High Severity</h2>
        <p className="text-3xl font-bold text-white">{observations.filter(obs => obs.severityLevel === 'high').length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">Recent Observations</h2>
        <p className="text-3xl font-bold text-white">{observations.filter(obs => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(obs.timestamp) > oneWeekAgo;
        }).length}</p>
      </div>
    </div>
  )
}