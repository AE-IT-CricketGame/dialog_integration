import { Injectable, LoggerService, Logger, LogLevel } from '@nestjs/common';
import axios from 'axios';
import { mobileGeneratorWithOutPlus } from 'src/config/common';
import { HUTCH_BUNDLE_ID, HUTCH_CLIENT_ID, HUTCH_CLIENT_PASSWORD, HUTCH_CLIENT_SECRET, HUTCH_CLIENT_USERNAME, HUTCH_OTP_UNREGISTER_URL, HUTCH_OTP_URL, HUTCH_OTP_VERIFY_URL, HUTCH_TOKEN_URL } from 'src/config/const';

@Injectable()
export class HutchService {
  constructor() {}

  async getAccessToken() {
    try {
      const response = await axios(HUTCH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: {
          grant_type: 'password',
          client_id: HUTCH_CLIENT_ID,
          client_secret: HUTCH_CLIENT_SECRET,
          username: HUTCH_CLIENT_USERNAME,
          password: HUTCH_CLIENT_PASSWORD,
        },
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  async sendOTP(mobile: string) {
    try {
      const tokenData = await this.getAccessToken()
      const response = await axios(HUTCH_OTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${tokenData.data.access_token}`
        },
        data: {
          bundle_id: HUTCH_BUNDLE_ID,
          number: `${mobileGeneratorWithOutPlus(mobile)}`,
        },
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  async verifyOTPAndRegister(mobile: string, otp: number) {
    try {
      const tokenData = await this.getAccessToken()
      const response = await axios(HUTCH_OTP_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${tokenData.data.access_token}`
        },
        data: {
          bundle_id: HUTCH_BUNDLE_ID,
          number: `${mobileGeneratorWithOutPlus(mobile)}`,
          otp: otp
        },
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  async removeUser(mobile: string) {
    try {
      const tokenData = await this.getAccessToken()
      const response = await axios(HUTCH_OTP_UNREGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${tokenData.data.access_token}`
        },
        data: {
          bundle_id: HUTCH_BUNDLE_ID,
          number: `${mobileGeneratorWithOutPlus(mobile)}`,
        },
      });

      return response;
    } catch (e) {
      throw e;
    }
  }
}
