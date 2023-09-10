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
  MSPACE_APPID,
  MSPACE_AUTH_TOKEN,
  MSPACE_OTP_URL,
  MSPACE_OTP_VERIFY_URL,
  MSPACE_PAYMENT_URL,
  MSPACE_SUBSCRIBE_URL,
  SEND_SMS_URL,
  SERVICE_ID,
  SERVICE_PROVIDERS,
  SMS_REMINDERS,
  SUBSCRIBE_USER_URL,
  UNSUBSCRIBE_USER_URL,
  getPaymentURL,
} from './config/const';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';
import {
  _checkDuplicateNumber,
  generateNumber,
  generateStringHash,
  mobileGenerator,
  mobileGeneratorWithOutPlus,
  validateServiceProvider,
} from './config/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MobileDTO } from './dto/mobile.request.dto';
import { MyLogger } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: MyLogger) {}

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async triggerPayments() {
    try {
      this.logger.log(
        '==== TRIGERRING CHARGES FOR USERS =====',
        AppService.name,
      );
      const response = await axios(GET_USER_DATA, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      this.logger.log('==== ALL USERS FROM DB =====', AppService.name);
      this.logger.log(JSON.stringify(response.data.data), AppService.name);
      this.logger.log(
        'User Count: ' + JSON.stringify(response.data.data.length),
        AppService.name,
      );

      if (response.data.data.length != 0) {
        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const users = response.data.data;
        const processUser = async (element) => {
          if (
            (await validateServiceProvider(element.attributes.mobile)) ==
            SERVICE_PROVIDERS.DIALOG
          ) {
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
                  endUserId: `tel:${mobileGenerator(
                    element.attributes.mobile,
                  )}`,
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
            })
              .then((res) =>
                this.logger.log(
                  `USER: ${element.attributes.mobile} |` +
                    JSON.stringify(res?.data),
                  AppService.name,
                ),
              )
              .catch(async (e) => {
                this.logger.error(
                  `USER: ${element.attributes.mobile} |` +
                    JSON.stringify(e?.response?.data),
                  AppService.name,
                );
              });
          } 
          // else if (
          //   (await validateServiceProvider(element.attributes.mobile)) ==
          //   SERVICE_PROVIDERS.MOBITEL
          // ) {
          //   const response = await axios(MSPACE_PAYMENT_URL, {
          //     method: 'POST',
          //     headers: {
          //       'Content-Type': 'application/json',
          //       Accept: 'application/json',
          //     },
          //     data: {
          //       applicationId: MSPACE_APPID,
          //       externalTrxId: `${generateNumber(11)}`,
          //       subscriberId: `tel:${mobileGeneratorWithOutPlus(
          //         element.attributes.mobile,
          //       )}`,
          //       paymentInstrumentName: 'Mobile Account',
          //       amount: '1',
          //       currency: 'LKR',
          //     },
          //   });
          // }
        };

        const processUsersWithDelay = async () => {
          for (const element of users) {
            await processUser(element);
            await delay(1000); // Adding a 1-second delay
          }
        };

        processUsersWithDelay();
      }

      console.log('PAYMENT USER COUNT: ' + response.data.data.length);
    } catch (e) {
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendReminder() {
    const chunkSize = 10;
    const chunks = [];
    const delayBetweenRequests = 1000;

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
        },
      });

      const reminderMessage = msgData?.data.data[0]?.attributes?.sms
        ? msgData?.data.data[0]?.attributes?.sms
        : SMS_REMINDERS[Math.floor(Math.random() * SMS_REMINDERS.length)];

      if (users) {
        const mobileNumbers = users.map((user: any) => {
          return user.attributes.mobile;
        });

        const uniqueMobileNumbers = await _checkDuplicateNumber(mobileNumbers);

        const nullCheckNumbers = uniqueMobileNumbers.filter((element) => {
          return element !== null;
        });

        const formatedNumbers = nullCheckNumbers.map((msisdn: string) => {
          return `tel:+${mobileGeneratorWithOutPlus(msisdn)}`;
        });

        for (let i = 0; i < formatedNumbers.length; i += chunkSize) {
          chunks.push(formatedNumbers.slice(i, i + chunkSize));
        }

        const sendSMSWithDelay = async (chunk) => {
          const requestBody = {
            outboundSMSMessageRequest: {
              address: chunk,
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

          const response = await axios.post(IDEABIZ_SMS_URL, requestBody, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: AUTH_TOKEN,
            },
          });

          // Process the response if needed
          console.log('SMS sent successfully:', response.data);
        };

        const sendSMSRequests = async () => {
          for (const chunk of chunks) {
            await sendSMSWithDelay(chunk);
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenRequests),
            );
          }
        };

        // Call the function to start sending SMS requests
        sendSMSRequests();
      }
    } catch (error) {
      console.log(error?.response?.data);
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
      if ((await validateServiceProvider(dto.mobile)) == 'dialog') {
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

        return response;
      } else if ((await validateServiceProvider(dto.mobile)) == 'mobitel') {
        this.logger.log(
          '==== SUBSCRIBE OTP MOBITEL ENDPOINT CALLED ====',
          AppService.name,
        );
        const response = await axios(MSPACE_OTP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            applicationId: MSPACE_APPID,
            password: 'eea1ebf64d8eca14380a0da39aba9f8b',
            subscriberId: `tel:${mobileGeneratorWithOutPlus(dto.mobile)}`,
            applicationHash: generateStringHash(10),
            applicationMetaData: {
              client: 'MOBILEAPP',
              device: 'Samsung S8',
              os: 'Windows 10',
              appCode: 'https://mycricq.com',
            },
          },
        });
        this.logger.log(
          '==== SUBSCRIBE OTP MOBITEL ====' + response.data,
          AppService.name,
        );
        const returnResponse = {
          data: {
            ...response.data,
            msisdn: `${mobileGeneratorWithOutPlus(dto.mobile)}`,
            serverRef: response.data?.referenceNo,
            data: {
              msisdn: `${mobileGeneratorWithOutPlus(dto.mobile)}`,
              serverRef: response.data?.referenceNo,
              status: 'PENDING_AUTH',
            },
          },
          msisdn: `${mobileGeneratorWithOutPlus(dto.mobile)}`
        };
        return returnResponse;
      }
    } catch (e) {
      console.log(e);
      this.logger.error(
        '==== SUBSCRIBE OTP MOBITEL ====' + e?.response,
        AppService.name,
      );
      throw e;
    }
  }

  async validateOTP(dto: OTPRequestDTO): Promise<any> {
    this.logger.log(
      '==== OTPRequestDTO ====' + JSON.stringify(dto),
      AppService.name,
    );
    try {
      if ((await validateServiceProvider(dto.mobile)) == 'dialog') {
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
      } else if ((await validateServiceProvider(dto.mobile)) == 'mobitel') {
        this.logger.log(
          '==== VERIFY MOBITEL ENDPOINT CALLED ====',
          AppService.name,
        );
        const response = await axios(MSPACE_OTP_VERIFY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            applicationId: MSPACE_APPID,
            password: 'eea1ebf64d8eca14380a0da39aba9f8b',
            subscriberId: `tel:${mobileGeneratorWithOutPlus(dto.mobile)}`,
            referenceNo: dto.serverRef,
            otp: dto.otp,
          },
        });
        this.logger.log(
          '==== VERIFY MOBITEL ====' + response.data,
          AppService.name,
        );
        return response;
      }
    } catch (e) {
      this.logger.error(
        '==== VERIFY OTP MOBITEL ====' + e?.response,
        AppService.name,
      );
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
      if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.DIALOG
      ) {
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
      } 
      // else if (
      //   (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.MOBITEL
      // ) {
      //   const response = await axios(MSPACE_PAYMENT_URL, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Accept: 'application/json',
      //     },
      //     data: {
      //       applicationId: MSPACE_APPID,
      //       externalTrxId: `${generateNumber(11)}`,
      //       subscriberId: `tel:${mobileGeneratorWithOutPlus(dto.mobile)}`,
      //       paymentInstrumentName: 'Mobile Account',
      //       amount: '1',
      //       currency: 'LKR',
      //     },
      //   });
      // }

      return 'Succefully Subscribed';
    } catch (e) {
      throw e;
    }
  }

  async unsubscribeFullUser(dto: MobileDTO): Promise<any> {
    try {
      console.log(dto);
      if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.DIALOG
      ) {
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
      } else if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.MOBITEL
      ) {
        const response = await axios(MSPACE_SUBSCRIBE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            applicationId: MSPACE_APPID,
            subscriberId: `tel:${mobileGeneratorWithOutPlus(dto.mobile)}`,
            action: '0',
          },
        });

        console.log(response.data)

        await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
          method: 'POST',
        });
      }
    } catch (e) {
      console.log(e.response)
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
