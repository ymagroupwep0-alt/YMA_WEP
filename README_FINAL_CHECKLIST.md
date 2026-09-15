# YMA WEP — Final deployment/test checklist

## What was fixed

- Supplier details now load from PostgreSQL through `/api/data/suppliers/:id`; mock supplier details were removed.
- Supplier/client list data is normalized from the Prisma API response so the UI no longer assumes mock-only fields exist.
- User deletion in Settings now calls the real DELETE API directly and refreshes from the database.
- A system admin cannot delete another admin. An admin can delete only their own admin account; the last active admin cannot be deleted.
- Permission loading no longer blocks the whole dashboard for Manager/Employee/Viewer users. The provider only loads the user directory when the current user has `settings.view` (or is admin).
- If the role-permission table is completely empty, the system falls back to the four built-in roles and their default permissions instead of giving non-admin users zero access.
- Role permission editing in Settings uses the persisted role permissions when displaying the checkboxes/counts.
- User API validation was strengthened for required user fields, email, role, and account status.
- Common Prisma duplicate/foreign-key errors return useful HTTP errors instead of a generic 500.
- Real `.env` and generated/build artifacts are excluded from the delivery package. Only `.env.example` is included.

## Local setup

1. Extract this ZIP. `package.json` is at the root of the extracted folder.
2. Copy `.env.example` to `.env`.
3. Put your real PostgreSQL `DATABASE_URL` and a long random `AUTH_SECRET` in `.env`.
4. Set `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and `INITIAL_ADMIN_NAME`.
5. Run:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run build
npm start
```

For local development use `npm run dev` instead of `npm start`.

## Important production security

Never upload a real `.env` file or commit it to Git. If credentials from an older project archive were real, rotate the database password, admin password, and `AUTH_SECRET` before deployment.

## Acceptance test

### Authentication
- Login with the initial admin.
- Create one user for each role: Admin, Manager, Employee, Viewer.
- Log out and log in with each account separately.
- Confirm each account sees only its permitted sections and operations.

### Permissions
- In Settings, change Manager permissions and save.
- Log in as Manager again and confirm the change is enforced both in the UI and API.
- Test a denied operation by calling the UI button and confirm the operation is blocked.
- Test a permitted create/edit/delete operation and confirm it persists after refresh.
- Test per-user allow/deny overrides and confirm they override the role.

### User management
- Create a second admin.
- From the first admin, confirm the second admin cannot be deleted.
- Log in as the second admin and delete that account from its own account/user-management view.
- Confirm the last remaining active admin cannot delete itself.
- Confirm deleting a normal user removes it from the database and it does not return after refresh.

### Data integrity
- Add/edit/delete a supplier and open its details page. Confirm details come from the database and survive refresh.
- Add/edit/delete a client and open its details page.
- Add/edit/delete a project.
- Add a product and stock movement; verify quantities persist.
- Add/update/delete a supply and verify inventory changes are consistent.
- Add finance transactions and verify finance totals refresh from the API.
- Add/edit/delete a report and attachment metadata.
- Add/edit/delete a manufacturing operation.
- Check activity log entries after mutations.

### Deployment smoke test
- Run `npm run build` with production environment variables.
- Run `npm start`.
- Test login, dashboard, Settings, one CRUD operation per module, permissions, logout, and a hard browser refresh.


## Environment setup before Prisma
1. Copy `.env.example` to `.env`.
2. Set a real PostgreSQL `DATABASE_URL`.
3. Set a long random `AUTH_SECRET`.
4. Set `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and `INITIAL_ADMIN_NAME`.
5. Run `npx prisma generate`.
6. Run `npx prisma migrate deploy`.
7. Run `npm run prisma:seed`.
8. Run `npm run build`.

The seed script now loads `.env` when run directly with `tsx`, so `npm run prisma:seed` works after the environment variables are configured.

### Important
- Never commit or upload `.env`.
- Next.js has been upgraded to 16.3.5 with the required async cookies and route-params compatibility changes. Node.js 20.9 or newer is required by this release.

## ERP Integration Update
- Delivered/completed supplies now automatically create/update a linked income transaction and a linked materials-cost expense transaction in Finance.
- Changing a supply back to draft/pending/processing/cancelled removes the automatically generated supply finance entries.
- Deleting an inventory-applied supply reverses stock and removes its automatic finance entries in the same database transaction.
- Manufacturing operations now automatically create/update a linked manufacturing-cost finance transaction and remove it when the operation is cancelled/deleted.
- Automatic finance entries use deterministic IDs/numbers to prevent duplicate entries on refresh/retry.
- Standalone warehouse movements create linked finance entries: stock in creates a materials expense, stock out creates sales revenue plus cost of goods sold, and returns reverse those entries. Supply- and manufacturing-owned movements are excluded from this automatic sync to prevent duplicate accounting.
- Employee creation does not create a salary expense because salary is periodic and requires a payroll period/payment event.
- Project budgets create linked completed project-cost expense entries in Finance and are included in project financial summaries.


## Full ERP Integration (v5+)
- Supplies track `paidAmount`; delivered/completed supplies create revenue, cost, and collected client-payment entries without double-counting client payments as profit revenue.
- Payroll records are linked to employees and automatically create salary expenses in Finance; duplicate payroll for the same employee and period is blocked.
- Manufacturing material usage is transactional: used quantities are deducted from Warehouse, linked Stock Movements are created, material cost is calculated from product purchase cost, and total manufacturing cost is reflected in Finance. Decreasing/deleting a manufacturing operation reverses material stock.
- Warehouse purchase receipts can be recorded as stock `in` with reason containing `شراء` and create a supplier-linked materials expense automatically.
- Project API responses expose revenue, expenses, and profit derived from linked financial transactions.
- Client payments are treated as cash collection, not additional profit revenue.
