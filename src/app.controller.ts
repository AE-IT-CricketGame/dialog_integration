import { Controller, Post, HttpStatus, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OTPRequestDTO } from './dto/otp.request.dto';
import { ResponseDTO } from './dto/response.dto';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';
import { MobileDTO } from './dto/mobile.request.dto';
import { MyLogger } from './logger/logger.service';

@Controller('config')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: MyLogger,
  ) {}

  @Post('/otp')
  async sendOTP(@Body() OTPRequestDTO: OTPRequestDTO): Promise<ResponseDTO> {
    const response = await this.appService.sendOTP(OTPRequestDTO);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `OTP sent Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/subscribe-otp')
  async subscribeOTP(@Body() mobileDTO: MobileDTO): Promise<ResponseDTO> {
    const response = await this.appService.subscribeOTP(mobileDTO);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `OTP sent Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/validate-otp')
  async validateOTP(
    @Body() OTPRequestDTO: OTPRequestDTO,
  ): Promise<ResponseDTO> {
    const response = await this.appService.validateOTP(OTPRequestDTO);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `OTP validated Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/subscribe')
  async subscribeUser(
    @Body() userSubscribeRequestDTO: UserSubscribeRequestDTO,
  ): Promise<ResponseDTO> {
    const response = await this.appService.subscribe(userSubscribeRequestDTO);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `User subscribe Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/unsubscribe')
  async unsubscribeUser(
    @Body() userSubscribeRequestDTO: UserSubscribeRequestDTO,
  ): Promise<ResponseDTO> {
    const response = await this.appService.unsubscribe(userSubscribeRequestDTO);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `User unsubscribe from campaign Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/unsubscribe-app')
  async unsubscribeUserApp(
    @Body() userSubscribeRequestDTO: MobileDTO,
  ): Promise<ResponseDTO> {
    const response = await this.appService.unsubscribeFullUser(
      userSubscribeRequestDTO,
    );

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `User unsubscribe Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/initiate-payment')
  async initiatePayment(): Promise<ResponseDTO> {
    const response = await this.appService.triggerPaymentsInitialsCycle();

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `Payment Initiated Successfully`,
      null,
    );
  }

  @Post('/clear-payment')
  async clearPayments(): Promise<ResponseDTO> {
    const response = await this.appService.clearCycles();

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `Payment Cleared Successfully`,
      null,
    );
  }

  @Post('/callback')
  async callBackAPI(@Body() data: any): Promise<ResponseDTO> {
    console.log(data);

    return new ResponseDTO(
      HttpStatus.OK,
      'Success',
      `callback Successfully`,
      null,
    );
  }

  @Get('/test')
  async testAPI(): Promise<void> {
    this.logger.log('ALL USERS FROM DB', AppController.name);
    this.logger.log(
      JSON.stringify({ test: 'test', test2: ['test'] }),
      AppController.name,
    );
  }
}
