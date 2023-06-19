import { Text, Header, Left, Body, Right, Button, Icon, Thumbnail } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useContext } from "react"
import { AuthContext } from '../../contexts/authContext';
import personImage from '../../image/person.png';

export default () => {
    const { user } = useContext(AuthContext)
    return (
        <Header
            iosBarStyle={'dark-content'}
            androidStatusBarColor={'#fff'}
            noLeft
            style={styles.header}>
            <Body style={{ paddingLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { console.log("Click header") }}>
                    <Thumbnail
                        style={{ width: 40, height: 40 }}
                        source={user.image ? { uri: user.image } : personImage} />
                </TouchableOpacity>
                <Text style={styles.title}>Chat</Text>
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
        fontWeight: '700',
        fontSize: 25,
        marginLeft: 15
    },
    icon: {
        color: '#000'
    }
})