import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from 'src/dto/product.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/Roles.guard';
import { Role } from '../auth/role.enum';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@Controller('product')
@ApiTags('product')
@ApiSecurity('JWT-auth')
export class ProductController {
  constructor(private readonly productservice: ProductService) {}
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Post('create-products')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'create products' })
  async Createproduct(
    @Body()
    productdto: ProductDto
  ) {
    return await this.productservice.Createproduct(productdto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('get-product-by-id')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get product by ID' })
  public async getproductbyid(@Query('id') id: string): Promise<any> {
    console.log('I am inside getproductbyid');
    return await this.productservice.getproductbyid(id);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete('delete-product-by-id')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'delete product by ID' })
  // @ApiBody({
  //   description: 'delete product by ID',
  //   schema: {
  //     properties: {
  //       id: { type: 'string' },
  //     },
  //   },
  // })
  public async deleteproductbyid(@Query('id') id: string): Promise<any> {
    console.log('I am inside deleteproductbyid');
    return await this.productservice.deleteproductbyid(id);
  }
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Patch('update-product-details')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'update product details' })
  public async updateproductdetails(
    @Body()
    productdto: ProductDto
  ) {
    return await this.productservice.updateproductdetails(productdto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('get-product-by-status')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get product by status' })
  @ApiBody({
    description: 'get product by status',
    schema: {
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        letters: { type: 'string' },
      },
    },
  })
  public async getproductsbystatus(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('letters') letters?: string
  ): Promise<any> {
    console.log('inside getallusers');
    return this.productservice.getproductsbystatus(page, limit, letters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-products')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token for authentication',
    required: true,
    example: ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'get all products' })
  @ApiBody({
    description: 'get all products',
    schema: {
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        letters: { type: 'string' },
      },
    },
  })
  public async getallproducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('letters') letters?: string
  ): Promise<any> {
    console.log('inside get all products');
    return this.productservice.getallproducts(page, limit, letters);
  }
}
