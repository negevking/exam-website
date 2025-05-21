// File: pages/api/questions.js
import { query } from '../../lib/db'

export default async function handler(req, res) {
  const { year, number } = req.query

  const q = await query(`
    SELECT q.id, q.question_text, q.question_number, a.answer_text, a.display_order
    FROM questions q
    JOIN answers a ON q.id = a.question_id
    WHERE q.exam_year = $1 AND q.question_number = $2
    ORDER BY a.display_order ASC
  `, [year, number])

  if (q.length === 0) {
    return res.status(404).json({ message: "Question not found" })
  }

  const question = {
    question_text: q[0].question_text,
    question_number: q[0].question_number,
    choices: q.map(a => ({
      label: String.fromCharCode(65 + a.display_order),  // A, B, C, ...
      text: a.answer_text
    }))
  }

  res.status(200).json(question)
} 