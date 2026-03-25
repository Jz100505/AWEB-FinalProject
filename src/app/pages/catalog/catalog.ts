import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ── Shared interface — also imported by product-detail ──────────────────────
export interface CatalogProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  size: string | string[];
  condition: string;
  images: string[];
  stock: number;
  description: string;
  createdAt: string;
}

export type PriceRange = 'all' | 'under300' | '300to500' | 'over500';
export type SortOption = 'newest' | 'price-desc';

// ── Helpers ──────────────────────────────────────────────────────────────────
export function resolveLocalImage(productName: string): string {
  const base = productName
    .toLowerCase()
    .replace(/-/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return `/assets/images/${base}.webp`;
}

export function normalizeSizes(size: string | string[]): string[] {
  if (!size) return [];
  if (Array.isArray(size)) return (size as string[]).filter(Boolean);
  return [size as string];
}

function normalizeImages(p: any): string[] {
  if (p.images?.length) return p.images;
  if (p.image) {
    const img = (p.image as string).trim();
    const prefixed = img.startsWith('/') || img.startsWith('http') ? img : `/${img}`;
    return [prefixed];
  }
  return [resolveLocalImage(p.name)];
}

// ── Fallback data — 12 products (Tops + Bottoms) ────────────────────────────
export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    _id: '69c23ff91ad6a5f45e13de96',
    name: 'Yellow Hoodie',
    category: 'Tops',
    price: 550,
    size: ['XL'],
    condition: 'Pre-loved',
    images: ['/assets/images/yellow_hoodie.webp'],
    stock: 1,
    description: 'Oversized multicolor knit cardigan with a bold abstract print. The loudest piece in your rotation — impossible to miss, impossible not to cop.',
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de97',
    name: 'Vintage Long Sleeves',
    category: 'Tops',
    price: 450,
    size: ['Small'],
    condition: 'Pre-loved',
    images: ['/assets/images/vintage_long_sleeves.webp'],
    stock: 1,
    description: 'Soft vintage long-sleeve tee with a relaxed silhouette. A versatile everyday layer with a worn-in character that new clothes can\'t replicate.',
    createdAt: '2025-01-14T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de8e',
    name: 'Grey Cargo Pants',
    category: 'Bottoms',
    price: 450,
    size: ['34'],
    condition: 'Pre-loved',
    images: ['/assets/images/grey_cargo_pants.webp'],
    stock: 1,
    description: 'Utilitarian grey cargo pants with reinforced pockets and a relaxed street-ready fit. Plenty of storage, maximum drip.',
    createdAt: '2025-01-13T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de98',
    name: 'Grey T-Shirt Imprint',
    category: 'Tops',
    price: 250,
    size: ['Medium'],
    condition: 'Pre-loved',
    images: ['/assets/images/grey_tshirt_imprint.webp'],
    stock: 1,
    description: 'Faded grey tee with a vintage graphic imprint on the back. Low-key statement — the kind that earns double-takes.',
    createdAt: '2025-01-12T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de99',
    name: 'Vintage Shirt V2',
    category: 'Tops',
    price: 350,
    size: ['Medium'],
    condition: 'Pre-loved',
    images: ['/assets/images/vintage_shirt_v2.webp'],
    stock: 1,
    description: 'Bold short-sleeve shirt with vivid abstract panels and an open collar. A genuine vintage one-of-one — not a reprint.',
    createdAt: '2025-01-11T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de9a',
    name: 'Grey T-Shirt',
    category: 'Tops',
    price: 200,
    size: ['Large'],
    condition: 'Pre-loved',
    images: ['/assets/images/grey_tshirt.webp'],
    stock: 1,
    description: 'Minimal grey crew-neck tee in a relaxed fit. The foundation of every outfit — simple, clean, irreplaceable.',
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de9b',
    name: 'Vintage Shirt',
    category: 'Tops',
    price: 300,
    size: ['Large'],
    condition: 'Pre-loved',
    images: ['/assets/images/vintage_shirt.webp'],
    stock: 1,
    description: 'Vibrant patchwork vintage button-up with a kaleidoscope of color. A statement piece that works with anything minimal.',
    createdAt: '2025-01-09T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de8b',
    name: 'Black Jeans',
    category: 'Bottoms',
    price: 400,
    size: ['32'],
    condition: 'Pre-loved',
    images: ['/assets/images/black_jeans.webp'],
    stock: 1,
    description: 'Classic black denim with a straight cut and clean finish. The most versatile bottom you\'ll ever cop — goes with literally everything.',
    createdAt: '2025-01-08T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de8c',
    name: 'Black Track Pants',
    category: 'Bottoms',
    price: 300,
    size: ['Large'],
    condition: 'Pre-loved',
    images: ['/assets/images/black_track_pants.webp'],
    stock: 1,
    description: 'Clean black track pants with white side stripes. Comfort and style in equal measure — streets or sport, this fits anywhere.',
    createdAt: '2025-01-07T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de8d',
    name: 'Blue Jeans',
    category: 'Bottoms',
    price: 400,
    size: ['30'],
    condition: 'Pre-loved',
    images: ['/assets/images/blue_jeans.webp'],
    stock: 1,
    description: 'Classic medium-wash blue denim in a straight leg cut. The original everyday essential — because some fits never go out of style.',
    createdAt: '2025-01-06T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de8f',
    name: 'Grey Sweatpants',
    category: 'Bottoms',
    price: 250,
    size: ['Medium'],
    condition: 'Pre-loved',
    images: ['/assets/images/grey_sweatpants.webp'],
    stock: 1,
    description: 'Soft, lightweight grey sweatpants with a tapered fit. Elevated comfort — looks just as good on a coffee run as it does off the court.',
    createdAt: '2025-01-05T00:00:00Z',
  },
  {
    _id: '69c23ff91ad6a5f45e13de90',
    name: 'White Track Pants',
    category: 'Bottoms',
    price: 300,
    size: ['Small'],
    condition: 'Pre-loved',
    images: ['/assets/images/white_track_pants.webp'],
    stock: 1,
    description: 'Crisp white track pants with a modern silhouette. Clean, sharp, and effortlessly styleable — pair with anything and win.',
    createdAt: '2025-01-04T00:00:00Z',
  },
];

