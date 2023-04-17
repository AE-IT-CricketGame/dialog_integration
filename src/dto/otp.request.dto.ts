import { IsNotEmpty, IsString } from 'class-validator';

export class OTPRequestDTO {

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  name: string;

}

