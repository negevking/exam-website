// File: components/Layout.js
import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Layout.module.css'
import { useEffect, useState } from 'react'

function daysUntilESAT(date = '2025-10-09') {
  const now = new Date()
  const examDate = new Date(date)
  const diffTime = examDate - now
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

export default function Layout({ children }) {
  const [days, setDays] = useState(0)

  useEffect(() => {
    setDays(daysUntilESAT())
  }, [])

  return (
    <>
      <Head>
        {/* Load MathJax from CDN */}
        <script
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        ></script>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.headerBtn}>Logo</Link>
          <div className={styles.headerBtn}>{days} days until ESAT</div>
          <Link href="/tuition" className={styles.headerBtn}>1:1 Tuition Link</Link>
        </header>

        <main className={styles.main}>{children}</main>

        <footer className={styles.footer}>
          <div className={styles.footerText}>
            &copy; {new Date().getFullYear()} Ben Silva
          </div>
          <Link href="/privacy" className={styles.footerBtn}>Privacy policy</Link>
          <Link href="/terms" className={styles.footerBtn}>T&amp;Cs</Link>
          <Link href="/contact" className={styles.footerBtn}>Contact form</Link>
        </footer>
      </div>
    </>
  )
}
