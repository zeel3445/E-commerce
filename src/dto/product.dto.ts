import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ProductDto {
  @ApiProperty({ description: 'product name', type: 'string', required: true })
  productname: string;
  @ApiProperty({
    description: 'product description',
    type: 'string',
    required: true,
  })
  description: string;
  @ApiProperty({
    description: 'price of product',
    type: 'string',
    required: true,
  })
  price: string;
  @ApiProperty({
    description: 'status of product',
    type: 'string',
    required: true,
  })
  status: string;
  @IsOptional()
  @ApiProperty({
    description: 'product is enabled or not',
    type: 'string',
  })
  enabled: boolean;
}
