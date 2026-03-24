import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

// ── Product Model ──────────────────────────────────────────
export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  imageUrl: string;
  description: string;
  inStock: boolean;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCardComponent implements OnInit, OnDestroy {

  // ── Inputs ───────────────────────────────────────────────
  @Input({ required: true }) product!: Product;
  @Input() wishlisted = false;

  // ── Outputs ──────────────────────────────────────────────
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetail = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();

  // ── State ─────────────────────────────────────────────────
  isWishlisted = false;
  isAddingToCart = false;
  addedToCart = false;

  private addedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.isWishlisted = this.wishlisted;
  }

  ngOnDestroy(): void {
    if (this.addedTimer) clearTimeout(this.addedTimer);
  }

  // ── Handlers ──────────────────────────────────────────────

  onAddToCart(): void {
    if (!this.product.inStock || this.isAddingToCart) return;

    this.isAddingToCart = true;
    this.addedToCart = false;

    // Simulate async add (replace with CartService call)
    setTimeout(() => {
      this.isAddingToCart = false;
      this.addedToCart = true;
      this.addToCart.emit(this.product);

      // Reset button label after 2 seconds
      this.addedTimer = setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
    }, 600);
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.product);
    this.router.navigate(['/product', this.product.id]);
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    this.isWishlisted = !this.isWishlisted;
    this.toggleWishlist.emit(this.product);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.jpg';
  }

  // ── Helpers ───────────────────────────────────────────────

  getConditionClass(condition: string): string {
    const map: Record<string, string> = {
      'New': 'condition--new',
      'Like New': 'condition--like-new',
      'Good': 'condition--good',
      'Fair': 'condition--fair'
    };
    return map[condition] ?? 'condition--good';
  }
}