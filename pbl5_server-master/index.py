from flask import Flask, request, jsonify
import os
import base64
import cv2
import io
import numpy as np
import requests
from PIL import Image
from sqlite import insert, getNameFaceWithPhone, getNamePhonewithId, deleteFaceWithId
from trainData import train
from detectFaces import getFace
from firestore import updatePassword,addUser,addUserExists,resetVerifyCode,deviceIsInPhone,setStatusDoor,addHistory,getUserByPhone,getNameDevice,deleteUser
app = Flask(__name__)


@app.route("/")
def home():
    return "You can post to /api/upload."


@app.route("/users/updatePassword", methods=["POST"])
def updatePasswordAPI():
    data = request.get_json()
    if updatePassword(data["phone"], data["password"], data["newPassword"]):
        return jsonify({"message": "Update password successfully"})
    return jsonify({"message": "Password unchanged"}), 403


@app.route("/users/addUser", methods=["POST"])
def addUserAPI():
    data = request.get_json()
    res = addUser(data["phone"], data["name"],
                  data["phoneOwner"])
    if res == "exists account" or res == "no have owner":
        return jsonify({"message": res})
    return jsonify({"message": "Add account successfully"})


@app.route("/users/deleteUser", methods=["POST"])
def deleteUserAPI():
    data = request.get_json()
    res = deleteUser(data["phone"])
    return jsonify({"message": res})


@app.route("/users/addUserExists", methods=["POST"])
def addUserExistsAPI():
    data = request.get_json()
    res = addUserExists(data["phone"], data["name"],
                        data["phoneOwner"], data["verification"])
    if res == "error" or res == "verification code not match" or res == "no have owner":
        return jsonify({"message": res})
    return jsonify({"message": "Add account successfully"})


@app.route("/users/resendVerifyCode", methods=["POST"])
def resendVerifyCode():
    data = request.get_json()
    res = resetVerifyCode(data["phone"])
    if res:
        return jsonify({"message": "Resend success"})
    return jsonify({"message": "Resend error"})


@app.route("/users/addUserOwner", methods=["POST"])
def addUserOwner():
    data = request.get_json()

    return "abc"


@app.route("/faces/<id>", methods=["DELETE"])
def deleteFaceAPI(id):
    faces = getNamePhonewithId(id)
    if len(faces) == 0:
        return jsonify({"error": "face not found"}), 404
    face = faces[0]
    deleteFaceWithId(id)
    path = "./dataSet/"+face["phone"]+"/"+face["name"]
    for root, dirs, files in os.walk(path):
        for file in files:
            os.remove(os.path.join(root, file))
    try:
        os.rmdir(path)
    except:
        print("")
    train()
    return jsonify({"message": "face deleted successfully"}), 200


@app.route("/face/<phone>", methods=["GET"])
def getFacesAPI(phone):
    return jsonify({"data": getNameFaceWithPhone(phone)})


@app.route("/api/upload", methods=["POST"])
def upload():
    data = request.get_json()
    phone = data["phone"]
    name = data["name"]
    count = int(data["count"])
    image = data["image"]
    
    npImage = np.array(Image.open(io.BytesIO(base64.b64decode(image))),'uint8')
    
    resGetFace = getFace(cv2.flip(cv2.rotate(npImage, cv2.ROTATE_90_COUNTERCLOCKWISE),1),phone,name,count)
    if resGetFace=="Gan chut nua" or resGetFace=="Khong co mat":
        return jsonify({"message":resGetFace})
    if resGetFace==True:
        if count >= 5:
            insert(name, phone)
            train()
            return jsonify({"message": "success"})
        else:
            return jsonify({"message": "need further data"})
    return jsonify({"message": "khong co mat"})


@app.route('/unlockDoor', methods=['POST'])
def lockDoor():
    data = request.get_json()
    print(data)
    phone = data['phone']
    addressDoor = data['addressDoor']
    if not deviceIsInPhone(addressDoor, phone):
        return jsonify({'message': 'unauthorized'}), 400
    setStatusDoor(addressDoor,True)
    addHistory(addressDoor,getNameDevice(addressDoor)+' open by '+getUserByPhone(phone)['name'],phone)
    print('Unlocked')
    return jsonify({'message': "Unlocked"})


@app.route('/lockDoor', methods=['POST'])
def unlockDoor():
    
    data = request.get_json()
    phone = data['phone']
    addressDoor = data['addressDoor']

    if not deviceIsInPhone(addressDoor, phone):
        return jsonify({'message': 'unauthorized'}), 400

    setStatusDoor(addressDoor, False)
    print('Locked')
    # return jsonify({'status': response.status_code})
    return jsonify({'message': "Locked"})


if __name__ == "__main__":
    app.run(debug=True, host="192.168.43.98", port=os.environ.get("PORT", 3000))
