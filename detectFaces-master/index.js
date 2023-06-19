import { AppRegistry, PermissionsAndroid } from 'react-native';
import _App from './_App';
import { name as appName } from './app.json';
import firebaseApp from './firebase'
import messaging from '@react-native-firebase/messaging'
import UpdateNotifyBackground from './src/utils/updateNotify';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);


firebaseApp

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => _App);

