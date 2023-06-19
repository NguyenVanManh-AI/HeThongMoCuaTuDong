import { API_URL } from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import React, { useContext, useState } from "react"
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native"
import { useNetInfo } from '@react-native-community/netinfo';
import { AuthContext } from "../contexts/authContext"
export default function Faces() {
    const [registeredFaces, setRegisteredFaces] = useState()
    const { user } = useContext(AuthContext)
    const [network, setNetwork] = useState()
    const netInfor = useNetInfo();
    
    useFocusEffect(
        React.useCallback(() => {
            const getFacesLocal = async () => {
                if (!registeredFaces) {
                    setRegisteredFaces(JSON.parse(await AsyncStorage.getItem('faces')))
                }
            }
            getFacesLocal()
            return () => { getFacesLocal }
        }, [])
    )
    useFocusEffect(
        React.useCallback(() => {
            if(netInfor.isConnected){
            const fetch = async () => {
                console.log("use effect loop")
                axios.get(`${API_URL}:3000/face/${user.phone}`).then(async response=>{
                    const data = response.data.data
                    console.log(data)
                    if (data != registeredFaces) {
                        setRegisteredFaces(data)
                        await AsyncStorage.setItem('faces', JSON.stringify(data))
                    }
                }).catch(error=>{
                    setNetwork(error)

                })
            }
            const intervalId = setInterval(() => {
                fetch();
            }, 1000)
            return () => { clearInterval(intervalId) }
        }
        }, [registeredFaces, network,netInfor])
    )
    return (
        <View>
            <Text style={{ fontSize: 20 }}>Registered faces:</Text>
            <FlatList
                data={registeredFaces}
                renderItem={({ item }) => <Item face={item} />}
                keyExtractor={item => item.id}
                item
            >
            </FlatList>
        </View>
    )
}

const Item = ({face: {name, id}}) => {
  const handleDelete = async () => {
    axios
      .delete(`${API_URL}:3000/faces/${id}`)
      .then(response => {
        console.log(res);
      })
      .catch(error => {
        console.log(error.message);
      });
  };
  const handleLongPress = async () => {
    Alert.alert('Bạn có chắc xóa không', name, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          handleDelete();
        },
      },
    ]);
  };
  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View
        style={{
          backgroundColor: 'white',
          color: 'black',
          // borderRadius: 10,
          margin: 2,
          padding: 8,
        }}>
        <Text style={{color: 'black', fontSize: 16}}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};
