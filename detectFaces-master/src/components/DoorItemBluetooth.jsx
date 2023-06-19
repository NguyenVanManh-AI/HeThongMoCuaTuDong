import React, { useContext, useEffect, useState } from 'react';
import BluetoothSerial from 'react-native-bluetooth-serial';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    TextInput,
    View
} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import deepEqual from "deep-equal"
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/authContext';
import AlertCustom from './AlertCustom';



export default ({ address }) => {
    const { user } = useContext(AuthContext)
    const { addressBluetooth, name } = address;
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [reConnect, setReConnect] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [wifiName, setWifiName] = useState('');
    const [password, setPassword] = useState('');
    const [newRes, setNewRes] = useState();
    useFocusEffect(
        React.useCallback(() => {
            if (addressBluetooth !== "thieu") {
                console.log("res connect")
                try {
                    BluetoothSerial.connect(addressBluetooth)
                        .then(res => {
                            console.log(res, "Connected")
                            setIsConnected(true)
                            const id = setInterval(() => {
                                //   // Hành động cần thực hiện sau mỗi khoảng thời gian
                                BluetoothSerial.readFromDevice().then(res => {
                                    if (res != "") {
                                        const _res = (JSON.parse(String(res)))
                                        console.log(newRes, "Giá trị đọc được")
                                        setStatus(_res.status == 0 ? false : true)
                                        if (!deepEqual(_res, newRes)) {
                                            setNewRes(_res)
                                        }
                                        if ((wifiName === "" && newRes)) {
                                            setWifiName(newRes.wifiName)
                                            setPassword(newRes.password)
                                        }
                                    }
                                }).catch(error => {
                                    console.log(error, "Lôi đọc")
                                })

                            }, 1000);
                            setIntervalId(id);
                        })
                        .catch(error => {
                            setIsConnected(false)
                            console.log(error, "connect fail")
                        })
                } catch (error) {

                }
            }
        }, [reConnect, newRes]))
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                clearInterval(intervalId);
            };
        }, [intervalId, reConnect]))
    const handleTogglePress = async () => {
        setLoading(true);
        if (status) {
            BluetoothSerial.write(JSON.stringify({ phone: user.owner === true ? user.phone : user.owner, status: 0 })).
                then(response => {
                    console.log(response, 'Lock res');
                    setStatus(false)
                    setTimeout(() => {
                        setLoading(false)
                    }, 1500)

                })
                .catch(error => {
                    Alert.alert(`${error}`)
                    setLoading(false)

                });
        } else {
            BluetoothSerial.write(JSON.stringify({ phone: user.owner === true ? user.phone : user.owner, status: 1 })).
                then(response => {
                    console.log(response, 'Unlock res');
                    setStatus(true)
                    setTimeout(() => {
                        setLoading(false)
                    }, 1500)

                })
                .catch(error => {
                    Alert.alert(`${error}`)
                    setLoading(false)

                });
        }
    };
    const handleLongPress = () => {
        setModalVisible(true)
    };
    const handleOK = () => {
        BluetoothSerial.write(JSON.stringify({ phone: user.owner === true ? user.phone : user.owner, wifiName, password }))
            .then(res => {
                console.log("Gui wifi thanh cong", res)
            })
            .catch(error => {
                console.log("Gui wifi loi", error)
            })
        setWifiName("")
        setPassword("")
        setModalVisible(false)
    };
    const handleReset = () => {
        BluetoothSerial.write("reset")
            .then(res => {
                console.log("Gui reset thanh cong", res)
            })
            .catch(error => {
                console.log("Gui reset loi", error)
            })
    }
    return (
        <>
            <TouchableOpacity onLongPress={handleLongPress}
                onPress={() => {
                    setReConnect(!reConnect)
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        backgroundColor: isConnected ? "#8dfcb4" : 'white',
                        color: 'black',
                        borderRadius: 10,
                        margin: 8,
                        padding: 8,
                    }}>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'black', fontSize: 16 }}>{addressBluetooth}</Text>
                        <Text style={{ color: 'black', fontSize: 16 }}>{name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <TouchableOpacity
                            onPress={handleReset}
                        >
                            <Icon name="refresh" size={24, 24} color={"gray"} />
                        </TouchableOpacity>
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={status ? 'gray' : '#00ff00'}
                            />
                        ) : (
                            <ToggleSwitch
                                isOn={status}
                                onColor="green"
                                offColor="gray"
                                onToggle={handleTogglePress}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            <AlertCustom
                isVisible={isModalVisible}
                OKpress={handleOK}
                Cancelpress={() => { setModalVisible(false) }}>
                <Text style={{ paddingHorizontal: 4, color: "#ffffff" }}>Wifi</Text>
                <TextInput
                    placeholder="Wifi name"
                    placeholderTextColor={"#342353"}
                    value={wifiName}
                    style={{ color: "#ffffff" }}
                    onChangeText={setWifiName}
                />
                <Text style={{ paddingHorizontal: 4, color: "#ffffff" }}>Password</Text>
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={"#342353"}
                    value={password}
                    style={{ color: "#ffffff" }}
                    onChangeText={setPassword}
                />
            </AlertCustom>
        </>
    );
};
