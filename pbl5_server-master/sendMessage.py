from twilio.rest import Client

account_sid = 'AC8ab86ba13ff9add0fa299a79e6792662'
auth_token = '9559484b942864b2db3825aff2b2acca'
client = Client(account_sid, auth_token)
from_phone_number = '+19704235222'

def sendVerifyCodeToPhone(phone,message_body):
    # Số điện thoại người nhận (có dạng +84xxxxxxxxx)
    to_phone_number = '+84'+phone[1:]
    # Số điện thoại Twilio

    # Nội dung tin nhắn
    message_body = message_body
    try:
    # Gửi tin nhắn
        message = client.messages.create(
            body=message_body,
            from_=from_phone_number,
            to=to_phone_number
        )
    except:
        print(end="")

    try:
    # Gửi tin nhắn
        message = client.messages.create(
           from_='whatsapp:+14155238886',
            body=message_body,
            to='whatsapp:'+to_phone_number
        )
    except:
        print(end="")