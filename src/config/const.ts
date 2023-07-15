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
export const GET_REMINDER_MSG = MAIN_API + "sms-templates"
export const SUBSCRIBE_USER_URL = process.env.IDEABIZ_SUBSCRIBE_USER_URL
export const UNSUBSCRIBE_USER_URL = process.env.IDEABIZ_UNSUBSCRIBE_USER_URL
export const SERVICE_ID = process.env.IDEABIZ_SERVICE_ID
export const IDEABIZ_SUBSCRIBE_OTP_URL = process.env.IDEABIZ_SUBSCRIBE_OTP_URL
export const IDEABIZ_VALIDATE_OTP_URL = process.env.IDEABIZ_VALIDATE_OTP_URL
export const CHARGE_AMOUNT = 6
export const IDEABIZ_SMS_URL = process.env.IDEABIZ_SMS_URL

export const getPaymentURL = (mobile: string) => {
    return `${process.env.IDEABIZ_PAYMENT_URL}tel:${mobileGenerator(mobile)}/transactions/amount`
}

export const SMS_REMINDERS = [
    "Hey there! Don't forget to kickstart your day with a dose of cricket knowledge and fun! Remember to play the MYCricQ quiz app daily to test your cricket IQ and stay on top of the game! Start your cricket adventure now! ",
    "Hey cricket enthusiast! Time to unleash your cricket expertise and conquer the MYCricQ quiz app! Don't miss out on daily challenges and exciting trivia. Stay ahead of the game by playing every day! Join the league of cricket champions now! ",
    "Hello cricket lover! Get ready to power up your cricket IQ with MYCricQ quiz app! Don't forget to dive into the exciting world of cricket trivia every day. Sharpen your skills, challenge your friends, and unlock amazing rewards! Keep the cricket fever alive and play daily! ",
    "Hello! This is a quick reminder to keep up with your daily routine of playing the MYCricQ quiz app. Engage in thrilling cricket quizzes and stay up-to-date with the latest in the world of cricket. Challenge yourself, learn something new, and have a great time with MYCricQ!",
    "Hey there! Just a friendly reminder to play the MYCricQ quiz app daily and test your cricket knowledge. Stay on top of the game and challenge yourself with exciting trivia questions. Don't miss out on the fun! Start playing now and show off your cricket skills!",
    "Hey there! Just a friendly reminder to make time for your daily dose of cricket knowledge and entertainment. Don't forget to play the MYCricQ quiz app today and put your cricket skills to the test. Challenge yourself, beat your high score, and become a cricket champion! Have a fantastic time playing!",
    "Hey there! ක්‍රිකට් දැනුම සහ විනෝදය සමඟින් ඔබේ දවස ආරම්භ කිරීමට අමතක නොකරන්න! ඔබේ ක්‍රිකට් IQ පරීක්ෂා කිරීමට සහ ක්‍රීඩාවේ ඉහළින්ම සිටීමට දිනපතා MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම ක්‍රීඩා කිරීමට මතක තබා ගන්න! ඔබේ ක්‍රිකට් වික්‍රමය දැන් ආරම්භ කරන්න!",
    "Hey ක්‍රිකට් ලෝලීන්! ඔබේ ක්‍රිකට් ප්‍රවීණත්වය මුදා හැරීමට සහ MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම ජය ගැනීමට කාලයයි! දෛනික අභියෝග සහ සිත් ඇදගන්නා සුළු සුළු දේවල් අතපසු නොකරන්න. සෑම දිනකම ක්‍රීඩා කිරීමෙන් ක්‍රීඩාවෙන් ඉදිරියෙන් සිටින්න! දැන් ක්‍රිකට් ශූරයන්ගේ ලීගයට එක්වන්න!",
    "ආයුබෝවන් ක්‍රිකට් Lover! MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම සමඟින් ඔබේ ක්‍රිකට් IQ බල ගැන්වීමට සූදානම් වන්න! සෑම දිනකම ක්‍රිකට් ට්‍රයිවියාවේ උද්යෝගිමත් ලෝකයට කිමිදීමට අමතක නොකරන්න. ඔබේ කුසලතා මුවහත් කරන්න, ඔබේ මිතුරන්ට අභියෝග කරන්න, සහ විස්මිත ත්‍යාග විවෘත කරන්න! ක්‍රිකට් උණ සජීවීව තබාගෙන දිනපතා ක්‍රීඩා කරන්න!",
    "ආයුබෝවන්! මෙය MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම වාදනය කිරීමේ ඔබේ දෛනික චර්යාව සමඟින් සිටීමට ඉක්මන් මතක් කිරීමකි. ත්‍රාසජනක ක්‍රිකට් ප්‍රශ්නාවලියෙහි නිරත වන්න සහ ක්‍රිකට් ලෝකයේ නවතම දේ සමඟ යාවත්කාලීනව සිටින්න. ඔබටම අභියෝග කරන්න, අලුත් දෙයක් ඉගෙන ගන්න, සහ MYCricQ සමඟ හොඳ කාලයක් ගත කරන්න!",
    "Hey there! MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම දිනපතා වාදනය කිරීමට සහ ඔබේ ක්‍රිකට් දැනුම පරීක්ෂා කිරීමට මිත්‍රශීලී මතක් කිරීමක් පමණි. ක්‍රීඩාවේ ඉහළින්ම සිටින්න සහ සිත් ඇදගන්නා සුළු සුළු ප්‍රශ්න සමඟ ඔබටම අභියෝග කරන්න. විනෝදය අතපසු නොකරන්න! දැන් ක්‍රීඩා කරන්න සහ ඔබේ ක්‍රිකට් දක්ෂතා පෙන්වන්න!",
    "Hey there! ඔබගේ ක්‍රිකට් දැනුම සහ විනෝදාස්වාදයේ දෛනික මාත්‍රාව සඳහා කාලය ගත කිරීමට සුහද මතක් කිරීමක් පමණි. අදම MYCricQ ප්‍රශ්න විචාරාත්මක යෙදුම වාදනය කර ඔබේ ක්‍රිකට් කුසලතා පරීක්ෂණයට ලක් කිරීමට අමතක නොකරන්න. ඔබටම අභියෝග කරන්න, ඔබේ ඉහළ ලකුණු පරාජය කරන්න, සහ ක්‍රිකට් ශූරයෙකු වන්න! සෙල්ලම් කිරීමට අපූරු කාලයක් ගත කරන්න!"
]