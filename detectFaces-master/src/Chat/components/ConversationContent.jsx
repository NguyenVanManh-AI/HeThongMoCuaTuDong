import React, { useContext, useState } from "react";
import ConversationItem from "./ConversationItem"
import { AuthContext } from "../../contexts/authContext";
import firestore from '@react-native-firebase/firestore';
import { useNetInfo } from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import deepEqual from "deep-equal"
import FormatDate from "../../utils/formatDate";
export default () => {
    const [chatList, setChatList] = useState([]);
    const { user } = useContext(AuthContext);
    const netInfor = useNetInfo();

    useFocusEffect(
        React.useCallback(() => {
            const getChatListLocal = async () => {
                if (!chatList) {
                    setChatList(JSON.parse(await AsyncStorage.getItem('chatList')))
                }
            }
            getChatListLocal()
            return () => {
                getChatListLocal
            }
        }, [chatList])
    )

    useFocusEffect(
        React.useCallback(() => {
            var unsubscribe
            if (netInfor.isConnected) {
                const chatRef = firestore().collection("conversations")
                    .where("users", "array-contains", user.phone)

                unsubscribe = chatRef.onSnapshot(async snapshot => {
                    const chats = []
                    await Promise.all(
                        snapshot.docs.map(async doc => {
                            const id = doc.id
                            let name = await doc.data().name
                            let image
                            let isGroup
                            if (name) {
                                isGroup = true
                            }
                            else {
                                const users = await doc.data().users
                                const phone = users[0] === user.phone ? users[1] : users[0]
                                const otherUser = (await firestore().collection("users").doc(phone).get()).data()
                                name = otherUser.name
                                image = otherUser.image
                            }
                            const lastMessage = await doc.data().lastMessage
                            const lastAt = FormatDate(await doc.data().lastAt.toDate().toString())
                            if (doc.exists) {
                                chats.push({ id, name, image, lastMessage, lastAt, isGroup })
                            }
                        })
                    );
                    chats.sort((a, b) => {
                        return b.lastAt.localeCompare(a.lastAt);;
                    })
                    if (chatList?.length !== chats.length || !deepEqual(chatList, chats)) {
                        setChatList(chats)
                        await AsyncStorage.setItem("chatList", JSON.stringify(chats))
                        console.log("Reset chatList")
                    }
                })
                return () => {
                    unsubscribe();
                }
            }
        }, [netInfor, user])
    )
    return (
        <>
            {
                chatList.map((item) => {
                    return (
                        <ConversationItem key={item.id} data={item} />
                    )
                })
            }
        </>)
}