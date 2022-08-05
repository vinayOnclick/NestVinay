import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()

  email: string;

  @IsString()
  @IsNotEmpty()

  password: string;


}
