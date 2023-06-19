import { useNavigation } from "@react-navigation/native"
import { Body, Icon, Left, ListItem, Right, Text, Thumbnail } from "native-base"
import { StyleSheet } from "react-native"
import personImage from '../../image/person.png';
import prompt from "react-native-prompt-android";
import firestore from "@react-native-firebase/firestore";
export default ({ data }) => {
    const navigation = useNavigation()
    const updateName = async (name) => {
        await firestore().collection("conversations").doc(data.id).update({ name })
    }
    const changeNameGroup = () => {
        console.log(data)
        prompt(
            'Enter name',
            `Enter name for group`,
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('Cancel Pressed');
                    },
                    style: 'cancel',
                },
                { text: 'OK', onPress: updateName },
            ],
            {
                type: 'text',
                cancelable: false,
                defaultValue: `${data.name}`,
                placeholder: `${data.name}`,
            },
        );
    }
    return (
        <ListItem
            avatar
            onPress={() => { navigation.navigate("Chatting", { ...data }) }}
            onLongPress={() => { if (data.isGroup) { changeNameGroup() } }}
        >
            <Left><Thumbnail source={data.image ? { uri: data.image } : personImage} /></Left>
            <Body>
                <Text>{data.name}</Text>
                <Text note>{data.lastMessage}</Text>
            </Body>
            <Right>
                <Text note>{data.lastAt}</Text>
            </Right>
        </ListItem>

    )
}
const styles = StyleSheet.create({
    icon: {
        marginTop: 5,
        fontSize: 18
    }
})
