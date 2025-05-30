// File: pages/[display_code]/exam.js
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { query } from '../../lib/db'
import styles from '../../styles/Exam.module.css'
import { v4 as uuidv4 } from 'uuid'
import QuestionViewer from '../../components/QuestionViewer'
import ReviewPane from '../../components/ReviewPane'

export default function ExamSimulator({ questions, exam }) {
  const router = useRouter()
  const mode = router.query.mode || 'exam'
  const isPractice = mode === 'practice'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [checked, setChecked] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(null)
  const sessionIdRef = useRef(uuidv4())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(exam.time_limit * 60)
  const timerRef = useRef()

useEffect(() => {
  if (isPractice) {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
  } else {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return () => clearInterval(timerRef.current)
}, [isPractice])
  const currentQuestion = reviewMode
    ? questions[reviewIndex]
    : questions[currentIndex]

  function handleSelect(answerId) {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }))
    setChecked(false)
  }

  async function saveResponse() {
    const qid = questions[currentIndex].id
    const aid = responses[qid]
    if (!aid) return

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
    const timeTaken = isPractice ? elapsedTime : exam.time_limit * 60 - timeLeft
    clearInterval(timerRef.current)
    setSubmitted(true)
    const res = await fetch(`/api/responses?session_id=${sessionIdRef.current}&exam_id=${exam.id}&time_taken=${timeTaken}`)
    const data = await res.json()
    setScore(data)
    handleStartReview(0)
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartReview = (index) => {
    setReviewIndex(index)
    setReviewMode(true)
    setChecked(false)
    setShowCorrect(false)
  }

  return (
    <div className={styles.container}>
      {!submitted && (
      <div className={styles.timer}>
        {isPractice ? (
          <>Time elapsed: <strong>{formatTime(elapsedTime)}</strong></>
        ) : (
          <>Time remaining: <strong>{formatTime(timeLeft)}</strong></>
        )}
      </div>
    )}

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
            setShowCorrect(false)
          }}
          onSubmit={async () => {
            await saveResponse()
            handleSubmitExam()
          }}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          disablePrevious={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
          showCheck={isPractice}
          showReveal={isPractice}
          onCheck={() => setChecked(true)}
          onReveal={() => setShowCorrect(prev => !prev)}
          isChecked={checked}
          showCorrect={showCorrect}
        />
      ) : submitted && score && reviewMode ? (
        
        <ReviewPane
          exam={exam}
          score={score}
          questions={questions}
          responses={responses}
          reviewIndex={reviewIndex}
          setReviewIndex={setReviewIndex}
          setReviewMode={setReviewMode}
          setChecked={setChecked}
          setShowCorrect={setShowCorrect}
          showCorrect={showCorrect}
          checked={checked}
          handleSelect={handleSelect}
        />
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
      label: String.fromCharCode(65 + row.display_order),
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
