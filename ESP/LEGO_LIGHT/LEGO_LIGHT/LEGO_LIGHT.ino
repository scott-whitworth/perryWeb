
// Based off of WiFiClient.ino from the ESP examples
//Also: https://randomnerdtutorials.com/esp32-http-get-post-arduino/

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

#include "./wifi_creds.h"
// ^^^^^^^^^^^^^^^^^^^^^^ Using .gitignored file for git safety
//const char *ssid = "***";
//const char *password = "***";

#define apiServer "192.168.0.100"
#define apiPort 5173
String serverPath;

//API Paths
const char* apiTime = "/api/time";
const char* apiPoke = "/api/poke";

// Just makes the basic server call
// Only passes back a string if 200 was returned
// String is raw output returned from the request
String apiGETRequest(const String& server, const char* apiPath);

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

  //Set this up for the loop
  serverPath = String("http://" + String(apiServer) + ":" + String(apiPort));
}

void loop() {

  //Testing out the Time API
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
