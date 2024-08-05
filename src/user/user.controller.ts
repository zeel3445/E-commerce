import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/user.dto';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/Roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';

@Controller('user')
@ApiTags('user')
@ApiSecurity('JWT-auth')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Post('create-user')
  @ApiOperation({ summary: 'create user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  //@UseGuards(JwtAuthGuard)
  public async postuser(
    @Body()
    userdto: CreateUserDto
  ) {
    return await this.userservice.postuser(userdto);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('get-user-by-id')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get user by ID' })
  public async getuserbyid(@Query('id') id?: string): Promise<any> {
    console.log('I am inside getuserbyid');
    console.log(id);
    return await this.userservice.getuserbyid(id);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete('delete-user-by-id')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'delete user by ID' })
  public async deleteuserbyid(
    @Req() req,
    @Query('id') id: string
  ): Promise<any> {
    console.log('I am inside deleteuserbyid');
    return await this.userservice.deleteuserbyid(
      id,
      req.user.sub,
      req.user.role
    );
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('get-all-users')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get all user' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('letters') letters?: string
  ): Promise<any> {
    console.log('inside getallusers');
    return this.userservice.getAll(page, limit, letters);
  }
}
