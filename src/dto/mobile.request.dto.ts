import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MobileDTO {

    @IsString()
    @IsNotEmpty()
    mobile: string;

    @IsOptional()
    serverRef: string;

}

