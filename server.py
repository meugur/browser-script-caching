
from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return "Testing server"

@app.route('/test-scripts')
def test_scripts():
    return render_template('test-scripts.html')

@app.route('/test-scripts-async')
def test_scripts_async():
    return render_template('test-scripts-async.html')

@app.route('/test-scripts-mixed')
def test_scripts_mixed():
    return render_template('test-scripts-mixed.html')

@app.route('/test-scripts-defer')
def test_scripts_defer():
    return render_template('test-scripts-defer.html')

@app.route('/test-scripts-dynamic')
def test_scripts_dynamic():
    return render_template('test-scripts-dynamic.html')

@app.route('/js/<path:path>')
def serve_js(path):
    return send_from_directory('js', path)
