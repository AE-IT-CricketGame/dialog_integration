import { mobileGenerator } from "./common"
import * as dotenv from 'dotenv';
dotenv.config({ path: ".env" });

const SMS_API = process.env.SMS_API
const MAIN_API = process.env.MAIN_API
const SMS_CREDENTIALS = {
    USERNAME: process.env.SMS_CREDENTIALS_USERNAME,
    PASSWORD: process.env.SMS_CREDENTIALS_PASSWORD,
    FROM: process.env.SMS_CREDENTIALS_FROM
}

export const AUTH_TOKEN = `Bearer ${process.env.AUTH_TOKEN}`
export const SEND_SMS_URL = SMS_API + '?username=' + SMS_CREDENTIALS.USERNAME + '&password=' + SMS_CREDENTIALS.PASSWORD + '&from=' + SMS_CREDENTIALS.FROM
export const DELETE_USER_DATA = MAIN_API + "leaderboards/"
export const DELETE_USER_DATA_FROM_ALL = MAIN_API + "question/delete/"
export const GET_USER_DATA = MAIN_API + "leaderboards?populate=campaign"
export const SUBSCRIBE_USER_URL = process.env.IDEABIZ_SUBSCRIBE_USER_URL
export const UNSUBSCRIBE_USER_URL = process.env.IDEABIZ_UNSUBSCRIBE_USER_URL
export const SERVICE_ID = process.env.IDEABIZ_SERVICE_ID
export const CHARGE_AMOUNT = 1

export const getPaymentURL = (mobile: string) => {
    return `${process.env.IDEABIZ_PAYMENT_URL}tel:${mobileGenerator(mobile)}/transactions/amount`
}