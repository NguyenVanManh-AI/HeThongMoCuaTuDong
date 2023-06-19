import { API_URL } from "@env";
import axios from "axios";
export async function sendMessage(phone, id, message, createAt) {
    try {
        console.log("Gui thong bao")
        await axios.post(`${API_URL}:3000/sendNotifyMessage`, { phone, id, createAt, message })
    } catch (error) {
        console.log("Send notify message error", error)
    }

}