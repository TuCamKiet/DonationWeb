import re

with open('app/seed.py', 'r', encoding='utf-8') as f:
    content = f.read()

# For products: add image_url after story_slug
content = re.sub(r'("story_slug": ".*?",)', r'\1\n        "image_url": None,', content)
# For stories: add image_url after art (but avoid matching other art properties multiple times)
content = re.sub(r'("art": \{.*?\},)\n    \},', r'\1\n        "image_url": None,\n    },', content)

with open('app/seed.py', 'w', encoding='utf-8') as f:
    f.write(content)
