import storage from '@react-native-firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FormatDate from '../utils/formatDate';
import { DataContext } from '../contexts/dataContext';
export default function Notifys({ navigation }) {
  const {notify:{notifys,updateNumOfNotify,has,loadMoreLoading,setLoadMoreLoading,setIsHasNew}}=useContext(DataContext)
  useFocusEffect(
    React.useCallback(
      ()=>{
        setIsHasNew(false)
      ,[]}
    )
  )
  return (
    <SafeAreaView style={{ backgroundColor: 'dodgerblue', flex: 1 }}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
        }}>
        Notify
      </Text>
      {notifys ? <FlatList
        data={notifys}
        renderItem={({ item }) => (
          <Item notify={item} navigation={navigation} />
        )}
        keyExtractor={item => item.id}
        item></FlatList> : <ActivityIndicator size="large" color={'#ffffff'} />}

      {has && notifys && (
        <View>
          {loadMoreLoading ? (
            <ActivityIndicator size="large" color={'#ffffff'} />
          ) : (
            <Button
              color="royalblue"
              onPress={() => {
                setLoadMoreLoading(true);
                updateNumOfNotify();
              }}
              disabled={loadMoreLoading}
              title="Load more"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const Item = ({ notify: { message, createAt, imgPath, id }, navigation }) => {
  const createAtFormat = FormatDate(createAt);
  const [url, setUrl] = useState();
  useFocusEffect(
    React.useCallback(() => {
      const getUrl = async () => {
        if (imgPath) {
          if (imgPath.includes('appspot.com/'))
            imgPath = imgPath.split('appspot.com/')[1];
          setUrl(await storage().ref(imgPath).getDownloadURL());
        }
      };
      getUrl();
      return getUrl;
    }, [imgPath]),
  );
  const handleLongPress = async () => { };
  const handlePress = () => {
    navigation.navigate('Notify', { id });
  };
  return (
    <TouchableOpacity onLongPress={handleLongPress} onPress={handlePress}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          flexDirection: 'row',

        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: 'white',
            width: '95%',
            borderRadius: 10,
            margin: 8,
            padding: 8,
            overflow:'hidden'
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              color: 'black',
              width: '65%',
            }}>
            <Text style={{ color: 'black', fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Message: </Text>
              {message}
            </Text>
            <Text style={{ color: 'black', fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Create at: </Text>
              {createAtFormat}
            </Text>
          </View>
          {url &&
            <Image src={url} style={{ width: 40, backgroundColor: "red" }} alt={imgPath}></Image>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
};
