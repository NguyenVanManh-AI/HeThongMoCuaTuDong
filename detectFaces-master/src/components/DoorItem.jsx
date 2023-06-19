import { API_URL } from '@env';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import deepEqual from 'deep-equal';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import prompt from 'react-native-prompt-android';
import ToggleSwitch from 'toggle-switch-react-native';
import { AuthContext } from '../contexts/authContext';




export default ({ address }) => {
    const { addressDoor, name, status } = address;
    const { user, setUser } = useContext(AuthContext);
    const { phone, owner } = user;
    const [loading, setLoading] = useState(false);
    useFocusEffect(
      React.useCallback(() => {
        const fetch = async () => {
          const door = (
            await firestore().collection('devices').doc(addressDoor).get()
          ).data();
          // console.log(door,"so sanh",address)
          if (!deepEqual(address, door)) {
            console.log('Sẽ cập nhật lại user do thay đổi trạng thái cửa')
            const newAddress = await Promise.all(user.devices.map(i => {
              if (i.addressDoor === door.addressDoor) return door;
              return i;
            }));
            setUser({ ...user, devices: newAddress });
            setLoading(false)
          }
        };
        const intervalId = setInterval(() => {
          fetch();
        }, 2000);
        return () => {
          clearInterval(intervalId);
        };
      }, [user]),
    );
  
    const handleTogglePress = async () => {
      setLoading(true);
      console.log(`${API_URL}:3000/lockDoor`)
      if (status) {
        axios.post(`${API_URL}:3000/lockDoor`, {
          phone,
          addressDoor,
        }).then(response => {
          console.log(response.data, 'Lock res');
  
        })
          .catch(error => {
            Alert.alert(`${error}`)
            setLoading(false)
  
          });
      } else {
        axios.post(`${API_URL}:3000/unlockDoor`, {
          phone,
          addressDoor,
        }).then(response => {
          console.log(response.data, 'Unlock res');
  
        })
          .catch(error => {
            Alert.alert(`${error}`)
            setLoading(false)
  
          });
      }
    };
    const handleLongPress = () => {
      prompt(
        'Enter name',
        `Enter name for ${addressDoor}`,
        [
          {
            text: 'Cancel',
            onPress: () => {
              console.log('Cancel Pressed');
            },
            style: 'cancel',
          },
          { text: 'OK', onPress: updateName },
        ],
        {
          type: 'text',
          cancelable: false,
          defaultValue: `${name}`,
          placeholder: 'Enter name',
        },
      );
    };
    const updateName = async name => {
      console.log(owner);
      if (owner == true) {
        await firestore()
          .collection('devices')
          .doc(addressDoor)
          .set({ name }, { merge: true });
        const newAddress = await Promise.all(user.devices.map(i => {
          if (i.addressDoor === address.addressDoor) return {...address,name};
          return i;
        }));
        setUser({ ...user, devices: newAddress });
      }
    };
    return (
      <TouchableOpacity onLongPress={handleLongPress}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: 'white',
            color: 'black',
            borderRadius: 10,
            margin: 8,
            padding: 8,
          }}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ color: 'black', fontSize: 16 }}>{addressDoor}</Text>
            <Text style={{ color: 'black', fontSize: 16 }}>{name}</Text>
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={status ? 'gray' : '#00ff00'}
            />
          ) : (
            <ToggleSwitch
              isOn={status}
              onColor="green"
              offColor="gray"
              onToggle={handleTogglePress}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  