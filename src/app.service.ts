import { Injectable } from '@nestjs/common';
import { OTPRequestDTO } from './dto/otp.request.dto';
import axios from "axios";
import { SEND_SMS_URL } from './config/const';

@Injectable()
export class AppService {
  async sendOTP(OTPRequestDTO: OTPRequestDTO): Promise<any> {
    try {
     
      return await axios(SEND_SMS_URL + '&to=' + OTPRequestDTO.mobile + '&msg=' + OTPRequestDTO.message + '&msg_ref_num=A001', {
        method: 'POST',
        data: null
      });
    } catch (e) {
      throw e
    }
  }

}
