import React, { useEffect } from 'react'
import styles from '../styles/Exam.module.css'
import MathsHTML from './MathsHTML'
import { useRouter } from 'next/router'

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
  showSubmit = true,
  showWorkedSolution = false,
  onCheck,
  onReveal,
  isChecked,
  showCorrect
}) {
  const router = useRouter();
  return (
    <div className={styles.questionBox}>
      <div className={styles.questionContent}>
        <h2 className={styles.title}>Question {currentIndex + 1} of {totalQuestions}</h2>
        <div className={styles.questionTextDiagramContainer}>
          {/* Render HTML safely */}
          <div className={styles.questionText}>
            <MathsHTML content={question.question_text} className={styles.questionParagraphs} />
          </div>
          {question.diagram && (
            <div className={styles.diagramBox}>
              <img src={question.diagram} alt="question diagram" />
            </div>
          )}
        </div>
        <div className={styles.answerWorkedsolutionsContainer}>
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
                  <MathsHTML content={choice.text} answer={true} />
                </label>
              )
            })}
          </div>
        </div>
        {question.workedSolution && (
            <div className={styles.solutionBox}>
              <img src={question.diagram} alt="question diagram" />
            </div>
          )}
      </div>
      <div className={styles.actions}>
        <button
          onClick={onPrevious}
          disabled={disablePrevious}
          className={styles.checkBtn}
        >
          Previous
        </button>

        {/* // Submit or next button. Routes to end if in review mode */}
        <button
          onClick={() => {
            if (isLast) {
              if (showSubmit) {
                onSubmit();
              } else {
                router.push('/')
              }
            } else {
              onNext();
            }
          }}
          className={styles.nextBtn}
        >
          {isLast
            ? showSubmit
              ? 'Submit'
              : 'End Exam'
            : 'Next'}
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