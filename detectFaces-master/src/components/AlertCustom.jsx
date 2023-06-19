import Modal from 'react-native-modal';
import {View,Button} from "react-native"
export default ({isVisible,children,Cancelpress,OKpress})=>{
    return(
        <Modal isVisible={isVisible}>
                <View style={{ backgroundColor: '#000000', padding: 20,borderRadius:10 }}>
                    {children}
                    <View style={{flexDirection:"row",justifyContent:"flex-end"}}>

                        <Button title="Cancel" color={"transparent"}  onPress={Cancelpress} />
                        <Button title="OK" color={"transparent"}  onPress={OKpress} />
                        
                    </View>
                </View>
            </Modal>
    )
}