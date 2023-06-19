export default function FormatDate(datetime) {
    const data = new Date(datetime)

    return `${(data.getHours() < 10 && "0") + data.getHours()}:${(data.getMinutes() < 10 && "0") + data.getMinutes()}, ${(data.getDate() < 10 && "0") + data.getDate()}-${(data.getMonth() < 9 && "0") + (data.getMonth() + 1)}-${data.getFullYear()}`
}