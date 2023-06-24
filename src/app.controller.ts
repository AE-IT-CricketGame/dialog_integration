import { Controller, Post, HttpStatus, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { OTPRequestDTO } from './dto/otp.request.dto';
import { ResponseDTO } from './dto/response.dto';
import { UserSubscribeRequestDTO } from './dto/user-suscribe.request.dto';
import { MobileDTO } from './dto/mobile.request.dto';

@Controller('config')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/otp')
  async sendOTP(@Body() OTPRequestDTO: OTPRequestDTO): Promise<ResponseDTO> {
   const response = await this.appService.sendOTP(OTPRequestDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `OTP sent Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/subscribe-otp')
  async subscribeOTP(@Body() mobileDTO: MobileDTO): Promise<ResponseDTO> {
   const response = await this.appService.subscribeOTP(mobileDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `OTP sent Successfully`,
      response.data ? response.data : response,
    );
  }

  
  @Post('/validate-otp')
  async validateOTP(@Body() OTPRequestDTO: OTPRequestDTO): Promise<ResponseDTO> {
   const response = await this.appService.validateOTP(OTPRequestDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `OTP validated Successfully`,
      response.data ? response.data : response,
    );
  }


  @Post('/subscribe')
  async subscribeUser(@Body() userSubscribeRequestDTO: UserSubscribeRequestDTO): Promise<ResponseDTO> {
   const response = await this.appService.subscribe(userSubscribeRequestDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `User subscribe Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/unsubscribe')
  async unsubscribeUser(@Body() userSubscribeRequestDTO: UserSubscribeRequestDTO): Promise<ResponseDTO> {
   const response = await this.appService.unsubscribe(userSubscribeRequestDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `User unsubscribe from campaign Successfully`,
      response.data ? response.data : response,
    );
  }

  @Post('/unsubscribe-app')
  async unsubscribeUserApp(@Body() userSubscribeRequestDTO: MobileDTO): Promise<ResponseDTO> {
   const response = await this.appService.unsubscribeFullUser(userSubscribeRequestDTO);

   
    return new ResponseDTO(
      HttpStatus.OK,
      "Success",
      `User unsubscribe Successfully`,
      response.data ? response.data : response,
    );
  }
}
