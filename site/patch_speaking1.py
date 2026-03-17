import re

with open('Speaking Mocks.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make initializeQuestions aware of URL parameters
new_init = """    // Load default question file on page load
    async function initializeQuestions() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTest = urlParams.get('test');
      const urlAction = urlParams.get('action');
      
      const selector = document.getElementById('mockSelector');
      let defaultFile = selector ? selector.value : 'questions S/questions.js';
      
      if (urlTest) {
        defaultFile = urlTest;
        if (selector) {
          selector.value = defaultFile;
          selector.disabled = true; // Lock the selector if passed via URL
        }
      }

      try {
        await loadQuestionFile(defaultFile);
        applyDynamicSettings();
        
        // If action is download, trigger PDF download immediately
        if (urlAction === 'download') {
          setTimeout(() => {
            if (typeof downloadSpeakingPDF === 'function') {
              downloadSpeakingPDF();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Failed to load default questions:', error);
      }
    }"""

content = re.sub(r'// Load default question file on page load[\s\S]*?async function initializeQuestions\(\) \{[\s\S]*?\}', new_init, content)

with open('Speaking Mocks.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
