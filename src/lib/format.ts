const currencyVnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const numberVi = new Intl.NumberFormat('vi-VN');

const dateFull = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateShort = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateShortWithTime = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
});

const formatVnd = (amount: number): string => currencyVnd.format(amount);
const formatNumber = (n: number): string => numberVi.format(n);
const formatDateFull = (iso: string | Date): string =>
  dateFull.format(typeof iso === 'string' ? new Date(iso) : iso);
const formatDateShort = (iso: string | Date): string =>
  dateShort.format(typeof iso === 'string' ? new Date(iso) : iso);
const formatDateShortWithTime = (iso: string | Date): string =>
  dateShortWithTime.format(typeof iso === 'string' ? new Date(iso) : iso);

export {
  formatDateFull,
  formatDateShort,
  formatDateShortWithTime,
  formatNumber,
  formatVnd,
};
