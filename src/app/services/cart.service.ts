import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    condition: string;
    size: string;
    quantity: number;
    stock: number;
}

/** Returns the per-user cart key, or the legacy key when no user is logged in. */
export function cartKey(userId: string | null | undefined): string {
    return userId ? `th_cart_${userId}` : 'th_cart';
}

/** Legacy constant kept so existing imports in checkout.ts / order-history.ts don't break. */
export const CART_STORAGE_KEY = 'th_cart';

@Injectable({ providedIn: 'root' })
export class CartService {

    private items: CartItem[] = [];

    private cartCountSubject = new BehaviorSubject<number>(0);
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

    /** Total number of units across all line items */
    cartCount$: Observable<number> = this.cartCountSubject.asObservable();

    /** Full cart item array */
    cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

    constructor(private authService: AuthService) {
        // Re-load cart whenever the logged-in user changes (login / logout).
        this.authService.currentUser$.subscribe(() => {
            this.items = this.loadFromStorage();
            this.publish();
        });
    }

    // ── Public API ──────────────────────────────────────────────────────────

    addItem(product: Omit<CartItem, 'quantity'>): void {
        const existing = this.items.find(
            i => i._id === product._id && i.size === product.size
        );

        if (existing) {
            if (existing.quantity < existing.stock) {
                existing.quantity += 1;
            }
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.persist();
    }

    removeItem(productId: string, size: string): void {
        this.items = this.items.filter(
            i => !(i._id === productId && i.size === size)
        );
        this.persist();
    }

    updateQuantity(productId: string, size: string, quantity: number): void {
        const item = this.items.find(
            i => i._id === productId && i.size === size
        );
        if (!item) return;

        if (quantity <= 0) {
            this.removeItem(productId, size);
        } else {
            item.quantity = Math.min(quantity, item.stock);
            this.persist();
        }
    }

    clearCart(): void {
        this.items = [];
        this.persist();
    }

    getItems(): CartItem[] {
        return [...this.items];
    }

    getCount(): number {
        return this.calcCount();
    }

    getSubtotal(): number {
        return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    // ── Private ─────────────────────────────────────────────────────────────

    private get storageKey(): string {
        return cartKey(this.authService.currentUser?.id);
    }

    private calcCount(): number {
        return this.items.reduce((sum, i) => sum + i.quantity, 0);
    }

    private publish(): void {
        this.cartCountSubject.next(this.calcCount());
        this.cartItemsSubject.next([...this.items]);
    }

    private persist(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch {
            // localStorage unavailable — silently ignore
        }
        this.publish();
    }

    private loadFromStorage(): CartItem[] {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
            return [];
        }
    }
}