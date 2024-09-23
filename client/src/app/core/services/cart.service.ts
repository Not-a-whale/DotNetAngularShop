import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  baseUrl = 'https://localhost:5001/api';
  cart = signal<Cart | null>(null);
  itemCount = computed(() =>
    this.cart()?.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0),
  );
  totals = computed(() => {
    const cart = this.cart();
    if (!cart) return null;
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    const shipping = 0;
    const discount = 0;
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    };
  });
  private http = inject(HttpClient);

  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + '/cart?id=' + id).pipe(
      map((cart) => {
        console.log('asdad', cart);
        this.cart.set(cart);
        return cart;
      }),
    );
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + '/cart', cart).subscribe({
      next: (cart) => this.cart.set(cart),
    });
  }

  removeItemFromCart(productId: string, quantity = 1) {
    const cart = this.cart();
    console.log('cart', cart);
    if (!cart) return;
    const index = cart.items.findIndex((i) => i.productId === productId);
    console.log('index', index);
    if (index !== -1) {
      if (cart.items[index].quantity > quantity) {
        cart.items[index].quantity -= quantity;
      } else {
        cart.items.splice(index, 1);
      }
      if (cart.items.length === 0) {
        this.deleteCart();
      } else {
        this.setCart(cart);
      }
    }
  }

  deleteCart() {
    const cart = this.cart();
    if (!cart) return;
    this.http.delete(this.baseUrl + '/cart?id=' + cart.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      },
    });
  }

  addItemToCart(item: CartItem | Product, quantity = 1, $event?: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    const cart = this.cart() ?? this.createCart();

    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }

    cart.items = this.addOrUpdateItem(cart.items, item, quantity);
    this.setCart(cart);
  }

  private addOrUpdateItem(
    items: CartItem[],
    item: CartItem,
    quantity: number,
  ): CartItem[] {
    console.log('items', items);
    console.log('item', item);
    const index = items.findIndex((i) => i.productId === item.productId);

    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity;
    }

    return items;
  }

  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      quantity: 0,
      price: item.price,
      pictureUrl: item.pictureUrl,
      brand: item.brand,
      type: item.type,
    };
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
