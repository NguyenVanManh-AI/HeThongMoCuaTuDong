import { API_URL } from '@env';
import axios from 'axios';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { AuthContext } from '../contexts/authContext';

export default function AddUser({ setAddUser, focus }) {
  // console.log(API_URL)
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [verification, setVerification] = useState('');
  const [openVerify, setOnpenVerify] = useState(false);
  const { user } = useContext(AuthContext);
  const [wrongVerifyCode, setWrongVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(user.phone);
  const handleCreateUser = async () => {
    if (!name) return;
    if (phone.trim().length !== 10 || phone === user.phone) return;
    setLoading(true);
    if (!openVerify) {
      axios
        .post(`${API_URL}:3000/users/addUser`, {
          phone,
          name,
          phoneOwner: user.phone,
        })
        .then(res => {
          if (res.data.message === 'exists account') {
            setOnpenVerify(true);
            setLoading(false);
            return;
          }
          if (res.data.message === 'Add account successfully') {
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
            setAddUser(false);
          }
          console.log(res.data);
          setLoading(false);
          return;
        })
        .catch(error => {
          Alert.alert('Error', `${error}`);
        });
    } else {
      axios
        .post(`${API_URL}:3000/users/addUserExists`, {
          phone,
          name,
          phoneOwner: user.phone,
          verification,
        })
        .then(res => {
          if (res.data.message === 'verification code not match')
            setWrongVerify(true);
          if (res.data.message === 'Add account successfully') {
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
            setAddUser(false);
          } else {
            setLoading(false);
            return;
          }
        })
        .catch(error => {
          Alert.alert('Error', `${error}`);
        });
    }
  };
  const handleResendVerifyCode = async () => {
    await axios
      .post(`${API_URL}:3000/users/resendVerifyCode`, { phone })
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        Alert.alert('Error', `${error}`);
      });
  };
  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        style={styles.textInput}
        value={phone}
        onChangeText={text => setPhone(text)}
        placeholder="Phone number"
        placeholderTextColor="gray"
        onFocus={focus}
      />
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={text => setName(text)}
        placeholder="Name user"
        placeholderTextColor="gray"
        onFocus={focus}
      />
      {openVerify && (
        <TextInput
          style={styles.textInput}
          value={verification}
          onChangeText={text => setVerification(text)}
          placeholder="Verification code"
          onFocus={focus}
        />
      )}
      {loading ? (
        <ActivityIndicator size="large" color={'#ffffff'} />
      ) : (
        <Button
          color={
            name && phone && phone !== user.phone && phone.trim().length === 10
              ? 'green'
              : 'gray'
          }
          title="Add user"
          onPress={handleCreateUser}
        />
      )}
      {wrongVerifyCode && (
        <Text
          style={{ fontSize: 14, color: 'blue' }}
          onPress={handleResendVerifyCode}>
          Resend verification code
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'white',
    marginBottom: 16,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: 'black',
  },
});
