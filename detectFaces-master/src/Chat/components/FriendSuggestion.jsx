import { ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Text } from 'native-base';
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useContext, useState, useEffect } from "react";
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from "@react-native-community/netinfo";
import deepEqual from 'deep-equal';
import { AuthContext } from "../../contexts/authContext";
import personImage from '../../image/person.png';

export default () => {
    const navigation = useNavigation()
    const route = useRoute()
    const [userList, setUserList] = useState([]);
    const { user } = useContext(AuthContext);
    const netInfor = useNetInfo();

    useEffect(() => {
        const unSub = async () => {
            if (route.params?.phones) {
                const conversations = (await firestore().collection("conversations")
                    .where("users", "array-contains-any", route.params.phones)
                    .get()).docs
                const conversation = conversations.find(conversation => {
                    const phones = [...route.params.phones, user.phone]
                    return JSON.stringify(conversation.data().users.sort((a, b) => a - b))
                        === JSON.stringify(phones.sort((a, b) => a - b));
                });
                if (conversation) {
                    navigation.navigate("Chatting",
                        {
                            id: conversation.id,
                            name: conversation.name,
                            image: conversation.image,
                            isGroup: true
                        })
                }
                else {
                    navigation.navigate("Chatting",
                        {
                            isGroup: true,
                            newChat: route.params.phones
                        })
                }
                route.params = null
            }
            else if (route.params?.id) {
                const conversation = (await firestore().collection("conversations")
                    .doc(route.params.id).get())
                if (conversation?.id) {
                    let phone = conversation.data().users[0] === user.phone ?
                        conversation.data().users[1] : conversation.data().users[0]
                    const toUser = (await firestore().collection("users").doc(phone).get()).data()
                    navigation.navigate("Chatting",
                        {
                            id: conversation.id,
                            name: toUser?.name,
                            image: toUser?.image
                        })
                }
                route.params = null

            }
            else {
                console.log(route.params)
            }
        }
        unSub()
        return unSub
    }, [route])
    useFocusEffect(
        React.useCallback(() => {
            const getUserListLocal = async () => {
                if (!userList) {
                    setUserList(JSON.parse(await AsyncStorage.getItem('userChatList')))
                }
            }
            getUserListLocal()
            return () => {
                getUserListLocal
            }
        }, [userList])
    )
    useFocusEffect(
        React.useCallback(() => {
            var unsubscribe
            if (netInfor.isConnected) {
                if (user.owner === true) {
                    const userRef = firestore().collection("users").where("owner", "==", user.phone)
                    unsubscribe = userRef.onSnapshot(async snapshot => {
                        const users = []
                        await Promise.all(
                            snapshot.docs.map(async doc => {
                                const name = await doc.data().name
                                const phone = await doc.data().phone
                                const image = await doc.data().image
                                if (doc.exists) {
                                    users.push({ name, phone, image })
                                }
                            })
                        );

                        if (userList?.length !== users.length || !deepEqual(userList, users)) {
                            setUserList(users)
                            await AsyncStorage.setItem("userChatList", JSON.stringify(users))
                            console.log("Reset userList")
                        }
                    })
                }
                else {
                    const userRef = firestore().collection("users").where("owner", "==", user.owner)
                    const userRef2 = firestore().collection("users").doc(user.owner)
                    unsubscribe = userRef.onSnapshot(async snapshot => {
                        const users = []
                        await Promise.all(
                            snapshot.docs.map(async doc => {
                                if (doc.data().phone !== user.phone) {
                                    const name = await doc.data().name
                                    const phone = await doc.data().phone
                                    const image = await doc.data().image
                                    if (doc.exists) {
                                        users.push({ name, phone, image })
                                    }
                                }
                            }),
                        );
                        let owner = (await userRef2.get()).data();
                        users.push({
                            name: owner.name,
                            image: owner.image,
                            phone: owner.phone
                        })
                        console.log(users)

                        if (userList?.length !== users.length || !deepEqual(userList, users)) {
                            setUserList(users)
                            await AsyncStorage.setItem("userChatList", JSON.stringify(users))
                            console.log("Reset userList")
                        }
                    })
                }
                return () => {
                    unsubscribe();
                }
            }
        }, [netInfor, user])
    )
    const handleItemOnClick = async ({ phone, name, image }) => {
        let chatRef = (await firestore().collection("conversations")
            .where("users", "==", [user.phone, phone]).get())
        if (!chatRef.empty) {
            navigation.navigate("Chatting", { id: chatRef.docs[0].id, name, image })
            return
        }
        chatRef = (await firestore().collection("conversations")
            .where("users", "==", [phone, user.phone]).get());
        if (!chatRef.empty) {
            navigation.navigate("Chatting", { id: chatRef.docs[0].id, name, image })
            return
        }

        navigation.navigate("Chatting", { newChat: [phone], name, image })
    }
    return (
        <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.content}
        >
            {userList.map((item) => {
                return (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.item}
                        key={item.phone}
                        onPress={() => { handleItemOnClick(item) }}>
                        <Image
                            style={styles.avatar}
                            source={item.image ? { uri: item.image } : personImage}
                        />
                        <Text style={styles.name}>{item.name}</Text>
                    </TouchableOpacity>
                )
            })
            }
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        flexWrap: 'nowrap',
        overflow: 'hidden'
    },
    item: {
        marginRight: 15,
        alignItems: 'center'
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 0.4,
        borderColor: "#dddddd"
    },
    name: {
        fontSize: 15,
        marginTop: 3,
        textAlign: 'center'
    },
    icon: {
        marginTop: 5,
        fontSize: 18
    }
})
