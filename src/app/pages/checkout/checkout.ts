import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartItem } from '../cart/cart';
import { AuthService } from '../../services/auth.service';

/** Legacy flat keys kept for reference — NOT used directly anymore. */
export const CART_STORAGE_KEY = 'th_cart';
export const ORDERS_STORAGE_KEY = 'th_orders';
export const CONFIRMED_ORDER_KEY = 'th_last_order';

const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 120;

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {

  // ── Cart items ────────────────────────────────────────────────
  items: CartItem[] = [];

  // ── Steps: 1 = Details, 2 = Review, 3 = (Done — navigates away) ──
  currentStep: 1 | 2 = 1;

  // ── Form ──────────────────────────────────────────────────────
  form: CheckoutForm = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  };

  // ── UI state ──────────────────────────────────────────────────
  isPlacingOrder = false;
  formErrors: Partial<CheckoutForm> = {};

  private orderTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.prefillFromStorage();
  }

  ngOnDestroy(): void {
    clearTimeout(this.orderTimer);
  }

  // ── Per-user storage keys ─────────────────────────────────────
  private get userId(): string | null {
    return this.authService.currentUser?.id ?? null;
  }

  private get userCartKey(): string {
    return this.userId ? `th_cart_${this.userId}` : CART_STORAGE_KEY;
  }

  private get userOrdersKey(): string {
    return this.userId ? `th_orders_${this.userId}` : ORDERS_STORAGE_KEY;
  }

  // ── Load cart ─────────────────────────────────────────────────
  private loadCart(): void {
    try {
      const raw = localStorage.getItem(this.userCartKey);
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
    // Redirect to cart if empty
    if (this.items.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  private prefillFromStorage(): void {
    try {
      const user = this.authService.currentUser;
      if (user) {
        if (user.name) this.form.fullName = user.name;
        if (user.email) this.form.email = user.email;
      }
    } catch { /* ignore */ }
  }

  // ── Computed ──────────────────────────────────────────────────
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

  // ── Validation ────────────────────────────────────────────────
  private validate(): boolean {
    this.formErrors = {};
    const f = this.form;

    if (!f.fullName.trim() || f.fullName.trim().length < 3)
      this.formErrors.fullName = 'Please enter your full name.';

    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      this.formErrors.email = 'Please enter a valid email address.';

    if (!f.phone.trim() || !/^(\+63|0)[0-9]{9,10}$/.test(f.phone.replace(/\s/g, '')))
      this.formErrors.phone = 'Enter a valid Philippine mobile number.';

    if (!f.address.trim() || f.address.trim().length < 5)
      this.formErrors.address = 'Please enter your full street address.';

    if (!f.city.trim())
      this.formErrors.city = 'Please enter your city / municipality.';

    if (!f.postalCode.trim() || !/^\d{4}$/.test(f.postalCode.trim()))
      this.formErrors.postalCode = 'Enter a valid 4-digit postal code.';

    return Object.keys(this.formErrors).length === 0;
  }

  // ── Step navigation ───────────────────────────────────────────
  goToReview(): void {
    if (!this.validate()) return;
    this.currentStep = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Place order ───────────────────────────────────────────────
  placeOrder(): void {
    if (this.isPlacingOrder) return;
    this.isPlacingOrder = true;

    // Build order object matching the ConfirmedOrder interface
    const orderId = 'TH-' + Date.now().toString(36).toUpperCase();
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      status: 'confirmed' as const,
      items: this.items.map(i => ({
        name: i.name,
        category: i.category,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        condition: i.condition,
      })),
      total: this.total,
      shippingAddress: {
        fullName: this.form.fullName.trim(),
        address: this.form.address.trim(),
        city: this.form.city.trim(),
        postalCode: this.form.postalCode.trim(),
        phone: this.form.phone.trim(),
      },
    };

    // Persist last order (global — used only by order-confirmation page immediately after)
    localStorage.setItem(CONFIRMED_ORDER_KEY, JSON.stringify(order));

    // Append to the per-user order history
    try {
      const raw = localStorage.getItem(this.userOrdersKey);
      const existing = raw ? JSON.parse(raw) : [];
      existing.unshift(order);
      localStorage.setItem(this.userOrdersKey, JSON.stringify(existing));
    } catch { /* ignore */ }

    // Clear the per-user cart
    localStorage.removeItem(this.userCartKey);

    // Simulate a brief processing delay then redirect
    this.orderTimer = setTimeout(() => {
      this.router.navigate(['/order-confirmation']);
    }, 1800);
  }

  // ── Helpers ───────────────────────────────────────────────────
  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }

  trackByItem(_: number, i: CartItem): string {
    return i._id + '|' + i.size;
  }
}