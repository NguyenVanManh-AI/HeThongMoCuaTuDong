import messaging from '@react-native-firebase/messaging';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/authContext';
import AddFace from '../screens/AddFace';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Notifys from '../screens/Notifys';
import OpenDoor from '../screens/OpenDoor';
import User from '../screens/User';
import { AddDeviceTokenToFirebase } from '../utils/firebaseHelper';
import { DataContext } from '../contexts/dataContext';
import { View } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo';
import ChatList from '../Chat/ChatList';
const Tab = createBottomTabNavigator();

export default function TabNavigator({ route }) {
  const netInfor = useNetInfo();
  const { user } = useContext(AuthContext);
  const { newData: { isHasNewHistory, isHasNewNotify } } = useContext(DataContext)
  console.log(route);

  useFocusEffect(
    React.useCallback(() => {
      const unsub = async () => {
        console.log(user, 'user');
        if (user && netInfor.isConnected) {
          await messaging().registerDeviceForRemoteMessages();
          const token = await messaging().getToken();
          const result = await AddDeviceTokenToFirebase(user.phone, token)
          console.log(result);
        }
      };
      unsub();
      return () => {
        unsub;
      };
    }, [user, netInfor]),
  );

  if (!user) return <Login />;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'dodgerblue',
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            isHasNewHistory ? <Icon name="home" color={"red"} size={size + 2} />
              : <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='ChatList'
        component={ChatList}
        options={{
          headerShown: false,
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chat" color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="AddFace"
        initialParams={
          route?.params?.screen === 'AddFace'
            ? { message: route.params.message }
            : ''
        }
        component={AddFace}
        options={{
          tabBarLabel: 'AddFace',
          tabBarIcon: ({ color, size }) => (
            <Icon name="face" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="OpenDoor"
        component={OpenDoor}
        options={{
          tabBarLabel: 'OpenDoor',
          tabBarIcon: ({ color, size }) => (
            <Icon name="sensor-door" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Notifys"
        component={Notifys}
        options={{
          tabBarLabel: 'Notifys',
          tabBarIcon: ({ color, size }) => (
            isHasNewNotify ? <Icon name="notifications-active" color={"red"} size={size + 2} />
              : <Icon name="notifications-active" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="User"
        component={User}
        options={{
          tabBarLabel: 'User',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle" color={color} size={size} />
          ),
          // headerShown: false 
        }}
      />
    </Tab.Navigator>
  );
}
