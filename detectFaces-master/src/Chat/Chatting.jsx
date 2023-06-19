import { Container, Content } from "native-base"
import ConversationHeader from "./components/ConversationHeader"
import { ScrollView, StyleSheet } from "react-native"
import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import firestore from '@react-native-firebase/firestore';
import Input from "./components/Input"
import { AuthContext } from "../contexts/authContext"
import MessageItem from "./components/MessageItem"

export default ({ navigation, route }) => {
    const { user } = useContext(AuthContext)
    const [messages, setMessages] = useState([]);
    const scrollView = useRef()
    const { image, name, id, newChat, isGroup } = route.params
    console.log(route.params, "fhsjfhdsjfkshfk")

    const [addConversation, setAddConversation] = useState(false)
    useEffect(() => {
        const unSub = async () => {
            if (!name) {
                const conversation = (await firestore().collection("conversations").doc(id).get()).data()
                console.log(conversation)
            }
            return unSub()
        }
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            if (addConversation || id) {
                const chatRef = firestore().collection("messages")
                    .where("idChat", "==", addConversation ? addConversation : id).orderBy('createAt', 'desc')
                unsubscribe = chatRef.onSnapshot(async snapshot => {
                    console.log("onSnapshotlai", addConversation)

                    const chats = []
                    await Promise.all(
                        snapshot.docs.map(async doc => {
                            const id = doc.id
                            let fromUser = (await firestore().collection("users").doc(await doc.data().from).get()).data()
                            let content = await doc.data().content
                            let isMe = await doc.data().from === user.phone
                            let createAt = await doc.data().createAt
                            if (doc.exists) {
                                chats.push({ id, content, createAt, isMe, image: fromUser.image, name: fromUser.name })
                            }
                        }))

                    if (messages?.length !== chats.length) {
                        setMessages(chats.reverse())
                    }
                    // if (chatList?.length !== chats.length || !deepEqual(chatList, chats)) {
                    //     setChatList(chats)
                    //     // await AsyncStorage.setItem("chatList", JSON.stringify(chats))
                    //     console.log("Reset chatList")
                    // }
                })
                return () => {
                    unsubscribe();
                }
            }
        }, [addConversation]))
    console.log(messages)
    return (
        <Container>
            <ConversationHeader data={{ image, name, isGroup }} />
            <ScrollView
                style={styles.content}
                ref={scrollView}
                onContentSizeChange={(contentWidth, contentHeight) => {
                    scrollView.current.scrollToEnd({ animated: true });
                }}
            >
                {
                    messages.map(message => {
                        return (<MessageItem key={message.id} data={{ ...message, isGroup }} />)
                    })
                }
            </ScrollView>
            <Input data={{ from: user.phone, isGroup, idChat: id, newChat, setAddConversation }} />
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    content: {
        flex: 1,
        //justifyContent: 'center', alignItems: 'center'
    },
    message: {
        marginTop: 15,
        color: '#212121',
        fontSize: 14,
        lineHeight: 22,
        marginHorizontal: 80,
        textAlign: 'center'
    }
})
