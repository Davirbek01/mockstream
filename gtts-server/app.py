from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import io
import zipfile
import os
import json
import urllib.request

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'service': 'Mock Stream GTTS Server'})


@app.route('/tts/audio', methods=['POST'])
def tts_audio():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    # Single phrase mode: { "phrase": "Hello world" }
    if 'phrase' in data:
        text = str(data['phrase']).strip()
        if not text:
            return jsonify({'error': 'Empty phrase'}), 400

        mp3_buf = io.BytesIO()
        tts = gTTS(text=text, lang='en')
        tts.write_to_fp(mp3_buf)
        mp3_buf.seek(0)

        # Return as ZIP (matching existing client expectations)
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('phrase.mp3', mp3_buf.read())
        zip_buf.seek(0)

        return send_file(zip_buf, mimetype='application/zip',
                         download_name='audio.zip')

    # Multi-sentence mode: { "sentence0": "...", "sentence1": "...", ... }
    sentences = {k: str(v).strip() for k, v in data.items()
                 if k.startswith('sentence') and str(v).strip()}

    if not sentences:
        return jsonify({'error': 'No sentences provided'}), 400

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for key in sorted(sentences.keys(),
                          key=lambda x: int(x.replace('sentence', '') or 0)):
            text = sentences[key]
            mp3_buf = io.BytesIO()
            tts = gTTS(text=text, lang='en')
            tts.write_to_fp(mp3_buf)
            zf.writestr(f'{key}.mp3', mp3_buf.getvalue())

    zip_buf.seek(0)
    return send_file(zip_buf, mimetype='application/zip',
                     download_name='audio.zip')


OLLAMA_URL = 'http://localhost:11434/api/generate'
OLLAMA_MODEL = 'gemma4:e4b'


@app.route('/grade', methods=['POST'])
def grade():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    prompt = str(data.get('prompt', '')).strip()
    text = str(data.get('text', '')).strip()
    grade_type = str(data.get('type', 'writing')).strip()  # 'writing' or 'speaking'

    if not prompt or not text:
        return jsonify({'error': 'Missing prompt or text'}), 400

    full_prompt = prompt + '\n\n' + text

    payload = json.dumps({
        'model': OLLAMA_MODEL,
        'prompt': full_prompt,
        'stream': False
    }).encode('utf-8')

    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        return jsonify({'ok': True, 'result': result.get('response', ''), 'model': OLLAMA_MODEL, 'type': grade_type})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 502


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
