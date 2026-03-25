import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[]; // Already fully-resolved URLs coming from the API
  category: string;
  size: string[];
  condition: string;
  description: string;
}

interface Testimonial {
  name: string;
  handle: string;
  quote: string;
  avatar: string;
}

/**
 * Maps a product name to its corresponding image filename in
 * /assets/images/. Converts "Grey T-Shirt Imprint" → "grey_tshirt_imprint.webp"
 * by lowercasing, stripping hyphens, and replacing spaces with underscores.
 * Falls back to featured_product_a.webp when no match is found.
 */
function resolveLocalImage(productName: string): string {
  const base = productName
    .toLowerCase()
    .replace(/-/g, '')        // remove hyphens: "t-shirt" → "tshirt"
    .replace(/\s+/g, '_')    // spaces → underscores: "grey tshirt" → "grey_tshirt"
    .replace(/[^a-z0-9_]/g, ''); // strip remaining special chars

  return `/assets/images/${base}.webp`;
}

// Safety fallback if the derived filename doesn't exist on disk
const FALLBACK_IMAGE = '/assets/images/featured_product_a.webp';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  featuredProducts: Product[] = [];
  isLoadingProducts = true;
  productsError = false;

  newsletterEmail = '';
  newsletterSubmitted = false;
  newsletterLoading = false;

  navScrolled = false;

  readonly whyItems = [
    {
      icon: '✦',
      title: 'Curated Drops',
      desc: 'Every item is hand-checked for quality. No junk, just gems.',
    },
    {
      icon: '◈',
      title: 'Streetwear Focus',
      desc: 'We hunt the best ukay finds — fits that actually go hard.',
    },
    {
      icon: '⬡',
      title: 'Sustainable Fashion',
      desc: 'Second-hand is the move. Cop pre-loved pieces, reduce waste.',
    },
    {
      icon: '◎',
      title: 'Easy Ordering',
      desc: 'Browse, add to cart, checkout. No DMs, no hassle.',
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Bianca Reyes',
      handle: '@biancareyess',
      quote:
        'ThriftHub changed how I shop. Found a vintage jacket for ₱250 that people keep asking about. The catalog is clean, checkout was smooth.',
      avatar: 'BR',
    },
    {
      name: 'Marcus Dela Cruz',
      handle: '@marcusdlc',
      quote:
        'Bro this site goes hard. Found three fits in one sitting. Way better than scrolling Facebook for hours just to get ghosted by the seller.',
      avatar: 'MD',
    },
    {
      name: 'Trisha Lim',
      handle: '@trishalimm',
      quote:
        'Love the vibe and the prices. I always felt ukay shopping online was risky but ThriftHub actually shows you everything up front. Big W.',
      avatar: 'TL',
    },
  ];

  readonly categories = [
    { label: 'Tops', slug: 'tops', emoji: '👕' },
    { label: 'Bottoms', slug: 'bottoms', emoji: '👖' },
    { label: 'Outerwear', slug: 'outerwear', emoji: '🧥' },
    { label: 'Footwear', slug: 'footwear', emoji: '👟' },
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchFeaturedProducts();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 60;
  }

  fetchFeaturedProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = false;

    // Fetch only 3 featured products for the home page preview
    this.http.get<Product[]>('/api/products?limit=3').subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 3);
        this.isLoadingProducts = false;
      },
      error: () => {
        this.productsError = true;
        this.isLoadingProducts = false;
      },
    });
  }

  /**
   * Returns the display image URL for a product card.
   *
   * Priority order:
   *   1. Image URL already resolved by the API (stored in MongoDB)
   *   2. Derived from the product name → "Grey T-Shirt" → grey_tshirt.webp
   *   3. Generic fallback if neither exists
   */
  getProductImage(product: Product, _index: number): string {
    // 1. API-resolved image takes priority
    if (product.images && product.images[0]) {
      return product.images[0];
    }

    // 2. Derive filename from product name so it always matches the right asset
    if (product.name) {
      return resolveLocalImage(product.name);
    }

    // 3. Last-resort fallback
    return FALLBACK_IMAGE;
  }

  submitNewsletter(): void {
    if (!this.newsletterEmail || this.newsletterLoading) return;
    this.newsletterLoading = true;

    setTimeout(() => {
      this.newsletterSubmitted = true;
      this.newsletterLoading = false;
      this.newsletterEmail = '';
    }, 900);
  }

  trackByProduct(_: number, product: Product): string {
    return product._id;
  }

  formatPrice(price: number): string {
    return '₱' + price.toLocaleString('en-PH');
  }
}