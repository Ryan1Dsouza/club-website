import sys

filename = 'src/App.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "['/', '/team'].includes(pagePath)",
    "['/', '/team', '/recruitment'].includes(pagePath)"
)

content = content.replace(
    "['/', '/achievements', '/news', '/live-news'].includes(pagePath)",
    "['/', '/achievements', '/news', '/live-news', '/recruitment'].includes(pagePath)"
)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)
