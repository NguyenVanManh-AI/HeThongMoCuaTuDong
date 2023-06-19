import { useNavigation } from "@react-navigation/native"
import { Body, Button, Header, Icon, Right, Text, Thumbnail } from "native-base"
import { StyleSheet } from "react-native"
import personImage from "../../image/person.png"
export default ({ data: { image, name, isGroup } }) => {

    const navigation = useNavigation()
    return (
        <Header
            iosBarStyle={'dark-content'}
            androidStatusBarColor={'#fff'}
            noLeft
            style={styles.header}>
            <Body style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button transparent
                    onPress={() => { navigation.navigate("ChatList") }}>
                    <Icon style={[styles.icon, { fontSize: 28, marginLeft: 0 }]} name='ios-arrow-back' />
                </Button>
                <Thumbnail
                    small
                    source={image ? { uri: image } : personImage} />
                <Text style={styles.title}>{name || (isGroup && "Group")}</Text>
            </Body>

        </Header>
    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff'
    },
    title: {
        color: '#000',
        fontWeight: '600',
        fontSize: 20,
        marginLeft: 5
    },
    icon: {
        color: '#000'
    }
})
