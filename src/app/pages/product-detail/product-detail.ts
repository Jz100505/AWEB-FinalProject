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
    // Re-run when the route param changes (e.g. related product clicked)
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
    this.addedToCart = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Flat RxJS pipeline — avoids nested subscribes that can escape zone.js
    this.http.get<any>(`/api/product?id=${id}`).pipe(
      switchMap((raw) => {
        if (raw && raw._id) {
          const p = this.normalize(raw);
          // Fetch related products as a chained observable
          return this.http.get<any[]>('/api/products?limit=100').pipe(
            catchError(() => of(null)),                       // on error, continue with null
            switchMap((all) => {
              const allNorm = all?.length ? all.map(x => this.normalize(x)) : FALLBACK_PRODUCTS;
              return of({ product: p, related: allNorm });
            }),
          );
        }
        // API returned unexpected data — fall back to local list
        return of({ product: null as CatalogProduct | null, related: FALLBACK_PRODUCTS, fallbackId: id });
      }),
      catchError(() => {
        // Primary product fetch failed — fall back
        return of({ product: null as CatalogProduct | null, related: FALLBACK_PRODUCTS, fallbackId: id });
      }),
    ).subscribe((result) => {
      this.ngZone.run(() => {
        if (result.product) {
          this.product = result.product;
          this.relatedProducts = result.related
            .filter(x => x.category === result.product!.category && x._id !== result.product!._id)
            .slice(0, 4);
          const sizes = normalizeSizes(result.product.size);
          this.selectedSize = sizes[0] ?? '';
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
      const sizes = normalizeSizes(found.size);
      this.selectedSize = sizes[0] ?? '';
    } else {
      this.notFound = true;
    }
    this.isLoading = false;
  }

  private normalize(p: any): CatalogProduct {
    return {
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category ?? 'Uncategorized',
      size: normalizeSizes(p.size),
      condition: p.condition ?? 'Pre-loved',
      images: p.images?.length ? p.images
        : p.image ? [`/${(p.image as string).replace(/^\//, '')}`]
          : [resolveLocalImage(p.name)],
      stock: p.stock ?? 1,
      description: p.description ?? '',
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
  }

  // ── Actions ───────────────────────────────────────────────
  addToCart(): void {
    if (!this.product || this.product.stock === 0) return;

    this.addedToCart = true;
    this.toastMessage = `${this.product.name} added to cart!`;
    this.showToast = true;

    clearTimeout(this.toastTimer);
    clearTimeout(this.btnTimer);

    this.toastTimer = setTimeout(() => (this.showToast = false), 2600);
    this.btnTimer = setTimeout(() => (this.addedToCart = false), 2000);
  }

  selectSize(size: string): void { this.selectedSize = size; }

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