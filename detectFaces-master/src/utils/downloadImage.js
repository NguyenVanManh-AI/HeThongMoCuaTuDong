import { PermissionsAndroid } from "react-native";
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
export default async function DownloadImage(imageUrl) {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
            title: 'Storage Permission Required',
            message:
                'This app needs access to your storage to download photos',
            buttonPositive: 'OK',
        },
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission denied');
        return;
    }
    console.log("Bắt đầu tải")
    const { dirs } = RNFetchBlob.fs;
    const path = `${dirs.PictureDir}/PBL5/image.png`;
    try {
        await RNFS.unlink(path)
    } catch (error) {
        console.log("Xóa lỗi",error)
    }
    const config = {
        fileCache: true,
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mediaScannable: true,
            title: 'image.png',
            path
        },
    };
    const res = await RNFetchBlob.config(config).fetch('GET', imageUrl);
    return `file://${res.path()}`
}