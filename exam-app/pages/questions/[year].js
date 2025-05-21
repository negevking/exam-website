// File: pages/questions/[year].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function QuestionPage() {
  const router = useRouter()
  const { year } = router.query

  const [questionNumber, setQuestionNumber] = useState(1)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (year) loadQuestion()
  }, [questionNumber, year])

  async function loadQuestion() {
    const res = await fetch(`/api/questions?year=${year}&number=${questionNumber}`)
    const data = await res.json()
    setQuestion(data)
    setSelected(null)
  }

  function nextQuestion() {
    setQuestionNumber(prev => prev + 1)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">ENGAA {year} — Question {questionNumber}</h1>
      {question ? (
        <>
          <p className="mb-6 whitespace-pre-wrap">{question.question_text}</p>
          <div className="space-y-3">
            {question.choices.map((choice, i) => (
              <label key={i} className="block">
                <input
                  type="radio"
                  name="choice"
                  value={choice.label}
                  checked={selected === choice.label}
                  onChange={() => setSelected(choice.label)}
                  className="mr-2"
                />
                {choice.label}. {choice.text}
              </label>
            ))}
          </div>
          <button
            onClick={nextQuestion}
            disabled={!selected}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </>
      ) : (
        <p>Loading question...</p>
      )}
    </div>
  )
}