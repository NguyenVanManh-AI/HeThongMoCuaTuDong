import { useContext, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AddUser from '../components/AddUser';
import UpdatePassword from '../components/UpdatePassword';
import UserDetail from '../components/UserDetail';
import UserList from '../components/UserList';
import { AuthContext } from '../contexts/authContext';
import Logout from '../utils/logout';


export default function User() {
  const { user, setUser, setDevicesRef } = useContext(AuthContext);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [userListPanel, setUserListPanel] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const scrollViewRef = useRef()
  const [updatePassRef, setUpdatePasswordRef] = useState()
  const [addUserRef, setAddUserRef] = useState()

  const handleLogout = async () => {
    await Logout(user, setUser, setDevicesRef);
  };

  const scrollToUpdatePassword = () => {
    updatePassRef.measureLayout(
      scrollViewRef.current,
      (left, top, width, height) => {
        scrollViewRef.current?.scrollTo({
          y: top,
          animated: true
        })
      }
    )
  }
  const scrollToAddUser = () => {
    addUserRef.measureLayout(
      scrollViewRef.current,
      (left, top, width, height) => {
        // console.log(top)
        scrollViewRef.current?.scrollTo({
          y: top,
          animated: true
        })
      }
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: 'dodgerblue', flex: 1 }}>
      <ScrollView ref={scrollViewRef}>
        {/* <KeyboardAvoidingView behavior="position" style={{ marginBottom: 0 }}> */}
        <UserDetail />
        {user.owner == true && (
          <TouchableOpacity
            onPress={() => {
              setUserListPanel(!userListPanel);
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 16,
                paddingTop: 12,
                borderColor: 'white',
                borderTopWidth: 2,
                paddingLeft: 20,
              }}>
              <Text style={{ fontSize: 18, color: 'white' }}>User List</Text>
            </View>
          </TouchableOpacity>
        )}
        {userListPanel && <UserList setUserListPanel={setUserListPanel} />}
        <TouchableOpacity
          onPress={() => {
            setUpdatePassword(!updatePassword);
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 16,
              padding: 12,
              paddingHorizontal: 20,
              borderColor: 'white',
              borderTopWidth: 2,
            }}
            ref={ref => { setUpdatePasswordRef(ref) }}
          >
            <Text style={{ fontSize: 18, color: 'white' }}>
              Update password
            </Text>
          </View>
        </TouchableOpacity>
        {updatePassword && (
          <UpdatePassword setUpdatePassword={setUpdatePassword} focus={scrollToUpdatePassword} />
        )}
        <TouchableOpacity
          onPress={() => {
            setAddUser(!addUser);
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              padding: 12,
              paddingLeft: 20,
              borderColor: 'white',
              borderTopWidth: 2,
            }}
            ref={ref => { setAddUserRef(ref) }}
          >
            <Text style={{ fontSize: 18, color: 'white' }}>Add user</Text>
          </View>
        </TouchableOpacity>
        {addUser && (
          <AddUser
            setAddUser={setAddUser}
            focus={scrollToAddUser}
          />
        )}

        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: 'white',
            marginVertical: 2,
          }}></View>

        <TouchableOpacity onPress={handleLogout}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'blue',
              margin: 16,
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: keyboardVisible ? 300 : 20
            }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
        {/* </KeyboardAvoidingView> */}
      </ScrollView>

    </SafeAreaView>
  );
}
