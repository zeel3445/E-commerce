import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CartItem {
  @ApiProperty({ description: 'ID of product', type: 'string' })
  itemId: string;
  @ApiProperty({
    description: 'quantity of product',
    type: 'number',
    required: true,
  })
  quantity: number;
  @ApiProperty({
    description: 'price of product',
    type: 'string',
    required: true,
  })
  price: number;
  @ApiProperty({
    description: 'name of product',
    type: 'string',
    required: true,
  })
  name: string;
  @ApiProperty({
    description: 'description of product',
    type: 'string',
    required: true,
  })
  description: string;
  @ApiProperty({ description: 'total price', type: 'string', required: true })
  total: number;
}

export class CartDto {
  @ApiProperty({ description: 'ID of cart', type: 'string', required: true })
  cartId: string;
  @ApiProperty({ description: 'ID of user', type: 'string', required: true })
  userId: string;
  @ApiProperty({ description: 'about items', type: 'string' })
  @IsOptional()
  items: CartItem[];
  @ApiProperty({ description: 'subtotal', type: 'number' })
  @IsOptional()
  subtotal: number;
  @ApiProperty({ description: 'tax', type: 'number' })
  @IsOptional()
  tax: number;
  @ApiProperty({ description: 'shipping charges', type: 'number' })
  @IsOptional()
  shipping: number;
  @ApiProperty({ description: 'discounts', type: 'number' })
  @IsOptional()
  discounts: number;
  @ApiProperty({ description: 'total bill', type: 'number' })
  @IsOptional()
  grandTotal: number;
}
