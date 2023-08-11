import { Injectable } from '@nestjs/common';
import { OTPRequestDTO } from './dto/otp.request.dto';
import axios from 'axios';
import {
  AUTH_TOKEN,
  CHARGE_AMOUNT,
  DELETE_USER_DATA,
  DELETE_USER_DATA_FROM_ALL,
  GET_REMINDER_MSG,
  GET_USER_DATA,
  IDEABIZ_SMS_URL,
  IDEABIZ_SUBSCRIBE_OTP_URL,
  IDEABIZ_VALIDATE_OTP_URL,
  SEND_SMS_URL,
  SERVICE_ID,
  SMS_REMINDERS,
  SUBSCRIBE_USER_URL,
  UNSUBSCRIBE_USER_URL,
  getPaymentURL,
} from './config/const';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';
import {
  generateNumber,
  mobileGenerator,
  mobileGeneratorWithOutPlus,
} from './config/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MobileDTO } from './dto/mobile.request.dto';
import { MyLogger } from './logger/logger.service';

@Injectable()
export class AppService {

  constructor(private readonly logger: MyLogger) {}

  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async triggerPayments() {
    try {
      this.logger.log("==== TRIGERRING CHARGES FOR USERS =====", AppService.name)
      const response = await axios(GET_USER_DATA, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      this.logger.log("==== ALL USERS FROM DB =====", AppService.name)
      this.logger.log(JSON.stringify(response.data.data), AppService.name)
      this.logger.log("User Count: " + JSON.stringify(response.data.data.length), AppService.name)
      if (response.data.data.length != 0) {
        const users = response.data.data;
        users.forEach(async (element: any) => {
          await axios(getPaymentURL(element.attributes.mobile), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: AUTH_TOKEN,
            },
            data: {
              amountTransaction: {
                clientCorrelator: `${mobileGenerator(
                  element.attributes.mobile,
                )}-${Date.now()}`,
                endUserId: `tel:${mobileGenerator(element.attributes.mobile)}`,
                paymentAmount: {
                  chargingInformation: {
                    amount: CHARGE_AMOUNT,
                    currency: 'LKR',
                    description: `My CrickQ (${element.attributes.campaign.data.attributes.campaign_name}).`,
                  },
                  chargingMetaData: {
                    onBehalfOf: 'My CrickQ',
                    purchaseCategoryCode: 'Service',
                    channel: 'WAP',
                    taxAmount: '0',
                    serviceID: SERVICE_ID,
                  },
                },
                referenceCode: `REF-${Date.now()}`,
                transactionOperationStatus: 'Charged',
              },
            },
          }).catch(async (e) => {
            this.logger.error(`USER: ${element.attributes.mobile} |` + JSON.stringify(e?.response?.data), AppService.name)
            // if (
            //   e?.response?.data?.fault?.code == 'POL0001' ||
            //   e?.response?.data?.requestError?.policyException?.messageId ==
            //     'POL1000' ||
            //   e?.response?.data?.requestError?.policyException?.messageId ==
            //     'SVC0270'
            // ) {
            //   const dto: UserSubscribeRequestDTO = {
            //     mobile: element.attributes.mobile,
            //     userId: element.id,
            //     campaignId: element.attributes.campaign.data.id,
            //     matchName:
            //       element.attributes.campaign.data.attributes.campaign_name,
            //   };
            //   console.log(dto);
            //   this.logger.error(`USER: ${element.attributes.mobile} |` + "dto: " + JSON.stringify(dto), AppService.name)
            //   await this.unsubscribe(dto);
            // }
          });
        });
      }

      console.log('PAYMENT USER COUNT: ' + response.data.data.length);
    } catch (e) {
      console.log(e);
    }
  }

  async _checkDuplicateNumber(csvDataArr) {
    return [...new Set(csvDataArr)];
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendReminder() {
    try {
      const response = await axios(GET_USER_DATA, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const users = response.data.data;

      const msgData = await axios(GET_REMINDER_MSG, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      });

      const reminderMessage = msgData?.data.data[0]?.attributes?.sms ? msgData?.data.data[0]?.attributes?.sms : SMS_REMINDERS[Math.floor(Math.random() * SMS_REMINDERS.length)];

      if (users) {
        const mobileNumbers = users.map((user: any) => {
          return user.attributes.mobile;
        });

        const uniqueMobileNumbers = await this._checkDuplicateNumber(
          mobileNumbers,
        );

        const nullCheckNumbers = uniqueMobileNumbers.filter(element => {
          return element !== null;
        });

        const formatedNumbers = nullCheckNumbers.map((msisdn: string) => {
          return `tel:+${mobileGeneratorWithOutPlus(msisdn)}`;
        });

        const requestBody = {
          outboundSMSMessageRequest: {
            address: formatedNumbers,
            senderAddress: '87798',
            outboundSMSTextMessage: {
              message: reminderMessage,
            },
            clientCorrelator: '123456',
            receiptRequest: {
              notifyURL: null,
              callbackData: null,
            },
            senderName: 'MyCricQ',
          },
        };

        const response = await axios(IDEABIZ_SMS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: AUTH_TOKEN,
          },
          data: requestBody,
        });

        if(response.status == 201) {
          console.log(new Date() + " All SMS SENT SUCCESSFULLY!")
        } 
      }
    } catch (error) {
      console.log(error?.response?.data)
    }
  }

  async sendOTP(OTPRequestDTO: OTPRequestDTO): Promise<any> {
    try {
      const otp = (OTPRequestDTO.otp * 22) / 120;
      const message = `Hi ${OTPRequestDTO.serverRef}! Your One-Time Password is ${otp}.`;

      return await axios(
        SEND_SMS_URL +
          '&to=' +
          OTPRequestDTO.mobile +
          '&msg=' +
          message +
          '&msg_ref_num=A001',
        {
          method: 'POST',
          data: null,
        },
      );
    } catch (e) {
      throw e;
    }
  }

  async subscribeOTP(dto: MobileDTO): Promise<any> {
    try {
      const response = await axios(IDEABIZ_SUBSCRIBE_OTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: AUTH_TOKEN,
        },
        data: {
          method: 'AndroidApp',
          msisdn: `${mobileGeneratorWithOutPlus(dto.mobile)}`,
          // serviceID: SERVICE_ID,
        },
      });
      console.log(response);

      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async validateOTP(dto: OTPRequestDTO): Promise<any> {
    try {
      const response = await axios(IDEABIZ_VALIDATE_OTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: AUTH_TOKEN,
        },
        data: {
          pin: `${dto.otp}`,
          serverRef: dto.serverRef,
        },
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  async subscribe(dto: UserSubscribeRequestDTO): Promise<any> {
    try {
      // const response = await axios(SUBSCRIBE_USER_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Accept: 'application/json',
      //     Authorization: AUTH_TOKEN,
      //   },
      //   data: {
      //     method: 'WEB',
      //     msisdn: `tel:${mobileGenerator(dto.mobile)}`,
      //     serviceID: dto.campaignId,
      //   },
      // });

      // if (response.data.status == 'SUBSCRIBED') {
      await axios(getPaymentURL(dto.mobile), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: AUTH_TOKEN,
        },
        data: {
          amountTransaction: {
            clientCorrelator: `${mobileGenerator(dto.mobile)}-${Date.now()}`,
            endUserId: `tel:${mobileGenerator(dto.mobile)}`,
            paymentAmount: {
              chargingInformation: {
                amount: CHARGE_AMOUNT,
                currency: 'LKR',
                description: `My CrickQ (${dto.matchName}).`,
              },
              chargingMetaData: {
                onBehalfOf: 'My CrickQ',
                purchaseCategoryCode: 'Service',
                channel: 'WAP',
                taxAmount: '0',
                serviceID: SERVICE_ID,
              },
            },
            referenceCode: `REF-${Date.now()}`,
            transactionOperationStatus: 'Charged',
          },
        },
      }).catch(async (e) => {
        if (
          e?.response?.data?.requestError?.policyException?.messageId ==
            'POL1000' ||
          e?.response?.data?.requestError?.policyException?.messageId ==
            'SVC0270' ||
          e?.response?.data?.requestError?.policyException?.messageId ==
            'POL1001'
        ) {
          await this.unsubscribe(dto);
        } else if (e?.response?.data?.fault?.code == 'POL0001') {
          const mobileDTO: MobileDTO = {
            mobile: dto.mobile,
          };

          await this.unsubscribeFullUser(mobileDTO);
        }
      });

      return 'Succefully Subscribed';
    } catch (e) {
      throw e;
    }
  }

  async unsubscribeFullUser(dto: MobileDTO): Promise<any> {
    try {
      console.log(dto);
      const response = await axios(UNSUBSCRIBE_USER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: AUTH_TOKEN,
        },
        data: {
          method: 'WEB',
          msisdn: `tel:${mobileGenerator(dto.mobile)}`,
          serviceID: SERVICE_ID,
        },
      });

      if (
        response?.data?.data?.subscribeResponse?.status == 'UNSUBSCRIBED' ||
        response.data?.data?.subscribeResponse?.status == 'NOT_SUBSCRIBED'
      ) {
        await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
          method: 'POST',
        });
      }
    } catch (e) {
      if (e.response.data.message) {
        return e.response.data.message;
      }
      throw e;
    }
  }

  async unsubscribe(dto: UserSubscribeRequestDTO): Promise<any> {
    try {
      await axios(DELETE_USER_DATA + dto.userId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: null,
      });
    } catch (e) {
      throw e;
    }
  }
}
