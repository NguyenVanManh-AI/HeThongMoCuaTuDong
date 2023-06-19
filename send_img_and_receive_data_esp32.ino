#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
// #include "esp_camera.h"
// #include <WiFiManager.h>
#include <HTTPClient.h>
#include "BluetoothSerial.h"
#include "esp_bt_main.h"
#include "esp_bt_device.h"
#include <Arduino_JSON.h>
#include <EEPROM.h>
#include <esp_bt.h>
// #include <TaskScheduler.h>
// #include "driver/ledc.h"

#define LEDC_CHANNEL_0 0
#define LEDC_TIMER_13_BIT 13
#define LEDC_BASE_FREQ 5000
#define BT_SERIAL_PORT 1
#define _TASK_SCHEDULING_OPTIONS

const char* WIFI_SSID = "(^-^)";
const char* WIFI_PASS = "68709502";
const char* phoneESP = "0912459841";
IPAddress previousIP;
int valueSensor;
int checkWifi = 1;
WebServer server(80);

// variable
// Scheduler scheduler;
int statusLock = 0;
String responseStatus;
long previousMillis = -45000;
const long interval = 35000;
int timeRelay = 25000;
// boolean openDoor = False;
unsigned long timeOpen = 0;
unsigned long timeBuzzer = 0;
int checkLoa = 0;
int checkReg = 0;
unsigned long timeReg = 0;
#define eeprom_addr 0
#define echo 15
#define trig 14
#define relay 12
#define led 2
#define ledReg 4
#define buzzer 13

int channel = 0; // Use channel 0 for the tone
int toneResolution = 8; // Set the resolution of the tone
int frequency = 400; // Set the frequency of the tone in Hz
int dutyCycle = 128; // Set the duty cycle of the tone

void webServerTask();
// void handleBluetoothSerial();

// Task bluetoothTask(1000, TASK_FOREVER, &handleBluetoothSerial);
// Task wifiTask(500, TASK_FOREVER, &webServerTask);

String urlServer = "http://192.168.43.98:3000/";
static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);
void serveJpg()
{
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    server.send(503, "", "");
    return;
  }
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(),
                static_cast<int>(frame->size()));
 
  server.setContentLength(frame->size());
  server.send(200, "image/jpeg");
  WiFiClient client = server.client();
  frame->writeTo(client);
}
 
void handleJpgLo()
{
  if (!esp32cam::Camera.changeResolution(loRes)) {
    Serial.println("SET-LO-RES FAIL");
  }
  serveJpg();
}
 
void handleJpgHi()
{
  if (!esp32cam::Camera.changeResolution(hiRes)) {
    Serial.println("SET-HI-RES FAIL");
  }
  serveJpg();
}
 
void handleJpgMid()
{
  if (!esp32cam::Camera.changeResolution(midRes)) {
    Serial.println("SET-MID-RES FAIL");
  }
  serveJpg();
}
 
BluetoothSerial btSerial;
 


