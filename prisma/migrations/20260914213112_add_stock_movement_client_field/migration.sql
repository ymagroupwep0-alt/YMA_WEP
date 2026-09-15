-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "client_id" TEXT;

-- CreateIndex
CREATE INDEX "stock_movements_client_id_idx" ON "stock_movements"("client_id");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
