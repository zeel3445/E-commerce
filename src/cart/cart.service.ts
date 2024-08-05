import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CartDto } from 'src/dto/cart.dto';
import { CartModel } from 'src/models/cart.model';
import { firstValueFrom } from 'rxjs';
import { redisClient } from 'src/services/redis.service';
import { ProductService } from 'src/product/product.service';
import { ActionType } from './actiontype.enum';

@Injectable()
export class CartService {
  constructor(
    private readonly httpService: HttpService,
    private readonly productservice: ProductService
  ) {}
  private JSONBLOB_URL = 'https://jsonblob.com/api/jsonBlob';
  async createCart(cartdto: CartDto, userId: string): Promise<any> {
    const cart = new CartModel();
    cart.userId = userId;

    cart.shipping = cartdto.shipping;
    cart.items = cartdto.items;
    cart.tax = cartdto.tax;
    cart.discounts = cartdto.discounts;
    cart.subtotal = cartdto.subtotal;
    cart.grandTotal = cartdto.grandTotal;
    console.log(cart);

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.JSONBLOB_URL, cart.toJSON())
      );
      console.log('Response:', response);

      const locationHeader = response.headers['location'];
      if (!locationHeader) {
        const err = 'Location header not found in the response';
        throw new Error(err);
      }

      const cartId = locationHeader.split('/').pop();
      cart.cartId = cartId;

      await redisClient.set(`userCart:${userId}`, JSON.stringify(cart));

      return cart;
    } catch (error) {
      const err = 'Error creating cart';
      console.error('Error creating cart:', error);
      throw new Error(err);
    }
  }

  async updateCart(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<any> {
    console.log('this is updateCart method');
    console.log(itemId);
    const data = await redisClient.get(`userCart:${userId}`);
    console.log('this is data');
    const cartdata = JSON.parse(data);
    console.log(cartdata);
    if (!data) {
      const err = 'Cart not found';
      throw new Error(err);
    }
    const item = await this.productservice.getproductbyid(itemId);
    console.log('this is getProductById');
    console.log(item);
    if (!item) {
      const err = 'Product not found';
      throw new Error(err);
    }
    const newItem = {
      itemId: item.ProductId,
      quantity: quantity,
      price: item.price,
      name: item.productname,
      description: item.description,
      total: quantity * item.price,
    };
    const existingItemIndex = cartdata.items.findIndex(
      (i: any) => i.itemId === itemId
    );
    if (existingItemIndex !== -1) {
      cartdata.items[existingItemIndex].quantity = quantity;
    } else {
      cartdata.items.push(newItem);
    }
    cartdata.subtotal = cartdata.items.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    );
    cartdata.grandTotal =
      cartdata.subtotal + 0.15 * cartdata.subtotal - 0.07 * cartdata.subtotal;

    const cartId = cartdata.cartId;
    cartdata.tax = 0.07;
    cartdata.discounts = 0.15;
    console.log(cartdata);
    await redisClient.set(`userCart:${userId}`, JSON.stringify(cartdata));
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.JSONBLOB_URL}/${cartId}`, cartdata, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      console.log('Updated cart data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateCart:', error);
      throw new Error('Failed to update cart in JsonBlob');
    }
  }

  async getCart(userId: string): Promise<any> {
    try {
      const data = await redisClient.get(`userCart:${userId}`);
      if (!data) {
        throw new Error('Cart not found');
      }
      const cartData = JSON.parse(data);
      const cartId = cartData.cartId;
      const response = await firstValueFrom(
        this.httpService.get(`${this.JSONBLOB_URL}/${cartId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      return { cartData: response.data };
    } catch (error) {
      console.error('Error in getCart:', error);
      const err = 'Failed to retrieve cart from JsonBlob';
      return new Error(err);
    }
  }

  async deleteCart(userId: string): Promise<void> {
    try {
      const data = await redisClient.get(`userCart:${userId}`);
      if (!data) {
        const err = 'Cart not found';
        throw new Error(err);
      }
      const cartData = JSON.parse(data);
      const cartId = cartData.cartId;
      await redisClient.del(`userCart:${userId}`);
      await redisClient.del(`cartId:${cartId}`);
      await firstValueFrom(
        this.httpService.delete(`${this.JSONBLOB_URL}/${cartId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      console.log('Cart deleted successfully');
    } catch (error) {
      console.error('Error in deleteCart:', error);
      const err = 'Failed to delete cart from JsonBlob';
      throw new Error(err);
    }
  }
  async deleteItemFromCart(userId: string, itemId: string): Promise<any> {
    const data = await redisClient.get(`userCart:${userId}`);
    console.log(data);
    const cartdata = JSON.parse(data);
    console.log(cartdata);
    if (!cartdata.cartId) {
      const err = 'Cart not found';
      throw new NotFoundException(err);
    }

    let response = await firstValueFrom(
      this.httpService.get(`${this.JSONBLOB_URL}/${cartdata.cartId}`)
    );
    const cart = response.data;
    console.log('checking cart response');
    console.log(cart);

    const itemIndex = cart.items.findIndex((item) => item.itemId === itemId);
    if (itemIndex === -1) {
      const err = 'Item not found in cart';
      throw new NotFoundException(err);
    }
    await redisClient.del(`userCart:${userId}`);
    const updatecart = cart.items.splice(itemIndex, 1);

    cart.subtotal = cart.items.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    );

    cart.grandTotal =
      cart.subtotal + 0.15 * cart.subtotal - 0.07 * cart.subtotal;
    console.log('checkupdatedcart');
    console.log(updatecart);
    console.log('checking cart');
    console.log(cart);
    await redisClient.set(`userCart:${userId}`, JSON.stringify(cart));
    response = await firstValueFrom(
      this.httpService.put(`${this.JSONBLOB_URL}/${cartdata.cartId}`, cart, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    console.log(cart.items[0]);
    await this.updateCart(userId, cart.items[0].itemId, cart.items[0].quantity);
    console.log(response.data);
    console.log('indeleteitemfromcart');
    return response.data;
  }
  catch(error) {
    console.error('Error deleting item from cart:', error);
    const err = 'Error deleting item from cart';
    throw new Error(err);
  }
  async deleteusingactiontype(
    userId: string,
    itemId: string,
    actionType: ActionType
  ): Promise<any> {
    let val;
    const data = await redisClient.get(`userCart:${userId}`);
    console.log(data);
    const cartdata = JSON.parse(data);
    console.log(cartdata);
    if (!cartdata.cartId) {
      const err = 'Cart not found';
      throw new NotFoundException(err);
    }
    let response = await firstValueFrom(
      this.httpService.get(`${this.JSONBLOB_URL}/${cartdata.cartId}`)
    );
    const cart = response.data;
    console.log('checking cart response');
    console.log(cart);
    const item = cart.items.find((item) => item.itemId === itemId);
    if (!item) {
      const err = 'Item not found in cart';
      throw new NotFoundException(err);
    }

    switch (actionType) {
      case ActionType.IncreaseQuantity:
        console.log('in quantity');
        item.quantity += 1;
        item.total = item.quantity * item.price;
        cart.subtotal = cart.items.reduce(
          (sum: number, i: any) => sum + i.price * i.quantity,
          0
        );

        cart.grandTotal =
          cart.subtotal + 0.15 * cart.subtotal - 0.07 * cart.subtotal;
        break;
      case ActionType.DecreaseQuantity:
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cart.items = cart.items.filter((i) => i.itemId !== itemId);
        } else {
          item.total = item.quantity * item.price;
          cart.subtotal = cart.items.reduce(
            (sum: number, i: any) => sum + i.price * i.quantity,
            0
          );

          cart.grandTotal =
            cart.subtotal + 0.15 * cart.subtotal - 0.07 * cart.subtotal;
        }
        break;
      case ActionType.RemoveItem:
        console.log('in deleteitem');
        console.log(userId);
        console.log(itemId);
        val = await this.deleteItemFromCart(userId, itemId);
        console.log(val);
        await redisClient.set(`userCart:${userId}`, JSON.stringify(val));
        response = await firstValueFrom(
          this.httpService.put(`${this.JSONBLOB_URL}/${cartdata.cartId}`, val, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
        console.log(val);
        return val;

      default:
        const err = 'Invalid action type';
        throw new BadRequestException(err);
    }

    await redisClient.del(`userCart:${userId}`);
    console.log(cart);
    await redisClient.set(`userCart:${userId}`, JSON.stringify(cart));
    response = await firstValueFrom(
      this.httpService.put(`${this.JSONBLOB_URL}/${cartdata.cartId}`, cart, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    console.log(cart);
    return cart;
  }
}
