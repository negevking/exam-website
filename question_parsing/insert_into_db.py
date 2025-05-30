import json
import psycopg2
from dotenv import load_dotenv
import os

# === STEP 1: LOAD .env VARIABLES ===
load_dotenv('.env.pyth')

db_config = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT"))
}

# === STEP 2: LOAD JSON FILES ===
questions_path = "./ENGAA2016/ENGAA2016_questions.json"
answers_path = "./ENGAA2016/ENGAA2016_answers.json"
exam_path = "./ENGAA2016/ENGAA2016_exam.json"

with open(questions_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

with open(answers_path, "r", encoding="utf-8") as f:
    answers = json.load(f)

with open(exam_path, "r", encoding="utf-8") as f:
    exam_metadata = json.load(f)[0]

# === STEP 3: CONNECT AND INSERT ===
try:
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()

    # Insert exam metadata
    insert_exam_query = """
    INSERT INTO exams (year, subject, section, time_limit, calculator_allowed)
    VALUES (%s, %s, %s, %s, %s)
    RETURNING id
    """
    cursor.execute(insert_exam_query, (
        exam_metadata["year"],
        exam_metadata["subject"],
        exam_metadata["section"],
        exam_metadata["time"],
        exam_metadata["calculator"]
    ))
    exam_id = cursor.fetchone()[0]

    # Insert questions and fetch q_id
    insert_question_query = """
    INSERT INTO questions (exam_id, question_number, question_text, diagram_url)
    VALUES (%s, %s, %s, %s)
    RETURNING id
    """

    insert_answer_query = """
    INSERT INTO answers (question_id, display_order, answer_text)
    VALUES (%s, %s, %s)
    """

    for question in questions:
        cursor.execute(insert_question_query, (
            exam_id,
            question["q_number"],
            question["q_text"],
            question["diagram_url"]
        ))
        q_id = cursor.fetchone()[0]

        # Insert answers linked to the question
        for answer in answers:
            if answer["question_number"] == question["q_number"]:
                cursor.execute(insert_answer_query, (
                    q_id,
                    answer["display_order"],
                    answer["answer_text"]
                ))

    conn.commit()
    print(f"Inserted exam metadata, {len(questions)} questions, and {len(answers)} answers into the database.")

except Exception as e:
    print("Error inserting into database:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()