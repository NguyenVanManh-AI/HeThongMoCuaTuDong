import {API_URL} from '@env';
import {useContext, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../contexts/authContext';
export default function UpdatePassword({setUpdatePassword,focus}) {
  // console.log(API_URL)
  const {user} = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleUpdatePassword = async () => {
    if (newPassword !== reNewPassword) return;
    if (!oldPassword || !newPassword) return;
    setLoading(true);
    axios
      .post(`${API_URL}:3000/users/updatePassword`, {
        phone: user.phone,
        password: oldPassword,
        newPassword,
      })
      .then(res => {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        setUpdatePassword(false);
        setLoading(false);
      })
      .catch(error => {
        ToastAndroid.show('Password unchanged', ToastAndroid.SHORT);
        setLoading(false);
      });
  };

  return (
    <View style={{marginBottom: 16}}>
      <TextInput
        style={styles.textInput}
        value={oldPassword}
        onChangeText={text => setOldPassword(text)}
        placeholder="Old password"
        placeholderTextColor="gray"
        onFocus={()=>{focus();focus()}}
      />
      <TextInput
        style={styles.textInput}
        value={newPassword}
        onChangeText={text => setNewPassword(text)}
        placeholder="New password"
        placeholderTextColor="gray"
        onFocus={()=>{focus()}}
      />
      <TextInput
        style={styles.textInput}
        value={reNewPassword}
        onChangeText={text => setReNewPassword(text)}
        placeholder="Confirm new password"
        placeholderTextColor="gray"
        onFocus={()=>{focus()}}
      />
      {newPassword !== reNewPassword && reNewPassword && (
        <Text style={{fontSize: 12, color: 'red'}}>
          New password and confirm password fields do not match
        </Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color={'#ffffff'} />
      ) : (
        <Button
          color={
            oldPassword &&
            newPassword &&
            reNewPassword &&
            newPassword === reNewPassword
              ? 'green'
              : 'gray'
          }
          title="Update"
          onPress={handleUpdatePassword}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'white',
    color: 'black',
    marginBottom: 16,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
});
