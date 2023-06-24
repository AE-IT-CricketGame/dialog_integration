import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OTPRequestDTO {

  @IsNotEmpty()
  otp: any;

  @IsOptional()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  serverRef: string;

}

