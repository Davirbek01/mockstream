import os
import json
import re

directory = r"c:/Users/user/Desktop/Mock Stream/site/questions Articles"
articles = []

for i in range(1, 57):
    num = str(i).zfill(2)
    path = os.path.join(directory, f"article-{num}.js")
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            title_match = re.search(r'title:\s*["\'](.*?)["\']', content)
            title = title_match.group(1) if title_match else f"Article {num}"
            
            count = len(re.findall(r'definition:', content))
                
            articles.append({
                "num": num,
                "title": title,
                "vocab": count
            })

with open('c:/Users/user/Desktop/Mock Stream/site/articles_index.json', 'w') as f:
    json.dump(articles, f, indent=2)
print("Done")
