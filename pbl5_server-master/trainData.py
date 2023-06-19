import numpy as np
import os
from PIL import Image
from sqlite import getIdWithNameAndPhone
import cv2
def train():
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    path='dataSet'
    
    def getImagesWidthID(path):
        phonePaths=[os.path.join(path,f) for f in os.listdir(path)]
        namePaths=[[os.path.join(phonePath,f) for f in os.listdir(phonePath)] for phonePath in phonePaths]
        imagePaths=[]
        for phonePath in namePaths:
            for namePath in phonePath:
                for f in os.listdir(namePath):
                    imagePaths.append(os.path.join(namePath,f))
        faces=[]
        ids=[]
        for imagePath in imagePaths:
            faceImg=Image.open(imagePath).convert('L')
            faceNp=np.array(faceImg,'uint8')
            phone=imagePath.split('\\')[1].split('\\')[0]
            name=imagePath.split('\\')[2].split('\\')[0]

            faces.append(faceNp)
            ids.append(getIdWithNameAndPhone(name,phone))
            
        return faces,ids

    faces,ids = getImagesWidthID(path)
    if faces==[]:
        os.remove("recognizer/trainningData.xml")
        return
    recognizer.train(faces,np.array(ids))
    if not os.path.exists('recognizer'):
        os.makedirs('recognizer')
    recognizer.save('recognizer/trainningData.xml')


