
// Based off of WiFiClient.ino from the ESP examples
//Also: https://randomnerdtutorials.com/esp32-http-get-post-arduino/
// for getting MAC address: https://randomnerdtutorials.com/get-change-esp32-esp8266-mac-address-arduino/

#include <Arduino.h>
#include <WiFi.h>
#include <esp_wifi.h>
#include <HTTPClient.h>     // Sending GET/POST requests to API server
#include <Arduino_JSON.h>   //JSON parsing
#include <Preferences.h>    //Non-volitile memory access

#include "./wifi_creds.h"
// ^^^^^^^^^^^^^^^^^^^^^^ Using .gitignored file for git safety
//const char *ssid = "***";
//const char *password = "***";

#define updateCycle 5000 //check in witht he server every updataCycle number of ms

#define apiServer "192.168.0.100"
#define apiPort 5173
String serverPath;

//API Paths
const char* apiTime = "/api/time";
const char* apiPoke = "/api/poke";
const char* apiESPStatus = "/api/espStatus/";
const char* apiInitialStatus = "/api/InitialStatus/";

// Just makes the basic server call
// Only passes back a string if 200 was returned
// String is raw output returned from the request
String apiGETRequest(const String& server, const char* apiPath);

//Basic POST server call
//postData needs to be JSON string
//Otherwise similar to apiGETrequest
String apiPOSTRequest(const String& server, const char* apiPath, const String& postData);

//Returns system's mac address, use with API calls
String getMacAddress();

Preferences longTerm; //Non-volitile memory access
String nodeName; //Working memory to hold this particular node's name, this is stored in non-volitile memory (longTerm) and set by API call
String nodeDescription; // Similar to above, but for node description

String macAddress; // Read at start up, used to index for all API calls

JSONVar jsonResponse; //Used as global for speed / memory optimization

//Takes current jsonResponse and checks to see if nodeName / nodeDescription has changed
//TODO: might want to also check ligh status
void updateState();

void setup() {
  Serial.begin(115200);
  //TODO: set up test to not do printing if serial is not set up

  // connect to a WiFi network
  Serial.println();
  Serial.println("******************************************************");
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  //Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  //Confirm WIFI connection
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  //TODO: probably want a LED for status

  //Grab and store mac address.
  macAddress = getMacAddress();
  Serial.println("MAC Address: " + macAddress);

  //Non-volitile memory setup
  longTerm.begin("nonVMem",false);
  nodeName = longTerm.getString("name","NEW_NODE");
  nodeDescription = longTerm.getString("desc","UNCONFIGURED! set via web interface");
  //longTerm.end();

  //Set this up for the loop
  serverPath = String("http://" + String(apiServer) + ":" + String(apiPort));

  bool connected = false;
  while(!connected){ //Keep doing this until connected
    //Send initial status (informing server of name/description)
    jsonResponse = JSON.parse(apiPOSTRequest(serverPath,apiInitialStatus,
    "{\"mac\":\"" + macAddress + "\","+
    "\"name\":\"" + nodeName + "\"," +
    "\"description\": \"" + nodeDescription + "\"}"));

    if(JSON.typeof(jsonResponse) == "undefined"){
      Serial.println("Unable to connect to server to set up initial connection!");
      //TODO: Long-term this is fine, we can keep going
      //      We may want to have some amount of re-tries while the main loop runs. 
      //      There is no reason we can't reconnect midway though
      delay(10000);
    } else {
      connected = true;
    }
  }

}

void loop() {

  Serial.println("Calling espStatus API");
  jsonResponse = JSON.parse(apiPOSTRequest(serverPath, apiESPStatus,"{\"mac\":\""+macAddress+"\"}"));
  if(JSON.typeof(jsonResponse) != "undefined"){
    Serial.print("Successfully parsed JSON object: ");
    Serial.println(jsonResponse);

    //Check for changes
    if( jsonResponse.hasOwnProperty("name") && jsonResponse.hasOwnProperty("description") ){
      //make sure there is a name/description to work with
      updateState(); //jsonResponse is passed globally
    }

    //re-send initial setup
    if(jsonResponse.hasOwnProperty("listError")){
      //don't really need to check more, if listError shows up, we should re-send status
      //We could handle this cleaner, but a soft-reset seems like an appropriate course of action if out of sync
      ESP.restart();
    }

    int curLight = jsonResponse["lighting"];
    Serial.println("Current lighting status: " + String(curLight));
  } else {
    Serial.println("JSON Parsing Error!");
  }

  
  Serial.println("Looping.");
  delay(10000);

}


