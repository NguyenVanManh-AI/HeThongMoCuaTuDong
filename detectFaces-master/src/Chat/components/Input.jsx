import { Icon } from "native-base"
import { useState } from "react"
import { Text, TextInput, TouchableOpacity, View } from "react-native"
import firestore from "@react-native-firebase/firestore"
import { sendMessage } from "../../utils/sendMessage"
export default ({ data: { from, idChat, newChat, setAddConversation, isGroup } }) => {
    const [message, setMessage] = useState()
    const [idChatt, setIdChat] = useState(idChat)
    const handleSendMessage = async () => {
        if (message.trim() === "")
            return
        if (!idChatt) {
            const newConversation = isGroup ? { lastAt: new Date(), users: [...newChat, from], name: "Group" }
                : { lastAt: new Date(), users: [...newChat, from] }

            idChat = (await firestore().collection("conversations").add(newConversation)).id
            setIdChat(idChat)
            setAddConversation(idChatt || idChat)
        }
        const newMessage = { from, idChat: idChatt || idChat, createAt: new Date(), content: message }
        setMessage("")
        console.log(newMessage)
        await firestore().collection("messages").add(newMessage)
        await firestore().collection("conversations").doc(idChatt || idChat).update({ lastAt: newMessage.createAt, lastMessage: newMessage.content })
        await sendMessage(from, idChat || idChat, newMessage.content, newMessage.createAt)
    }
    return (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TextInput
                style={{
                    flex: 1,
                    borderWidth: 0.5,
                    borderColor: "#999999",
                    borderRadius: 16,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    fontSize: 16,
                    color: "black",
                    marginLeft: 10
                }}
                placeholder="Message"
                placeholderTextColor={"gray"}
                onChangeText={setMessage}
                value={message} />
            <TouchableOpacity
                onPress={() => {
                    handleSendMessage()
                }}
            >
                <Text
                    style={{ fontWeight: "600", color: "cyan", paddingHorizontal: 20 }}
                >
                    <Icon name="send" />
                </Text>
            </TouchableOpacity>
        </View>
    )
}