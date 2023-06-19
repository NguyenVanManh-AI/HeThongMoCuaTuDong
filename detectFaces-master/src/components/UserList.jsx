import { API_URL } from '@env';
import firestore from "@react-native-firebase/firestore"
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/authContext';
import { useNetInfo } from '@react-native-community/netinfo';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import deepEqual from "deep-equal"
export default function UserList({ setUserListPanel }) {
  const [userList, setUserList] = useState([]);
  const { user } = useContext(AuthContext);
  const netInfor = useNetInfo();
  const navigation = useNavigation()

  useFocusEffect(
    React.useCallback(() => {
      const getUserListLocal = async () => {
        if (!userList) {
          setUserList(JSON.parse(await AsyncStorage.getItem('userList')))
        }
      }
      getUserListLocal()
      return () => {
        getUserListLocal
      }
    }, [userList])
  )
  useFocusEffect(
    React.useCallback(() => {

      if (user.owner && netInfor.isConnected) {
        console.log("Đã chạy tới đây")

        const userRef = firestore().collection("users").where("owner", "==", user.phone)
        const unsubscribe = userRef.onSnapshot(async snapshot => {
          const users = []
          await Promise.all(
            snapshot.docs.map(async doc => {
              const name = await doc.data().name
              const phone = await doc.data().phone
              if (doc.exists) {
                users.push({ name, phone })
              }
            })
          );

          if (userList?.length !== users.length || !deepEqual(userList, users)) {
            setUserList(users)
            await AsyncStorage.setItem("userList", JSON.stringify(users))
            console.log("Reset userList")
          }
        })
        return () => {
          unsubscribe();
        }
      }
    }, [netInfor, user])
  )

  return (
    <SafeAreaView>
      <TouchableOpacity style={{ left: "90%", marginRight: 20 }}
        onPress={() => { phones = userList.map(item => item.phone); navigation.navigate("ChatList", { phones }) }}
      >
        <Icon name="chat" size={30, 30} />
      </TouchableOpacity>
      {userList ? (
        userList.map(item => (
          <Item
            item={item}
            key={item.phone}
            setUserListPanel={setUserListPanel}
          />
        ))
      ) : (
        <Text style={{ textAlign: 'center', color: 'white', fontSize: 16 }}>
          Loading...
        </Text>
      )}
    </SafeAreaView>
  );
}

const Item = props => {
  const handleDelete = () => {
    axios
      .post(`${API_URL}:3000/users/deleteUser`, { phone: props.item.phone })
      .then(res => {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        props.setUserListPanel(false);
        props.setUserListPanel(true);
      })
      .catch(err => {
        ToastAndroid.show(err, ToastAndroid.SHORT);
      });
  };

  const handleLongPress = async () => {
    Alert.alert('Alert', 'Bạn có chắc chắn muốn xóa người dùng này', [
      {
        text: 'Cancel',
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          console.log(props.item.phone);
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
          borderRadius: 10,
          margin: 8,
          padding: 8,
          marginTop: 10,
        }}>
        <Text style={{ color: 'black', fontSize: 16 }}>
          <Text style={{ fontWeight: 'bold' }}>Name: </Text>
          {props.item.name}
        </Text>
        <Text style={{ color: 'black', fontSize: 16 }}>
          <Text style={{ fontWeight: 'bold' }}>Phone: </Text>
          {props.item.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
