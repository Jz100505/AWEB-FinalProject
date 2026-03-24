import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {

  // State
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isSearchOpen = false;
  isLoggedIn = false;
  cartCount = 0;
  searchQuery = '';
  userInitial = 'U';

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // TODO: Replace with AuthService subscription
    // this.authService.currentUser$.subscribe(user => {
    //   this.isLoggedIn = !!user;
    //   this.userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';
    // });

    // TODO: Replace with CartService subscription
    // this.cartService.cartCount$.subscribe(count => this.cartCount = count);
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void { }

  // ── Scroll listener ───────────────────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  // ── Click outside listener ────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
    if (!target.closest('.search-bar') && !target.closest('[aria-label="Search"]')) {
      this.isSearchOpen = false;
    }
  }

  // ── Keyboard escape ───────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }

  // ── Toggles ───────────────────────────────────────────────
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 100);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  closeMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
    this.isSearchOpen = false;
    document.body.style.overflow = '';
  }

  // ── Actions ───────────────────────────────────────────────
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.closeMenus();
      this.searchQuery = '';
    }
  }

  logout(): void {
    // TODO: Replace with AuthService call
    // this.authService.logout();
    this.isLoggedIn = false;
    this.closeMenus();
    this.router.navigate(['/login']);
  }
}