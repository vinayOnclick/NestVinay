import {
  Controller,
  SetMetadata,
  Request,
  Get,
  Post,
  Body,
  Put,
  ValidationPipe,
  Query,
  Req,
  Res,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  ApiTags,
  ApiSecurity,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiConsumes,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UserCredentialsDto } from "./dto/user-credentials.dto";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto"
import { loginDto } from "./dto/userDto";

@Controller("users")
@ApiTags("Users")
@ApiSecurity("api_key")
export class UsersController {
  constructor(private userService: UsersService, AuthCredentialsDto: AuthCredentialsDto) { }
  @Post("/register")
  async signIn(@Body() userDto: UserCredentialsDto, @Req() req) {
    const vin = await this.userService.register(userDto, req);
    return vin;
  }
  @Post("/login")
  async logIn(@Body() authCredentialsDto: AuthCredentialsDto, @Request() req) {
    return await this.userService.login(authCredentialsDto, req);
  }
}
