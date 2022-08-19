import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import { HeaderRaw } from './decorator/raw-header.decorator';
import { RoleProtected } from './decorator/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser(['email', 'id']) user: User,
    @HeaderRaw() rawHeader: string[],
  ) {
    return { user, rawHeader };
  }
  @Get('private2')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@Req() req: any) {
    return req.user;
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  testingPrivateRoute3(@Req() req: any) {
    return req.user;
  }
}
