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
            import('./pages/home/home').then(m => m.Home),
        title: 'ThriftHub — Affordable Ukay-Ukay Online'
    },
    {
        path: 'about',
        loadComponent: () =>
            import('./pages/about/about').then(m => m.About),
        title: 'About Us — ThriftHub'
    },
    {
        path: 'contact',
        loadComponent: () =>
            import('./pages/contact/contact').then(m => m.Contact),
        title: 'Contact Us — ThriftHub'
    },

    // ── Product Pages ──────────────────────────────────────────
    {
        path: 'catalog',
        loadComponent: () =>
            import('./pages/catalog/catalog').then(m => m.Catalog),
        title: 'Shop — ThriftHub'
    },
    {
        path: 'product/:id',
        loadComponent: () =>
            import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
        title: 'Product — ThriftHub'
    },

    // ── Cart & Ordering ────────────────────────────────────────
    {
        path: 'cart',
        loadComponent: () =>
            import('./pages/cart/cart').then(m => m.Cart),
        title: 'Cart — ThriftHub'
    },
    {
        path: 'checkout',
        loadComponent: () =>
            import('./pages/checkout/checkout').then(m => m.Checkout),
        title: 'Checkout — ThriftHub'
    },
    {
        path: 'order-confirmation',
        loadComponent: () =>
            import('./pages/order-confirmation/order-confirmation').then(m => m.OrderConfirmation),
        title: 'Order Confirmed — ThriftHub'
    },

    // ── User Account ───────────────────────────────────────────
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login').then(m => m.Login),
        title: 'Log In — ThriftHub'
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/register/register').then(m => m.Register),
        title: 'Create Account — ThriftHub'
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./pages/profile/profile').then(m => m.Profile),
        title: 'My Profile — ThriftHub'
    },
    {
        path: 'order-history',
        loadComponent: () =>
            import('./pages/order-history/order-history').then(m => m.OrderHistory),
        title: 'Order History — ThriftHub'
    },

    // ── Wildcard / 404 ─────────────────────────────────────────
    {
        path: '**',
        redirectTo: 'home'
    }

];