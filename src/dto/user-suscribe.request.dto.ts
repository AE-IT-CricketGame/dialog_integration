import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserSubscribeRequestDTO {

    @IsNotEmpty()
    userId: any;

    @IsString()
    @IsNotEmpty()
    mobile: string;

    @IsNotEmpty()
    campaignId: any;

    @IsOptional()
    matchName: string;

    @IsOptional()
    serverRef: string;

}

