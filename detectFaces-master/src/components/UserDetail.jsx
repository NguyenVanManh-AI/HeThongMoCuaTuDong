import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState, memo } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../contexts/authContext';
import personImage from '../image/person.png';
import DownloadImage from '../utils/downloadImage';
import { updateUserMultiField, uploadImage } from '../utils/firebaseHelper';
import AlertCustom from './AlertCustom';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StartUpperCase } from '../utils/StartUpperCase';


export default memo(() => {
    const { user } = useContext(AuthContext)
    const [newUser, setNewUser] = useState(user)
    const [image, setImage] = useState(null);
    const [isVisible, setIsVisible] = useState(false)
    const [listInfo, setListInfo] = useState()
    const [isNewInfo, setIsNewInfo] = useState(false)
    const [newKey, setNewKey] = useState()
    const [newValue, setNewValue] = useState()
    const handleOk = async () => {
        await updateUserMultiField(newUser)
        setIsVisible(false)
    }
    const chooseImage = () => {
        try {
            launchImageLibrary({ mediaType: 'photo' }, async res => {
                console.log(res);
                if (res.assets) {
                    const assets = res.assets;
                    if (assets) {
                        setImage(assets[0].uri);
                    }
                }
            }).then(async res => {
                console.log(res);
                if (res.assets) {
                    const assets = res.assets;
                    if (assets[0]) {
                        await uploadImage(user.phone, assets[0].uri);
                        await AsyncStorage.setItem('imageUrl', assets[0].uri);
                    }
                }
            });
        } catch (error) { }
        console.log(image);
    };
    useEffect(() => {
        const unsub = async () => {
            const res = await AsyncStorage.getItem('imageUrl');
            if (!res && user.image) {
                const downloadImage = await DownloadImage(user.image);
                await AsyncStorage.setItem('imageUrl', downloadImage);
                setImage(downloadImage);
            } else {
                setImage(res);
            }
            console.log(res, 'abc');
        };
        setNewUser({ ...user })
        unsub();
    }, [user]);
    useEffect(() => {
        const list = []
        for (const key in newUser) {
            if (key !== "devices" && key !== "image" && key !== "password") {
                list.push({ key, value: newUser[key] })
            }
        }
        setListInfo(list)
    }, [newUser])
    return (
        <>
            <TouchableOpacity
                onLongPress={() => { setIsVisible(true) }}
            >
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: 'white',
                        margin: 16,
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                    }}>
                    <TouchableOpacity onPress={chooseImage}>
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        ) : user.image ? (
                            <Image
                                src={user.image}
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        ) : (
                            <Image
                                source={personImage}
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        )}
                    </TouchableOpacity>
                    <View style={{ marginLeft: 20 }}>
                        <Text style={{ fontSize: 22, color: 'black', fontWeight: 'bold' }}>
                            {user.name}
                        </Text>
                        <Text style={{ fontSize: 18, color: 'black' }}>{user.phone}</Text>
                        {user.owner == true && (
                            <Text style={{ fontSize: 18, color: 'black' }}>Owner</Text>
                        )}
                    </View>
                </View>
                <AlertCustom
                    isVisible={isVisible}
                    Cancelpress={() => { setIsVisible(false) }}
                    OKpress={handleOk}
                >
                    <TouchableOpacity onPress={chooseImage}
                        style={{
                            width: "100%",
                            alignItems: "center",
                            marginBottom: 30
                        }}
                    >
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        ) : user.image ? (
                            <Image
                                src={user.image}
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        ) : (
                            <Image
                                source={personImage}
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                }}
                            />
                        )}
                    </TouchableOpacity>
                    {listInfo && listInfo.map((info) => (
                        <View
                            key={info.key}
                            style={{
                                flexDirection: "row",
                                width: "100%",
                                alignItems: "center",
                                height: 40,
                            }}
                        >
                            <Text style={{ width: "20%"}}>{StartUpperCase(info.key)} :</Text>
                            <TextInput
                                value={String(info.value)}
                                style={{ width: "60%"}}
                                editable={!(info.key==="phone" || info.key==="owner")}
                                onChangeText={(text) => { setNewUser({ ...newUser, [info.key]: text }) }} />
                            {!(info.key==="phone" || info.key==="owner" || info.key==="name")&&
                            <Icon
                            style={{right:20}}
                            onPress={
                                () => {
                                    if (info.key==="phone" || info.key==="owner" || info.key==="name")
                                        return
                                    delete newUser[info.key]
                                    setNewUser({...newUser})
                                }
                            }
                            name="cancel" color="red" size={24} />
                            }
                        </View>
                    ))}
                    <View
                        style={{
                            marginTop: 30,
                            alignItems: "center"
                        }}
                    >
                        {
                            isNewInfo && (
                                <View style={{ width: "90%" }}>
                                    <TextInput
                                        value={newKey}
                                        style={{borderColor:"white",borderTopWidth:0.2,borderBottomWidth:0.2}}
                                        placeholder="New info"
                                        onChangeText={setNewKey}
                                    />
                                    <TextInput
                                        value={newValue}
                                        style={{borderColor:"white",borderBottomWidth:0.2,marginBottom:10}}
                                        placeholder="Value"
                                        onChangeText={setNewValue}
                                    />
                                </View>
                            )
                        }
                        <Icon
                            onPress={
                                () => {
                                    if (!isNewInfo) {
                                        setIsNewInfo(true)
                                        return
                                    }
                                    if (!newKey || !newValue)
                                        return
                                    if (newKey.toUpperCase() === "OWNER" || newKey.toUpperCase() === "PHONE" || newKey.toUpperCase() === "PASSWORD")
                                        return
                                    setNewUser({ ...newUser, [newKey]: newValue })
                                    setNewKey()
                                    setNewValue()
                                }
                            }
                            name="add-circle-outline" color="cyan" size={24} />
                    </View>
                </AlertCustom>
            </TouchableOpacity>
        </>
    )
})