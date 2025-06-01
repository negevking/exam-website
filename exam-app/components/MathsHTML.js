import React, { useEffect, memo } from 'react'
import styles from '../styles/Exam.module.css'

function MathsHTML({ content, className, answer = false }) {
  useEffect(() => {
      if (window.MathJax) {
        window.MathJax.typesetPromise()
          .catch((err) => console.log('MathJax typeset failed:', err))
      }
    }, [content]) // re-run when content changes
  
  if (answer) {
    // If this is an answer, we use a different class for styling - we want it inline so we choose span
    return (
    <span
        className={ className }
        dangerouslySetInnerHTML={{ __html: content }}
      />
  )
  } else {
    return (
      <p
        className={ className }
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
  
}

export default memo(MathsHTML)
