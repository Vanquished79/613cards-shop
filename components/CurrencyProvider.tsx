'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'AUD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInCAD: number) => string;
  rates: Record<string, number>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('CAD');
  const [rates, setRates] = useState<Record<string, number>>({ CAD: 1, USD: 0.73, EUR: 0.68, GBP: 0.58, AUD: 1.13 }); // Fallback rates
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved currency from localStorage if available
    const saved = localStorage.getItem('preferredCurrency') as Currency;
    if (saved && Object.keys(CURRENCY_SYMBOLS).includes(saved)) {
      setCurrencyState(saved);
    }

    // Fetch latest rates
    fetch('https://api.exchangerate-api.com/v4/latest/CAD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch(err => {
        console.error("Failed to fetch exchange rates", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const formatPrice = (amountInCAD: number) => {
    const rate = rates[currency] || 1;
    const converted = amountInCAD * rate;
    return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
