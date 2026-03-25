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

// ── Fallback images used ONLY when a product has no image in MongoDB ──
// Each card gets a unique placeholder by cycling through this list with
// its position index, so no two adjacent cards ever look the same.
const PLACEHOLDER_IMAGES = [
  '/assets/images/hero_main_editorial.webp',
  '/assets/images/hero_img_0.webp',
  '/assets/images/hero_img_1.webp',
  '/assets/images/home_split_a.webp',
];

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

    this.http.get<Product[]>('/api/products?limit=8').subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 8);
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
   * The API (products.js) now resolves all image URLs before sending them,
   * so `product.images[0]` is always a ready-to-use URL when present.
   * We only fall back to a placeholder when MongoDB has no image stored,
   * cycling by card index so each card looks visually distinct.
   */
  getProductImage(product: Product, index: number): string {
    if (product.images && product.images[0]) {
      // Already a full URL resolved by the API — use directly, no prefix needed
      return product.images[0];
    }
    // No image in DB → unique placeholder per card position
    return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
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