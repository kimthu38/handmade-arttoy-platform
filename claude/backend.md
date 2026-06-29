# CLAUDE CONTEXT: NESTJS BACKEND ARCHITECTURE & GUIDELINES

## 1. Core Tech Stack
- Framework: NestJS (TypeScript)
- Database: PostgreSQL (Hosted on Supabase)
- ORM: Prisma
- Authentication: JWT with Passport Strategy
- Validation: class-validator & class-transformer

## 2. API Response Standardization (Crucial Rule)
Every controller must pipe its response through a global interceptor. The final output JSON must strictly adhere to this format:
- Success: `{ "success": true, "data": AnyData, "error": null }`
- Error: `{ "success": false, "data": null, "error": "Error message here" }`

## 3. Layered Architecture Rules
When writing code for any module, strictly separate concerns into 3 layers:
1. **Controller Layer (`*.controller.ts`):** 
   - Handle routing, HTTP methods, and status codes.
   - Apply Guards for authentication (`@UseGuards(JwtAuthGuard, RolesGuard)`).
   - Use DTOs (`class-validator`) to validate incoming Request Bodies. Never pass raw Request bodies to Services.
2. **Service Layer (`*.service.ts`):**
   - Contain 100% of the business logic (e.g., calculating commission, splitting multi-vendor orders).
   - Inject `PrismaService` to talk to the database.
3. **Data Access Layer (`schema.prisma`):**
   - Define database models with strict relational integrity.

## 4. Multi-Vendor Security Rule (Tenant Isolation)
- For any endpoint under Vendor access control (e.g., update product, view orders), NEVER trust the `shop_id` passed from the frontend request body or query params.
- Always extract the `user.id` from the JWT Token (via `@CurrentUser()`), query the corresponding `shop_id` from the `shops` table, and append it to the database `WHERE` clause. (Prevent Shop A from modifying Shop B's data).

## 5. Coding Instructions for Claude
When I ask you to implement a backend feature:
1. Show the Prisma model updates (if any).
2. Create the Data Transfer Objects (DTOs) with validation annotations.
3. Write the Service business logic first.
4. Write the Controller and expose the API endpoints.
5. Always use TypeScript strong typing; avoid using `any`.



Module-based Architecture

backend/
├── src/
│   ├── common/                 <-- Global shared codebase across the entire system
│   │   ├── decorators/         <-- e.g., @CurrentUser, @Roles
│   │   ├── guards/             <-- AuthGuard, RolesGuard (JWT Authentication & Authorization)
│   │   ├── interceptors/       <-- TransformInterceptor (Standardizes API output to {success, data, error})
│   │   └── filters/            <-- HttpExceptionFilter (Global exception handling and error formatting)
│   ├── modules/                <-- Feature-driven modules (Core business epics)
│   │   ├── auth/               <-- Authentication, Registration, and JWT management
│   │   ├── users/              <-- User account management
│   │   ├── shops/              <-- Artisan / Vendor storefront management
│   │   ├── products/           <-- Handmade goods & Art Toy catalog management
│   │   └── orders/             <-- Order pipeline & Multi-vendor split-order logic
│   ├── prisma/                 <-- Database schema definitions and ORM Client configuration
│   │   ├── schema.prisma
│   │   └── prisma.service.ts
│   ├── app.module.ts           <-- Root module of the application
│   └── main.ts                 <-- Application entry point (Configures CORS, Global ValidationPipes, etc.)
├── test/                       <-- Unit and End-to-End (E2E) testing suites
├── README.md
└── package.json