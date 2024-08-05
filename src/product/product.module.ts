import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductDto } from 'src/dto/product.dto';
import { PostgresService } from 'src/services/pg.services';
import { ProductModel } from 'src/models/product.model';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/auth/Roles.guard';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '180s' },
    }),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    AuthService,
    ProductDto,
    PostgresService,
    ProductModel,
    RolesGuard,
    JwtAuthGuard,
  ],
})
export class ProductModule {}
