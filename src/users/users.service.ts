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
}



