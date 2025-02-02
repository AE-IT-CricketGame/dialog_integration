import { Injectable } from '@nestjs/common';
import { OTPRequestDTO } from './dto/otp.request.dto';
import axios from 'axios';
import {
  AUTH_TOKEN,
  CHARGE_AMOUNT,
  DELETE_FRIMI_USER,
  DELETE_USER_DATA,
  DELETE_USER_DATA_FROM_ALL,
  GET_REMINDER_MSG,
  GET_USER_DATA,
  HUTCH_BUNDLE_ID,
  HUTCH_OTP_URL,
  HUTCH_OTP_VERIFY_URL,
  IDEABIZ_SMS_URL,
  IDEABIZ_SUBSCRIBE_OTP_URL,
  IDEABIZ_VALIDATE_OTP_URL,
  MSPACE_APPID,
  MSPACE_AUTH_TOKEN,
  MSPACE_OTP_URL,
  MSPACE_OTP_VERIFY_URL,
  MSPACE_PAYMENT_URL,
  MSPACE_SMS_URL,
  MSPACE_SUBSCRIBE_URL,
  PAYMENT_USER_URL,
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
import { HutchService } from './hutch/hutch.service';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: MyLogger,
    private hutchService: HutchService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async triggerPaymentsFirstCycle() {
    const response: any = await this.getPaymentUserByCycle(1);
    const paymentUserData = response?.data?.data;

    if (paymentUserData?.length == 0) {
      this.logger.log(
        '==== TRIGERRING CHARGES FOR USERS (1st Cycle): NO DATA =====',
        AppService.name,
      );
      return;
    }

    this.logger.log(
      '==== TRIGERRING CHARGES FOR USERS (1st Cycle) =====',
      AppService.name,
    );

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const users = response.data.data;
    const processUser = async (element) => {
      if (element?.attributes?.mobile) {
        if (
          (await validateServiceProvider(element.attributes.mobile)) ==
          SERVICE_PROVIDERS.DIALOG
        ) {
          await axios(getPaymentURL(element?.attributes?.mobile), {
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
                    description: `My CrickQ (cycle ${element?.attributes?.cycle}).`,
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
            .then(async (res) => {
              await this.updatePaymentUser(
                element.attributes.mobile,
                10,
                JSON.stringify(res?.data ? res.data : res) || 'Internal Error',
              );
              this.logger.log(
                `USER (1st Cycle): ${element?.attributes?.mobile} |` +
                  JSON.stringify(res?.data),
                AppService.name,
              );
            })
            .catch(async (e) => {
              this.logger.error(
                `USER (1st Cycle): ${element.attributes.mobile} |` +
                  JSON.stringify(e?.response?.data),
                AppService.name,
              );

              await this.updatePaymentUser(
                element?.attributes?.mobile,
                2,
                JSON.stringify(e?.response?.data) || 'Internal Error',
              );
            });
        }
      }
    };

    const processUsersWithDelay = async () => {
      for (const element of users) {
        await processUser(element);
        await delay(1000); // Adding a 1-second delay
      }
    };

    processUsersWithDelay();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async triggerPaymentsSecondCycle() {
    const response: any = await this.getPaymentUserByCycle(2);
    const paymentUserData = response?.data?.data;

    if (paymentUserData?.length == 0) {
      this.logger.log(
        '==== TRIGERRING CHARGES FOR USERS (2nd Cycle): NO DATA =====',
        AppService.name,
      );
      return;
    }

    this.logger.log(
      '==== TRIGERRING CHARGES FOR USERS (2nd Cycle) =====',
      AppService.name,
    );
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const users = response.data.data;
    const processUser = async (element) => {
      if (element.attributes.mobile) {
        if (
          (await validateServiceProvider(element.attributes.mobile)) ==
          SERVICE_PROVIDERS.DIALOG
        ) {
          await axios(getPaymentURL(element?.attributes?.mobile), {
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
                    description: `My CrickQ (cycle ${element?.attributes?.cycle}).`,
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
            .then(async (res) => {
              await this.updatePaymentUser(
                element.attributes.mobile,
                10,
                JSON.stringify(res?.data ? res.data : res) || 'Internal Error',
              );
              this.logger.log(
                `USER (2nd Cycle): ${element.attributes.mobile} |` +
                  JSON.stringify(res?.data),
                AppService.name,
              );
            })
            .catch(async (e) => {
              this.logger.error(
                `USER (2nd Cycle): ${element.attributes.mobile} |` +
                  JSON.stringify(e?.response?.data),
                AppService.name,
              );

              await this.updatePaymentUser(
                element.attributes.mobile,
                3,
                JSON.stringify(e?.response?.data) || 'Internal Error',
              );
            });
        }
      }
    };

    const processUsersWithDelay = async () => {
      for (const element of users) {
        await processUser(element);
        await delay(1000); // Adding a 1-second delay
      }
    };

    processUsersWithDelay();
  }
  //"07 00 * * *"
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerPaymentsTHirdCycle() {
    const response: any = await this.getPaymentUserByCycle(3);
    const paymentUserData = response?.data?.data;

    if (paymentUserData?.length == 0) {
      this.logger.log(
        '==== TRIGERRING CHARGES FOR USERS (3rd Cycle): NO DATA =====',
        AppService.name,
      );
      return;
    }
    this.logger.log(
      '==== TRIGERRING CHARGES FOR USERS (3rd Cycle) =====',
      AppService.name,
    );
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const users = response.data.data;
    const processUser = async (element) => {
      if (element.attributes.mobile) {
        if (
          (await validateServiceProvider(element.attributes.mobile)) ==
          SERVICE_PROVIDERS.DIALOG
        ) {
          await axios(getPaymentURL(element?.attributes?.mobile), {
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
                    description: `My CrickQ (cycle ${element?.attributes?.cycle}).`,
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
            .then(async (res) => {
              await this.updatePaymentUser(
                element.attributes.mobile,
                10,
                JSON.stringify(res?.data ? res.data : res) || 'Internal Error',
              );
              this.logger.log(
                `USER: ${element.attributes.mobile} |` +
                  JSON.stringify(res?.data),
                AppService.name,
              );
            })
            .catch(async (e) => {
              this.logger.error(
                `USER: ${element.attributes.mobile} |` +
                  JSON.stringify(e?.response?.data),
                AppService.name,
              );

              await this.updatePaymentUser(
                element.attributes.mobile,
                4,
                JSON.stringify(e?.response?.data) || 'Internal Error',
              );
            });
        }
      }
    };

    const processUsersWithDelay = async () => {
      for (const element of users) {
        await processUser(element);
        await delay(1000); // Adding a 1-second delay
      }
    };

    processUsersWithDelay();
  }

  // @Cron(CronExpression.EVERY_30_MINUTES)
  // async updatePaymetUsers() {
  //   try {
  //   const response = await axios(GET_USER_DATA, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Accept: 'application/json',
  //     },
  //   });

  //   if (response.data.data.length != 0) {
  //     const delay = (ms: number) =>
  //       new Promise((resolve) => setTimeout(resolve, ms));
  //     const users = response.data.data;
  //     const processUser = async (element) => {
  //       if (element.attributes.mobile) {
  //         await this.createPaymentUser(
  //           element.attributes.mobile,
  //           '',
  //           await validateServiceProvider(element.attributes.mobile),
  //         );
  //       }
  //     };

  //     const processUsersWithDelay = async () => {
  //       for (const element of users) {
  //         await processUser(element);
  //         await delay(1000); // Adding a 1-second delay
  //       }
  //     };

  //     processUsersWithDelay();
  //   }
  // } catch (e) {
  //   console.log(e)
  // }
  // }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async clearCycles() {
    try {
      this.logger.log('==== CLEAR CYCLES =====', AppService.name);
      await axios(PAYMENT_USER_URL + '/cycle/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    } catch (e) {
      this.logger.error(JSON.stringify(e), AppService.name);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async triggerPaymentsInitialsCycle() {
    const response: any = await this.getPaymentUserByCycle(0);
    const paymentUserData = response?.data?.data;

    if (paymentUserData?.length == 0) {
      this.logger.log(
        '==== TRIGERRING CHARGES FOR USERS (initial Cycle): NO DATA =====',
        AppService.name,
      );
      return;
    }

    this.logger.log(
      '==== TRIGERRING CHARGES FOR USERS (initial Cycle) =====',
      AppService.name,
    );
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const users = response.data.data;
    const processUser = async (element) => {
      if (element.attributes.mobile) {
        if (
          (await validateServiceProvider(element.attributes.mobile)) ==
          SERVICE_PROVIDERS.DIALOG
        ) {
          await axios(getPaymentURL(element?.attributes?.mobile), {
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
                    description: `My CrickQ (cycle ${element?.attributes?.cycle}).`,
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
            .then(async (res) => {
              await this.updatePaymentUser(
                element.attributes.mobile,
                10,
                JSON.stringify(res?.data ? res.data : res) || 'Internal Error',
              );
              this.logger.log(
                `USER (initial Cycle): ${element.attributes.mobile} |` +
                  JSON.stringify(res?.data),
                AppService.name,
              );
            })
            .catch(async (e) => {
              this.logger.error(
                `USER (initial Cycle): ${element.attributes.mobile} |` +
                  JSON.stringify(e?.response?.data),
                AppService.name,
              );

              await this.updatePaymentUser(
                element.attributes.mobile,
                1,
                JSON.stringify(e?.response?.data) || 'Internal Error',
              );
            });
        }
      }
    };

    const processUsersWithDelay = async () => {
      for (const element of users) {
        await processUser(element);
        await delay(1000); // Adding a 1-second delay
      }
    };

    processUsersWithDelay();
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
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

      this.logger.log(
        'User Count: ' + JSON.stringify(response.data.data.length),
        AppService.name,
      );

      if (response.data.data.length != 0) {
        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const users = response.data.data;
        const processUser = async (element) => {
          const paymentUserData: any = await this.getPaymentUser(
            element.attributes.mobile,
          );
          if (
            element.attributes.mobile &&
            paymentUserData?.data?.data.length != 0
          ) {
            if (
              (await validateServiceProvider(element.attributes.mobile)) ==
              SERVICE_PROVIDERS.DIALOG
            ) {
              await axios(getPaymentURL(element?.attributes?.mobile), {
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
                        description: `My CrickQ (${element?.attributes?.campaign?.data?.attributes?.campaign_name}).`,
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
                .then(async (res) => {
                  await this.updatePaymentUser(
                    element.attributes.mobile,
                    10,
                    JSON.stringify(res?.data ? res.data : res) ||
                      'Internal Error',
                  );
                  this.logger.log(
                    `USER: ${element.attributes.mobile} |` +
                      JSON.stringify(res?.data),
                    AppService.name,
                  );
                })
                .catch(async (e) => {
                  this.logger.error(
                    `USER: ${element.attributes.mobile} |` +
                      JSON.stringify(e?.response?.data),
                    AppService.name,
                  );

                  await this.updatePaymentUser(
                    element.attributes.mobile,
                    1,
                    JSON.stringify(e?.response?.data) || 'Internal Error',
                  );
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
            }
          }
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
      this.logger.error('========= CRON ERROR =======', AppService.name);
      this.logger.error(JSON.stringify(e), AppService.name);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendReminder() {
    const chunkSize = 10;
    const dialogChunks = [];
    const mobitelChunks = [];
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

        const dialogNumbers = await Promise.all(
          nullCheckNumbers.map(async (msisdn: string) => {
            if (
              (await validateServiceProvider(msisdn)) ===
              SERVICE_PROVIDERS.DIALOG
            ) {
              return `tel:+${mobileGeneratorWithOutPlus(msisdn)}`;
            }
          }),
        );

        const mobitelNumbers = await Promise.all(
          nullCheckNumbers.map(async (msisdn: string) => {
            if (
              (await validateServiceProvider(msisdn)) ===
              SERVICE_PROVIDERS.MOBITEL
            ) {
              return `tel:+${mobileGeneratorWithOutPlus(msisdn)}`;
            }
          }),
        );

        // const formatedNumbers = nullCheckNumbers.map((msisdn: string) => {
        //   return `tel:+${mobileGeneratorWithOutPlus(msisdn)}`;
        // });

        const filterUndefined = (arr) =>
          arr.filter((item) => item !== undefined);

        // Filter out undefined values from dialogNumbers and mobitelNumbers
        const filteredDialogNumbers = filterUndefined(dialogNumbers);
        const filteredMobitelNumbers = filterUndefined(mobitelNumbers);

        for (let i = 0; i < filteredDialogNumbers.length; i += chunkSize) {
          dialogChunks.push(filteredDialogNumbers.slice(i, i + chunkSize));
        }

        for (let i = 0; i < filteredMobitelNumbers.length; i += chunkSize) {
          mobitelChunks.push(filteredMobitelNumbers.slice(i, i + chunkSize));
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

          console.log(requestBody);

          const response = await axios.post(IDEABIZ_SMS_URL, requestBody, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: AUTH_TOKEN,
            },
          });

          // Process the response if needed
          this.logger.log(
            `SMS Dialog sent successfully: ${response.data} |`,
            AppService.name,
          );
        };

        const sendSMSWithDelayMobitel = async (chunk) => {
          const requestBody = {
            version: '1.0',
            applicationId: MSPACE_APPID,
            password: 'eea1ebf64d8eca14380a0da39aba9f8b',
            message: reminderMessage,
            destinationAddresses: chunk,
            sourceAddress: '77000',
            deliveryStatusRequest: '1',
            encoding: '245',
            binaryHeader:
              '526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564',
          };

          const response = await axios(MSPACE_SMS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            data: requestBody,
          });

          // Process the response if needed
          this.logger.log(
            `SMS Mobitel sent successfully: ${response.data} |`,
            AppService.name,
          );
        };

        const sendSMSRequests = async () => {
          for (const chunk of dialogChunks) {
            await sendSMSWithDelay(chunk);
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenRequests),
            );
          }

          for (const chunk of mobitelChunks) {
            await sendSMSWithDelayMobitel(chunk);
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenRequests),
            );
          }
        };

        // Call the function to start sending SMS requests
        sendSMSRequests();
      }
    } catch (error) {
      console.log(error);
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
      } else if ((await validateServiceProvider(dto.mobile)) == 'hutch') {
        this.logger.log(
          '==== SUBSCRIBE OTP HUTCH ENDPOINT CALLED ====',
          AppService.name,
        );

        const response = await this.hutchService.sendOTP(dto.mobile);

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
          '==== SUBSCRIBE OTP MOBITEL ====' + JSON.stringify(response.data),
          AppService.name,
        );
        // if (response.data?.statusCode == 'E1351') {
        //   await this.createPaymentUser(
        //     dto.mobile,
        //     response.data.subscriberId,
        //     SERVICE_PROVIDERS.MOBITEL,
        //   );
        // }

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
          msisdn: `${mobileGeneratorWithOutPlus(dto.mobile)}`,
        };
        return returnResponse;
      }
    } catch (e) {
      console.log(e);
      this.logger.error(
        '==== SUBSCRIBE OTP MOBITEL ====' + JSON.stringify(e?.response),
        AppService.name,
      );
      throw e;
    }
  }

  async validateOTP(dto: OTPRequestDTO): Promise<any> {
    this.logger.log(
      '==== OTPValidateDTO ====' + JSON.stringify(dto),
      AppService.name,
    );
    try {
      if ((await validateServiceProvider(dto.mobile)) == 'dialog') {
        this.logger.log(
          '==== VERIFY DIALOG ENDPOINT CALLED ====',
          AppService.name,
        );
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

        const userData = response.data.data;

        if (
          userData?.status == 'SUBSCRIBED' ||
          userData?.status == 'ALREADY_SUBSCRIBED'
        ) {
          await this.createPaymentUser(
            dto.mobile,
            dto.serverRef,
            SERVICE_PROVIDERS.DIALOG,
          );
        }

        this.logger.log(
          '==== VERIFY DIALOG ====' + JSON.stringify(response.data),
          AppService.name,
        );

        return response;
      } else if ((await validateServiceProvider(dto.mobile)) == 'hutch') {
        this.logger.log(
          '==== VERIFY HUTCH ENDPOINT CALLED ====',
          AppService.name,
        );

        const response = await this.hutchService.verifyOTPAndRegister(
          dto.mobile,
          dto.otp,
        );

        await this.createPaymentUser(
          dto.mobile,
          response.data?.data?.subscription_id,
          SERVICE_PROVIDERS.HUTCH,
        );

        this.logger.log(
          '==== VERIFY HUTCH ====' + JSON.stringify(response.data),
          AppService.name,
        );
        return response;
      } else if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.MOBITEL
      ) {
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
        console.log(response.data);

        if (response.data.statusCode == 'S1000') {
          await this.createPaymentUser(
            dto.mobile,
            response.data.subscriberId,
            SERVICE_PROVIDERS.MOBITEL,
          );
        }
        this.logger.log(
          '==== VERIFY MOBITEL ====' + JSON.stringify(response.data),
          AppService.name,
        );
        return response;
      }
    } catch (e) {
      this.logger.error(
        '==== VERIFY OTP ERROR ====' + JSON.stringify(e),
        AppService.name,
      );
      throw e;
    }
  }

  async createPaymentUser(msisdn: string, serverRef: string, provider: string) {
    await axios(PAYMENT_USER_URL + '?mobile=' + msisdn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: {
        data: {
          mobile: msisdn,
          service_provider: provider,
          cycle: 0,
          serverRef: serverRef?.toString(),
          ipdated: new Date(),
        },
      },
    }).catch(async (e) => {
      this.logger.error(
        '==== createPaymentUser ====' + JSON.stringify(e),
        AppService.name,
      );
    });
  }

  async getPaymentUsers() {
    return await axios(PAYMENT_USER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).catch(async (e) => {
      this.logger.error(
        '==== getPaymentUsers ====' + JSON.stringify(e),
        AppService.name,
      );
    });
  }

  async getPaymentUser(msisdn: string) {
    return await axios(PAYMENT_USER_URL + '?filters[mobile][$eq]=' + msisdn, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).catch(async (e) => {
      this.logger.error(
        '==== getPaymentUser ====' + JSON.stringify(e),
        AppService.name,
      );
    });
  }

  async getPaymentUserByCycle(cycle: number) {
    return await axios(PAYMENT_USER_URL + '?filters[cycle][$eq]=' + cycle, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).catch(async (e) => {
      this.logger.error(
        '==== getPaymentUser ====' + JSON.stringify(e),
        AppService.name,
      );
    });
  }

  async updatePaymentUser(msisdn: string, cycle: number, log: string) {
    try {
      await axios(
        PAYMENT_USER_URL +
          '/update?mobile=' +
          msisdn +
          '&cycle=' +
          cycle +
          '&log=' +
          log,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log('==== updatePaymentUser ====' + msisdn, AppService.name);
    } catch (e) {
      this.logger.error(
        '==== updatePaymentUser ====' + JSON.stringify(e),
        AppService.name,
      );
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
              serverRef: dto?.serverRef,
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
          await axios(PAYMENT_USER_URL + '/delete/' + dto.mobile, {
            method: 'POST',
          });
          await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
            method: 'POST',
          });
        }
      } else if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.MOBITEL
      ) {
        console.log(`tel:${mobileGeneratorWithOutPlus(dto.mobile)}`);
        const response = await axios(MSPACE_SUBSCRIBE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            applicationId: MSPACE_APPID,
            password: 'eea1ebf64d8eca14380a0da39aba9f8b',
            subscriberId: `${dto?.serverRef}`,
            action: '0',
          },
        });

        console.log(response.data);

        await axios(PAYMENT_USER_URL + '/delete/' + dto.mobile, {
          method: 'POST',
        });

        await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
          method: 'POST',
        });
      } else if (
        (await validateServiceProvider(dto.mobile)) == SERVICE_PROVIDERS.HUTCH
      ) {
        console.log(`tel:${mobileGeneratorWithOutPlus(dto.mobile)}`);
        await this.hutchService.removeUser(dto.mobile);

        await axios(PAYMENT_USER_URL + '/delete/' + dto.mobile, {
          method: 'POST',
        });

        await axios(DELETE_USER_DATA_FROM_ALL + dto.mobile, {
          method: 'POST',
        });
      }

      await axios(DELETE_FRIMI_USER + dto.mobile, {
        method: 'POST',
      });
    } catch (e) {
      console.log(e.response);
      if (e.response?.data.message) {
        return e.response?.data.message;
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
