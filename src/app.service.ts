import { Injectable } from '@nestjs/common';
import { OTPRequestDTO } from './dto/otp.request.dto';
import axios from "axios";
import { AUTH_TOKEN, SEND_SMS_URL, SUBSCRIBE_USER_URL, UNSUBSCRIBE_USER_URL } from './config/const';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';

@Injectable()
export class AppService {
  async sendOTP(OTPRequestDTO: OTPRequestDTO): Promise<any> {
    try {
      const otp = (OTPRequestDTO.message * 22) / 120
      const message = `Hi ${OTPRequestDTO.name}! Your One-Time Password is ${otp}.`

      return await axios(SEND_SMS_URL + '&to=' + OTPRequestDTO.mobile + '&msg=' + message + '&msg_ref_num=A001', {
        method: 'POST',
        data: null
      });
    } catch (e) {
      throw e
    }
  }

  async subscribe(dto: UserSubscribeRequestDTO): Promise<any> {
    try {

      return await axios(SUBSCRIBE_USER_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": AUTH_TOKEN
        },
        data: {
          method:"WEB",      
          msisdn:`tel:+94${dto.mobile}`,
          serviceID: dto.campaignId    
      }
      });
    } catch (e) {
      throw e
    }
  }

  async unsubscribe(dto: UserSubscribeRequestDTO): Promise<any> {
    try {

      return await axios(UNSUBSCRIBE_USER_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": AUTH_TOKEN
        },
        data: {
          method:"WEB",      
          msisdn:`tel:+94${dto.mobile}`,
          serviceID: dto.campaignId    
      }
      });
    } catch (e) {
      throw e
    }
  }

}
