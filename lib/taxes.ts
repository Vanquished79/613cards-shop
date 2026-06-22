export interface TaxInfo {
  rate: number;
  amount: number;
  name: string;
}

export const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
];

export function calculateTaxes(countryCode: string, provinceCode: string, taxableAmount: number): TaxInfo {
  // We apply DDU (0% tax at checkout) for everything outside Canada
  if (countryCode !== 'CA') {
    return {
      rate: 0,
      amount: 0,
      name: 'Tax Exempt (DDU)'
    };
  }

  let rate = 0;
  let name = 'GST/HST';

  switch (provinceCode) {
    case 'ON':
      rate = 0.13; // 13% HST
      name = 'HST';
      break;
    case 'NB':
    case 'NL':
    case 'NS':
    case 'PE':
      rate = 0.15; // 15% HST
      name = 'HST';
      break;
    case 'QC':
      rate = 0.14975; // 5% GST + 9.975% QST
      name = 'GST + QST';
      break;
    case 'MB':
      rate = 0.12; // 5% GST + 7% PST
      name = 'GST + PST';
      break;
    case 'BC':
      rate = 0.12; // 5% GST + 7% PST
      name = 'GST + PST';
      break;
    case 'SK':
      rate = 0.11; // 5% GST + 6% PST
      name = 'GST + PST';
      break;
    case 'AB':
    case 'NT':
    case 'NU':
    case 'YT':
      rate = 0.05; // 5% GST only
      name = 'GST';
      break;
    default:
      rate = 0.05; // Default to GST if unknown
      name = 'GST';
  }

  return {
    rate,
    amount: taxableAmount * rate,
    name
  };
}
