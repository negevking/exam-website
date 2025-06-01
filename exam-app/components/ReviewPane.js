// File: components/ReviewPane.js
import { useState } from 'react'
import QuestionViewer from './QuestionViewer'
import styles from '../styles/Exam.module.css'

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function ReviewPane({
  exam,
  score,
  questions,
  responses,
  reviewIndex,
  setReviewIndex,
  setReviewMode,
  setChecked,
  setShowCorrect,
  showCorrect,
  checked,
  handleSelect
}) {
  const handleClick = (index) => {
    setReviewIndex(index)
    setChecked(false)
    setShowCorrect(false)
  }

  const toggleShowIncorrectOnly = (e) => {
    setShowIncorrectOnly(e.target.checked)
  }

  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false)

  const timeTaken = formatTime(score.time_taken)

  const questionList = showIncorrectOnly
    ? score.question_responses.filter(q => q.is_correct === false)
    : score.question_responses

  const displayedQuestions = questionList.map(q => {
    const index = questions.findIndex(ques => ques.id === q.question_id)
    return { ...q, index }
  })

  return (
    <div className={styles.reviewContainer}>
      <div className={styles.reviewSidebar}>
        <h2>{exam.subject} {exam.year} {exam.section}</h2>
        <p>Score: {score.correct} / {score.total}</p>
        <p>Time Taken: {timeTaken}</p>

        <div className={styles.reviewOptions}>
          <label>
            <input
              type="checkbox"
              checked={showIncorrectOnly}
              onChange={toggleShowIncorrectOnly}
            />{' '}
            Show incorrect only
          </label>
        </div>

        <div className={styles.questionList}>
          {displayedQuestions.map(q => (
            <div
              key={q.question_id}
              className={`${styles.reviewItem} ${
                q.is_correct === true
                ? styles.correct
                : q.is_correct === false
                ? styles.incorrect
                : styles.unattempted}`}
              onClick={() => handleClick(q.index)}
            >
              Question {q.question_number}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.reviewMain}>
        <QuestionViewer
          question={questions[reviewIndex]}
          selectedAnswer={responses[questions[reviewIndex].id]}
          onSelect={handleSelect}
          onNext={() => setReviewIndex(i => Math.min(i + 1, questions.length - 1))}
          onPrevious={() => setReviewIndex(i => Math.max(i - 1, 0))}
          onSubmit={null}
          currentIndex={reviewIndex}
          totalQuestions={questions.length}
          disablePrevious={reviewIndex === 0}
          isLast={reviewIndex === questions.length - 1}
          showCheck={true}
          showReveal={true}
          showSubmit={false}
          showWorkedSolution={true}
          onCheck={() => setChecked(true)}
          onReveal={() => setShowCorrect(prev => !prev)}
          isChecked={checked}
          showCorrect={showCorrect}
        />
      </div>
    </div>
  )
}