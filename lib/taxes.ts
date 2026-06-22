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

export const EUROPEAN_COUNTRIES = [
  { code: 'AL', name: 'Albania' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AT', name: 'Austria' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'XK', name: 'Kosovo' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SM', name: 'San Marino' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SK_EU', name: 'Slovakia' }, // Avoid SK conflict if doing global map
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'VA', name: 'Vatican City' }
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
