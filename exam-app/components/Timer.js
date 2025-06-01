import React, { useEffect, useRef, useState } from 'react'
import styles from '../styles/Exam.module.css'

function Timer({ isPractice, timeLeft, handleSubmitExam }) {
  const [currentTime, setCurrentTime] = useState(timeLeft)
  const timerRef = useRef(null)

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

  return (
    <div className={styles.timer}>
      {isPractice ? (
        <>Time elapsed: <strong>{currentTime}</strong></>
      ) : (
        <>Time remaining: <strong>{currentTime}</strong></>
      )}
    </div>
  )
}

export default Timer