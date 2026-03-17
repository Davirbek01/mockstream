import re
import json

# 1. Parse CEFR Speaking tests
with open('Speaking Mocks.html', 'r', encoding='utf-8') as f:
    cefr_html = f.read()

select_block = re.search(r'<select id="mockSelector"[^>]*>([\s\S]*?)</select>', cefr_html)
cefr_speaking_tests = []
if select_block:
    options = re.findall(r'<option value="([^"]*)"[^>]*>([^<]*)</option>', select_block.group(1))
    for val, text in options:
        if val and "questions" in val:
            name = text.replace('✓', '').replace('⏳', '').replace('🎯', '').replace('✅', '').strip()
            # Handle coming soon styling inside landing.html if needed, or just keep name
            cefr_speaking_tests.append({"file": val, "name": name})

# 2. Parse IELTS Speaking tests
with open('questions IELTS S/ielts-mocks-selection.js', 'r', encoding='utf-8') as f:
    ielts_js = f.read()

ielts_speaking_tests = []
# Extract window.IELTS_MOCKS_SELECTION = [ ... ];
match = re.search(r'window\.IELTS_MOCKS_SELECTION\s*=\s*(\[[\s\S]*?\]);', ielts_js)
if match:
    # Use simple regex to extract value and text since it's JS, not strict JSON
    entries = re.findall(r'\{\s*value:\s*"([^"]*)",\s*text:\s*"([^"]*)"[^}]*\}', match.group(1))
    for val, text in entries:
        if val:
            name = text.replace('✓', '').replace('⏳', '').replace('🎯', '').replace('✅', '').strip()
            ielts_speaking_tests.append({"file": val, "name": name})

# 3. Patch landing.html
with open('landing.html', 'r', encoding='utf-8') as f:
    landing = f.read()

# Create JS arrays strings
cefr_str = "    const cefrSpeakingTests = " + json.dumps(cefr_speaking_tests, indent=6) + ";\n"
ielts_str = "    const ieltsSpeakingTests = " + json.dumps(ielts_speaking_tests, indent=6) + ";\n"

# Inject arrays after flashcardTopics
landing = re.sub(r'(const flashcardTopics = \[[\s\S]*?\];)', r'\1\n\n' + cefr_str + '\n' + ielts_str, landing)

# Inject routing handling in selectSpeakingType
new_select_speaking = """    function selectSpeakingType(type) {
      closeSpeakingModal();
      if (type === 'ielts') {
        openCategoryModal('ielts-speaking');
      } else {
        openCategoryModal('cefr-speaking');
      }
    }"""
landing = re.sub(r'function selectSpeakingType\(type\) \{[\s\S]*?\}', new_select_speaking, landing)

# Inject openCategoryModal logic for speaking categories
new_modal_conditions = """      } else if (category === 'cefr-speaking') {
        items = cefrSpeakingTests;
        icon = '🎤';
        title = 'CEFR Speaking';
        desc = 'Select a practice test';
        actionText = 'Take Test';
      } else if (category === 'ielts-speaking') {
        items = ieltsSpeakingTests;
        icon = '🎙️';
        title = 'IELTS Speaking';
        desc = 'Select an official practice test';
        actionText = 'Take Test';
      } else if (category === 'flashcards') {"""
landing = landing.replace("} else if (category === 'flashcards') {", new_modal_conditions)

# Modify item generic generation logic to accommodate the download button for speaking mocks
item_gen_regex = r'(let clickHandler = `loadLearningTool\(.*?\)`;\n\s*if \(category ===) ([\s\S]*?)(          return `\n\s*<a href="#" onclick="\$\{clickHandler\}" class="category-modal-item">[\s\S]*?<\/a>`;\n\s*\}\)'

new_item_gen = """let clickHandler = `loadLearningTool('${pageUrl}', '${loadType}'); return false;`;
          let secondaryAction = '';
          
          if (category.includes('listening') || category.includes('reading') || category.includes('speaking')) {
            let mockType = category.includes('listening') ? 'listening' : (category.includes('reading') ? 'reading' : 'speaking');
            clickHandler = `loadMock('${pageUrl}', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); return false;`;
            
            // Speaking special logic: pass `&action=practice` to primary, add secondary download button
            if (category.includes('speaking')) {
               clickHandler = `loadMock('${pageUrl}&action=practice', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); return false;`;
               
               let downloadHandler = `loadMock('${pageUrl}&action=download', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); event.stopPropagation(); return false;`;
               secondaryAction = `<button onclick="${downloadHandler}" title="Download PDF" style="background:transparent;border:none;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.2s;" onmouseover="this.style.background='rgba(17,106,96,0.1)';this.style.transform='scale(1.1)';" onmouseout="this.style.background='transparent';this.style.transform='scale(1)';">📥</button>`;
            }
          }
          return `
            <a href="#" onclick="${clickHandler}" class="category-modal-item" style="display:flex;align-items:center;">
              <span class="item-icon">${itemIcon}</span>
              <span class="item-name" style="flex:1;">${item.name}</span>
              ${secondaryAction}
              <span class="item-action" style="margin-left:8px;">${actionText}</span>
            </a>`;
        }).join('');
"""

landing = re.sub(r'let clickHandler = `loadLearningTool\([\s\S]*?\}\)\.join\(\'\'\);', new_item_gen, landing)

with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(landing)

print("done")
