import json
import re

with open('articles_index.json', 'r', encoding='utf-8') as f:
    articles = json.load(f)

js_array = "    const readingArticles = [\n"
for a in articles:
    js_array += f"      {{ file: 'Articles.html?article={a['num']}', name: 'Article {a['num']}: {a['title'].replace(chr(39), chr(92)+chr(39))} ({a['vocab']} words)', icon: '📰' }},\n"
js_array += "    ];\n\n"

with open('landing.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject readingArticles
if 'readingArticles = [' not in content:
    content = content.replace('// ===== UPDATE LEARNING TOOLS COUNTS =====', '// ===== DYNAMIC ARTICLES MENU =====\n' + js_array + '    // ===== UPDATE LEARNING TOOLS COUNTS =====')

# 2. Update openCategoryModal logic
if "category === 'articles'" not in content:
    content = content.replace("} else if (category === 'flashcards') {", "} else if (category === 'articles') {\n        items = readingArticles;\n        icon = '📰';\n        title = 'Reading Articles';\n        desc = 'Tap an article to read and learn vocabulary';\n        actionText = 'Read';\n      } else if (category === 'flashcards') {")

# 3. Update onclick events
content = content.replace("onclick=\"loadLearningTool('Articles.html', 'articles'); toggleSidebar();\"", "onclick=\"openCategoryModal('articles'); toggleSidebar();\"")
content = content.replace("onclick=\"loadLearningTool('Articles.html', 'articles')\"", "onclick=\"openCategoryModal('articles')\"")

with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("landing.html patched successfully.")
