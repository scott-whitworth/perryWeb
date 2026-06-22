
class ESP:
	def __init__(self,n,desc):
		self.name = n
		self.description = desc
		self.lighting = 0 # 0 is off, anything else is on TODO: maybe want to add move
		self.lastCheckIn = -1 #We need to have some kind of heartbeat / check in process

	def toString(self):
		return self.name + "," + self.description

	def toJson(self):
		return self.__dict__

#test = ESP("node1","Office ESP")

#print("Current ESP:", test)
#print("Specifically the name: ", test.name)
#print(test.toString())

#espList = [ ESP("node1","Office"), ESP("node2","Kitchen")]

#espNames =  "{\"esps\":["

#for esp in espList:
#	print(esp.toString())
#	print(esp.toJson())
#	espNames = espNames + "\"" + esp.name + "\","

#espNames = espNames + "]}"

#print(espNames)
