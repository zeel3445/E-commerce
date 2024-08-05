import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'ID of the product', type: 'string' })
  productId: string;

  @ApiProperty({ description: 'Product name', type: 'string' })
  productname: string;

  @ApiProperty({ description: 'Product description', type: 'string' })
  description: string;

  @ApiProperty({ description: 'Price of the product', type: 'string' })
  price: string;

  @ApiProperty({ description: 'Status of the product', type: 'string' })
  status: string;

  @ApiProperty({
    description: 'Indicates if the product is enabled',
    type: 'boolean',
  })
  enabled: boolean;
}
