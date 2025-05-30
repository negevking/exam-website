import re
import json

# Read the markdown file
with open('./ENG2016/ENGAA 2016 Section 1.md', 'r', encoding='utf-8') as f:
    md = f.read()

# Pattern to match each question block (numbered, followed by text, then answers)
question_blocks = re.split(r'\n(?=\d+\s)', md)
print(f'Found {len(question_blocks)} question blocks.')
exam_json = [
    {
        'year': 2016,
        'subject': 'ENGAA',
        'section': 'Section 1',
        'time': '40',
        'calculator': False,
        'display_code': 'ENGAA2016',
    }
]

questions_json = []
answers_json = []
expected_q_number = 0

for block in question_blocks:
    block = block.strip()
    if not block:
        continue

    # Extract question number
    expected_q_number += 1
    q_number_match = re.match(r'^(\d+)\s+', block)
    if not q_number_match or int(q_number_match.group(1)) != expected_q_number:
        continue
    q_number = q_number_match.group(1)

    # Extract diagram (if any)
    img_match = re.search(r'!\[.*?\]\((.*?)\)', block)
    img_url = img_match.group(1) if img_match else None

    # Find where the answers start (first line starting with A-H)
    answer_start = None
    answer_label_match = re.search(r'^[A-H]\s', block, re.MULTILINE)
    if answer_label_match:
        answer_start = answer_label_match.start()
    
    # Question text is everything after the number up to the first answer
    if answer_start is not None:
        # Remove the question number from the start
        q_text = block[len(q_number):answer_start].strip()
    else:
        q_text = block[len(q_number):].strip()

    # Extract all answer options (A, B, C, ...)
    answers = re.findall(r'^([A-H])\s+(.*)', block, re.MULTILINE)

    questions_json.append({
        'q_number': q_number,
        'q_text': q_text,
        'diagram_url': img_url
    })

    # Add each answer as a separate row
    for ans in answers:
        answer_label, ans_text = ans
        answers_json.append({
            'question_number': q_number,
            'display_order': ord(answer_label.upper()) - ord('A'), 
            'answer_text': ans_text.strip()
        })

# Write to JSON
with open('ENGAA2016_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions_json, f, indent=2, ensure_ascii=False)

with open('ENGAA2016_answers.json', 'w', encoding='utf-8') as f:
    json.dump(answers_json, f, indent=2, ensure_ascii=False)

with open('ENGAA2016_exam.json', 'w', encoding='utf-8') as f:
    json.dump(exam_json, f, indent=2, ensure_ascii=False)

print(f'Extracted {len(questions_json)} questions and {len(answers_json)} answers.')