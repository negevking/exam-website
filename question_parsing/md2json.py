import re
import json
import markdown
import os

# Specify the file path and exam metadata
file_path = 'd:/Documents/Work/WebDev/exam-website/question_parsing/ENGAA2016S1/ENGAA 2016 Section 1.md'
exam_time = '40'  # in minutes
exam_calculator = False  # whether a calculator is allowed
exam_display_code = 'ENGAA2016S1'

# Extract metadata from the file path
file_name = file_path.split('/')[-1]
metadata_match = re.match(r'(\w+)\s+(\d{4})\s+(Section\s+\d+)', file_name)
if metadata_match:
    exam_subject = metadata_match.group(1)
    exam_year = int(metadata_match.group(2))
    exam_section = metadata_match.group(3)
else:
    raise ValueError('File name does not match expected format.')


def md_to_custom_html(md_text):
    # 1. Replace inline math $...$ with \[ ... \]
    #    This assumes simple cases and not nested/multi-line math.
    #    Also replaces multiple occurrences.
    def replace_math(match):
        content = match.group(1)
        return f"\\({content}\\)"
    
    # Use regex to find $...$ (not preceded or followed by $)
    md_replaced = re.sub(r'\$(.+?)\$', replace_math, md_text)

    # 2. Split by newlines (supporting \n or \r\n)
    lines = re.split(r'\r?\n', md_replaced)

    # 3. Wrap each non-empty line in <p>...</p>
    wrapped_lines = [f"<p>{line}</p>" for line in lines if line.strip() != ""]

    # 4. Join all paragraphs into one HTML string
    html_result = '\n'.join(wrapped_lines)

    return html_result

# Read the markdown file
with open(file_path, 'r', encoding='utf-8') as f:
    md_lines = f.readlines()

exam_json = [
    {
        'year': exam_year,
        'subject': exam_subject,
        'section': exam_section,
        'time': exam_time,
        'calculator': exam_calculator,
        'display_code': exam_display_code,
    }
]

questions_json = []
answers_json = []

current_question = None
current_answers = []
expected_q_number = 1

for line in md_lines:
    line = line.strip()
    if not line:
        continue

    # Check if the line starts with a question number
    q_number_match = re.match(r'^(\d+)\s+(.*)', line)
    if q_number_match:
        # Check if the number detected is the expected question number
        q_number = int(q_number_match.group(1))
        if q_number != expected_q_number:
            # If not then its just part of the question text that starts with a number
            current_question['q_md'] += '\n ' + line
            continue

        # Otherwise its a new question - save the previous question and its answers
        if current_question:
            current_question['q_html'] = md_to_custom_html(current_question['q_md'])
            questions_json.append(current_question)

            for idx, ans in enumerate(current_answers):
                answers_json.append({
                    'question_number': current_question['q_number'],
                    'display_order': idx,
                    'answer_md': ans,
                    'answer_html': md_to_custom_html(ans)
                })

        expected_q_number += 1

        current_question = {
            'q_number': str(q_number),
            'q_md': q_number_match.group(2).strip(),  # Include the text following the question number
            'diagram_url': None
        }
        current_answers = []
        continue

    # Check if the line contains a diagram
    img_match = re.search(r'!\[.*?\]\((.*?)\)', line)
    if img_match and current_question:
        current_question['diagram_url'] = img_match.group(1)
        continue

    # Check if the line starts with an answer label (e.g., A, B, C)
    answer_match = re.match(r'^([A-H])\s+(.*)', line)
    if answer_match:
        answer_text = answer_match.group(2).strip()
        # Remove '\quad' if it appears at the start of the answer text
        answer_text = answer_text.replace("$\quad ", "$")
        current_answers.append(answer_text)
        continue

    # Otherwise, treat the line as part of the question text
    if current_question:
        current_question['q_md'] += '\n ' + line

# Save the last question and its answers
if current_question:
    current_question['q_html'] = md_to_custom_html(current_question['q_md'])
    questions_json.append(current_question)

    for idx, ans in enumerate(current_answers):
        answers_json.append({
            'question_number': current_question['q_number'],
            'display_order': idx,
            'answer_md': ans,
            'answer_html': md_to_custom_html(ans)
        })

# Write to JSON
folder_path = f'D:\\Documents\\Work\\WebDev\\exam-website\\question_parsing\\{exam_display_code}'
os.makedirs(folder_path, exist_ok=True)

with open(os.path.join(folder_path, f'{exam_display_code}_questions.json'), 'w', encoding='utf-8') as f:
    json.dump(questions_json, f, indent=2, ensure_ascii=False)

with open(os.path.join(folder_path, f'{exam_display_code}_answers.json'), 'w', encoding='utf-8') as f:
    json.dump(answers_json, f, indent=2, ensure_ascii=False)

with open(os.path.join(folder_path, f'{exam_display_code}_exam.json'), 'w', encoding='utf-8') as f:
    json.dump(exam_json, f, indent=2, ensure_ascii=False)

print(f'Extracted {len(questions_json)} questions and {len(answers_json)} answers.')