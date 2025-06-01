import React, { useEffect } from 'react'
import styles from '../styles/Exam.module.css'


function QuestionViewer({
  question,
  selectedAnswer,
  onSelect,
  onNext,
  onPrevious,
  onSubmit,
  currentIndex,
  totalQuestions,
  disablePrevious = false,
  isLast = false,
  showCheck = false,
  showReveal = false,
  onCheck,
  onReveal,
  isChecked,
  showCorrect
}) {
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise()
        .catch((err) => console.log('MathJax typeset failed:', err))
    }
  }, [question]) // re-run when question changes

  return (
    <div className={styles.questionBox}>
      <h2 className={styles.title}>Question {currentIndex + 1} of {totalQuestions}</h2>
      {/* Render HTML safely */}
      <p
        className={styles.questionText}
        dangerouslySetInnerHTML={{ __html: question.question_text }}
      />
      <div className={styles.choices}>
        {question.choices.map(choice => {
          const isCorrect = choice.is_correct
          const isSelected = selectedAnswer === choice.id

          let choiceClass = styles.choiceLabel
          if (isChecked && isSelected) {
            choiceClass += isCorrect ? ` ${styles.correct}` : ` ${styles.incorrect}`
          }
          if (showCorrect && isCorrect) {
            choiceClass += ` ${styles.correct}`
          }

          return (
            <label key={choice.id} className={choiceClass}>
              <input
                type="radio"
                name="choice"
                value={choice.id}
                checked={isSelected}
                onChange={() => onSelect(choice.id)}
              />{' '}
              {choice.label}.{' '}
              <span dangerouslySetInnerHTML={{ __html: choice.text }} />
            </label>
          )
        })}
      </div>

      <div className={styles.actions}>
        <button
          onClick={onPrevious}
          disabled={disablePrevious}
          className={styles.checkBtn}
        >
          Previous
        </button>

        <button
          onClick={isLast ? onSubmit : onNext}
          className={styles.nextBtn}
        >
          {isLast ? 'Submit' : 'Next'}
        </button>

        {showCheck && (
          <button
            onClick={onCheck}
            className={styles.checkBtn}
          >
            Check
          </button>
        )}

        {showReveal && (
          <button
            onClick={onReveal}
            className={styles.checkBtn}
          >
            {showCorrect ? 'Hide Answer' : 'Show Answer'}
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(QuestionViewer)