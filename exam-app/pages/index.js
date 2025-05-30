// File: pages/index.js
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import theme from '../styles/theme'
import styles from '../styles/Home.module.css'
import { query } from '../lib/db'

export default function HomePage({ exams }) {
  const router = useRouter()

  useEffect(() => {
    theme.forEach((color, idx) => {
      document.documentElement.style.setProperty(`--color${idx + 1}`, color)
    })
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          <span className={styles.bold}>Welcome to <u>exam prep</u></span>
        </h1>
      </header>
      <main className={styles.main}>
        {exams.map((exam) => (
          <section key={exam.subject} className={styles.examBox}>
            <div className={styles.examTitle}>{exam.subject}</div>
            <div className={styles.examContent}>
              {exam.years.map((year) => (
                <div key={year.year} className={styles.yearBlock}>
                  <div className={styles.yearLabel}>{year.year}</div>
                  <div className={styles.partsRow}>
                    {year.sections.map((sectionObj) => (
                      <button
                        key={sectionObj.section}
                        className={styles.partBtn}
                        onClick={() => router.push(`/${sectionObj.display_code}/info`)}
                      >
                        {sectionObj.section}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <button className={styles.loginBtn} onClick={() => router.push('/practice')}>
          Attempt questions sorted by topic
        </button>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  // Fetch all exams
  const examsRaw = await query(`
    SELECT subject, year, section, display_code
    FROM exams
    ORDER BY subject, year, section
  `)

  // Build a nested structure and preserve display_code for each section
  const examsMap = {}
  examsRaw.forEach(({ subject, year, section, display_code }) => {
    if (!examsMap[subject]) examsMap[subject] = {}
    if (!examsMap[subject][year]) examsMap[subject][year] = []
    // Store both section and display_code for each section
    examsMap[subject][year].push({ section, display_code })
  })

  const exams = Object.entries(examsMap).map(([subject, yearsObj]) => ({
    subject,
    years: Object.entries(yearsObj).map(([year, sectionsArr]) => ({
      year,
      sections: sectionsArr // array of { section, display_code }
    }))
  }))

  return { props: { exams } }
}