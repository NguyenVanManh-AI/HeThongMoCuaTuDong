import { Body, Left, Text, View } from "native-base"
import FormatDate from "../../utils/formatDate"
import personImage from "../../image/person.png"
import { Image } from "react-native"
export default ({ data }) => {
    console.log(data)
    const time = FormatDate(data.createAt.toDate().toString())

    return (
        <View style={{
            position: "relative",
            flexDirection: `row`,
            justifyContent: `${!data.isMe ? "flex-start" : "flex-end"}`,
            alignItems: "center",
            marginEnd: 10,
            marginVertical: 5
        }}>
            {data.isMe || <View
                style={{
                    position: "relative",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    margin: 10
                }}
            >
                <Image
                    source={data.image ? { uri: data.image } : personImage}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15
                    }} />
                {data.isGroup &&
                    <Text
                        style={{
                            color: "gray",
                            fontSize: 12,
                            fontFamily: "100"
                        }}>
                        {data.name.split(" ")[0]}
                    </Text>}
            </View>}
            <View style={{ justifyContent: "center" }}>
                <Body style={{
                    backgroundColor: `${!data.isMe ? "gray" : "#3C1AAB"}`,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    alignItems: "flex-start",
                }}>
                    <Text style={{ textAlign: "left", fontWeight: 600, fontSize: 17, color: `${data.isMe ? "white" : "black"}` }}>{data.content}</Text>
                    <Text style={{ textAlign: "left", fontSize: 14 }} note>{time}</Text>
                </Body>
            </View>
        </View >
    )
}