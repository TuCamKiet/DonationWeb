import re

with open('com-passion/src/components/Photo.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add style to Props
content = re.sub(
    r'(\s+imgUrl\?: string;)(\n\})',
    r'\1\n  style?: React.CSSProperties;\2',
    content
)

# Add style to function args
content = re.sub(
    r'(\s+imgUrl,)(\n\}: Props)',
    r'\1\n  style,\2',
    content
)

# Add style to first div
content = re.sub(
    r'(style=\{\{ aspectRatio: ratio )(\}\})',
    r'\1, ...style \2',
    content
)

# Add style to second div
content = re.sub(
    r'(background: `linear-gradient\(135deg, \$\{art.from\}, \$\{art.to\}\)`,)(\n\s+\}\})',
    r'\1\n        ...style,\2',
    content
)

with open('com-passion/src/components/Photo.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
