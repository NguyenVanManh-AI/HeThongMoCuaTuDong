#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
#include <WiFiManager.h>
 
const char* WIFI_SSID = "My Duyen";
const char* WIFI_PASS = "0582484851";
 
WebServer server(80);
 

// variable
int statusLock = 0;
String responseStatus;
 
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
 
 
void  setup(){
  Serial.begin(115200);
  pinMode(13,OUTPUT);
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
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  WiFiManager wifiManager;
  wifiManager.autoConnect();

  // In địa chỉ IP của ESP32-CAM
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("http://");
  Serial.println(WiFi.localIP());
  Serial.println("  /cam-lo.jpg");
  Serial.println("  /cam-hi.jpg");
  Serial.println("  /cam-mid.jpg");
 
  server.on("/cam-lo.jpg", handleJpgLo);
  server.on("/cam-hi.jpg", handleJpgHi);
  server.on("/cam-mid.jpg", handleJpgMid);
  server.on("/unlock", HTTP_POST, handleUnlock);
  server.on("/getStatusLock",HTTP_POST,handleSendStatusLock);
  server.begin();
}
 
void loop()
{
  server.handleClient();
  
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
  if (data == "open"){
    digitalWrite(13,HIGH);
    delay(5000);
    digitalWrite(13,LOW);
    statusLock = 1;
  }
  else {
    digitalWrite(13,LOW);
    statusLock = 0;
  }

  Serial.println("Door unlocked");
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