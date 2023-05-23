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

export const SMS_REMINDERS = [
    "Hey there! Don't forget to kickstart your day with a dose of cricket knowledge and fun! Remember to play the MYCricQ quiz app daily to test your cricket IQ and stay on top of the game! Start your cricket adventure now! ",
    "Hey cricket enthusiast! Time to unleash your cricket expertise and conquer the MYCricQ quiz app! Don't miss out on daily challenges and exciting trivia. Stay ahead of the game by playing every day! Join the league of cricket champions now! ",
    "Hello cricket lover! Get ready to power up your cricket IQ with MYCricQ quiz app! Don't forget to dive into the exciting world of cricket trivia every day. Sharpen your skills, challenge your friends, and unlock amazing rewards! Keep the cricket fever alive and play daily! ",
    "Hello! This is a quick reminder to keep up with your daily routine of playing the MYCricQ quiz app. Engage in thrilling cricket quizzes and stay up-to-date with the latest in the world of cricket. Challenge yourself, learn something new, and have a great time with MYCricQ!",
    "Hey there! Just a friendly reminder to play the MYCricQ quiz app daily and test your cricket knowledge. Stay on top of the game and challenge yourself with exciting trivia questions. Don't miss out on the fun! Start playing now and show off your cricket skills!",
    "Hey there! Just a friendly reminder to make time for your daily dose of cricket knowledge and entertainment. Don't forget to play the MYCricQ quiz app today and put your cricket skills to the test. Challenge yourself, beat your high score, and become a cricket champion! Have a fantastic time playing!"
]