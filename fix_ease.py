import re
import glob
import os

files = glob.glob('com-passion/src/**/*.tsx', recursive=True) + glob.glob('com-passion/src/**/*.ts', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match ease: [a, b, c, d] and add ' as const' if not present
    new_content = re.sub(r'(ease:\s*\[[0-9\.\s,-]+\])(?!\s*as\s+const)', r'\1 as const', content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file}")
