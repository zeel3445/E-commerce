import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponse {
  @ApiProperty({ description: 'ID of the item', type: 'string' })
  itemId: string;

  @ApiProperty({ description: 'Quantity of the item', type: 'number' })
  quantity: number;

  @ApiProperty({ description: 'Price of the item', type: 'number' })
  price: number;

  @ApiProperty({ description: 'Name of the item', type: 'string' })
  name: string;

  @ApiProperty({ description: 'Description of the item', type: 'string' })
  description: string;

  @ApiProperty({ description: 'Total price for this item', type: 'number' })
  total: number;
}

export class CartResponseDto {
  @ApiProperty({ description: 'ID of the cart', type: 'string' })
  cartId: string;

  @ApiProperty({ description: 'ID of the user', type: 'string' })
  userId: string;

  @ApiProperty({
    description: 'List of cart items',
    type: CartItemResponse,
    isArray: true,
  })
  items: CartItemResponse[];

  @ApiProperty({ description: 'Subtotal of the cart', type: 'number' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount for the cart', type: 'number' })
  tax: number;

  @ApiProperty({ description: 'Shipping charges for the cart', type: 'number' })
  shipping: number;

  @ApiProperty({ description: 'Discounts applied to the cart', type: 'number' })
  discounts: number;

  @ApiProperty({ description: 'Total bill amount of the cart', type: 'number' })
  grandTotal: number;
}
