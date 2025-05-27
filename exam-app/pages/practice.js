// File: pages/practice.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Practice.module.css'

export default function TopicPracticePage({ tags }) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState([])
  const [questionCount, setQuestionCount] = useState(20)
  const [excludeSeen, setExcludeSeen] = useState(true)

  const toggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  // Check if all tags are selected
  const allSelected = tags.length > 0 && selectedTags.length === tags.length

  // Toggle select/deselect all tags
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTags([])
    } else {
      setSelectedTags(tags.map(tag => tag.id))
    }
  }

  const handleStart = () => {
    if (selectedTags.length === 0) return alert('Please select at least one topic.')
    const tagParams = selectedTags.join(',')
    router.push(`/practice/start?tags=${tagParams}&count=${questionCount}&excludeSeen=${excludeSeen}`)
  }

  return (
    <div className={styles.container}>
      <h1>Select Topics for Practice</h1>

      <button
        className={styles.selectAllBtn}
        onClick={toggleSelectAll}
      >
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>

      <div className={styles.tagList}>
        {tags.map(tag => (
          <button
            key={tag.id}
            className={selectedTags.includes(tag.id) ? `${styles.tag} ${styles.selected}` : styles.tag}
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className={styles.settings}>
        <label>Number of Questions (1–50):</label>
        <input
          type="number"
          value={questionCount}
          onChange={e => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value))))}
          min={1}
          max={50}
        />
      </div>

      <div className={styles.settings}>
        <label>
          <input
            type="checkbox"
            checked={excludeSeen}
            onChange={() => setExcludeSeen(prev => !prev)}
          />{' '}
          Exclude questions I've already seen
        </label>
      </div>

      <button onClick={handleStart} className={styles.startBtn}>
        Start Practice
      </button>
    </div>
  )
}

export async function getServerSideProps() {
  const { query } = await import('../lib/db')
  const tags = await query('SELECT id, tag_name AS name FROM tag_list ORDER BY tag_name')
  return { props: { tags } }
}
