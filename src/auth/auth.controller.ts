import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
@Controller('auth')
@ApiTags('auth')
//@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authservice: AuthService) {}
  @Post('register-user')
  @ApiOperation({ summary: 'register a user' })
  async register(
    @Body()
    userdto: CreateUserDto
  ) {
    console.log('her1');
    return this.authservice.register(
      userdto.name,
      userdto.username,
      userdto.password,
      userdto.age,
      userdto.gender,
      userdto.role
    );
  }
  @Post('login-user')
  @ApiOperation({ summary: 'login user' })
  @ApiBody({
    description: 'user login',
    schema: {
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(
    @Body()
    userdto: CreateUserDto
  ) {
    console.log('inside login');
    return this.authservice.login(userdto.username, userdto.password);
  }
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'resest-password' })
  @ApiBody({
    description: 'resest-password',
    schema: {
      properties: {
        username: { type: 'string' },
        oldpassword: { type: 'string' },
        newpassword: { type: 'string' },
      },
    },
  })
  async resetPassword(
    @Req() req,
    @Body()
    userdto: CreateUserDto,
    @Body('oldpassword') oldpassword: string,
    @Body('newpassword') newpassword: string
  ): Promise<any> {
    console.log('in reset controller');
    console.log(req.user);
    console.log('resetcontroller');

    return await this.authservice.resetPassword(
      userdto.username,
      oldpassword,
      newpassword
    );
  }
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('forgot-password')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiBody({
    description: 'forgot password',
    schema: {
      properties: {
        username: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'forgot password' })
  async forgotPassword(
    @Req()
    @Body()
    userdto: CreateUserDto
  ) {
    const code = await this.authservice.generateResetCode(userdto.username);
    const msg = 'Use the following code to reset your password.';
    return { message: msg, code };
  }
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('reset-forgot-password')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'reset forgot password' })
  @ApiBody({
    description: 'reset forgot password',
    schema: {
      properties: {
        code: { type: 'string' },
        newpassword: { type: 'string' },
      },
    },
  })
  async resetforgotpassword(
    @Body()
    userdto: CreateUserDto,
    @Body('code') code: string,
    @Body('newpassword') newpassword: string
  ): Promise<void> {
    console.log('resetcontroller');
    await this.authservice.resetforgotpassword(
      userdto.username,
      code,
      newpassword
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-user')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'user logout' })
  @ApiBody({
    description: 'user logout',
    schema: {
      properties: {},
    },
  })
  async logout(@Req() req): Promise<any> {
    const token = req.headers['authorization'].split(' ')[1];
    console.log(token);
    return await this.authservice.logout(req.user.username, token);
  }
}
