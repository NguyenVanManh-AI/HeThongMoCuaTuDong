import React, { createContext, useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import deepEqual from 'deep-equal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import { GetUserFirebase } from '../utils/firebaseHelper';
import logout from '../utils/logout';
export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [devicesUserRef, setDevicesUserRef] = useState();
  const netInfor = useNetInfo();
  useEffect(
    React.useCallback(() => {
      if (user && netInfor.isConnected) {
        const userRef = firestore().collection('users').doc(user.phone);
        const unsubscribe = userRef.onSnapshot(async doc => {
          const getUser = await GetUserFirebase(doc)
          if(!doc.data()) {
            logout(user,setUser)
            return
          }
          if (!deepEqual(getUser, user)) {
            console.log('set lai user o day');
            await AsyncStorage.setItem('user', JSON.stringify(getUser));
            setUser(getUser);
            setDevicesUserRef(doc.data().devices)
          }
          if(!devicesUserRef){
            setDevicesUserRef(doc.data().devices)
          }
        });
        
        return () => unsubscribe();
      }
    }, [user, netInfor]),
    [user, netInfor],
  );
  useEffect(
    React.useCallback(() => {
      if (user && devicesUserRef && netInfor.isConnected) {
        const unsubscribe = devicesUserRef.onSnapshot(async doc => {
          const docUser = await firestore().collection('users').doc(user.phone).get();
          const getUser = await GetUserFirebase(docUser)
          if (!deepEqual(getUser, user)) {
            console.log('set lai user o day');
            await AsyncStorage.setItem('user', JSON.stringify(getUser));
            setUser(getUser);
          }
        });
        
        return () => unsubscribe();
      }
    }, [user,devicesUserRef, netInfor]),
    [user,devicesUserRef, netInfor],
  );
  
  useEffect(
    React.useCallback(() => {
      const getRegisteredUser = async () => {
        const _user = JSON.parse(await AsyncStorage.getItem('user'));
        if (!user) {
          setUser(_user);
        }
        setLoading(false);
      };
      getRegisteredUser();
      return () => {
        getRegisteredUser;
      };
    }, []),
    [],
  );

  const authContextData = { user, setUser};
  return (
    <AuthContext.Provider value={authContextData}>
      <Spinner visible={loading} />
      {!loading && children}
    </AuthContext.Provider>
  );
}