String apiGETRequest(const String& server, const char* apiPath){
  HTTPClient http;

  String requestPath = String(server) + String(apiPath);

  Serial.println("GET Using serverPath: |" + requestPath + "|");
  http.begin(requestPath.c_str());

  int httpResponseCode = http.GET();
  String output = "";

  if(httpResponseCode == 200){
    output = http.getString();
    Serial.println("Successful HTTP Response. Data: |" + output + "|");
  } else {
    Serial.println("Problem in HTTP response:" + String(httpResponseCode));
  }

  //End connection
  http.end();
  return output;
}

String apiPOSTRequest(const String& server, const char* apiPath, const String& postData){
  HTTPClient http;

  String requestPath = String(server) + String(apiPath);

  Serial.println("POST Using serverPath: |" + requestPath + "| with postData: |" + postData +"|");
  http.begin(requestPath.c_str());
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(postData);
  String output = "";

  if(httpResponseCode == 200){
    output = http.getString();
    Serial.println("Successful HTTP Response. Data: |" + output + "|");
  } else {
    Serial.println("Problem in HTTP response:" + String(httpResponseCode));
  }

  //End connection
  http.end();
  return output;
}

String getMacAddress(){
  uint8_t baseMac[6];
  esp_err_t ret = esp_wifi_get_mac(WIFI_IF_STA, baseMac);
  if (ret == ESP_OK) {
    //Got the mac, need to parse into String
    String out = "";
    for(int i = 0; i < 6; i++){
      out += String(baseMac[i],HEX);
      //Possible issue: leading 0 will be ommitted, this means MAC won't necessarily be the same length every time
      //Still unique enough (which is good enough for what we are doing here)
    }
    return out;

  } else {
    Serial.println("#### Failed to read MAC address ####");
    return "";
  }
}

void updateState(){
  //Check nodeName
  if(nodeName != String(jsonResponse["name"])){
    String newName = jsonResponse["name"];
    Serial.println("New Name for Node! Old: " + nodeName + " New name: " + newName);
    //Store it long term
    longTerm.putString("name",newName);
    //Update current name
    nodeName = newName;

  }

  //Check nodeDescription
  if(nodeDescription != String(jsonResponse["description"])){
    String newDesc = jsonResponse["description"];
    Serial.println("New Description for Node! Old: " + nodeDescription + " New name: " + newDesc);
    longTerm.putString("desc",newDesc); //Store it long term
    nodeDescription = newDesc; //Update current description
  }

  //TODO: maywant to do something with light status as well
}

// Process for server
//   On start up:
//         make empty list of ESPs
//   When one first contacts, add to list
//   Everything should be based on MAC

//Process for ESP
// Should work even without network connection (i.e. run off previously configured state)
// boot up:
//    pull name/description from non-volitile memory
//    connect to server with name, description, mac address
//    This should 'setup' the node on the flask server (indexed by mac address)

// Loop:
//   If lighting changes (based on sensor / timing) update flask server
// Every updateCycle:
//     Ask server for status
//        update accordingly (name / description should be stored in non-volitile memory)
//        if lighting is different, change local state

//Old code for posterity
/*   //Testing out the Time API
  Serial.println("Calling Time API");
  //Grab the JSON response
  JSONVar timeJSON = JSON.parse(apiGETRequest(serverPath, apiTime));

  if(JSON.typeof(timeJSON) != "undefined"){
    Serial.print("Successfully parsed JSON object: ");
    Serial.println(timeJSON);

    double curTime = timeJSON["time"];
    Serial.println("Current time: " + String(curTime));
  } else {
    Serial.println("JSON Parsing Error!");
  }


  Serial.println("Calling Poke API");
  JSONVar pokeJSON = JSON.parse(apiGETRequest(serverPath, apiPoke));

  if(JSON.typeof(pokeJSON) != "undefined"){
    Serial.print("Successfully parsed JSON object: ");
    Serial.println(pokeJSON);

    int curPokes = pokeJSON["pokes"];
    Serial.println("Current number of pokes: " + String(curPokes));
  } else {
    Serial.println("JSON Parsing Error!");
  }
  */
