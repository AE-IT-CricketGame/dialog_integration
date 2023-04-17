import { IsNotEmpty, IsString } from 'class-validator';

export class OTPRequestDTO {

  @IsNotEmpty()
  message: any;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  name: string;

}

