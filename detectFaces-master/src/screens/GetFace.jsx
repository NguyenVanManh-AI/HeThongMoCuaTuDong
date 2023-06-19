import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useContext, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { RNCamera } from "react-native-camera";
import { AuthContext } from "../contexts/authContext";
import ProgressCircle from "../lib/ProgressCircle";

export default function GetFace({ navigation, route }) {

  const type = RNCamera.Constants.Type.front;
  const { user: { phone } } = useContext(AuthContext)
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState()
  const [takePicture, setTakePicture] = useState(true)
  const w = Math.round(Dimensions.get('window').width)
  const h = Math.round(Dimensions.get('window').height)
  const [error, setError] = useState()
  const [cameraRef, setCameraRef] = useState()
  const handlerFace = async ({ faces }) => {
    const handle = async () => {
      try {
        if (takePicture) {
          const photo = await cameraRef.takePictureAsync({ quality: 0.5, doNotSave: false, base64: true, width: 480, height: 720 })
          setTakePicture(false)
          await uploadImage(photo.base64)
        }
      } catch (error) {
        console.log(count)
      }
    }
    await handle()
  }
  const uploadImage = async (image) => {
    const { phone } = JSON.parse(await AsyncStorage.getItem('user'))
    console.log(`${API_URL}:3000/api/upload`)
    axios.post(`${API_URL}:3000/api/upload`, { phone, name: route.params.name, count, image })
      .then(res => {
        console.log(res.data)
        while (true) {
          if (res.data.message === "success") {
            setTakePicture(true)
            setMessage(undefined)
            navigation.navigate("HomeTabs", { screen: "AddFace", message: "add face successfully" })
            ToastAndroid.show("Thêm khuôn mặt thành công", ToastAndroid.SHORT)
            return
          }
          if (res.data.message === "need further data") {
            if (5 - count == 0) {
              setMessage("Chờ xử lí")
              console.log("Chowf xuwr li")
            }
            else
              setMessage("Ok")
            setCount(count + 1)
            setTakePicture(true)
            return true
          }
          if (res.data.message)
            setTakePicture(true)
          setMessage(res.data.message)
          return true
        }
      })
      .catch(error => {
        setError(error.message)
        console.log(error)
      })
  }
  if (error) {
    navigation.navigate("HomeTabs", { screen: "AddFace", message: "add face successfully" })
    ToastAndroid.show(`${error}`, ToastAndroid.SHORT)
    return
  }
  return (
    <View style={styles.container}>
      <RNCamera
        ref={ref => { setCameraRef(ref) }}
        style={styles.camera}
        type={type}
        captureAudio={false}
        onFacesDetected={handlerFace}
        faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
      />
      <View
        style={{ position: "absolute", top: (h * 30 / 100), left: (w * 6 / 100) }}
      >
        <ProgressCircle
          value={1.0 * count / 5}
          size={88 / 100 * w}
          thickness={6}
          color="green"
          unfilledColor="gray"
          animationMethod="spring"
          animationConfig={{ speed: 4 }}
        ></ProgressCircle>
      </View>
      <View style={{ width: '100%', position: "absolute", top: h / 2, alignItems: "center" }}>
        {/* <Text style={styles.text}>{5 - count}</Text> */}
        {message && <Text style={styles.text}>{message}</Text>}
        {error && <Text style={styles.text}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
  },
  camera: {
    flexGrow: 1,
  },
  text: {
    fontSize: 30,
    color: "green",
  }
});

