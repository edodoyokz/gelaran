'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

export default function EventFaqManagementPage() {
  const params = useParams()
  const [faqs, setFaqs] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  
  const fetchFaqs = useCallback(async () => {
    const response = await fetch(`/api/organizer/events/${params.id}/faq`)
    if (response.ok) {
      const data = await response.json()
      setFaqs(data)
    }
  }, [params.id])
  
  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])
  
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    
    try {
      const response = await fetch(`/api/organizer/events/${params.id}/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer
        })
      })
      
      if (response.ok) {
        setNewQuestion('')
        setNewAnswer('')
        await fetchFaqs()
      }
    } catch (error) {
      alert('Failed to add FAQ')
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Event FAQs</h1>
      
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New FAQ</h2>
        
        <form onSubmit={handleAddFaq} className="space-y-4">
          <div>
            <label htmlFor="faq-question" className="block text-sm font-medium mb-2">Question</label>
            <input
              id="faq-question"
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="faq-answer" className="block text-sm font-medium mb-2">Answer</label>
            <textarea
              id="faq-answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              rows={4}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isAdding}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add FAQ'}
          </button>
        </form>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing FAQs</h2>
        
        {faqs.map((faq, index) => (
          <div key={faq.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">
              {index + 1}. {faq.question}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
