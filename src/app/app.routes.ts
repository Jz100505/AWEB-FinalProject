import { Routes } from '@angular/router';

export const routes: Routes = [

    // ── Default redirect ───────────────────────────────────────
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    // ── Main Pages ─────────────────────────────────────────────
    {
        path: 'home',
        loadComponent: () =>
            import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'ThriftHub — Affordable Ukay-Ukay Online'
    },
    {
        path: 'about',
        loadComponent: () =>
            import('./pages/about/about.component').then(m => m.AboutComponent),
        title: 'About Us — ThriftHub'
    },
    {
        path: 'contact',
        loadComponent: () =>
            import('./pages/contact/contact.component').then(m => m.ContactComponent),
        title: 'Contact Us — ThriftHub'
    },

    // ── Product Pages ──────────────────────────────────────────
    {
        path: 'catalog',
        loadComponent: () =>
            import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
        title: 'Shop — ThriftHub'
    },
    {
        path: 'product/:id',
        loadComponent: () =>
            import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Product — ThriftHub'
    },

    // ── Cart & Ordering ────────────────────────────────────────
    {
        path: 'cart',
        loadComponent: () =>
            import('./pages/cart/cart.component').then(m => m.CartComponent),
        title: 'Cart — ThriftHub'
    },
    {
        path: 'checkout',
        loadComponent: () =>
            import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Checkout — ThriftHub'
    },
    {
        path: 'order-confirmation',
        loadComponent: () =>
            import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
        title: 'Order Confirmed — ThriftHub'
    },

    // ── User Account ───────────────────────────────────────────
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login.component').then(m => m.LoginComponent),
        title: 'Log In — ThriftHub'
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/register/register.component').then(m => m.RegisterComponent),
        title: 'Create Account — ThriftHub'
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile — ThriftHub'
    },
    {
        path: 'order-history',
        loadComponent: () =>
            import('./pages/order-history/order-history.component').then(m => m.OrderHistoryComponent),
        title: 'Order History — ThriftHub'
    },

    // ── Wildcard / 404 ─────────────────────────────────────────
    {
        path: '**',
        redirectTo: 'home'
    }

];