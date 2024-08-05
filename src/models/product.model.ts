import { PostgresService } from 'src/services/pg.services';
import { redisClient, set } from 'src/services/redis.service';
import { v4 as uuidv4 } from 'uuid';
import * as jf from 'joiful';

export class ProductModel {
  ProductId: string;
  productname: string;
  description: string;
  price: string;
  status: string;
  enabled: boolean;
  //   @jf.string().required()
  //   userId: string;
  //   @jf.string().min(3).max(50).required()
  //   name: string;
  //   @jf.string().min(4).max(10).required()
  //   username: string;
  //   @jf.string().min(8).max(100).required()
  //   password: string;
  //   @jf.boolean().required()
  //   enabled: boolean;
  postgress: PostgresService;

  toJSON(dataOnly: boolean = false) {
    //false
    const data: any = {};
    for (const key in this) {
      if (!['ProductId', 'enabled'].includes(key) || !dataOnly) {
        // (condition1 || condition2) true
        data[key] = this[key];
      }
    }
    return data;
  }

  static async getFromId(
    postgress: PostgresService,
    ProductId: string
  ): Promise<any> {
    const cachedproductData = await redisClient.get(`product:${ProductId}`);
    console.log(cachedproductData);
    if (cachedproductData) {
      console.log('inside  get redis by id');

      return ProductModel.build(JSON.parse(cachedproductData));
    }
    try {
      console.log('database to check for id');
      const result = await postgress.client.query(
        'SELECT * FROM products WHERE product_id = $1 and enabled=$2',
        [ProductId, true]
      );

      if (result.rows.length > 0) {
        const productData = ProductModel.build(result.rows[0]);
        console.log('setting product by id in redis');
        await set(`product:${ProductId}`, JSON.stringify(productData));

        return productData;
      } else {
        console.log('taking null');
        return null;
      }
    } catch (error) {
      console.error('Error getting product by id:', error);
      const err = 'ERROR GETTING Product BY ID';
      throw err;
    }
  }
  static build(rawData: any): ProductModel {
    console.log('inside build');
    console.log(rawData);
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    console.log('afterobjectassign');
    console.log(rawData);
    const product = new ProductModel();
    (product.ProductId = rawData.product_id || rawData.ProductId || uuidv4()),
      (product.productname = rawData.productname),
      (product.description = rawData.description),
      (product.price = rawData.price),
      (product.status = rawData.status),
      (product.enabled =
        rawData.enabled !== undefined ? rawData.enabled : true);

    console.log('build succesful');
    console.log(product);
    return product;
  }
  static validate(product: any): { error?: any } {
    const { error } = jf.validate(product);
    if (error) {
      console.error('Validation failed:', error.details);
    }
    throw error.details;
  }
  getSanitizedData(): Partial<any> {
    return this;
  }
  async save(postgress: PostgresService): Promise<any> {
    // UserModel.validate(this);
    console.log(this);
    const existingproduct = await ProductModel.getFromproductname(
      postgress,
      this.productname
    );
    console.log('inside save');
    console.log(existingproduct);
    console.log(this);
    const data = this.toJSON(true);
    if (existingproduct) {
      const result = await postgress.client.query(
        'UPDATE products SET enabled = $1,  data = $2 WHERE product_id = $3',
        [this.enabled, data, this.ProductId]
      );
      console.log('checking result');
      console.log(result);
      console.log('checking productdata');
      console.log(this);
      await set(`product:${this.ProductId}`, JSON.stringify(this));
      return result;
    } else {
      console.log(this);
      const result2 = await postgress.client.query(
        'INSERT INTO products (data, enabled, product_id) VALUES ($1, $2, $3) RETURNING *',
        [data, this.enabled, this.ProductId]
      );
      console.log('checking productdata');
      console.log(result2);
      await set(`product:${this.ProductId}`, JSON.stringify(this));
      await set(
        `product:${this.productname.toLowerCase()}`,
        JSON.stringify(this)
      );
      console.log(JSON.stringify(this));
      return this;
    }
  }

  static async getFromproductname(
    postgress: PostgresService,
    productname: string
  ): Promise<ProductModel | null> {
    try {
      const cachedproductData = await redisClient.get(
        `product:${productname.toLowerCase()}`
      );
      console.log('cache in getfromproduct');
      console.log(cachedproductData);

      if (cachedproductData) {
        const val1 = JSON.parse(cachedproductData);
        console.log('going inside cached');
        console.log(cachedproductData);
        return ProductModel.build(val1);
      }

      const result = await postgress.client.query(
        "SELECT * FROM products WHERE data->>'productname' = $1 AND enabled=true",
        [productname]
      );
      if (result.rows.length) {
        const productData = result.rows[0];
        const product = ProductModel.build(productData);
        return product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product by username:', error);
      const err = 'Failed to fetch product by username';
      throw err;
    }
  }
}
