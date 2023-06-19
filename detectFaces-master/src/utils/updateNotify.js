import { async } from '@firebase/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'

export async function FormatNotify(doc) {
    const device = await doc.data().device;
    const createAt = await doc.data().createAt.toDate().toString();
    const imgPath = await doc.data().imgPath
    var notify
    if (imgPath)
        notify = { createAt, device, message: doc.data().message, id: doc.id, imgPath };
    else
        notify = { createAt, device, message: doc.data().message, id: doc.id }
    return notify
}
export async function FormatHistory(doc) {
    const device = (await doc.data().device);
    const createAt = await doc.data().createAt.toDate().toString();
    const message = await doc.data().message
    const history = {
        createAt,
        device,
        message,
        id: doc.id,
    };
    return history
}

