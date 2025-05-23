// File: components/QuestionViewer.js
import styles from '../styles/Exam.module.css'

export default function QuestionViewer({
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
  return (
    <div className={styles.questionBox}>
      <h2 className={styles.title}>Question {currentIndex + 1} of {totalQuestions}</h2>
      <p className={styles.questionText}>{question.question_text}</p>
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
              {choice.label}. {choice.text}
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