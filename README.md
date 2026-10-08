# Malaysia Local Services V3

V3 includes:
- Separate Customer Website
- Separate Admin Website
- Service request workflow
- Admin dashboard
- Worker management
- Job assignment
- Request status workflow
- Photo-upload-ready request field
- Cloudflare D1 schema
- Worker/API starter structure
- WhatsApp CTA

## Projects
- `customer-app` - public customer website
- `admin-app` - separate admin website
- `worker-api` - Cloudflare Worker API starter
- `database/schema.sql` - D1 database schema

## Run customer
cd customer-app
npm install
npm run dev

## Run admin
cd admin-app
npm install
npm run dev

## API
cd worker-api
npm install
npx wrangler dev

## Important
V3 is a development-ready starter. The customer/admin apps currently use local demo data so the UI can be tested immediately. The API and D1 schema are provided for connecting production data.

Before production:
1. Create D1 database and apply `database/schema.sql`.
2. Connect customer form to Worker API.
3. Connect admin dashboard to Worker API.
4. Add Cloudflare R2 for actual image uploads.
5. Replace demo admin login with secure authentication.
6. Add real WhatsApp number.
7. Add Malaysia privacy/terms pages.
