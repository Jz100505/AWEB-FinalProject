# ThriftHub

Welcome to **ThriftHub**, an online marketplace for affordable, sustainable ukay-ukay fashion. This document provides a comprehensive overview of the project's folder structure, explaining the purpose of each directory and file (excluding standard tool configuration folders like `node_modules`, `.angular`, and `.vscode`).

---

## 📁 `netlify/`
Contains serverless functions and backend configuration deployed via Netlify Functions. 
*(Note: The directory is locally named `funcitons` due to a typo in the local development environment).*

* **`funcitons/`**
  * **`login.js`**: Serverless HTTP endpoint handling user authentication and sign-in functionality.
  * **`register.js`**: Serverless HTTP endpoint handling the creation of new user accounts.
  * **`models/`**
    * **`user.model.js`**: Mongoose database schema defining the structure of a User document (name, email, password hash) for MongoDB.
  * **`utils/`**
    * **`db.js`**: Database connection utility that manages the MongoDB connection lifecycle and caching for the serverless environment.

* **`netlify.toml`** (Root Level): Configuration file defining Netlify build settings, deployment directories, and routing rules for the single-page application.

---

## 📁 `public/`
Stores static assets that are served directly to the browser without passing through the build process.

* **`assets/`**: Contains static visuals and media used throughout the app.
  * Includes images like SVG logos (`th-logo-black.svg`, `th-logo-white.svg`) and fallback thumbnails.
* **`favicon.ico`**: The small browser tab icon representing the ThriftHub logo.

---

## 📁 `src/`
The main source code directory containing all the Angular application logic, components, styles, and routing.

### 📄 Root Application Files
* **`index.html`**: The main standard HTML template where the Angular app is injected (`<app-root>`). It includes meta tags for SEO, Open Graph descriptions, and Google Fonts.
* **`main.ts`**: The application entry point that bootstraps the root Angular component (`AppComponent`) and injects the global configuration (`appConfig`).
* **`styles.css`**: The global stylesheet for the application, containing CSS variables, base styles, and utility classes that apply project-wide.

### 📂 `app/` (Application Logic)
This folder holds the core Angular building blocks of ThriftHub.

#### 📄 Core App Files
* **`app.ts` / `app.html` / `app.css`**: The fundamental root component (`AppComponent`) layout. It renders the global `NavbarComponent`, the `RouterOutlet` (for inner pages), and `FooterComponent`.
* **`app.routes.ts`**: Defines the application's URL paths, lazy-loading the respective component views (e.g., mapping `/cart` to `CartComponent`).
* **`app.config.ts`**: Global Angular configuration file providing core services such as routing (with view transitions) and raw HTTP client capabilities.
* **`app.spec.ts`**: Unit test file for validating the root `AppComponent`.

#### 📂 `pages/`
Contains the top-level routable views. Each subdirectory represents an entire page of the application, isolating its own TypeScript logic, HTML layout, and scoped CSS styles.
* **`home/`**: The landing page of the application.
* **`about/`**: Informational page about ThriftHub's mission and team.
* **`contact/`**: Page allowing users to reach out to support.
* **`catalog/`**: The main shop page displaying the full listing of available thrift products.
* **`product-detail/`**: A dynamic page showing specific details for a single product entry.
* **`cart/`**: Shopping cart screen where users manage their selected items.
* **`checkout/`**: The checkout flow for finalizing an order.
* **`login/`**: User authentication sign-in screen.
* **`register/`**: Sign-up screen for new users.
* **`profile/`**: Dashboard view to manage user account details.
* **`order-history/`**: Log of past transactions made by the authenticated user.
* **`order-confirmation/`**: Success screen displayed after a checkout is completed.

#### 📂 `services/`
Contains global singleton classes responsible for sharing data and making external requests.
* **`auth.service.ts`**: Manages user authentication flow, HTTP requests to the Netlify endpoints (`/api/login`, `/api/register`), session persistence in browser storage, and exposing user state via RxJS Observables.

#### 📂 `shared/`
Contains reusable UI components utilized across multiple different pages to maintain consistency and reduce code repetition.
* **`navbar/`**: The top navigation bar, featuring responsive mobile menus, user session dropdowns, and search functionality.
* **`footer/`**: The global page footer containing branding, copyright, and secondary links.
* **`product-card/`**: A standard card component to display an item's thumbnail, price, title, and "Add to Cart" functionality (used in catalog, home page, etc.).

---

## 📁 Root Configuration Files (Besides Angular)
* **`package.json` & `package-lock.json`**: Defines Node.js dependencies (like Angular, TailwindCSS, etc.) and npm scripts.
* **`angular.json`**: Workspace configuration file defining project architecture, build options, asset inclusion, and environments.
* **`tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`**: TypeScript compiler configuration files ensuring strong typing and optimal transpilation tailored for standard app code and unit tests.
* **`.gitignore`**: Defines files and folders ignored by Git tracking (e.g., node_modules).
* **`.editorconfig` & `.prettierrc`**: Configuration rules assuring code formatting consistency across different IDEs and contributors.
