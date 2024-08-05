import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartDto } from 'src/dto/cart.dto';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ProductService } from 'src/product/product.service';
import { ProductModule } from 'src/product/product.module';
import { PostgresService } from 'src/services/pg.services';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    ProductModule,
    HttpModule,
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '180s' },
    }),
  ],
  controllers: [CartController],
  providers: [
    PostgresService,
    AuthService,
    CartService,
    CartDto,
    HttpModule,
    ProductService,
  ],
})
export class CartModule {}
