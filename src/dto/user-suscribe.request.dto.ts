import { IsNotEmpty, IsString } from 'class-validator';

export class UserSubscribeRequestDTO {

    @IsNotEmpty()
    userId: any;

    @IsString()
    @IsNotEmpty()
    mobile: string;

    @IsString()
    @IsNotEmpty()
    campaignId: string;

}

