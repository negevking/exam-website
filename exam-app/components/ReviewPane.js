// File: components/ReviewPane.js
import { useState } from 'react'
import QuestionViewer from './QuestionViewer'
import styles from '../styles/Exam.module.css'

export default function ReviewPane({
  exam,
  score,
  timeTaken,
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

  const questionList = showIncorrectOnly
    ? score.incorrect_questions
    : [...score.correct_questions, ...score.incorrect_questions]

  const displayedQuestions = questionList.map(q => {
    const index = questions.findIndex(ques => ques.id === q.question_id)
    return { ...q, index }
  })

  return (
    <div className={styles.reviewContainer}>
      <div className={styles.reviewSidebar}>
        <h2>{exam.subject} {exam.year}</h2>
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
              className={`${styles.reviewItem} ${score.incorrect_questions.find(i => i.question_id === q.question_id) ? styles.incorrect : styles.correct}`}
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
          onSubmit={() => setReviewMode(false)}
          currentIndex={reviewIndex}
          totalQuestions={questions.length}
          disablePrevious={reviewIndex === 0}
          isLast={reviewIndex === questions.length - 1}
          showCheck={true}
          showReveal={true}
          onCheck={() => setChecked(true)}
          onReveal={() => setShowCorrect(prev => !prev)}
          isChecked={checked}
          showCorrect={showCorrect}
        />
      </div>
    </div>
  )
}