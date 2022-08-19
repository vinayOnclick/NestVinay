import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  Request,
  Response,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.model";
let ObjectId = require("mongodb").ObjectId;
import { UserCredentialsDto } from "./dto/user-credentials.dto";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";

import { UserDto } from "./dto/userDto";
import { JwtPayload } from "../middleware/jwt-payload.interface";
import * as  bcrypt  from "bcrypt";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class UsersService {
  user: any;
  constructor(
    @InjectModel("User") private usersModel: Model<User>,
    private jwtTokenService: JwtService
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersModel.findOne({ email: email });
  }
  async findOneByPhone(phone: string): Promise<User> {
    return await this.usersModel.findOne({ phoneNumber: phone });
  }
  async validateUserByJwt(payload: JwtPayload) {
    let user = await this.findOneByPhone(payload.phoneNumber);
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
  async register(userCred: UserCredentialsDto, @Response() res: any) {
    let usersCount = (await this.usersModel.estimatedDocumentCount()) + 1;
    let today = new Date().toISOString().substr(0, 10);
    let todayDate = today.replace(/-/g, "");
    let userId = todayDate + usersCount;

    try {
      const exist = await this.findOneByEmail(userCred.email);
      if (!exist) {
        const data = await new this.usersModel({
          userId: userId,
          fullName: userCred.fullName,
          email: userCred.email,
          password: userCred.password,
          phoneNumber: userCred.phoneNumber,
          address: userCred.address,
        });
        return data.save();
      } else {
        return new BadRequestException(
          "User Already Exists With The Email You Provided"
        );
      }
    } catch (error) {
      return console.log(error);
    }
  }

  async login(userCred: AuthCredentialsDto, request: any): Promise<any> {
    const user = await this.usersModel.findOne({userCred,});
    console.log(user,"iser>>>>>>>>>>>>>>>>>")
    let result = await bcrypt.compare(userCred.password, user.password);
    if (!result) {
      console.log("password not matching");
      return new BadRequestException("password matching fail");
    } else {
      const accesstoken = await this.jwtTokenService.sign({
        user,
        JWT_SECRET: "u$Er2o20bYeCc0me",
      });
      return {user,accesstoken}
    }
  }
  static async sendEmail(req, res) {
    try {
      let user = await this.usersModel.findOne({ email: req.body.email });
      console.log(user);
      if (!user) {
        res.json({ message: "users not found" });
      } else {
        const sent = await this.usersModel.sendMail({
          from: user.email,
          to: user.email,
          subject: "Its a SMTP message from vinay Sharma",
          html: "hello folks",
        });

        return res.json({
          message: "SUCCESS",
          data: sent,
        });
      }
    } catch (error) {
      return res.json({
        message: "FAILED",
        data: error,
      });
    }
  }

  async verifyTokenByEmail(emailVerifyCredentialsDto: any) {
    try {
      let userToAttempt, errorMsgNotFound, successMsg: any;
      if (emailVerifyCredentialsDto.email) {
        userToAttempt = await this.userModel.findOne({
          email: emailVerifyCredentialsDto.email,
        });
        errorMsgNotFound = 'Email not found !';
        successMsg = 'Email verification is successfully!';
      } else {
        userToAttempt = await this.userModel.findOne({
          phoneNumber: emailVerifyCredentialsDto.phone,
        });
        errorMsgNotFound = 'Phone number not found !';
        successMsg = 'Phone verification is successfully!';
      }
      if (!userToAttempt) throw new BadRequestException(errorMsgNotFound);

      return this.userVerificationModel
        .findOne({
          createdUser: userToAttempt._id,
          otp: emailVerifyCredentialsDto.code,
          verifiedStatus: false,
        })
        .then(
          (data) => {
            if (data) {
              let userData = this.userModel
                .findByIdAndUpdate(userToAttempt._id, { emailVerified: true })
                .exec();
              data.verifiedStatus = true;
              data.verifiedTime = new Date();
              data.save();
              return { data: data, msg: successMsg };
            } else {
              return new BadRequestException('Verification code is invalid!');
            }
          },
          (error) => {
            return new BadRequestException('Verification code is invalid!');
          },
        );
    } catch (e) {
      return new BadRequestException('Internal server error');
    }
  }
  
  async verifyTokenByEmailPassword(
    resetPasswordCredentialsDto: ResetPasswordCredentialsDto,
  ) {
    try {
      if (
        resetPasswordCredentialsDto.password !=
        resetPasswordCredentialsDto.confirmPassword
      ) {
        return new BadRequestException(
          'Password does not match with confirm password',
        );
      }
      let user = await this.findOneByEmail(resetPasswordCredentialsDto.email);
      if (!user) throw new BadRequestException('Email not found !');
      let passwordTokenData = await this.userVerificationModel.findOne({
        createdUser: user._id,
        otp: resetPasswordCredentialsDto.code,
        verifiedStatus: false,
      });
      if (!passwordTokenData) {
        return new BadRequestException('Verification code is invalid!');
      }
      return await this.userModel
        .findOne({ email: resetPasswordCredentialsDto.email })
        .then(
          (userToAttempt) => {
            passwordTokenData.verifiedStatus = true;
            passwordTokenData.verifiedTime = new Date();
            passwordTokenData.save();
            userToAttempt.password = resetPasswordCredentialsDto.password;
            userToAttempt.save();
            return { msg: 'Password  is successfully updated!' };
          },
          (error) => {
            throw new BadRequestException('Email not found !');
          },
        );
    } catch (e) {
      return new BadRequestException('Internal server error');
    }
  }
}



