# PROJECT PROFILE: HANDMADE & ART TOY MARKETPLACE

## 1. System Architecture
This project is a niche e-commerce marketplace for handmade products and art toys. It is divided into 3 subsystems running on separate deployment environments but managed under a single Monorepo workspace:
- `/backend`: Built with Node.js (TypeScript). It connects to the database and serves a pure RESTful API with zero UI components.
- `/frontend-buyer`: Built with Next.js (App Router). Dedicated to buyers; must be optimized for SEO and Server-Side Rendering (SSR). It fetches data from `/backend`.
- `/frontend-analytics`: Built with React (Vite). A unified dashboard for both Vendors (Artists) and Super Admins. Access control is enforced via JWT claims (`role: 'vendor' | 'admin'`).

## 2. Tech Stack & Best Practices Rules
- **Backend:** Adhere strictly to the Controller-Service-Repository pattern. Every API response must be wrapped in a standardized envelope: `{ success: boolean, data: any, error: string | null }`.
- **Frontend:** Use Axios for API calls. All API endpoints must be centrally defined inside `constants/api.ts`. Use TailwindCSS for styling.
- **Strict Separation:** Never inject or mix database queries or raw backend business logic into the frontend repositories.

## 3. Core Database Schema Rules
- The system recognizes 3 distinct user roles: `buyer`, `vendor`, and `admin`.
- The `Product` entity must include these specific domain fields: `is_preorder (boolean)`, `estimated_days (int)`, and `allow_custom (boolean)`.

## 4. AI Workflow Instructions (For Claude)
When I request a new feature, you must execute the task in the following strict order:
1. **Design the API Endpoints** for `/backend` first (Specify HTTP Method, URL, Request Body Schema, and Response Schema).
2. **Write the complete Backend code** (Implement request validation, core business logic, and database operations).
3. **Write the corresponding Frontend code** for either `/frontend-buyer` or `/frontend-analytics`, ensuring it maps correctly to the newly created endpoints.



## FEATURE LIST BY SUBSYSTEM

### Subsystem 1: Buyer Interface (Buyer App/Web)
The storefront of the marketplace where customers browse, discover, and purchase products.

#### 1. Authentication & Identity Module [MVP]
- **Sign-up / Sign-in:** Standard authentication (Prioritize social logins like Google/Facebook for a seamless onboarding experience).
- **Profile Management:** Manage personal information and an address book supporting multiple shipping addresses.

#### 2. Catalog & Search Module [MVP]
- **Homepage:** Display dynamic promotional banners, product categories (Handmade, Art Toy), new arrivals, and trending products.
- **Filters & Search:** Filter by price, category, materials (wood, ceramic, resin, plastic, etc.), and product status (In-Stock vs. Pre-order).
- **Product Detail Page (PDP):** Display image/video galleries, rich product descriptions, pricing, inventory stock levels, "Buy Now", and "Add to Cart" buttons.

#### 3. Customization & Pre-Order Module [MVP - Domain Specific]
- **Custom Note:** An input field that allows buyers to submit custom requests (e.g., Engraving text: "Spring 2026", custom paint color) directly when adding an item to the cart.
- **Pre-order Timer/Badge:** Display the estimated production/waiting period for unmade handmade goods or art toys (e.g., "Estimated shipping in 7 days").

#### 4. Cart & Checkout Module [MVP]
- **Multi-vendor Cart:** If a buyer adds items from Shop A and Shop B into the same cart, the system must automatically split them into two sub-orders to calculate separate shipping fees based on each shop's warehouse location.
- **Payment Integration:** Support Cash on Delivery (COD) and at least one online payment gateway (VNPAY or MoMo for initial release).

#### 5. Art Toy Gamification & Auction Module [Advanced - Future Scope]
- **Blind Box:** Random purchase mechanic. When a buyer purchases a box, the system runs a randomized algorithm to select and assign one of the figures from that specific series.
- **Auction:** Real-time countdown auction system for one-of-a-kind (1 of 1) masterpieces. Automatically updates the highest bidder in real-time.

---

### Subsystem 2: Vendor Dashboard (Artist/Studio Portal)
The backend interface where artisans and art toy studios manage their digital storefronts.

#### 1. Onboarding & Storytelling Module [MVP]
- **Vendor Registration Form:** Input business/personal details and upload portfolios or process videos proving their work is genuine (for admin curation).
- **Artist Profile:** Storefront management page allowing creators to write their "Brand Story" and pin studio process videos to build brand equity.

#### 2. Product Management Module [MVP]
- **CRUD Operations:** Create, Read, Update, and Delete product listings.
- **Advanced Attributes Configuration:** Enable/Disable customization fields and define the estimated production fulfillment days (for Pre-order items).

#### 3. Order & Logistics Module [MVP]
- **Order Pipeline:** View and process orders through explicit statuses (Awaiting Confirmation, Ready to Ship, Shipping, Delivered, Cancelled).
- **Custom Request Flag:** Clearly label and highlight custom notes so vendors know exactly how to tailor the product to the buyer's specifications.
- **Logistics API Integration:** Integrate third-party shipping carriers (e.g., GHTK or GHN). Clicking "Ship Order" automatically triggers a booking request, generates a shipping label, and fetches a tracking number.

#### 4. Finance & Wallet Module [MVP]
- **Analytics:** Basic revenue statistics filtered by day, month, and year.
- **Seller Wallet:** Funds from completed purchases are held here (escrow/temporarily locked until delivery confirmation). Vendors can initiate a "Withdrawal Request" to their linked bank accounts.

---

### Subsystem 3: Super Admin Portal (Platform Management)
The master control panel used by the platform owner to moderate, oversee, and orchestrate the marketplace.

#### 1. Moderation Module [MVP]
- **Vendor Curation:** Review and approve/reject new vendor applications (Verifying authentic handmade creators/studios vs. mass-manufactured factory goods).
- **Product Curation:** Moderation queue to take down policy-violating, counterfeit, or bootleg listings.

#### 2. Financial & Commission Configuration Module [MVP]
- **Commission Rates:** Configure the flat platform commission percentage deducted per successful transaction (e.g., setting a global 5% take-rate).
- **Payout Approvals:** Review, approve, and log financial withdrawal requests coming from the Seller Wallets.

#### 3. Dispute Resolution Module [MVP]
- **Escrow Arbitration:** A dedicated interface for Admins to act as arbitrators when a buyer submits a "Refund/Return Claim" (e.g., Buyer claims an Art Toy arrived broken, Vendor claims it was damaged by the courier).