from flask import Flask, request, render_template, jsonify
import os
from docx import Document
from concurrent.futures import ThreadPoolExecutor
from agents.medical_summarizer import medical_summarize
from agents.sentiment_analyzer import analyze_sentiment_intent
from agents.soap_generator import generate_soap_note
from agents.combiner import combine_outputs

app = Flask(__name__)
executor = ThreadPoolExecutor(max_workers=3)  # Allow concurrent execution

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def ignore_favicon():
    return '', 204  # No content response

@app.route('/process', methods=['POST'])
def process():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and allowed_file(file.filename):
        text = read_file(file)
        if text is None:
            return jsonify({'error': 'Failed to read file'}), 400
        
        # Run AI tasks concurrently
        with executor as pool:
            future_medical = pool.submit(medical_summarize, text)
            future_sentiment = pool.submit(analyze_sentiment_intent, text)
            future_soap = pool.submit(generate_soap_note, text)
            
            medical_summary = future_medical.result()
            sentiment_intent = future_sentiment.result()
            soap_note = future_soap.result()
        
        final_output = combine_outputs(medical_summary, sentiment_intent, soap_note)
        return jsonify(final_output)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'txt', 'docx'}

def read_file(file):
    if file.filename.endswith('.txt'):
        return file.read().decode('utf-8')
    elif file.filename.endswith('.docx'):
        try:
            doc = Document(file)
            return '\n'.join([para.text for para in doc.paragraphs])
        except Exception as e:
            print(f"Error reading .docx file: {e}")
            return None
    else:
        return None

if __name__ == '__main__':
    app.run(debug=True)
