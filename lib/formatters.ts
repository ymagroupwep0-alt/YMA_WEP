export const egyptCurrency = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export const egyptNumber = new Intl.NumberFormat('en-EG');

export const formatMoney = (value: number) => egyptCurrency.format(value);
export const formatNumber = (value: number) => egyptNumber.format(value);

export const formatEgyptianPhone = (value: string) => value.replace(/^\+966/, '+20');
