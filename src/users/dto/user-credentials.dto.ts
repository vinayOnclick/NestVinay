import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserCredentialsDto {
  @IsString()
  @IsEmail()

  email: string;

  @IsString()
  @IsNotEmpty()

  password: string;

  @IsString()
  @IsNotEmpty()
 
  fullName: string;

  @IsString()

  address: string;

  @IsString()
 
  phoneNumber: string;
}
