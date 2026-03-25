import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

// ── Re-use the Order types from profile.ts ────────────────────────────────────
export interface OrderItem {
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  condition?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingAddress?: ShippingAddress;
}

export type OrderFilter = 'all' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// ── Storage keys ──────────────────────────────────────────────────────────────
export const ORDERS_STORAGE_KEY = 'th_orders';
export const CART_STORAGE_KEY = 'th_cart';

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 120;

// ── Mock orders (shown when localStorage has no data) ─────────────────────────
// Root-cause guard: These ensure the page is never blank during development,
// and they match the same data shape expected by the template.
const MOCK_ORDERS: Order[] = [
  {
    id: 'TH-20260101',
    date: '2026-01-15T10:30:00Z',
    status: 'delivered',
    total: 870,
    items: [
      { name: 'Yellow Hoodie', category: 'Tops', image: '/assets/images/yellow_hoodie.webp', price: 550, quantity: 1, size: 'M', condition: 'Pre-loved' },
      { name: 'Grey T-Shirt', category: 'Tops', image: '/assets/images/grey_tshirt.webp', price: 200, quantity: 1, size: 'L', condition: 'Pre-loved' },
    ],
    shippingAddress: { fullName: 'Juan dela Cruz', address: '123 McArthur Hwy', city: 'Angeles City, Pampanga', postalCode: '2009', phone: '+63 917 123 4567' },
  },
  {
    id: 'TH-20260215',
    date: '2026-02-08T14:22:00Z',
    status: 'shipped',
    total: 750,
    items: [
      { name: 'Blue Jeans', category: 'Bottoms', image: '/assets/images/blue_jeans.webp', price: 400, quantity: 1, size: 'M', condition: 'Pre-loved' },
      { name: 'Grey Sweatpants', category: 'Bottoms', image: '/assets/images/grey_sweatpants.webp', price: 250, quantity: 1, size: 'L', condition: 'Pre-loved' },
    ],
    shippingAddress: { fullName: 'Maria Santos', address: '456 Rizal St', city: 'Angeles City, Pampanga', postalCode: '2009' },
  },
  {
    id: 'TH-20260312',
    date: '2026-03-10T09:05:00Z',
    status: 'confirmed',
    total: 570,
    items: [
      { name: 'Vintage Long Sleeves', category: 'Tops', image: '/assets/images/vintage_long_sleeves.webp', price: 450, quantity: 1, size: 'S', condition: 'Pre-loved' },
      { name: 'Grey T-Shirt', category: 'Tops', image: '/assets/images/grey_tshirt.webp', price: 200, quantity: 1, size: 'M', condition: 'Pre-loved' },
    ],
    shippingAddress: { fullName: 'Pedro Reyes', address: '789 Sto. Rosario St', city: 'Angeles City, Pampanga', postalCode: '2009' },
  },
  {
    id: 'TH-20260220',
    date: '2026-02-20T16:45:00Z',
    status: 'cancelled',
    total: 300,
    items: [
      { name: 'Vintage Shirt', category: 'Tops', image: '/assets/images/vintage_shirt.webp', price: 300, quantity: 1, size: 'L', condition: 'Pre-loved' },
    ],
  },
];

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit, OnDestroy {

  // ── Data ─────────────────────────────────────────────────────────
  orders: Order[] = [];

  // ── Filter ───────────────────────────────────────────────────────
  activeFilter: OrderFilter = 'all';

  // ── Accordion ────────────────────────────────────────────────────
  expandedOrderId: string | null = null;

  // ── Toast ────────────────────────────────────────────────────────
  showToast = false;
  toastMessage = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  // ── Load from localStorage; fall back to mock data ───────────────
  // Systematic debugging note: we validate the shape before accepting
  // localStorage data to guard against stale/malformed payloads.
  private loadOrders(): void {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Order[];
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
          this.orders = parsed;
          return;
        }
      }
    } catch {
      // JSON.parse failed — fall through to mocks
    }
    this.orders = MOCK_ORDERS;
  }

  // ── Computed ──────────────────────────────────────────────────────
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
      .reduce((sum, o) => sum + o.total, 0);
  }

  // ── Filter ───────────────────────────────────────────────────────
  setFilter(filter: OrderFilter): void {
    this.activeFilter = filter;
    // Collapse any open card when filter changes
    this.expandedOrderId = null;
  }

  // ── Accordion ────────────────────────────────────────────────────
  toggleOrder(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  isExpanded(id: string): boolean {
    return this.expandedOrderId === id;
  }

  // ── Reorder: push items back to cart ─────────────────────────────
  reorder(order: Order): void {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const cart: any[] = raw ? JSON.parse(raw) : [];

      order.items.forEach(item => {
        const existing = cart.find(c => c.name === item.name && c.size === item.size);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + item.quantity, 10);
        } else {
          cart.push({
            _id: item.name.toLowerCase().replace(/\s+/g, '-'),
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image,
            condition: item.condition ?? 'Pre-loved',
            size: item.size,
            quantity: item.quantity,
            stock: 10,
          });
        }
      });

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      this.triggerToast('Items added to your cart!');
    } catch {
      this.triggerToast('Could not add items to cart.');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  getSubtotal(order: Order): number {
    return order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  getShipping(order: Order): number {
    const sub = this.getSubtotal(order);
    return sub >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] ?? status;
  }

  // ── Toast ─────────────────────────────────────────────────────────
  private triggerToast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 3000);
  }
}