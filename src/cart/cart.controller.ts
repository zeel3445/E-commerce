import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto } from 'src/dto/cart.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ActionType } from './actiontype.enum';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/Roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('cart')
@ApiTags('cart')
@ApiSecurity('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
  @Post('create-cart')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'create cart' })
  public async createCart(@Req() req, @Body() cartdto: CartDto): Promise<any> {
    console.log('inside createcart');
    console.log(req.user.sub);
    return await this.cartService.createCart(cartdto, req.user.sub);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
  @Get('get-cart-by-id')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get cart by ID' })
  async getCart(@Req() req): Promise<any> {
    return await this.cartService.getCart(req.user.sub);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
  @Put('add-cart-to-product')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'add product to cart' })
  @ApiBody({
    description: 'add product to cart',
    schema: {
      properties: {
        itemId: { type: 'string' },
        quantity: { type: 'string' },
      },
    },
  })
  public async updateCart(
    @Req() req,
    @Body('itemId') itemId: string,
    @Body('quantity') quantity: number
  ): Promise<any> {
    console.log('inside update cart');
    return await this.cartService.updateCart(req.user.sub, itemId, quantity);
  }
  //@UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  //@Roles(Role.Customer)
  @Delete('delete-cart')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'delete cart' })
  async deleteCart(@Req() req): Promise<void> {
    return await this.cartService.deleteCart(req.user.sub);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
  @Patch('delete-any-product-from-cart')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'delete any product from cart' })
  @ApiBody({
    description: 'add product to cart',
    schema: {
      properties: {
        itemId: { type: 'string' },
      },
    },
  })
  async deleteItemFromCart(
    @Req() req,
    @Body('itemId') itemId: string
  ): Promise<any> {
    return await this.cartService.deleteItemFromCart(req.user.sub, itemId);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
  @Delete('delete-using-actiontype')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'using some action' })
  @ApiBody({
    description: 'using some action',
    schema: {
      properties: {
        itemId: { type: 'string' },
      },
    },
  })
  async deleteusingactiontype(
    @Req() req,
    @Body('itemId') itemId: string,
    @Body('actionType') actionType: ActionType
  ): Promise<any> {
    return await this.cartService.deleteusingactiontype(
      req.user.sub,
      itemId,
      actionType
    );
  }
}
