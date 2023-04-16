import { HttpStatus } from "@nestjs/common";
import { IsString } from "class-validator";


export class ResponseDTO {
    readonly statusCode: HttpStatus;
  
    @IsString()
    readonly message: string;
  
    @IsString()
    readonly friendlyMessage: string;
  
    readonly data: any;
  
    constructor(
      statusCode: HttpStatus,
      message: string,
      friendlyMessage: string,
      data: any,
    ) {
      this.statusCode = statusCode;
      this.message = message;
      this.friendlyMessage = friendlyMessage;
      this.data = data;
    }
  }
  