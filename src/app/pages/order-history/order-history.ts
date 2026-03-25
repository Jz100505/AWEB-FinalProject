import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

// ── Shared types ─────────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  condition: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}

const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 120;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit, OnDestroy {

  orders: Order[] = [];
  activeFilter: OrderStatus | 'all' = 'all';
  expandedOrderId: string | null = null;

  showToast = false;
  toastMessage = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  private authSub?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadOrders();

    // Reload orders if the user changes (e.g. login / logout during the session)
    this.authSub = this.authService.currentUser$.subscribe(() => {
      this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
    this.authSub?.unsubscribe();
  }

  // ── Per-user storage key ──────────────────────────────────────
  private get userId(): string | null {
    return this.authService.currentUser?.id ?? null;
  }

  private get userOrdersKey(): string {
    return this.userId ? `th_orders_${this.userId}` : 'th_orders';
  }

  // ── Load orders ───────────────────────────────────────────────
  loadOrders(): void {
    // Reset filter / expand state on reload
    this.activeFilter = 'all';
    this.expandedOrderId = null;

    if (!this.userId) {
      // No logged-in user — show empty state (no mocks)
      this.orders = [];
      return;
    }

    try {
      const raw = localStorage.getItem(this.userOrdersKey);
      const parsed = raw ? JSON.parse(raw) : [];
      // Validate it's a non-empty array
      this.orders = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.orders = [];
    }
    // No mock fallback for authenticated users — show real empty state instead
  }

  // ── Computed ──────────────────────────────────────────────────
  get filteredOrders(): Order[] {
    if (this.activeFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get totalSpent(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
  }

  // ── Filter ────────────────────────────────────────────────────
  setFilter(filter: OrderStatus | 'all'): void {
    this.activeFilter = filter;
    this.expandedOrderId = null;
  }

  // ── Expand / collapse ─────────────────────────────────────────
  toggleOrder(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  isExpanded(id: string): boolean {
    return this.expandedOrderId === id;
  }

  // ── Reorder ───────────────────────────────────────────────────
  reorder(order: Order): void {
    order.items.forEach(item => {
      this.cartService.addItem({
        _id: item.name, // fallback — product ID not always stored on order items
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        condition: item.condition,
        size: item.size,
        stock: 99,
      });
    });
    this.toastMessage = 'Items added to your cart!';
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 2500);
    this.router.navigate(['/cart']);
  }

  // ── Helpers ───────────────────────────────────────────────────
  getSubtotal(order: Order): number {
    return order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  getShipping(order: Order): number {
    const subtotal = this.getSubtotal(order);
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status as OrderStatus] ?? status;
  }

  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}