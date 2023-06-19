import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';

import FormatDate from '../utils/formatDate';
import { DataContext } from '../contexts/dataContext';

export default function Historys() {
  const {history:{historys,updateNumOfHistory,has,loadMoreLoading,setLoadMoreLoading,setIsHasNew}}=useContext(DataContext)
  useFocusEffect(
    React.useCallback(
      ()=>{
        setIsHasNew(false)
      ,[]}
    )
  )
  return (
    <SafeAreaView style={{backgroundColor: 'dodgerblue', flex: 1}}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
        }}>
        History
      </Text>
      
        {
          historys?
        <FlatList
          data={historys}
          renderItem={({item}) => <Item notify={item} />}
          keyExtractor={item => item.id}
          item></FlatList>:
          <ActivityIndicator size="large" color={'#ffffff'} />
        }
      {has && historys && (
        <View>
          {loadMoreLoading ? (
            <ActivityIndicator size="large" color={'#ffffff'} />
          ) : (
            <Button
              color="royalblue"
              onPress={() => {
                setLoadMoreLoading(true);
                updateNumOfHistory();
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

const Item = ({notify: {message, createAt}}) => {
  const createAtFormat = FormatDate(createAt);
  const handleLongPress = async () => {};
  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 10,
          margin: 8,
          padding: 8,
        }}>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Message: </Text>
          {message}
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Create at: </Text>
          {createAtFormat}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