void  setup(){
  Serial.begin(115200);

  // ledcSetup(LEDC_CHANNEL_0, LEDC_BASE_FREQ, LEDC_TIMER_13_BIT);
  
  // // Cấu hình chân GPIO 5 là chân LEDC
  // ledcAttachPin(5, LEDC_CHANNEL_0);
  
  // // Đặt độ rộng xung và tần số cho LEDC
  // ledcWrite(LEDC_CHANNEL_0, 255); // độ rộng xung tối đa
  // ledcWriteTone(LEDC_CHANNEL_0, 1000); // tần số 1 kHz

  pinMode(relay,OUTPUT);
  pinMode(ledReg,OUTPUT);
  pinMode(led,OUTPUT);
  pinMode(buzzer,OUTPUT);
  pinMode(trig,OUTPUT);
  pinMode(echo,INPUT);
  
  digitalWrite(ledReg,HIGH);
  delay(500);
  digitalWrite(ledReg,LOW);

  ledcSetup(channel, frequency, toneResolution);
  ledcAttachPin(buzzer, channel);

  Serial.println();
  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);
 
    bool ok = Camera.begin(cfg);
    Serial.println(ok ? "CAMERA OK" : "CAMERA FAIL");
  }
  
  connectWifi(WIFI_SSID,WIFI_PASS);
  // preIp = WiFi.localIP().toString();
  // WiFiManager wifiManager;
  // wifiManager.autoConnect();

  // In địa chỉ IP của ESP32-CAM
  // Serial.print("IP address: ");
  // Serial.println(WiFi.localIP());
  

  // btSerial.begin("ESP32-CAM");
  // Serial.begin(115200);

  // Khởi tạo BluetoothSerial
  btSerial.begin("ESP32-BT");


  // In địa chỉ Bluetooth của ESP32-CAM
  // EEPROM.begin(512); // khởi tạo EEPROM với dung lượng 512 byte
  // EEPROM.get(eeprom_addr, previousIP); // đọc giá trị từ EEPROM
  // EEPROM.end();
  // Serial.print("ip da luu: ");
  // Serial.println(previousIP.toString());
  // if(previousIP != WiFi.localIP()){
    // sendIpToServer(previousIP,WiFi.localIP());
  // }
  // saveIP(WiFi.localIP());
  // previousIP = WiFi.localIP();
  

  Serial.println("  /cam-lo.jpg");
  Serial.println("  /cam-hi.jpg");
  Serial.println("  /cam-mid.jpg");
  server.on("/cam-lo.jpg", handleJpgLo);
  server.on("/cam-hi.jpg", handleJpgHi);
  server.on("/cam-mid.jpg", handleJpgMid);
  server.on("/unlock", HTTP_POST, handleUnlock);
  server.on("/getStatusLock",HTTP_POST,handleSendStatusLock);
  server.on("/getWifiAddress",HTTP_POST,handleGetWifiAddress);
  server.on("/getBluetoothAddress",HTTP_POST,handleGetBluetoothAddress);
  server.begin();

  // bluetoothTask.setSchedulingOption(TASK_SCHEDULE);
  // wifiTask.setSchedulingOption(TASK_SCHEDULE);
  // scheduler.init();
  // scheduler.addTask(wifiTask);
  // scheduler.addTask(bluetoothTask);

  // // Enable tasks
  // scheduler.enableAll();
  
}

int countDelay = 0; 



