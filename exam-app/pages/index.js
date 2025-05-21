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
        <button className={styles.loginBtn} onClick={() => router.push('/login')}>
          login/signup
        </button>
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
                    {year.sections.map((section) => (
                      <button
                        key={section}
                        className={styles.partBtn}
                        onClick={() => router.push(`/questions/${exam.subject}/${year.year}/${section}`)}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  // Updated query and mapping for new keys
  const examsRaw = await query(`
    SELECT subject, year, section
    FROM exams
    ORDER BY subject, year, section
  `)

  // Transform to nested structure: [{subject, years:[{year, sections:[]}, ...]}, ...]
  const examsMap = {}
  examsRaw.forEach(({ subject, year, section }) => {
    if (!examsMap[subject]) examsMap[subject] = {}
    if (!examsMap[subject][year]) examsMap[subject][year] = []
    if (!examsMap[subject][year].includes(section)) examsMap[subject][year].push(section)
  })
  const exams = Object.entries(examsMap).map(([subject, yearsObj]) => ({
    subject,
    years: Object.entries(yearsObj).map(([year, sections]) => ({
      year,
      sections
    }))
  }))

  return { props: { exams } }
}