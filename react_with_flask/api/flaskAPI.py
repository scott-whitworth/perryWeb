import time
from flask import Flask

app = Flask(__name__)

pokes = 0

@app.route('/api/time')
def get_current_time():
	return {'time':time.time()}

@app.route('/api/getPokes')
def get_pokes():
	return {'pokes':pokes}

@app.route('/api/poke')
def poke():
	global pokes
	pokes = pokes + 1
	return {'pokes':pokes}