void loop()
{
  // Serial.print("wifi: ");
  // Serial.print(WiFi.isConnected());
  // Serial.print("   Bluetooth: ");
  // Serial.println(btSerial.connected());
  // handleBluetoothSerial();
  server.handleClient();
  // scheduler.execute();

  if(statusLock == 1 && millis() - timeOpen > timeRelay ){
    statusLock = 0;
    digitalWrite(relay,LOW);
    setStatusDoor();
  }

  if(millis() - timeReg > 90000){
    digitalWrite(led,LOW);
  }

  // if(millis() - timeBuzzer > 20000 && checkLoa == 1){
  //   noTone(buzzer);
  //   checkLoa = 0;
  // }
  
  unsigned long currentMillis = millis();
  // if (currentMillis - previousMillis >= interval &&  statusLock == 0) {
  if (currentMillis - previousMillis >= interval && statusLock == 0) {
    int distance = getDistance();
    if(distance <  10){
      ledcWriteTone(channel, frequency);
      delay(500);
      ledcWrite(channel, 0);
      JSONVar objJS;
      objJS["phone"]=phoneESP;
      IPAddress ip = WiFi.localIP();
      objJS["ipAddressESP"]= ip.toString();
      String dt = JSON.stringify(objJS) ;
      HTTPClient http;
      http.begin(urlServer + "recognize_face");
      http.addHeader("Content-Type", "text/plain");
      // String ipAddress = ip.toString();
      int httpCode = http.POST(dt);

      // int code = http.GET();
      Serial.println(httpCode);
      if(httpCode > 0) Serial.println("Gui thanh cong");
      else Serial.println("Co loi khi gui request");
      http.end();
      previousMillis = millis();
      // digitalWrite(ledReg,HIGH);
      timeReg = millis();
      checkReg = 1;
      digitalWrite(led,HIGH);
    }
  }
  if(millis() >  4294967290) previousMillis = 0;

  // if (btSerial.hasClient()) { // kiểm tra xem có thiết bị Bluetooth nào đó kết nối
  //   Serial.println("have connection");
  // }
  


  if(btSerial.hasClient()){
    if (btSerial.available()) { // kiểm tra xem có dữ liệu nhận được từ client hay không
      String data = btSerial.readString(); // đọc dữ liệu nhận được từ client
      Serial.println("Received data: " + data); // in ra dữ liệu trên Serial Monitor
      JSONVar jsonObj = JSON.parse(data);
      if(data.indexOf("reset") != -1) {
        ESP.restart();
      }
      // Truy xuất các giá trị từ đối tượng JSON và in chúng ra màn hình
      const char* phone = jsonObj["phone"];
      const char* wifiName = jsonObj["wifiName"];
      const char* password = jsonObj["password"];
      Serial.print("Phone: ");
      Serial.println(phone);
      Serial.print("Wifi name: ");
      Serial.println(wifiName);
      Serial.print("Password: ");
      Serial.println(password);
      if(data.indexOf("status") != -1){
        int status = jsonObj["status"];
        Serial.print("Status: ");
        Serial.println(status);
        if(status == 1) middlehandleUnlock("open");
        else if(status == 0){
        middlehandleUnlock("lock");
        setStatusDoor(); 
        }
      }
      else if(data.indexOf("wifiName") != -1) {
        if(strcmp(phone,phoneESP) == 0){
          Serial.println(phone);
          connectWifi(wifiName,password);
          // sendIpToServer(previousIP,WiFi.localIP());        
          // saveIP(WiFi.localIP());
        }
      }
    // btSerial.disconnect();
    }

    if(countDelay==1000){
      JSONVar object;
      object["status"]=statusLock;
      object["wifiName"]=WIFI_SSID;    
      object["password"]=WIFI_PASS;    
      String data = JSON.stringify(object) ;
      // Serial.println("Ban"+data); // in ra dữ liệu trên Serial Monitor
      btSerial.print(data);
      // btSerial.disconnect();
      countDelay=0;
      
    }
    countDelay+=100; 
    delay(100);
  }
  else {
    btSerial.disconnect();
    // server.begin();
    
  }


  if(Serial.available() > 0){
    String st = Serial.readString();
    st.trim();
    Serial.println("1");
    // if(st = "gui"){
    //   HTTPClient http;
    //   http.begin("http://192.168.43.5:3000/recognize_face");
    //   http.addHeader("Content-Type", "text/plain");
    //   IPAddress ip = WiFi.localIP();
    //   String ipAddress = ip.toString();
    //   int httpCode = http.POST(ipAddress);
    //   // int code = http.GET();
    //   Serial.println(httpCode);
    //   if(httpCode > 0) Serial.println("Gui thanh cong");
    //   else Serial.println("Co loi khi gui request");
    //   http.end();      
    //   // String data = "tao duy ne";
    //   // btSerial.print(data);
    // }
    if(st.indexOf("status") != -1){
      Serial.println("2");

    }
    else if(st.indexOf("wifiName") != -1){
      //  {"phone":"0912459841","wifiName":"My Duyen","password":"0582484851"}
      Serial.println("3");
      JSONVar jsonObj = JSON.parse(st);
      const char* phone = jsonObj["phone"];
      const char* wifiName = jsonObj["wifiName"];
      const char* password = jsonObj["password"];
      if(strcmp(phone,phoneESP) == 0){
        Serial.println(phone);
        connectWifi(wifiName,password);
        // sendIpToServer(previousIP,WiFi.localIP());        
        saveIP(WiFi.localIP());
      }
    }
    else if(st == "rom"){
      Serial.println("5");
      EEPROM.begin(512); // khởi tạo EEPROM với dung lượng 512 byte
      EEPROM.put(0, 347); // ghi giá trị vào EEPROM
      EEPROM.commit(); // lưu thay đổi vào EEPROM
      EEPROM.end(); // kết thúc sử dụng EEPROM
    }
  }
  
  // delay(500);
}

void saveIP(IPAddress ip) {
  // Lưu địa chỉ IP hiện tại vào EEPROM
  if(previousIP == ip)  Serial.println("giong dia chi wifi");
  else{
    Serial.println("wifi co thay doi");
    EEPROM.begin(512); // Khởi tạo EEPROM với dung lượng 512 byte
    EEPROM.put(eeprom_addr, ip); // Ghi địa chỉ IP hiện tại vào EEPROM
    EEPROM.commit(); // Lưu thay đổi vào EEPROM
    EEPROM.end(); // Kết thúc sử dụng EEPROM
    previousIP = WiFi.localIP();
  }
}

