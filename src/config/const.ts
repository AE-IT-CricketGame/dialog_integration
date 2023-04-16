const SMS_API = 'http://bulksms.lk/sendsms'
const SMS_CREDENTIALS = {
    USERNAME: 'MyCricQ',
    PASSWORD: 'Th3437hk',
    FROM: 'MyCricQ'
}
export const SEND_SMS_URL = SMS_API + '?username=' + SMS_CREDENTIALS.USERNAME + '&password=' + SMS_CREDENTIALS.PASSWORD + '&from=' + SMS_CREDENTIALS.FROM