// Logical size sort order
const SIZE_ORDER = ['XS', 'Small', 'S', 'Medium', 'M', 'Large', 'L', 'XL', 'XXL',
  '26', '28', '30', '32', '34', '36', '38'];

const ITEMS_PER_PAGE = 8;

// ── Component ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit, OnDestroy {

  // ── Data ─────────────────────────────────────────────────
  allProducts: CatalogProduct[] = [];
  isLoading = true;

  // ── Filters ──────────────────────────────────────────────
  searchQuery = '';
  selectedCategory = 'all';
  selectedSizes: string[] = [];
  selectedPriceRange: PriceRange = 'all';
  showAvailableOnly = false;

  // ── Sort / Pagination ─────────────────────────────────────
  sortOption: SortOption = 'newest';
  currentPage = 1;
  readonly itemsPerPage = ITEMS_PER_PAGE;

  // ── Toast ─────────────────────────────────────────────────
  showToast = false;
  toastMessage = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  // ── Skeletons ─────────────────────────────────────────────
  readonly skeletonItems = Array(8).fill(0);

  constructor(
    public router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void { this.fetchProducts(); }
  ngOnDestroy(): void { clearTimeout(this.toastTimer); }

  // ── Fetch ─────────────────────────────────────────────────
  fetchProducts(): void {
    this.isLoading = true;
    this.http.get<any[]>('/api/products?limit=100').subscribe({
      next: (raw) => {
        this.allProducts = raw?.length
          ? raw.map(p => this.normalize(p))
          : FALLBACK_PRODUCTS;
        this.isLoading = false;
      },
      error: () => {
        this.allProducts = FALLBACK_PRODUCTS;
        this.isLoading = false;
      },
    });
  }

  private normalize(p: any): CatalogProduct {
    return {
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category ?? 'Uncategorized',
      size: normalizeSizes(p.size),
      condition: p.condition ?? 'Pre-loved',
      images: normalizeImages(p),
      stock: p.stock ?? 1,
      description: p.description ?? '',
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
  }

  // ── Computed ─────────────────────────────────────────────
  get categories(): string[] {
    return [...new Set(this.allProducts.map(p => p.category))].sort();
  }

  get availableSizes(): string[] {
    const set = new Set<string>();
    this.allProducts.forEach(p => normalizeSizes(p.size).forEach(s => set.add(s)));
    return [...set].sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a), bi = SIZE_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
  }

  get filteredProducts(): CatalogProduct[] {
    let p = [...this.allProducts];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      p = p.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q) ||
        normalizeSizes(x.size).some(s => s.toLowerCase().includes(q))
      );
    }
    if (this.selectedCategory !== 'all')
      p = p.filter(x => x.category === this.selectedCategory);

    if (this.selectedSizes.length)
      p = p.filter(x => normalizeSizes(x.size).some(s => this.selectedSizes.includes(s)));

    if (this.selectedPriceRange !== 'all') {
      p = p.filter(x => {
        if (this.selectedPriceRange === 'under300') return x.price < 300;
        if (this.selectedPriceRange === '300to500') return x.price >= 300 && x.price <= 500;
        if (this.selectedPriceRange === 'over500') return x.price > 500;
        return true;
      });
    }
    if (this.showAvailableOnly) p = p.filter(x => x.stock > 0);

    if (this.sortOption === 'newest')
      p.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (this.sortOption === 'price-desc')
      p.sort((a, b) => b.price - a.price);

    return p;
  }

  get paginatedProducts(): CatalogProduct[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery !== '' ||
      this.selectedCategory !== 'all' ||
      this.selectedSizes.length > 0 ||
      this.selectedPriceRange !== 'all' ||
      this.showAvailableOnly;
  }

  // ── Filter actions ────────────────────────────────────────
  setCategory(cat: string): void { this.selectedCategory = cat; this.currentPage = 1; }
  setPriceRange(r: PriceRange): void { this.selectedPriceRange = r; this.currentPage = 1; }
  onSearchChange(): void { this.currentPage = 1; }
  onSortChange(): void { this.currentPage = 1; }

  toggleSize(size: string): void {
    this.selectedSizes = this.selectedSizes.includes(size)
      ? this.selectedSizes.filter(s => s !== size)
      : [...this.selectedSizes, size];
    this.currentPage = 1;
  }

  isSizeSelected(size: string): boolean { return this.selectedSizes.includes(size); }

  toggleAvailability(): void { this.showAvailableOnly = !this.showAvailableOnly; this.currentPage = 1; }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedSizes = [];
    this.selectedPriceRange = 'all';
    this.showAvailableOnly = false;
    this.currentPage = 1;
  }

  // ── Pagination ────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      document.getElementById('cat-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Cart ──────────────────────────────────────────────────
  addToCart(product: CatalogProduct, event: MouseEvent): void {
    event.stopPropagation();
    this.toastMessage = `${product.name} added to cart!`;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 2500);
  }

  // ── Hero scroll ───────────────────────────────────────────
  scrollToGrid(): void {
    document.getElementById('cat-grid')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Helpers ───────────────────────────────────────────────
  getProductImage(product: CatalogProduct): string {
    return (product.images?.length && product.images[0])
      ? product.images[0]
      : resolveLocalImage(product.name);
  }

  getSizes(product: CatalogProduct): string[] { return normalizeSizes(product.size); }

  formatPrice(price: number): string {
    return '₱' + price.toLocaleString('en-PH');
  }

  trackById(_: number, p: CatalogProduct): string { return p._id; }
}