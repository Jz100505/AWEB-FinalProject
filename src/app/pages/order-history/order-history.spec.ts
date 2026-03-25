import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { OrderHistory } from './order-history';
import { AuthService } from '../../services/auth.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_USER = { id: 'test-uid-001', name: 'Test User', email: 'test@example.com' };
const USER_ORDERS_KEY = `th_orders_${MOCK_USER.id}`;

function writeMockOrders(orders: any[]): void {
  localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(orders));
}

const SAMPLE_ORDER = {
  id: 'TH-TEST01',
  date: new Date().toISOString(),
  status: 'confirmed',
  total: 500,
  items: [{
    name: 'Test', category: 'Tops', image: '', price: 500, quantity: 1, size: 'M', condition: 'Pre-loved',
  }],
};

// ── Stub AuthService ──────────────────────────────────────────────────────────

class MockAuthService {
  private subject = new BehaviorSubject<typeof MOCK_USER | null>(MOCK_USER);
  currentUser$ = this.subject.asObservable();
  get currentUser() { return this.subject.value; }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderHistory', () => {
  let component: OrderHistory;
  let fixture: ComponentFixture<OrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistory, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem(USER_ORDERS_KEY);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when localStorage has no orders for this user', () => {
    localStorage.removeItem(USER_ORDERS_KEY);
    component.ngOnInit();
    expect(component.orders.length).toBe(0);
  });

  it('should load orders from the per-user key', () => {
    writeMockOrders([SAMPLE_ORDER]);
    component.ngOnInit();
    expect(component.orders[0].id).toBe('TH-TEST01');
  });

  it('should fall back to empty array on malformed JSON', () => {
    localStorage.setItem(USER_ORDERS_KEY, '{{bad}}');
    component.ngOnInit();
    expect(component.orders.length).toBe(0);
  });

  it('should filter orders by status', () => {
    writeMockOrders([
      { ...SAMPLE_ORDER, id: 'TH-A', status: 'delivered' },
      { ...SAMPLE_ORDER, id: 'TH-B', status: 'confirmed' },
    ]);
    component.ngOnInit();
    component.setFilter('delivered');
    expect(component.filteredOrders.every(o => o.status === 'delivered')).toBe(true);
  });

  it('should return all orders when filter is "all"', () => {
    writeMockOrders([SAMPLE_ORDER, { ...SAMPLE_ORDER, id: 'TH-C' }]);
    component.ngOnInit();
    component.setFilter('all');
    expect(component.filteredOrders.length).toBe(component.orders.length);
  });

  it('should toggle expand state for an order', () => {
    writeMockOrders([SAMPLE_ORDER]);
    component.ngOnInit();
    const id = component.orders[0].id;
    component.toggleOrder(id);
    expect(component.isExpanded(id)).toBe(true);
    component.toggleOrder(id);
    expect(component.isExpanded(id)).toBe(false);
  });

  it('should collapse open card when filter changes', () => {
    writeMockOrders([SAMPLE_ORDER]);
    component.ngOnInit();
    const id = component.orders[0].id;
    component.toggleOrder(id);
    component.setFilter('all');
    expect(component.expandedOrderId).toBeNull();
  });

  it('should compute totalSpent excluding cancelled orders', () => {
    writeMockOrders([
      { ...SAMPLE_ORDER, id: 'TH-D', status: 'delivered', total: 400 },
      { ...SAMPLE_ORDER, id: 'TH-E', status: 'cancelled', total: 200 },
    ]);
    component.ngOnInit();
    expect(component.totalSpent).toBe(400);
  });

  it('should compute subtotal correctly', () => {
    writeMockOrders([SAMPLE_ORDER]);
    component.ngOnInit();
    const order = component.orders[0];
    const expected = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    expect(component.getSubtotal(order)).toBe(expected);
  });

  it('should format price with ₱', () => {
    expect(component.formatPrice(400)).toContain('₱');
    expect(component.formatPrice(400)).toContain('400');
  });

  it('should return correct status labels', () => {
    expect(component.getStatusLabel('confirmed')).toBe('Confirmed');
    expect(component.getStatusLabel('delivered')).toBe('Delivered');
    expect(component.getStatusLabel('cancelled')).toBe('Cancelled');
  });

  it('should NOT expose orders from a different user key', () => {
    // Write orders under a different user's key
    localStorage.setItem('th_orders_other-uid-999', JSON.stringify([SAMPLE_ORDER]));
    localStorage.removeItem(USER_ORDERS_KEY);
    component.ngOnInit();
    // Current user (test-uid-001) should see zero orders
    expect(component.orders.length).toBe(0);
    localStorage.removeItem('th_orders_other-uid-999');
  });
});