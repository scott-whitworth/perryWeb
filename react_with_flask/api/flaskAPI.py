import time
from flask import Flask
from flask import jsonify, request
from esp import ESP

app = Flask(__name__)

pokes = 0

# Basic Server Check Info
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


#Testing State
espList = [ESP("node1","Office controler"),ESP("noDe2","Kitchen Controler"),ESP("node3","Basement Controller"),ESP("Marty","Chonky")]



# Routes
# FrontEnd

# GET getConnectedESPs
# Returns: {"esps":["name1","name2" ... ]}
# get a list of esps that have connected to the API server
# TODO: probably need to handle time-out / keepalive

@app.route('/api/getConnectedESPs')
def getConnectedESPs():

	# Start JSON
	espNames =  "{\"esps\":["

	for esp in espList: #Iterate over all ESPs in the list
        	espNames = espNames + "\"" + esp.name + "\","
		#done: check what happens for the last ','? Apparently it breaks the axios auto-JSON parse

	espNames = espNames[:-1] + "]}" #The -1 is to remove the last ,

	# should be in the form:  {"esps":["name1","name2" ... ]}
	return espNames

# POST turnOnESP -> {"esp":"name1"}
# Turn on the external components of  name1

# POST turnOffESP -> {"esp":"name1"}
# Turn off the external components of name1

# POST toggleESP -> {"esp":"name1"}
# Toggle the state of name1

# POST setLighting -> {"esp":"name1","lightSet":0/1}
# returns new lighting status: {"name":"name","lighting":0/1}
# Sets lighting to whatever is in lightSet (start by assuming 0 is off, 1 is on
@app.route('/api/setLighting/', methods=['POST'])
def setLighting():
	try:
		if request.method == 'POST':
			r_data = request.get_json()
			print("setLighting received data: ",r_data)

			for esp in espList:
				if esp.name == r_data['esp']:
					#Find the correct esp in the list, then set the lighting value
					esp.lighting = r_data['lightSet']
					return {"name":esp.name,"lighting":esp.lighting}
	except Exception as err:
		print('Error! :',err)
		return {"error":err}

# testing curl (in git bash): curl 192.168.0.100:5173/api/espStatus/ -X POST -H 'Content-Type: application/json' -d '{"esp":"node1"}'


# GET espStatus -> {"esp":"name1"} or {"index":1}
# Returns: {"name":"name1","index":1,"description":"Controller for office LEGOs","lighting":0}
# TODO: this seems like we might want to add more to this part
@app.route('/api/espStatus/', methods=['POST'])
def getESPStatus():
	error = None

	try:
		if request.method == 'POST':
			if request.is_json:
				r_data = request.get_json()
				print("espStatus received data: ", r_data)

				if r_data.get('esp'): #Check to see if it is in the form {"esp":"name1"}
					print("Attempting to get data for :", r_data['esp'])

					for i, esp in enumerate(espList): #Look through all the elements of espList
						if esp.name == r_data['esp']: # Looking for matching name
							return {"name":esp.name,"index":i,"description":esp.description,"lighting":esp.lighting}

					return {"error":"No ESP with that name found"}

				if r_data.get('index'): #Check form {"index":"1"}
					print("Attempting to get data for ESP[", r_data['index'],"]")

					i = int(r_data['index']) # save the copy/paste for below indexing
					return {"name":espList[i].name,"index":i,"description":espList[i].description,"lighting":espList[i].lighting}
	except Exception as err:
		return {"error":f"Error in espStatus {err=}, {type(err)=}"}

# POST configureESP -> {"esp":"name1","description":"Controller for office LEGOs"} or {"index":1,"name":"name1",(optional)"description":"Controller for office LEGOs"}
# Returns: {"reqStatus":"good|bad|other"}


# To ESPs
# TODO



