import {Image, SafeAreaView, Text, View} from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import React, {useState,useContext} from 'react';
import {FormatNotify} from '../utils/updateNotify';
import deepEqual from 'deep-equal';
import FormatDate from '../utils/formatDate';
import { DataContext } from '../contexts/dataContext';

export default function Notify({navigation, route}) {
  const [url, setUrl] = useState();
  const {notify:{notifys}}=useContext(DataContext)
  const [notify, setNotify] = useState();

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        var newNotify = notifys.find(notify => notify.id == route.params.id);
        if (!newNotify) {
          const doc = await firestore()
            .collection('notifys')
            .doc(route.params.id)
            .get();
          newNotify = await FormatNotify(doc);
        }
        if (!deepEqual(notify, newNotify)) {
          setNotify(newNotify);
        }
        console.log(notify)
        if (notify && notify.imgPath) {
          if (notify.imgPath.includes('appspot.com/'))
            imgPath = imgPath.split('appspot.com/')[1];
          else imgPath=notify.imgPath
            setUrl(
              await storage()
                .ref(imgPath)
                .getDownloadURL(),
            );
          console.log(url);
        }
      };
      fetch();
      return () => {
        fetch;
      };
    }, [notify, url]),
  );
  return (
    <SafeAreaView style={{backgroundColor: 'dodgerblue', flex: 1,alignItems:"center"}}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
          width:"100%"
        }}>
        Notify
      </Text>
      {notify && (
        <View style={{width:"80%",marginTop:20}}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius:4,
              padding:8
            }}>
            <Text style={{color: 'black',fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Message: </Text>
              {notify.message}
            </Text>
            <Text style={{color: 'black',fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Device: </Text>
              {notify.device.name}
            </Text>
            <Text style={{color: 'black',fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Address wifi: </Text>
              {notify.device.addressDoor}
            </Text>
            <Text style={{color: 'black',fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Create at: </Text>
              {FormatDate(notify.createAt)}
            </Text>
          </View>
          {url && (
            <Image
              src={url}
              resizeMode="center"
              style={{width: '100%', height: 300}}></Image>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
