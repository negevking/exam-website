// File: pages/index.js
import { useRouter } from 'next/router'
import { query } from '../lib/db'

export default function HomePage({ years }) {
  const router = useRouter()

  const handleSelect = (year) => {
    router.push(`/questions/${year}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Cambridge Engineering Exam Practice</h1>
      <p className="mb-4 text-gray-700">Choose a paper to begin:</p>

      <div className="grid grid-cols-2 gap-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleSelect(year)}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            ENGAA {year}
          </button>
        ))}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const result = await query(`
    SELECT DISTINCT year
    FROM exams
    ORDER BY year ASC
  `)

  const years = result.map(row => row.exam_year)

  return { props: { years } }
}