void connectWifi(const char* nameWifi,const char* pass){
  int count = 0;
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  // WiFi.channel(37);
  WiFi.begin(nameWifi, pass);
  while (WiFi.status() != WL_CONNECTED) {
    count++;
    delay(500);
    Serial.print(".");
    if(count >= 60) {
      checkWifi = 0;
      break;
    }
  }
  if(WiFi.status() == WL_CONNECTED) checkWifi = 1;
  Serial.print("http://");
  Serial.println(WiFi.localIP());
}

void sendIpToServer(IPAddress preIp,IPAddress newIp){
  JSONVar objJS;
  objJS["phone"]=phoneESP;
  objJS["previousIP"]= preIp.toString();    
  objJS["currentIP"]= newIp.toString();    
  String dt = JSON.stringify(objJS) ;
  HTTPClient http1;
  http1.begin(urlServer + "updateIP");
  http1.addHeader("Content-Type", "text/plain");
  int httpCode = http1.POST(dt);
  Serial.println(httpCode);
  http1.end();
}


void handleUnlock() {
  // Đọc dữ liệu gửi từ server
  String data = server.arg("data");

  // Xử lý dữ liệu và thực hiện mở cửa
  Serial.print("du lieu nhan duoc: ");
  Serial.println(data);
  data.trim();
  // Gửi phản hồi về server
  server.send(200, "text/plain", "Unlock successful");
  checkReg = 0;
  digitalWrite(led,LOW);
  if (data == "open"){
    Serial.println("successe recognize");
  }
  middlehandleUnlock(data);
}
void middlehandleUnlock(String data){
  if (data == "open"){
    Serial.println("successe recognize");
    statusLock = 1;
    digitalWrite(relay,HIGH);
    timeOpen = millis();
  }
  else if(data == "lock") {
    // tone(buzzer,300,2000);
    // noTone(12);
    // timeBuzzer = millis();
    // checkLoa = 1;
    digitalWrite(relay,LOW);
    digitalWrite(ledReg,LOW);
    statusLock = 0;
  }
  else if(data == "warning"){
    digitalWrite(relay,LOW);
    statusLock = 0;
    ledcWriteTone(channel, frequency);
    delay(1000);
    ledcWrite(channel, 0);
    delay(1000);
  }
}
void handleSendStatusLock(){
  if(statusLock == 1){
  responseStatus = "Opening";
  }
  else responseStatus = "Closing";
  Serial.print("Status lock: ");
  Serial.println(responseStatus);
  server.send(200,"text/plain",responseStatus);
}

int getDistance(){
  unsigned long duration;
  int distance;
  digitalWrite(trig, 0);
  delayMicroseconds(2);
  digitalWrite(trig, 1);
  delayMicroseconds(10);
  digitalWrite(trig, 0);
  duration = pulseIn(echo, HIGH);
  distance = int(duration * 0.034 / 2);
  return distance;
}

void handleGetBluetoothAddress(){
  String arr = "";
  const uint8_t* point = esp_bt_dev_get_address();
  for (int i = 0; i < 6; i++) {
    char str[3];
    sprintf(str, "%02X", (int)point[i]);
    arr += str;
    if (i < 5){
      arr += ":";
    }
  }
  server.send(200,"text/plain",arr) ;
}

void handleGetWifiAddress(){
  IPAddress ip = WiFi.localIP();
  String ipAddress = ip.toString();
  server.send(200,"text/plain",ipAddress) ;
}
void webServerTask(){
  server.handleClient();
}

void handleBluetoothSerial() {
  if (btSerial.available()) {
    Serial.println("check bluetooth");
    String data = btSerial.readString();
    Serial.println("Received data: " + data);
    // Xử lý các yêu cầu từ BluetoothSerial ở đây
    btSerial.disconnect();
  }
}
void setStatusDoor(){
  String ip = WiFi.localIP().toString();
  HTTPClient http1;
  http1.begin(urlServer + "lockFromESP");
  http1.addHeader("Content-Type", "text/plain");
  int httpCode = http1.POST(ip);
  Serial.println(httpCode);
  http1.end();
}



