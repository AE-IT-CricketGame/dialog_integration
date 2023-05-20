import { Injectable } from '@nestjs/common';
import { OTPRequestDTO } from './dto/otp.request.dto';
import axios from 'axios';
import {
  AUTH_TOKEN,
  CHARGE_AMOUNT,
  DELETE_USER_DATA,
  DELETE_USER_DATA_FROM_ALL,
  GET_USER_DATA,
  SEND_SMS_URL,
  SERVICE_ID,
  SUBSCRIBE_USER_URL,
  UNSUBSCRIBE_USER_URL,
  getPaymentURL,
} from './config/const';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';
import { generateNumber, mobileGenerator } from './config/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MobileDTO } from './dto/mobile.request.dto';

@Injectable()
export class AppService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerPayments() {
    try {
      const response = await axios(GET_USER_DATA, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
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
            if (
              e?.response?.data?.fault?.code == 'POL0001' ||
              e?.response?.data?.requestError?.policyException?.messageId ==
                'POL1000' ||
              e?.response?.data?.requestError?.policyException?.messageId ==
                'SVC0270'
            ) {
              const dto: UserSubscribeRequestDTO = {
                mobile: element.attributes.mobile,
                userId: element.id,
                campaignId: element.attributes.campaign.data.id,
                matchName:
                  element.attributes.campaign.data.attributes.campaign_name,
              };
              console.log(dto)
              await this.unsubscribe(dto);
            }
          });
        });
      }

      console.log('PAYMENT USER COUNT: ' + response.data.data.length);
    } catch (e) {
      console.log(e);
    }
  }

  async sendOTP(OTPRequestDTO: OTPRequestDTO): Promise<any> {
    try {
      const otp = (OTPRequestDTO.message * 22) / 120;
      const message = `Hi ${OTPRequestDTO.name}! Your One-Time Password is ${otp}.`;

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
            e?.response?.data?.fault?.code == 'POL0001' ||
            e?.response?.data?.requestError?.policyException?.messageId ==
              'POL1000' ||
            e?.response?.data?.requestError?.policyException?.messageId ==
              'SVC0270'
          ) {
            await this.unsubscribe(dto);
          }
        });;
      

      return "Succefully Subscribed";
    } catch (e) {
      throw e;
    }
  }

  async unsubscribeFullUser(dto: MobileDTO): Promise<any> {
    try {
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

      if (response.data.subscribeResponse.status == 'UNSUBSCRIBED') {
        await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: null,
        });
      }
    } catch (e) {
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
