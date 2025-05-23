// File: pages/[display_code]/info.js
import { useRouter } from 'next/router'
import styles from '../../styles/Info.module.css'
import { query } from '../../lib/db'

export default function PaperInfoPage({ exam }) {
  const router = useRouter()
  const { display_code } = router.query

  return (
    <div className={styles.container}>
      {exam ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.bold}>{exam.subject} {exam.year} {exam.section}</h1>
            <p>Time limit: {exam.time_limit}</p>
            <p>Calculator: {exam.calculator_allowed ? 'Yes' : 'No'}</p>
          </div>

          <div className={styles.main}>
            <div className={styles.examBox}>
              <div className={styles.examTitle}>Launch Exam Mode</div>
              <div className={styles.examContent}>
                <p>You will answer all questions under timed conditions, with no feedback until the end. Perfect for simulating real test conditions.</p>
                <button
                  className={styles.partBtn}
                  onClick={() => router.push(`/${display_code}/exam`)}
                >
                  Start Exam Mode
                </button>
              </div>
            </div>

            <div className={styles.examBox}>
              <div className={styles.examTitle}>Launch Practice Mode</div>
              <div className={styles.examContent}>
                <p>Practice each question at your own pace, with optional hints, worked solutions, and the ability to check or retry questions.</p>
                <button
                  className={styles.partBtn}
                  onClick={() => router.push(`/${display_code}/practice`)}
                >
                  Start Practice Mode
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { display_code } = params
  const examRows = await query(
    `SELECT id, subject, year, section, calculator_allowed, time_limit FROM exams WHERE display_code = $1`,
    [display_code]
  )
  const exam = examRows[0] || null
  return {
    props: {
      exam
    }
  }
}