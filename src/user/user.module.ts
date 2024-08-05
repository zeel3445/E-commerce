import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/models/user.model';
import { PostgresService } from 'src/services/pg.services';
import { CreateUserDto } from 'src/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/Roles.guard';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '180s' },
    }),
  ],
  controllers: [UserController],
  providers: [
    PostgresService,
    AuthService,
    UserService,
    UserModel,
    CreateUserDto,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class UserModule {}
