import { query } from '../../lib/db'

export default async function handler(req, res) {
  const { method, query: queryParams, body } = req

  // 📤 POST: Save a new response
  if (method === 'POST') {
    const { session_id, question_id, answer_id } = body

    // Get correct status
    const correct = await query(`
      SELECT is_correct FROM answers WHERE id = $1
    `, [answer_id])
    const is_correct = correct[0]?.is_correct ?? false

    const result = await query(`
      INSERT INTO responses (session_id, question_id, answer_id, is_correct)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_id, question_id)
      DO UPDATE SET answer_id = $3, is_correct = $4
      RETURNING *
    `, [session_id, question_id, answer_id, is_correct])

    return res.status(200).json(result[0])
  }

  // 📥 GET: Return score summary
  
  // Base query: get responses joined with questions for the session
  // This query is used for both practice and exam modes
  const responseQuery = `
    SELECT r.question_id, q.question_number, r.is_correct
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.session_id = $1
  `;

  // practice mode: only the questions attempted in this session are scored
  if (method === 'GET' && queryParams.session_id && !queryParams.exam_id) {
    const { session_id } = queryParams
    
    const result = await query(responseQuery, [session_id]);

    const correct = result.filter(r => r.is_correct).length
    const total = result.length
    const incorrect_questions = result
      .filter(r => !r.is_correct)
      .map(r => ({
        question_id: r.question_id,
        question_number: r.question_number
      }))

    return res.status(200).json({ correct, total, incorrect_questions })
  }

  // exam mode: questions are scored based on number of questions in the exam, a
  if (method === 'GET' && queryParams.session_id && queryParams.exam_id) {
    const session_id = queryParams.session_id;
    const exam_id = queryParams.exam_id;
    console.log('exam_id', exam_id);
    // Count query: count total questions for the exam
    const countQuery = `SELECT COUNT(*) FROM questions WHERE exam_id = $1`;

    try {
      // Run both queries separately
      const responseResult = await query(responseQuery, [session_id]);
      const countResult = await query(countQuery, [exam_id]);
      console.log('countResult:', countResult);
      // Count total questions (count comes as a string, convert to number)
      const total = parseInt(countResult[0].count, 10);
      console.log('total:', total);
      // Filter responses for correct/incorrect
      const correct = responseResult.filter(r => r.is_correct).length;
      const incorrect_questions = responseResult
        .filter(r => !r.is_correct)
        .map(r => ({
          question_id: r.question_id,
          question_number: r.question_number,
        }));

      return res.status(200).json({ correct, total, incorrect_questions });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}