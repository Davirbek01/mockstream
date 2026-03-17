import re

with open('landing.html', 'r', encoding='utf-8') as f:
    content = f.read()

reading_tests = """
    const cefrReadingTests = [
      { file: 'CEFR Reading.html?test=cefr-reading-test-01', name: 'CEFR Reading Test 01', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-02', name: 'CEFR Reading Test 02', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-03', name: 'CEFR Reading Test 03', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-04', name: 'CEFR Reading Test 04', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-05', name: 'CEFR Reading Test 05', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-06', name: 'CEFR Reading Test 06', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-07', name: 'CEFR Reading Test 07', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-08', name: 'CEFR Reading Test 08', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-09', name: 'CEFR Reading Test 09', icon: '📖', actionText: 'Take Test' },
      { file: 'CEFR Reading.html?test=cefr-reading-test-10', name: 'CEFR Reading Test 10', icon: '📖', actionText: 'Take Test' },
    ];

    const ieltsReadingTests = [
      { file: 'IELTS reading.html?test=ielts-reading-test-01.js', name: 'IELTS Reading Practice Test 01', icon: '📖', actionText: 'Take Test' },
      { file: 'IELTS reading.html?test=ielts-reading-test-02.js', name: 'IELTS Reading Practice Test 02', icon: '📖', actionText: 'Take Test' },
      { file: 'IELTS reading.html?test=ielts-reading-test-03.js', name: 'IELTS Reading Practice Test 03', icon: '📖', actionText: 'Take Test' },
      { file: 'IELTS reading.html?test=ielts-reading-test-04.js', name: 'IELTS Reading Practice Test 04', icon: '📖', actionText: 'Take Test' },
    ];
"""

# inject variables
if 'const cefrReadingTests =' not in content:
    content = content.replace('// ===== DYNAMIC ARTICLES MENU =====', '// ===== READING TESTS =====\n' + reading_tests + '\n    // ===== DYNAMIC ARTICLES MENU =====')

# patch category handler
if "category === 'cefr-reading'" not in content:
    content = content.replace("} else if (category === 'flashcards') {", "} else if (category === 'cefr-reading') {\n        items = cefrReadingTests;\n        icon = '📖';\n        title = 'CEFR Reading';\n        desc = 'Select a practice test';\n        actionText = 'Take Test';\n      } else if (category === 'ielts-reading') {\n        items = ieltsReadingTests;\n        icon = '🌍';\n        title = 'IELTS Reading';\n        desc = 'Select an official practice test';\n        actionText = 'Take Test';\n      } else if (category === 'flashcards') {")

# update selectReadingType
new_func = """      function selectReadingType(type) {
        closeReadingModal();
        if (type === 'ielts') {
          openCategoryModal('ielts-reading');
        } else {
          openCategoryModal('cefr-reading');
        }
      }"""
content = re.sub(r'function selectReadingType\(type\) \{[\s\S]*?\}', new_func, content)

# update click handler in loadLearningTool URL logic to call loadMock if it's a reading test
if "category === 'cefr-reading' || category === 'ielts-reading'" not in content:
    content = content.replace("if (category === 'cefr-listening' || category === 'ielts-listening')", "if (category === 'cefr-listening' || category === 'ielts-listening' || category === 'cefr-reading' || category === 'ielts-reading')")
    
    # Needs a small fix: we should rename the 2nd argument of loadMock from 'listening' to 'reading' dynamically based on category
    content = content.replace("""clickHandler = `loadMock('${pageUrl}', 'listening'); document.getElementById('categoryModal').classList.remove('show'); return false;`;""", """let mockType = category.includes('listening') ? 'listening' : (category.includes('reading') ? 'reading' : 'writing');\n             clickHandler = `loadMock('${pageUrl}', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); return false;`;""")

with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
