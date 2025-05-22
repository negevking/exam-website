import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../../styles/Exam.module.css'
import { query } from '../../lib/db'

export default function ExamPage({ questions, exam }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)

  if (!questions.length) {
    return <div className={styles.container}>No questions found for this exam.</div>
  }

  const question = questions[current]
  const correctAnswer = question.answers.find(a => a.is_correct)
  const selectedAnswer = question.answers.find(a => a.id === selected)
  const isCorrect = selectedAnswer && selectedAnswer.is_correct

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {exam.subject} - {exam.year} - {exam.section}
      </h2>
      <div className={styles.questionBox}>
        <div className={styles.questionText}>
          Q{current + 1}. {question.text}
        </div>
        <div className={styles.choices}>
          {question.answers.map((answer) => (
            <label key={answer.id} className={styles.choiceLabel}>
              <input
                type="radio"
                name="answer"
                value={answer.id}
                checked={selected === answer.id}
                onChange={() => {
                  setSelected(answer.id)
                  setShowResult(false)
                }}
              />
              {answer.answer}
            </label>
          ))}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.checkBtn}
            disabled={selected === null}
            onClick={() => setShowResult(true)}
          >
            Check Answer
          </button>
          <button
            className={styles.nextBtn}
            disabled={current === questions.length - 1}
            onClick={() => {
              setCurrent(current + 1)
              setSelected(null)
              setShowResult(false)
            }}
          >
            Next
          </button>
        </div>
        {showResult && (
          <div className={isCorrect ? styles.correct : styles.incorrect}>
            {isCorrect
              ? 'Correct!'
              : `Incorrect. Correct answer: ${correctAnswer ? correctAnswer.answer : ''}`}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { display_code } = params
  console.log('display_code', display_code)
  // Get exam info by display_code
  const examRows = await query(
  `SELECT id, subject, year, section FROM exams WHERE display_code = $1`,
  [display_code]
)
  console.log('examRows', examRows)
  const exam = examRows[0] || {}
  // Get all questions for this exam
  const questionsRaw = await query(
    `SELECT id, text, question_number FROM questions WHERE exam_id = $1 ORDER BY question_number`,
    [exam.id]
  )
  console.log('questionsRaw', questionsRaw)
  // Get all answers for these questions
  const questionIds = questionsRaw.map(q => q.id)
  let answersRaw = []
  if (questionIds.length) {
    answersRaw = await query(
      `
      SELECT id, question_id, text, is_correct, display_order
      FROM answers
      WHERE question_id IN (${questionIds.map((_, i) => `$${i + 1}`).join(',')})
      ORDER BY display_order
      `,
      questionIds
  )
}
  console.log('answersRaw', answersRaw)

  // Group answers by question_id
  const answersMap = {}
  answersRaw.forEach(a => {
    if (!answersMap[a.question_id]) answersMap[a.question_id] = []
    answersMap[a.question_id].push({
      id: a.id,
      answer: a.answer,
      is_correct: !!a.is_correct
    })
  })

  // Attach answers to questions
  const questions = questionsRaw.map(q => ({
    ...q,
    answers: answersMap[q.id] || []
  }))

  return {
    props: {
      questions,
      exam
    }
  }
}