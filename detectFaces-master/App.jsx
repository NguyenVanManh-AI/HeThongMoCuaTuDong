import messaging from '@react-native-firebase/messaging';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import TabNavigator from './src/components/TabNavigator';
import GetFace from './src/screens/GetFace';
import Notify from './src/screens/Notify';
import { useNavigation } from '@react-navigation/native';
import Chatting from './src/Chat/Chatting';
const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('HomeTabs');
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async ({ notification, data }) => {
      try {
        if (data.message) {

        }
        else {
          const message = notification.body;
          Alert.alert(notification.title, message, [
            {
              text: 'Cancel',
              onPress: () => { },
              style: 'cancel',
            },
            {
              text: 'View',
              onPress: () => {
                navigation.navigate('Notify', { id: data.id });
              },
            },
          ]);
        }
      } catch (error) {
        console.log(notification)
        Alert.alert(notification.title, notification.body)
      }
    });

    return unsubscribe;
  }, []);
  useEffect(
    useCallback(() => {
      const unsub = messaging().onNotificationOpenedApp(({ data }) => {
        // Lấy thông tin từ remoteMessage và chuyển hướng đến màn hình tương ứng
        // Ví dụ: chuyển đến màn hình Message với message ID
        if (data.message) {
          navigation.navigate('ChatList', { id: data.id, toChatting: true });
        }
        else {
          navigation.navigate('Notify', { id: data.id });
        }
      });
      return unsub
    }, []), []
  )

  console.log(initialRoute);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={TabNavigator} />
      <Stack.Screen name="GetFace" component={GetFace} />
      <Stack.Screen name="Notify" component={Notify} />
      <Stack.Screen name="Chatting" component={Chatting} />
    </Stack.Navigator>
  );
}

// import React, { useState } from 'react';
// import { View, Image, Button } from 'react-native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import RNFS from "react-native-fs"

// const App = () => {
//   const [image, setImage] = useState(null);

//   const takePicture = () => {
//     launchCamera({ mediaType: 'photo' }, ({assets}) => {
//       if (assets) {
//         setImage(assets[0].uri);
//         uploadImage(image);
//       }
//     });
//     console.log(image)
//   };

//   const choosePicture = () => {
//     launchImageLibrary({ mediaType: 'photo' }, (response) => {
//       if (!response.didCancel) {
//         setImage(assets[0].uri);
//         uploadImage(image);
//       }
//     });
//   };

//   const uploadImage =async (image) => {
//     try {
//       const base64Image = await RNFS.readFile(image,'base64')
//       await axios.post('http://192.168.1.5:3000/api/upload', { image:`${base64Image}` })
//     } catch (error) {
//       console.log(error)
//     }
//   };

//   return (
//     <View>{console.log(image)}
//       {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
//       <Button title="Take Picture" onPress={takePicture} />
//       <Button title="Choose Picture" onPress={choosePicture} />
//     </View>
//   );
// };

// 'use strict';
// import React, { PureComponent, useState } from 'react';
// import { AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { RNCamera } from 'react-native-camera';

// function App(){
//   const [camera,setCamera] = useState()
//   const takePicture = async () => {
//     if (camera) {
//       const options = { quality: 0.5, base64: true };
//       const data = await camera.takePictureAsync(options);
//       uploadImage(data.base64)
//       console.log(data);
//     }
//   };
//   const uploadImage =async (image) => {
//         try {
//           await axios.post('http://192.168.1.5:3000/api/upload', { image })
//         } catch (error) {
//           console.log(error)
//         }
//       };
//   return (
//     <View style={styles.container}>
//       <RNCamera
//         ref={ref => {
//           setCamera(ref)
//         }}
//         style={styles.preview}
//         type={RNCamera.Constants.Type.front}
//         flashMode={RNCamera.Constants.FlashMode.on}
//         captureAudio={false}
//         androidCameraPermissionOptions={{
//           title: 'Permission to use camera',
//           message: 'We need your permission to use your camera',
//           buttonPositive: 'Ok',
//           buttonNegative: 'Cancel',
//         }}
//       />
//       <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
//         <TouchableOpacity onPress={()=>{takePicture()}} style={styles.capture}>
//           <Text style={{ fontSize: 14 }}> SNAP </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     backgroundColor: 'black',
//   },
//   preview: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   capture: {
//     flex: 0,
//     backgroundColor: '#fff',
//     borderRadius: 5,
//     padding: 15,
//     paddingHorizontal: 20,
//     alignSelf: 'center',
//     margin: 20,
//   },
// });

// export default App;

// import {getDatabase,ref,set,onValue} from 'firebase/database';
// import React, { useState, useEffect } from 'react';
// import { FlatList, Text, View, TextInput, Button } from 'react-native';
// const InputText = () => {
//   const [text, setText] = useState('');
//   const db = getDatabase()
//   const handlePress = () => {
//     set(ref(db,'text/'+text),{
//       text
//     })
//     setText('');
//   };

//   return (
//     <View>
//       <TextInput
//         style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
//         onChangeText={(value) => setText(value)}
//         value={text}
//       />
//       <Button title="Send" onPress={handlePress} />
//     </View>
//   );
// };

// const MessageList = () => {
//   const [messages, setMessages] = useState([]);
//   const db = getDatabase()
//   useEffect(() => {
//     const databaseRef = ref(db,'text');
//     onValue(databaseRef,(snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const messages = Object.keys(data).map((key) => ({
//           key,
//           text: data[key].text,
//         }));
//         setMessages(messages);
//       }
//     });
//   }, []);

//   const renderItem = ({ item }) => <Text>{item.text}</Text>;

//   return (
//     <View>
//       <FlatList
//         data={messages}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.messages}
//       />
//     </View>
//   );
// };
// const App = () => {

//   return (
//     <View style={{ flex: 1 }}>
//       <InputText />
//       <MessageList />
//     </View>
//   );
// };

// export default App;

// import {Button, FlatList,Text, View} from "react-native"

// import firestore from '@react-native-firebase/firestore';

// export default function App(){

//   const unmount =async ()=>{
//   const res = await firestore().collection('users').get()
//   res.docs.forEach(doc => {
//   console.log(doc.id)})
//   }

//   return(
// <View>
// <Text>Hello world</Text>
// <Button title='set' onPress={unmount} />
// </View>
// )
// }
