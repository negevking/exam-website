// File: pages/[display_code]/exam.js
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { query } from '../../lib/db'
import styles from '../../styles/Exam.module.css'
import { v4 as uuidv4 } from 'uuid'
import QuestionViewer from '../../components/QuestionViewer'

export default function ExamSimulator({ questions, exam }) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [checked, setChecked] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)
  const sessionIdRef = useRef(uuidv4())
  const [timeLeft, setTimeLeft] = useState(exam.time_limit * 60)
  const timerRef = useRef()

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const currentQuestion = questions[currentIndex]

  function handleSelect(answerId) {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }))
    setChecked(false) // reset check state
  }

async function saveResponse() {
  const qid = questions[currentIndex].id
  const aid = responses[qid]

  if (!aid) return // optional: avoid saving empty response

  await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionIdRef.current,
      question_id: qid,
      answer_id: aid
    })
  })
}

  async function handleSubmitExam() {
    clearInterval(timerRef.current)
    setSubmitted(true)
    const res = await fetch(`/api/responses?session_id=${sessionIdRef.current}&exam_id=${exam.id}`)
    const data = await res.json()
    setScore(data)
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.timer}>Time remaining: <strong>{formatTime(timeLeft)}</strong></div>

      {!submitted ? (
        <QuestionViewer
          question={currentQuestion}
          selectedAnswer={responses[currentQuestion.id]}
          onSelect={handleSelect}
          onNext={async () => {
            await saveResponse()
            setCurrentIndex(i => i + 1)
            setChecked(false)
            setShowCorrect(false)
          }}
          onPrevious={async () => {
            await saveResponse()
            setCurrentIndex(i => i - 1)
            setChecked(false)
            setShowCorrect(false)}}
          onSubmit={async () => {
            await saveResponse()
            handleSubmitExam()
        } }
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          disablePrevious={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
          showCheck={true}
          showReveal={true}
          onCheck={() => setChecked(true)}
          onReveal={() => setShowCorrect(prev => !prev)}
          isChecked={checked}
          showCorrect={showCorrect}
        />
      ) : submitted && score ? (
            <div className={styles.questionBox}>
                <h2 className={styles.title}>Exam Complete</h2>
                <p>Your score: {score.correct} / {score.total}</p>
                <ul className={styles.choices}>
                {score.incorrect_questions.map(q => (
                    <li key={q.question_id} className={styles.incorrect}>
                    Question {q.question_number}: incorrect
                    </li>
                ))}
                </ul>
                <ul className={styles.choices}>
                {score.correct_questions.map(q => (
                    <li key={q.question_id} className={styles.correct}>
                    Question {q.question_number}: correct
                    </li>
                ))}
                </ul>
            </div>
        ) : submitted ? (
            <p className={styles.questionText}>Scoring your exam...</p>
        ) : null}
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { display_code } = params

  const examRows = await query(
    `SELECT id, subject, year, section, calculator_allowed, time_limit FROM exams WHERE display_code = $1`,
    [display_code]
  )
  const exam = examRows[0]

  const q = await query(`
    SELECT q.id, q.question_text, q.question_number, a.id AS answer_id, a.answer_text, a.display_order, a.is_correct
    FROM questions q
    JOIN answers a ON q.id = a.question_id
    WHERE q.exam_id = $1
    ORDER BY q.question_number ASC, a.display_order ASC
  `, [exam.id])

  const grouped = {}
  for (let row of q) {
    if (!grouped[row.id]) {
      grouped[row.id] = {
        id: row.id,
        question_text: row.question_text,
        question_number: row.question_number,
        choices: []
      }
    }
    grouped[row.id].choices.push({
      id: row.answer_id,
      text: row.answer_text,
      label: String.fromCharCode(64 + row.display_order),
      is_correct: row.is_correct
    })
  }

  const questions = Object.values(grouped)

  return {
    props: {
      questions,
      exam: {
        ...exam,
        time_limit: parseInt(exam.time_limit) || 60
      }
    }
  }
}