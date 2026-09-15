ALTER TABLE "supplies" ADD COLUMN "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "manufacturing_operations" ADD COLUMN "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "finance_transactions" ADD COLUMN "payroll_id" TEXT;
CREATE UNIQUE INDEX "finance_transactions_payroll_id_key" ON "finance_transactions"("payroll_id");
CREATE INDEX "finance_transactions_payroll_id_idx" ON "finance_transactions"("payroll_id");
CREATE TABLE "payroll_records" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "basic_salary" DECIMAL(14,2) NOT NULL,
  "allowances" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "net_salary" DECIMAL(14,2) NOT NULL,
  "status" TEXT NOT NULL,
  "payment_method" TEXT,
  "paid_at" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payroll_records_number_key" ON "payroll_records"("number");
CREATE UNIQUE INDEX "payroll_records_employee_id_period_start_period_end_key" ON "payroll_records"("employee_id","period_start","period_end");
CREATE INDEX "payroll_records_employee_id_period_start_period_end_idx" ON "payroll_records"("employee_id","period_start","period_end");
CREATE INDEX "payroll_records_status_idx" ON "payroll_records"("status");
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payroll_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD COLUMN "supplier_id" TEXT;
ALTER TABLE "stock_movements" ADD COLUMN "unit_cost" DECIMAL(14,2);
CREATE INDEX "stock_movements_supplier_id_idx" ON "stock_movements"("supplier_id");
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
