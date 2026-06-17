export type Bank = {
  id: number;
  code: string;
  shortName: string;
  fullName: string;
  logo: string;
  bin: string;
  transferSupported: boolean;
  lookupSupported: boolean;
};

export type VietQrBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
};

export type VietQrBanksResponse = {
  code: string;
  desc: string;
  data: VietQrBank[];
};
