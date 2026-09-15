import { getStockStatus, stockStatusLabels, StockStatus, WarehouseProduct } from '@/data/warehouse';

const classes: Record<StockStatus, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  low: 'border-amber-200 bg-amber-50 text-amber-700',
  minimum: 'border-orange-200 bg-orange-50 text-orange-700',
  out: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function StockStatusBadge({ product }: { product: Pick<WarehouseProduct, 'currentQuantity' | 'minimumQuantity'> }) {
  const status = getStockStatus(product);
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{stockStatusLabels[status]}</span>;
}
