import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, of } from 'rxjs';
import {
  CatalogProduct,
  FALLBACK_PRODUCTS,
  normalizeSizes,
  resolveLocalImage,
} from '../catalog/catalog';

// Full canonical size order shown on every product — unavailable ones are
// displayed but disabled so the shopper can see what exists vs. what's gone.
export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit, OnDestroy {

  // ── State ─────────────────────────────────────────────────
  product: CatalogProduct | null = null;
  relatedProducts: CatalogProduct[] = [];
  isLoading = false;
  notFound = false;

  selectedSize = '';
  quantity = 1;

  // Full size grid always rendered; unavailable sizes are disabled
  readonly allSizes = ALL_SIZES;

  // ── Toast ──────────────────────────────────────────────────
  showToast = false;
  toastMessage = '';
  addedToCart = false;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private btnTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // Re-run when route param changes (e.g. related product clicked)
    this.route.params.subscribe(params => this.loadProduct(params['id']));
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
    clearTimeout(this.btnTimer);
  }

  // ── Load product ──────────────────────────────────────────
  loadProduct(id: string): void {
    this.notFound = false;
    this.product = null;
    this.selectedSize = '';
    this.quantity = 1;
    this.addedToCart = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.http.get<any>(`/api/product?id=${id}`).pipe(
      switchMap((raw) => {
        if (raw && raw._id) {
          const p = this.normalize(raw);
          return this.http.get<any[]>('/api/products?limit=100').pipe(
            catchError(() => of(null)),
            switchMap((all) => {
              const allNorm = all?.length
                ? all.map(x => this.normalize(x))
                : FALLBACK_PRODUCTS;
              return of({ product: p, related: allNorm });
            }),
          );
        }
        return of({
          product: null as CatalogProduct | null,
          related: FALLBACK_PRODUCTS,
          fallbackId: id,
        });
      }),
      catchError(() => of({
        product: null as CatalogProduct | null,
        related: FALLBACK_PRODUCTS,
        fallbackId: id,
      })),
    ).subscribe((result) => {
      this.ngZone.run(() => {
        if (result.product) {
          this.product = result.product;
          this.relatedProducts = result.related
            .filter(x => x.category === result.product!.category && x._id !== result.product!._id)
            .slice(0, 4);
          // Auto-select first available size from the canonical grid
          this.selectedSize = this.firstAvailableSize(result.product);
        } else if ('fallbackId' in result) {
          this.resolveProduct(result.fallbackId as string, result.related);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    });
  }

  private resolveProduct(id: string, products: CatalogProduct[]): void {
    const found = products.find(p => p._id === id)
      ?? FALLBACK_PRODUCTS.find(p => p._id === id)
      ?? null;

    if (found) {
      this.product = found;
      this.relatedProducts = products
        .filter(p => p.category === found.category && p._id !== found._id)
        .slice(0, 4);
      this.selectedSize = this.firstAvailableSize(found);
    } else {
      this.notFound = true;
    }
    this.isLoading = false;
  }

  private normalize(p: any): CatalogProduct {
    // p.size may be a single string ("Medium"), an array, or absent
    const rawSizes = normalizeSizes(p.size ?? p.sizes ?? []);
    const mappedSizes = rawSizes.length
      ? rawSizes.map((s: string) => this.mapSizeLabel(s))
      : ['S', 'M', 'L'];

    return {
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category ?? 'Uncategorized',
      size: mappedSizes,
      condition: p.condition ?? 'Pre-loved',
      // MongoDB may use image_url, image, or images[]
      images: [this.resolveImage(p) || resolveLocalImage(p.name)],
      // Use MongoDB stock directly; fall back to 1 if absent/zero
      stock: (p.stock != null && Number(p.stock) > 0) ? Number(p.stock) : 1,
      description: p.description ?? '',
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
  }

  /**
   * Resolves the product image from whichever field MongoDB uses.
   * Priority: images[] -> image_url -> image -> empty string (caller falls back)
   */
  private resolveImage(p: any): string {
    if (p.images?.length) return p.images[0];
    const url: string = (p.image_url ?? p.image ?? '').trim();
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : '/' + url;
  }

  /** Normalise legacy size labels to our canonical ALL_SIZES entries */
  private mapSizeLabel(raw: string): string {
    const map: Record<string, string> = {
      'xs': 'XS', 'extra small': 'XS',
      's': 'S', 'small': 'S',
      'm': 'M', 'medium': 'M',
      'l': 'L', 'large': 'L',
      'xl': 'XL', 'extra large': 'XL', 'x-large': 'XL',
      'xxl': 'XXL', 'xx-large': 'XXL', 'double xl': 'XXL',
    };
    return map[raw.toLowerCase()] ?? raw;
  }

  /** Returns the first size in ALL_SIZES that this product carries */
  private firstAvailableSize(product: CatalogProduct): string {
    const available = normalizeSizes(product.size).map(s => this.mapSizeLabel(s));
    return ALL_SIZES.find(s => available.includes(s)) ?? '';
  }

  // ── Size helpers ──────────────────────────────────────────
  /**
   * Returns true when the product actually carries the requested size.
   * The full ALL_SIZES grid is always rendered; unavailable entries get
   * the pd-size-chip--unavailable style and are pointer-events: none.
   */
  isSizeAvailable(size: string): boolean {
    if (!this.product) return false;
    const available = normalizeSizes(this.product.size).map(s => this.mapSizeLabel(s));
    return available.includes(size);
  }

  // ── Quantity controls ─────────────────────────────────────
  // Cap at 10 per order regardless of total stock to keep UX sensible
  readonly maxQtyPerOrder = 10;

  incrementQty(): void {
    const cap = Math.min(this.product?.stock ?? 1, this.maxQtyPerOrder);
    if (this.quantity < cap) {
      this.quantity++;
    }
  }

  decrementQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // ── Cart ──────────────────────────────────────────────────
  addToCart(): void {
    if (!this.product || this.product.stock === 0 || !this.selectedSize) return;

    this.addedToCart = true;
    this.toastMessage = `${this.product.name} (${this.selectedSize}${this.quantity > 1 ? ' ×' + this.quantity : ''}) added to cart!`;
    this.showToast = true;

    clearTimeout(this.toastTimer);
    clearTimeout(this.btnTimer);

    this.toastTimer = setTimeout(() => (this.showToast = false), 2800);
    this.btnTimer = setTimeout(() => (this.addedToCart = false), 2200);
  }

  selectSize(size: string): void {
    if (this.isSizeAvailable(size)) {
      this.selectedSize = size;
      // Reset qty if it now exceeds available stock
      if (this.quantity > (this.product?.stock ?? 1)) {
        this.quantity = 1;
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  getProductImage(): string {
    if (!this.product) return '';
    return (this.product.images?.length && this.product.images[0])
      ? this.product.images[0]
      : resolveLocalImage(this.product.name);
  }

  getRelatedImage(p: CatalogProduct): string {
    return (p.images?.length && p.images[0]) ? p.images[0] : resolveLocalImage(p.name);
  }

  getSizes(): string[] {
    return this.product ? normalizeSizes(this.product.size) : [];
  }

  formatPrice(price: number): string {
    return '₱' + price.toLocaleString('en-PH');
  }

  trackById(_: number, p: CatalogProduct): string { return p._id; }
}