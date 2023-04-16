import { Controller, Post, HttpStatus, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { OTPRequestDTO } from './dto/otp.request.dto';
import { ResponseDTO } from './dto/response.dto';

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
}
