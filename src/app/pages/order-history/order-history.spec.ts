import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OrderHistory } from './order-history';

describe('OrderHistory', () => {
  let component: OrderHistory;
  let fixture: ComponentFixture<OrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistory, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem('th_orders');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load mock orders when localStorage is empty', () => {
    localStorage.removeItem('th_orders');
    component.ngOnInit();
    expect(component.orders.length).toBeGreaterThan(0);
  });

  it('should load orders from localStorage when valid', () => {
    const mock = [{
      id: 'TH-TEST01', date: new Date().toISOString(), status: 'confirmed', total: 500,
      items: [{ name: 'Test', category: 'Tops', image: '', price: 500, quantity: 1, size: 'M', condition: 'Pre-loved' }],
    }];
    localStorage.setItem('th_orders', JSON.stringify(mock));
    component.ngOnInit();
    expect(component.orders[0].id).toBe('TH-TEST01');
  });

  it('should fall back to mocks on malformed JSON', () => {
    localStorage.setItem('th_orders', '{{bad}}');
    component.ngOnInit();
    expect(component.orders.length).toBeGreaterThan(0);
  });

  it('should filter orders by status', () => {
    component.ngOnInit();
    component.setFilter('delivered');
    const allDelivered = component.filteredOrders.every(o => o.status === 'delivered');
    expect(allDelivered).toBe(true);
  });

  it('should return all orders when filter is "all"', () => {
    component.ngOnInit();
    component.setFilter('all');
    expect(component.filteredOrders.length).toBe(component.orders.length);
  });

  it('should toggle expand state for an order', () => {
    component.ngOnInit();
    const id = component.orders[0].id;
    component.toggleOrder(id);
    expect(component.isExpanded(id)).toBe(true);
    component.toggleOrder(id);
    expect(component.isExpanded(id)).toBe(false);
  });

  it('should collapse open card when filter changes', () => {
    component.ngOnInit();
    const id = component.orders[0].id;
    component.toggleOrder(id);
    component.setFilter('all');
    expect(component.expandedOrderId).toBeNull();
  });

  it('should compute totalSpent excluding cancelled orders', () => {
    component.ngOnInit();
    const expected = component.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    expect(component.totalSpent).toBe(expected);
  });

  it('should compute subtotal correctly', () => {
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
});