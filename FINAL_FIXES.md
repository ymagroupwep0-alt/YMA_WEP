# YMA WEP – Final Integration Fixes

This version contains the requested integration and stabilization fixes:

- Finance create/edit now converts blank relation IDs to null instead of causing PostgreSQL foreign-key errors.
- Finance form stays open when the API rejects a save and displays the returned error.
- Profits reads the central Finance ledger; dates are handled correctly by calendar day.
- Supply deletion removes its automatically generated income, payment, and cost finance entries and reverses applied inventory.
- Manufacturing, supplies, warehouse purchase movements, and payroll synchronize their related financial entries.
- Payroll creation/edit/delete is restricted server-side to Admin users. Payroll automatically creates/updates/deletes a salary expense entry in Finance.
- Payroll page now supports Admin editing as well as creation and deletion.
- Warehouse product and movement API responses are normalized for the UI, preventing the supplier-name crash on the Warehouse page.
- Report deletion removes attachments/activity events before deleting the report.
- Empty role permission sets are respected instead of silently reverting to default permissions.
- Company page uses real employee/project counts and creates the company record when missing.
- User/product image uploads use the upload API rather than storing browser-only `blob:` URLs.
- All HTML table headers and cells are centered vertically and horizontally globally.
- Dashboard KPI cards are back to four cards and use Finance data without double-counting client payments.

## Database

No new Prisma schema migration is required for these code-only fixes. Run the existing migrations, then seed the initial Admin and company record if setting up a fresh database:

`npm run prisma:migrate:deploy`

`npm run prisma:seed`

## Verification

The modified TypeScript/TSX files were syntax-transpiled successfully with the TypeScript compiler available in the verification environment. A full Next.js production build could not be executed in this environment because the uploaded project does not contain a complete installable `node_modules` tree and dependency installation timed out.
