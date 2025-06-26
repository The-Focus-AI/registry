# Stripe Integration

Complete Stripe payment integration with Supabase authentication, subscription management, and admin dashboard.

## Features

- **Payment Processing**: Full Stripe checkout and subscription management
- **User Authentication**: Supabase-based auth with protected routes
- **Admin Dashboard**: Stripe product/subscription sync and management
- **Webhooks**: Automated subscription status updates
- **Database Schema**: Complete migrations for user and subscription data
- **Pricing Tables**: Dynamic pricing display components

## Files Included

- **API Routes**: Checkout and webhook handling
- **Dashboard Pages**: User and admin interfaces
- **Components**: Pricing tables and sync buttons
- **Libraries**: Stripe client/server utilities, activity tracking
- **Database**: Supabase migrations and middleware
- **Scripts**: Stripe product synchronization

## Installation

Inside of a nextjs app (created like)

```bash
npx create-next-app@latest --use-pnpm your-app-name
cd your-app-name
```

run

```bash
npx shadcn@latest add https://registry.thefocus.ai/r/stripe-integration.json
```

## Dependencies

The component will automatically install:
- `@stripe/stripe-js`
- `stripe`
- `@supabase/ssr`
- `@supabase/supabase-js`

```bash
# Supabase UI blocks
npx shadcn@latest add https://supabase.com/ui/r/ai-editor-rules.json
npx shadcn@latest add https://supabase.com/ui/r/password-based-auth-nextjs.json

# CLI tools and configuration
npx shadcn@latest add https://registry.thefocus.ai/r/cli-component.json
```

## Configuration

### 1. Supabase Setup

```bash
supabase init
```

### 2. Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Configuration

1. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

2. **Get API Keys**: Visit [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

3. **Setup Webhook Forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

4. **Copy webhook secret** to `STRIPE_WEBHOOK_SECRET` in your `.env.local`

### 4. Supabase Auth Configuration

In your Supabase dashboard:

- [ ] Configure signup email templates: [Auth Templates](https://supabase.com/dashboard/project/_/auth/templates)
- [ ] Setup reset email template: [Auth Templates](https://supabase.com/dashboard/project/_/auth/templates)
- [ ] Set site URL: [URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)

## Usage

### 1. Run Database Migrations

```bash
supabase db reset --local --no-seed
```

or

```bash
mise run  db-seed
```

### 2. Sync Stripe Products

```bash
dotenvx run -- tsx scripts/sync_stripe_products.ts
# or
mise run sync-products
#
```

### 3. Start Development Server

```bash
pnpm dev
```

## API Endpoints

- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhooks` - Handle Stripe webhooks

## Pages

- `/` - Landing page with pricing
- `/pricing` - Pricing table
- `/dashboard` - User dashboard (protected)
- `/dashboard/admin` - Admin panel (protected)
- `/landing` - Marketing landing page

## Components

- `PricingTable` - Dynamic pricing display
- `SyncStripeButton` - Admin sync functionality

## Development

Reference: [Supabase Password Auth Guide](https://supabase.com/ui/docs/nextjs/password-based-auth)

