import type { Bank, VietQrBank, VietQrBanksResponse } from '@/types/bank';

const VIETQR_BANKS_URL = 'https://api.vietqr.io/v2/banks';

const normalizeBank = ({
  id,
  name,
  code,
  bin,
  shortName,
  logo,
  transferSupported,
  lookupSupported,
}: VietQrBank): Bank => ({
  id,
  code,
  shortName,
  fullName: name,
  logo,
  bin,
  transferSupported: transferSupported === 1,
  lookupSupported: lookupSupported === 1,
});

const getBanks = async (): Promise<Bank[]> => {
  const response = await fetch(VIETQR_BANKS_URL);
  if (!response.ok) throw new Error('err fetching banks');

  const payload = (await response.json()) as VietQrBanksResponse;
  if (payload.code !== '00' || !Array.isArray(payload.data)) {
    throw new Error(payload.desc || 'err fetching banks');
  }

  return payload.data.map(normalizeBank);
};

const findBank = (banks: Bank[], value: string): Bank | undefined => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  return banks.find(
    ({ bin, code }) =>
      bin.toLowerCase() === normalized || code.toLowerCase() === normalized,
  );
};

export { findBank, getBanks };
