import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ProductDto } from 'src/dto/product.dto';
import { ProductModel } from 'src/models/product.model';
import { PostgresService } from 'src/services/pg.services';
import { del, redisClient } from 'src/services/redis.service';

@Injectable()
export class ProductService {
  constructor(private readonly postgress: PostgresService) {}
  async Createproduct(productdto: ProductDto): Promise<any> {
    const product = new ProductModel();
    const existinguser = await ProductModel.getFromproductname(
      this.postgress,
      productdto.productname
    );
    if (existinguser) {
      const err = 'product already exist';
      throw new ConflictException(err);
    }

    product.productname = productdto.productname;
    product.description = productdto.description;
    product.price = productdto.price;
    product.status = productdto.status;

    console.log(product);
    const val = await ProductModel.build(product);
    console.log(val);

    await val.save(this.postgress);

    return val.getSanitizedData();
  }
  async getproductbyid(id: string): Promise<any> {
    try {
      let product = new ProductModel();
      product = await ProductModel.getFromId(this.postgress, id);
      console.log(product);
      const val = await ProductModel.build(product);
      return val.getSanitizedData();
    } catch (err) {
      return err;
    }
  }
  async deleteproductbyid(id: string): Promise<any> {
    try {
      let product = new ProductModel();
      product = await ProductModel.getFromId(this.postgress, id);
      console.log(product);
      if (product) {
        console.log('making enabled false');
        const val = await ProductModel.build(product);

        val.enabled = false;
        await val.save(this.postgress);
        await del(`product:${product.ProductId}`);
        console.log(product);
        console.log('delete');
        const val1 = 'successfully deleted';
        return val1;
      } else {
        console.error('Error getting user by id:');
        const err = 'Error getting user by id';
        throw new BadRequestException(err);
      }
    } catch (err) {
      console.error('Error getting user by id:', err);
      return err;
    }
  }
  async updateproductdetails(productdto: ProductDto) {
    let productdata = new ProductModel();
    productdata = await ProductModel.getFromproductname(
      this.postgress,
      productdto.productname
    );
    productdata.price = productdto.price;
    productdata.description = productdto.description;
    productdata.status = productdto.status;
    console.log(productdata);
    await redisClient.set(
      `product:${productdata.productname}`,
      JSON.stringify(productdata)
    );
    await productdata.save(this.postgress);
    return productdata.getSanitizedData();
  }
  async getproductsbystatus(
    page = 1,
    limit = 10,
    letters?: string
  ): Promise<any> {
    try {
      let query = 'SELECT product_id, data FROM products WHERE enabled = true';
      console.log(query);
      const params: any[] = [];
      if (letters) {
        console.log(letters);
        query += " AND data->>'status' ILIKE $1";
        params.push(`%${letters}%`);
      }
      console.log(params);
      const offset = (page - 1) * limit;
      query += ` ORDER BY product_id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      console.log(query);

      const result = await this.postgress.query(query, params);

      const userproduct = result.rows.map((row) => {
        const userData = { ProductId: row.product_id, ...row.data };
        console.log(userData);
        const user = ProductModel.build(userData);
        return user.getSanitizedData();
      });

      console.log(userproduct);
      return userproduct;
    } catch (error) {
      if (error.message === 'Query error') {
        console.error('Error in querying userproduct:', error);
      } else {
        console.error('Unexpected error:', error);
      }
      const err = 'Failed to fetch users';
      throw new BadRequestException(err);
    }
  }
  async getallproducts(page = 1, limit = 10, letters?: string): Promise<any> {
    try {
      let query = 'SELECT * FROM products WHERE enabled = true';
      console.log(query);
      const params: any[] = [];
      if (letters) {
        console.log(letters);
        query += " AND data->>'productname' ILIKE $1";
        params.push(`%${letters}%`);
      }
      console.log(params);
      const offset = (page - 1) * limit;
      query += ` ORDER BY product_id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      console.log(query);

      const result = await this.postgress.query(query, params);

      const userproduct = result.rows.map((row) => {
        const userData = { ProductId: row.product_id, ...row.data };
        console.log('checking userdata');
        console.log(userData);
        // const user = ProductModel.build(userData);
        console.log('checking user');
        console.log(userData);
        return userData;
      });

      console.log('checking userproduct');
      console.log(userproduct);
      return userproduct;
    } catch (error) {
      if (error.message === 'Query error') {
        console.error('Error in querying userproduct:', error);
      } else {
        console.error('Unexpected error:', error);
      }
      const err = 'Failed to fetch users';
      throw new BadRequestException(err);
    }
  }
}
