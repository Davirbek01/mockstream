import re

with open('landing.html', 'r', encoding='utf-8') as f:
    content = f.read()

cefr_tests = """
    const cefrListeningTests = [
      { file: 'CEFR Listening.html?test=cefr-listening-test-01', name: 'CEFR Listening Test 01', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-02', name: 'CEFR Listening Test 02', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-03', name: 'CEFR Listening Test 03', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-04', name: 'CEFR Listening Test 04', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-05', name: 'CEFR Listening Test 05', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-06', name: 'CEFR Listening Test 06', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-07', name: 'CEFR Listening Test 07', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-08', name: 'CEFR Listening Test 08', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-09', name: 'CEFR Listening Test 09', icon: '🎧', actionText: 'Take Test' },
      { file: 'CEFR Listening.html?test=cefr-listening-test-10', name: 'CEFR Listening Test 10', icon: '🎧', actionText: 'Take Test' },
    ];

    const ieltsListeningTests = [
      { file: 'IELTS listening.html?test=ielts-listening-test-01', name: 'IELTS Listening Practice Test 01', icon: '🎧', actionText: 'Take Test' },
      { file: 'IELTS listening.html?test=ielts-listening-test-02', name: 'IELTS Listening Practice Test 02', icon: '🎧', actionText: 'Take Test' },
      { file: 'IELTS listening.html?test=ielts-listening-test-03', name: 'IELTS Listening Practice Test 03', icon: '🎧', actionText: 'Take Test' },
      { file: 'IELTS listening.html?test=ielts-listening-test-04', name: 'IELTS Listening Practice Test 04', icon: '🎧', actionText: 'Take Test' },
    ];
"""

# inject variables
if 'const cefrListeningTests =' not in content:
    content = content.replace('// ===== DYNAMIC ARTICLES MENU =====', '// ===== LISTENING TESTS =====\n' + cefr_tests + '\n    // ===== DYNAMIC ARTICLES MENU =====')

# patch category handler
if "category === 'cefr-listening'" not in content:
    content = content.replace("} else if (category === 'flashcards') {", "} else if (category === 'cefr-listening') {\n        items = cefrListeningTests;\n        icon = '🎧';\n        title = 'CEFR Listening';\n        desc = 'Select a practice test';\n        actionText = 'Take Test';\n      } else if (category === 'ielts-listening') {\n        items = ieltsListeningTests;\n        icon = '🌍';\n        title = 'IELTS Listening';\n        desc = 'Select an official practice test';\n        actionText = 'Take Test';\n      } else if (category === 'flashcards') {")

# update selectListeningType
new_func = """    function selectListeningType(type) {
      closeListeningModal();
      if (type === 'ielts') {
        openCategoryModal('ielts-listening');
      } else {
        openCategoryModal('cefr-listening');
      }
    }"""
content = re.sub(r'function selectListeningType\(type\) \{[\s\S]*?\}', new_func, content)

# update click handler in loadLearningTool URL logic to call loadMock if it's a listening test
load_logic = """          if (category === 'flashcards') {
            const baseName = item.file.replace('.js', '');
            pageUrl = `flashcards.html?topic=${baseName}`;
          } else {
            pageUrl = item.file;
          }
          let clickHandler = `loadLearningTool('${pageUrl}', '${loadType}'); return false;`;
          if (category === 'cefr-listening' || category === 'ielts-listening') {
             clickHandler = `loadMock('${pageUrl}', 'listening'); document.getElementById('categoryModal').classList.remove('show'); return false;`;
          }"""
content = content.replace("""          if (category === 'flashcards') {
            const baseName = item.file.replace('.js', '');
            pageUrl = `flashcards.html?topic=${baseName}`;
          } else {
            pageUrl = item.file;
          }""", load_logic)

content = content.replace("""<a href="#" onclick="loadLearningTool('${pageUrl}', '${loadType}'); return false;" class="category-modal-item">""", """<a href="#" onclick="${clickHandler}" class="category-modal-item">""")

with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
