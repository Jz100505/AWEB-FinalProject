import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';

// Re-export CartItem so checkout.ts can import it from here (existing import path)
export type { CartItem } from '../../services/cart.service';

const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 120;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {

  items: CartItem[] = [];

  showToast = false;
  toastMessage = '';

  readonly FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD;

  private cartSub?: Subscription;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private cartService: CartService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Subscribe to the CartService reactive stream — always in sync with the
    // correct per-user key, regardless of which account is logged in.
    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  // ── Computed ──────────────────────────────────────────────────
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get itemCount(): number {
    return this.items.reduce((s, i) => s + i.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get shippingFee(): number {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  get total(): number {
    return this.subtotal + this.shippingFee;
  }

  get isFreeShipping(): boolean {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD;
  }

  get freeShippingProgress(): number {
    return Math.min((this.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  }

  get amountToFreeShipping(): number {
    return Math.max(FREE_SHIPPING_THRESHOLD - this.subtotal, 0);
  }

  // ── Actions ───────────────────────────────────────────────────
  increment(item: CartItem): void {
    this.cartService.updateQuantity(item._id, item.size, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item._id, item.size, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cartService.removeItem(item._id, item.size);
    this.showToastMsg(`${item.name} removed from cart.`);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.showToastMsg('Cart cleared.');
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  navigateToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

  // ── Helpers ───────────────────────────────────────────────────
  formatPrice(price: number): string {
    return '₱' + price.toLocaleString('en-PH');
  }

  trackByItem(_: number, item: CartItem): string {
    return item._id + '|' + item.size;
  }

  private showToastMsg(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 2500);
  }
}