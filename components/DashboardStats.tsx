'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Observation } from '@/types'

export default function DashboardStats() {
  const [observations, setObservations] = useState<Observation[]>([])

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'observations'))
        const fetchedObservations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Observation))
        setObservations(fetchedObservations)
      } catch (error) {
        console.error('Error fetching observations:', error)
      }
    }

    fetchObservations()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">Total Observations</h2>
        <p className="text-3xl font-bold">{observations.length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">High Severity</h2>
        <p className="text-3xl font-bold">{observations.filter(obs => obs.severityLevel === 'high').length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">Recent Observations</h2>
        <p className="text-3xl font-bold">{observations.filter(obs => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(obs.timestamp) > oneWeekAgo;
        }).length}</p>
      </div>
    </div>
  )
}