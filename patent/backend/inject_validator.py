"""Update backend min-chars validation from 20 to 60."""
with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the validation line
old_phrase = 'len(request.text.strip()) < 20'
new_phrase = 'len(request.text.strip()) < 60'

old_msg = 'Please provide at least 20 characters of case text.'
new_msg = 'Please provide at least 60 characters for a meaningful analysis.'

if old_phrase in content:
    content = content.replace(old_phrase, new_phrase, 1)
    content = content.replace(old_msg, new_msg, 1)
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('UPDATED: min chars changed to 60')
else:
    # Find current state
    for i, line in enumerate(content.split('\n')):
        if 'request.text' in line and 'len' in line:
            print(f'Line {i+1}: {line.strip()}')
