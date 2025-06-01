// TO DO: create submissions table which includes type of exam, score and time taken
// implement updating this table into the submit/score handler/method
import { query } from '../../lib/db'

function evaluateResponses(responses) {
  const correct = responses.filter(r => r.is_correct).length;

  const question_responses = responses.map(r => ({
    question_id: r.question_id,
    question_number: r.question_number,
    is_correct: r.is_correct
  }));

  return { correct, question_responses };
}

export default async function handler(req, res) {
  const { method, query: queryParams, body } = req

  // 📤 POST: Save a new response
  if (method === 'POST') {
    const { session_id, question_id, answer_id } = body

    // Get correct status
    let is_correct;

    if (answer_id === undefined || answer_id === null) {
      // If no answer is selected, treat it as unattempted
      is_correct = null;
    } else {
      // Else, look up the answer to determine if it's correct
      const correct = await query(`
        SELECT is_correct FROM answers WHERE id = $1
      `, [answer_id]);
      is_correct = correct[0]?.is_correct ?? false;
    }
    console.log('Saving response:', { session_id, question_id, answer_id, is_correct })
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
    ORDER BY q.question_number;
  `;

  // practice mode: only the questions attempted in this session are scored
  if (method === 'GET' && queryParams.session_id && !queryParams.exam_id) {
    const { session_id } = queryParams
    
    const result = await query(responseQuery, [session_id]);
    const attempted = result.filter(r => r.is_correct !== null);
    const total = attempted.length

    const { correct, question_responses } = evaluateResponses(result);
    return res.status(200).json({ correct, total, question_responses });
  }

  // exam mode: questions are scored based on number of questions in the exam, 
  if (method === 'GET' && queryParams.session_id && queryParams.exam_id) {
    const session_id = queryParams.session_id;
    const exam_id = queryParams.exam_id;
    const time_taken = queryParams.time_taken

    // Count query: count total questions for the exam
    const countQuery = `SELECT COUNT(*) FROM questions WHERE exam_id = $1`;

    try {
      // Run both queries separately
      const responseResult = await query(responseQuery, [session_id]);
      const countResult = await query(countQuery, [exam_id]);
      
      const total = parseInt(countResult[0].count, 10);
      const { correct, question_responses } = evaluateResponses(responseResult);
      return res.status(200).json({ correct, total, question_responses, time_taken });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}