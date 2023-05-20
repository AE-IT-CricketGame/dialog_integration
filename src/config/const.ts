import { mobileGenerator } from "./common"

const SMS_API = 'http://bulksms.lk/sendsms'
const MAIN_API = "https://api.mycricq.com/api/"
const SMS_CREDENTIALS = {
    USERNAME: 'MyCricQ',
    PASSWORD: 'Th3437hk',
    FROM: 'MyCricQ'
}

export const AUTH_TOKEN = "Bearer 266cd29a-4383-3ecd-915e-011a19843f0c"
export const SEND_SMS_URL = SMS_API + '?username=' + SMS_CREDENTIALS.USERNAME + '&password=' + SMS_CREDENTIALS.PASSWORD + '&from=' + SMS_CREDENTIALS.FROM
export const DELETE_USER_DATA = MAIN_API + "leaderboards/"
export const DELETE_USER_DATA_FROM_ALL = MAIN_API + "question/delete/"
export const GET_USER_DATA = MAIN_API + "leaderboards?populate=campaign"
export const SUBSCRIBE_USER_URL = "https://ideabiz.lk/apicall/subscription/v3/subscribe"
export const UNSUBSCRIBE_USER_URL = "https://ideabiz.lk/apicall/subscription/v3/unsubscribe"
export const SERVICE_ID = "16aae2a8-65a1-42a7-9759-d10f39c47fb8"
export const CHARGE_AMOUNT = 1

export const getPaymentURL = (mobile: string) => {
    return `https://ideabiz.lk/apicall/payment/v4/tel:${mobileGenerator(mobile)}/transactions/amount`
}