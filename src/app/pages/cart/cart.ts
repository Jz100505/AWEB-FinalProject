import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// ── Cart Item Interface ───────────────────────────────────────────────────────
// Written to the 'th_cart' localStorage key by catalog/product-detail pages.
export interface CartItem {
  _id: string;       // MongoDB product ID
  name: string;
  price: number;
  category: string;
  image: string;     // single resolved image URL
  condition: string;
  size: string;      // selected size at time of add-to-cart
  quantity: number;
  stock: number;     // used to cap quantity increment
}

export const CART_STORAGE_KEY = 'th_cart';

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 1500; // ₱1,500
const FLAT_SHIPPING_FEE = 120;        // ₱120

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {

  // ── State ─────────────────────────────────────────────────────────────────
  items: CartItem[] = [];
  showToast = false;
  toastMessage = '';
  removingId: string | null = null; // tracks which item has the confirm-remove UI

  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD;
  readonly FLAT_SHIPPING_FEE = FLAT_SHIPPING_FEE;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  // ── Persistence ───────────────────────────────────────────────────────────
  loadCart(): void {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
  }

  private saveCart(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get itemCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get shippingFee(): number {
    if (this.isEmpty) return 0;
    return this.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  get total(): number {
    return this.subtotal + this.shippingFee;
  }

  get isFreeShipping(): boolean {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD;
  }

  get amountToFreeShipping(): number {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - this.subtotal);
  }

  // 0 → 100 progress toward the free-shipping threshold
  get freeShippingProgress(): number {
    return Math.min(100, (this.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }

  // ── Cart Operations ───────────────────────────────────────────────────────
  increment(item: CartItem): void {
    if (item.quantity < item.stock) {
      item.quantity++;
      this.saveCart();
    }
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    }
  }

  remove(item: CartItem): void {
    const name = item.name;
    this.items = this.items.filter(
      (i) => !(i._id === item._id && i.size === item.size)
    );
    this.saveCart();
    this.triggerToast(`${name} removed from cart.`);
  }

  clearCart(): void {
    this.items = [];
    this.saveCart();
    this.triggerToast('Cart cleared.');
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  navigateToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }

  trackByItem(_: number, item: CartItem): string {
    return item._id + '|' + item.size;
  }

  private triggerToast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 2800);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// HOW TO WIRE addToCart IN catalog.ts
// ─────────────────────────────────────────────────────────────────────────────
// Replace the placeholder addToCart() in catalog.ts with this implementation:
//
//   import { CART_STORAGE_KEY, CartItem } from '../cart/cart';
//
//   addToCart(product: CatalogProduct, event: MouseEvent): void {
//     event.stopPropagation();
//
//     const cart: CartItem[] = JSON.parse(
//       localStorage.getItem(CART_STORAGE_KEY) ?? '[]'
//     );
//
//     const size = Array.isArray(product.size)
//       ? product.size[0] ?? 'Free Size'
//       : product.size ?? 'Free Size';
//
//     const key = product._id + '|' + size;
//     const existing = cart.find(
//       (i) => i._id === product._id && i.size === size
//     );
//
//     if (existing) {
//       if (existing.quantity < product.stock) existing.quantity++;
//     } else {
//       cart.push({
//         _id:       product._id,
//         name:      product.name,
//         price:     product.price,
//         category:  product.category,
//         image:     product.images?.[0] ?? '',
//         condition: product.condition,
//         size,
//         quantity:  1,
//         stock:     product.stock,
//       });
//     }
//
//     localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
//
//     this.toastMessage = `${product.name} added to cart!`;
//     this.showToast = true;
//     clearTimeout(this.toastTimer);
//     this.toastTimer = setTimeout(() => (this.showToast = false), 2500);
//   }
// ─────────────────────────────────────────────────────────────────────────────
