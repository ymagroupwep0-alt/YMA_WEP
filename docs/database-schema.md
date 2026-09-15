# YMA_WEP Database Schema

This document describes the PostgreSQL and Prisma relational foundation implemented in Phase 3. The current application continues to use the existing files in `data/` and local React state until Phase 4.

## Design Rules

- Primary keys use stable string IDs so future repositories can migrate the current mock records without silently changing identifiers. New record generation can move to UUID strings without changing the schema contract.
- Dates are stored as timestamps or ISO dates, depending on the field.
- Monetary values use integer minor units or a PostgreSQL `numeric(14, 2)` column and always carry `currency = EGP`.
- Foreign keys are nullable only where the current domain allows an optional relationship.
- Current mock data is not migrated or replaced in Phase 3.
- `permissions` keeps the existing `${section}.${action}` IDs. `user_permission_overrides.effect` stores `allow` or `deny`; an absent row means inherit.
- Money uses Prisma `Decimal` backed by PostgreSQL `numeric(14, 2)` and defaults to `EGP` where applicable.
- Supplier company/contact details, user account phone/job, and company contact/logo fields are persisted on their owning records; temporary passwords and browser object URLs are never stored.

## Core Entities

### Users and Employees

- `users.id` (PK)
- `users.employee_id` (FK -> `employees.id`, nullable, unique)
- `users.role_id` (FK -> `roles.id`)
- `employees.id` (PK)
- `employees.code` (unique)

A user may be linked to one employee record. An employee can own projects, reports, manufacturing operations, stock movements, finance transactions, and activity entries.

### Roles and Permissions

- `roles.id` (PK)
- `permissions.id` (PK)
- `role_permissions.role_id` (FK -> `roles.id`)
- `role_permissions.permission_id` (FK -> `permissions.id`)

The current Mock Roles are `admin`, `manager`, `employee`, and `viewer`. The existing permission IDs can become rows in `permissions` without changing the UI contract.

### Clients and Projects

- `clients.id` (PK)
- `projects.id` (PK)
- `projects.client_id` (FK -> `clients.id`, nullable)
- `projects.manager_id` (FK -> `employees.id`, nullable)
- `project_members.project_id` (FK -> `projects.id`)
- `project_members.employee_id` (FK -> `employees.id`)

One client can have many projects. A project can have many employees through `project_members`. Supplies reference their project through `supplies.project_id`; the current project UI does not use a separate `project.supply_id` foreign key.

### Reports

- `reports.id` (PK)
- `reports.project_id` (FK -> `projects.id`, nullable)
- `reports.employee_id` (FK -> `employees.id`, nullable)
- `report_attachments.id` (PK)
- `report_attachments.report_id` (FK -> `reports.id`)

A report may belong to a project and may be authored or assigned to an employee. Attachments belong to a report.

### Warehouse

- `warehouse_products.id` (PK)
- `warehouse_products.code` (unique)
- `stock_movements.id` (PK)
- `stock_movements.product_id` (FK -> `warehouse_products.id`)
- `stock_movements.employee_id` (FK -> `employees.id`)

Each stock movement records `in`, `out`, `return`, or `adjustment`. Product quantity can later be derived from movements or maintained transactionally. The current product ID and code are designed to be shared with manufacturing materials.

### Manufacturing

- `manufacturing_operations.id` (PK)
- `manufacturing_operations.project_id` (FK -> `projects.id`)
- `manufacturing_operations.employee_id` (FK -> `employees.id`)
- `manufacturing_materials.id` (PK)
- `manufacturing_materials.manufacturing_operation_id` (FK -> `manufacturing_operations.id`)
- `manufacturing_materials.product_id` (FK -> `warehouse_products.id`, nullable)
- `manufacturing_materials.product_code` (denormalized lookup value, indexed)
- `manufacturing_stages.id` (PK)
- `manufacturing_stages.manufacturing_operation_id` (FK -> `manufacturing_operations.id`)

A manufacturing operation belongs to a project and employee. Its materials can reference warehouse products by `product_id`; `product_code` remains useful for imports, display, and audit history. A future stock issue transaction can create a `stock_movements` row linked to the manufacturing operation.

### Finance and Profits

- `finance_transactions.id` (PK)
- `finance_transactions.project_id` (FK -> `projects.id`, nullable)
- `finance_transactions.client_id` (FK -> `clients.id`, nullable)
- `finance_transactions.employee_id` (FK -> `employees.id`)
- `finance_transactions.manufacturing_operation_id` (FK -> `manufacturing_operations.id`, nullable)
- `finance_transactions.stock_movement_id` (FK -> `stock_movements.id`, nullable)
- `finance_transactions.currency` (default `EGP`)
- `profit_snapshots.id` (PK)

Finance transactions can represent project revenue, client payments, supplier payments, salaries, manufacturing costs, materials, and operations. Profit is a derived view: `net_profit = revenue - expenses`; `profit_margin = 0` when revenue is zero.

### Company and Settings

- `companies.id` (PK)
- `company_documents.id` (PK), `company_documents.company_id` (FK -> `companies.id`)
- `company_goals.id` (PK), `company_goals.company_id` (FK -> `companies.id`)
- `company_timeline_events.id` (PK), `company_timeline_events.company_id` (FK -> `companies.id`)
- `company_gallery_items.id` (PK), `company_gallery_items.company_id` (FK -> `companies.id`)
- `company_organizational_roles.id` (PK), `company_organizational_roles.company_id` (FK -> `companies.id`), optional `employee_id` (FK -> `employees.id`)

The organizational structure can later reference real employees while retaining manually defined names and departments where needed.

### Activity Logs and Notifications

- `activity_logs.id` (PK)
- `activity_logs.user_id` (FK -> `users.id`)
- `activity_logs.entity_id` (indexed polymorphic ID)
- `notifications.id` (PK)
- `notifications.user_id` (FK -> `users.id`)

`activity_logs` follows the existing `ActivityLogEntry` shape: user, action, module, entity type, entity ID, description, timestamp, and metadata. The user foreign key uses `Restrict`, so historical activity prevents unsafe user deletion; deactivation is the supported fallback. The current `createActivity()` and `logActivity()` functions are the intended future service boundary; no second activity system is required.

## Relationship Summary

```text
Users -> Employees
Users -> Roles -> Permissions
Employees -> Projects -> Clients
Projects -> Reports
WarehouseProducts -> StockMovements
Projects -> ManufacturingOperations -> ManufacturingMaterials -> WarehouseProducts
Projects/Clients/Employees/Manufacturing/Stock -> FinanceTransactions
Companies -> Documents/Goals/Timeline/Gallery/Organization
Users -> ActivityLogs and Notifications
```

## Migration Boundary

Repositories can implement the interfaces in `lib/repositories/index.ts` using Prisma. Pages keep their current view-model contracts and switch data providers behind the repository/service boundary in Phase 4. Phase 3 adds `prisma/schema.prisma`, `lib/prisma.ts`, and a foundational reference-data seed; it does not enable database authentication, APIs, or persistent page data.
