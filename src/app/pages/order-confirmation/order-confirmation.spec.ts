import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OrderConfirmation } from './order-confirmation';

describe('OrderConfirmation', () => {
  let component: OrderConfirmation;
  let fixture: ComponentFixture<OrderConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmation, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load demo order when localStorage is empty', () => {
    localStorage.removeItem('th_last_order');
    component.ngOnInit();
    expect(component.order).toBeTruthy();
    expect(component.order!.items.length).toBeGreaterThan(0);
  });

  it('should load order from localStorage when valid', () => {
    const mockOrder = {
      id: 'TH-TEST01',
      date: new Date().toISOString(),
      status: 'confirmed',
      total: 500,
      items: [{ name: 'Test', category: 'Tops', image: '', price: 500, quantity: 1, size: 'M', condition: 'Pre-loved' }],
    };
    localStorage.setItem('th_last_order', JSON.stringify(mockOrder));
    component.ngOnInit();
    expect(component.order?.id).toBe('TH-TEST01');
    localStorage.removeItem('th_last_order');
  });

  it('should fall back to demo order on malformed JSON', () => {
    localStorage.setItem('th_last_order', '{{invalid}}');
    component.ngOnInit();
    expect(component.order).toBeTruthy();
    localStorage.removeItem('th_last_order');
  });

  it('should compute subtotal correctly', () => {
    component['loadOrder']();
    const expected = component.order!.items.reduce((s, i) => s + i.price * i.quantity, 0);
    expect(component.subtotal).toBe(expected);
  });

  it('should format price with ₱ prefix', () => {
    expect(component.formatPrice(550)).toContain('₱');
    expect(component.formatPrice(550)).toContain('550');
  });
});