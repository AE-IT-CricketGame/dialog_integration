const SMS_API = 'http://bulksms.lk/sendsms'
const SMS_CREDENTIALS = {
    USERNAME: 'MyCricQ',
    PASSWORD: 'Th3437hk',
    FROM: 'MyCricQ'
}

export const AUTH_TOKEN = "Bearer 8063c7c0-601d-3a58-8385-27cd5d03bb29"
export const SEND_SMS_URL = SMS_API + '?username=' + SMS_CREDENTIALS.USERNAME + '&password=' + SMS_CREDENTIALS.PASSWORD + '&from=' + SMS_CREDENTIALS.FROM
export const SUBSCRIBE_USER_URL = "https://ideabiz.lk/apicall/subscription/v3/subscribe"
export const UNSUBSCRIBE_USER_URL = "https://ideabiz.lk/apicall/subscription/v3/subscribe"