import { useState } from 'react';
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import Faces from '../components/Faces';


export default function AddFace({ navigation, route }) {
    const [name, setName] = useState("")
    if (route?.params?.message === "add face successfully") {
        setName("")
        route.params = {}
        console.log(route)
    }

    const handleAddFace = () => {
        if (name === "")
            return
        navigation.navigate('GetFace', { name })
    }
    return (
        <SafeAreaView style={{
            backgroundColor: 'dodgerblue',
            flex: 1,
            width: '100%',
            alignItems: 'center',
            // justifyContent: 'center',
            height: '100%'
        }}>
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    padding: 10,
                }}
            >
                <Text style={{ fontSize: 20 }}>Name:</Text>
                <TextInput
                    value={name}
                    onChangeText={text => setName(text)}
                    style={{
                        color: 'gray',
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: 8,
                        paddingHorizontal: 16,
                        width: '80%',
                        margin: 15,
                        fontSize: 20,
                    }}

                />
            </View>
            <View style={{ width: '80%', paddingBottom: 16, borderRadius: 30 }}>
                <Button
                    title='Thêm'
                    color={name ? 'green' : 'gray'}
                    onPress={handleAddFace} />
            </View>
            <View style={{ width: '80%', paddingBottom: 16, borderRadius: 30 }}>
                <Faces />
            </View>
            
        </SafeAreaView>
    )
}