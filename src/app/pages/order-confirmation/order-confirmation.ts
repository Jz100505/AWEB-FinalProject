import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface ConfirmedOrderItem {
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

export interface ConfirmedOrder {
  id: string;
  date: string;
  status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: ConfirmedOrderItem[];
  total: number;
  shippingAddress?: ShippingAddress;
}

// ── Storage key written by checkout ──────────────────────────────────────────
export const CONFIRMED_ORDER_KEY = 'th_last_order';

// ── Fallback demo order shown when localStorage is empty ─────────────────────
const DEMO_ORDER: ConfirmedOrder = {
  id: 'TH-20260325',
  date: new Date().toISOString(),
  status: 'confirmed',
  total: 970,
  items: [
    {
      name: 'Yellow Hoodie',
      category: 'Tops',
      image: '/assets/images/yellow_hoodie.webp',
      price: 550,
      quantity: 1,
      size: 'M',
      condition: 'Pre-loved',
    },
    {
      name: 'Grey Sweatpants',
      category: 'Bottoms',
      image: '/assets/images/grey_sweatpants.webp',
      price: 250,
      quantity: 1,
      size: 'L',
      condition: 'Pre-loved',
    },
    {
      name: 'Grey T-Shirt',
      category: 'Tops',
      image: '/assets/images/grey_tshirt.webp',
      price: 200,
      quantity: 1,
      size: 'M',
      condition: 'Pre-loved',
    },
  ],
  shippingAddress: {
    fullName: 'Juan dela Cruz',
    address: '123 McArthur Hwy, Brgy. Sto. Domingo',
    city: 'Angeles City, Pampanga',
    postalCode: '2009',
    phone: '+63 917 123 4567',
  },
};

const FLAT_SHIPPING_FEE = 120;
const FREE_SHIPPING_THRESHOLD = 1500;

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation implements OnInit {

  order: ConfirmedOrder | null = null;

  ngOnInit(): void {
    this.loadOrder();
  }

  // ── Load from localStorage; fall back to demo ─────────────────────────────
  private loadOrder(): void {
    try {
      const raw = localStorage.getItem(CONFIRMED_ORDER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConfirmedOrder;
        // Root-cause guard: validate required fields before accepting
        if (parsed?.id && Array.isArray(parsed?.items) && typeof parsed?.total === 'number') {
          this.order = parsed;
          return;
        }
      }
    } catch {
      // JSON.parse failed — fall through to demo
    }
    // Demo order so the page is never blank during development
    this.order = DEMO_ORDER;
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  get orderId(): string {
    return this.order?.id ?? '—';
  }

  get formattedDate(): string {
    if (!this.order?.date) return '—';
    return new Date(this.order.date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get subtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get shippingFee(): number {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }
}