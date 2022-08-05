import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { JwtService } from "@nestjs/jwt"
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthCredentialsDto } from "./dto/auth-credentials.dto"

@Module({

  imports: [MongooseModule.forRoot('mongodb+srv://vinayOnclick:0hzxpqJw2LP3ltWb@cluster0.ip4m3.mongodb.net/?retryWrites=true&w=majority'),
  MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },

  ]), PassportModule.register({ defaultStrategy: 'jwt', session: true }),
  JwtModule.registerAsync({
    imports: [ConfigModule,],
    useFactory: async (configService: ConfigService) => ({
      secretOrPrivateKey: configService.get('JWT_SECRET'),
      signOptions: {
        expiresIn: "10s",
      },
    }),
    inject: [ConfigService]
  }),],
  providers: [UsersService,AuthCredentialsDto,],
  controllers: [UsersController],

})
export class UsersModule { }
