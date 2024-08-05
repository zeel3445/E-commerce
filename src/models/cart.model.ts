import { PostgresService } from 'src/services/pg.services';
export class CartItem {
  itemId: string;
  quantity: number;
  price: number;
  name: string;
  description: string;
  total: number;
}

export class CartDTO {
  cartId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: number;
  grandTotal: number;
}

export class CartModel {
  cartId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: number;
  grandTotal: number;
  postgress: PostgresService;

  toJSON(dataOnly: boolean = false): any {
    const data: any = {};
    for (const key in this) {
      if (
        ![
          'cartId',
          'userId',
          'items',
          'subtotal',
          'tax',
          'shipping',
          'discounts',
          'grandTotal',
        ].includes(key) ||
        !dataOnly
      ) {
        data[key] = this[key];
      }
    }
    return data;
  }

  static build(rawData: any): CartModel {
    console.log('inside build');
    console.log(rawData);
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    const cart = new CartModel();
    (cart.cartId = rawData.cart_id || rawData.cartId),
      (cart.userId = rawData.user_id || rawData.userId),
      (cart.items = rawData.items || []),
      (cart.subtotal = rawData.subtotal),
      (cart.tax = rawData.tax),
      (cart.shipping = rawData.shipping),
      (cart.discounts = rawData.discounts),
      (cart.grandTotal = rawData.grandTotal);

    console.log('build succesful');
    console.log(cart);

    return cart;
  }
  getSanitizedData(): Partial<any> {
    return this;
  }
}
