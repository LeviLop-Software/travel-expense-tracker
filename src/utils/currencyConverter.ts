import { GoogleGenerativeAI } from '@google/generative-ai';
import { Currency } from '../types';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

// Cache for exchange rates (valid for 1 hour)
const exchangeRateCache = new Map<string, ExchangeRate>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const getCacheKey = (from: Currency, to: Currency): string => `${from}-${to}`;

const isCacheValid = (exchangeRate: ExchangeRate): boolean => {
  const now = new Date().getTime();
  const cacheTime = exchangeRate.timestamp.getTime();
  return (now - cacheTime) < CACHE_DURATION;
};

// Fallback function using a free exchange rate API
const getFallbackExchangeRate = async (from: Currency, to: Currency): Promise<number> => {
  try {
    console.log('🌐 Using fallback exchange rate API...');
    // Using exchangerate-api.com (free tier allows 1500 requests/month)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.rates && data.rates[to]) {
      const rate = data.rates[to];
      console.log('✅ Fallback API Exchange rate:', `1 ${from} = ${rate} ${to}`);
      return rate;
    } else {
      throw new Error(`No rate found for ${from} to ${to}`);
    }
  } catch (error) {
    console.error('❌ Fallback API failed:', error);
    throw new Error(`שגיאה בAPI חלופי: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
  }
};

export const getCurrentExchangeRate = async (from: Currency, to: Currency): Promise<number> => {
  // If same currency, return 1
  if (from === to) return 1;

  // Check cache first
  const cacheKey = getCacheKey(from, to);
  const cachedRate = exchangeRateCache.get(cacheKey);
  
  if (cachedRate && isCacheValid(cachedRate)) {
    console.log('💰 Using cached exchange rate:', cachedRate.rate);
    return cachedRate.rate;
  }

  // Try to get rate from AI
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('מפתח ה-API של Gemini לא מוגדר');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.1,
      }
    });

    const prompt = `${from} to ${to} rate:`;

    console.log('🤖 Getting current exchange rate from AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      console.warn('⚠️ AI returned empty response, trying again...');
      throw new Error('AI לא החזיר תשובה');
    }
    
    const rateText = text.trim();
    const rate = parseFloat(rateText);
    
    if (!isNaN(rate) && rate > 0) {
      // Cache the result
      const exchangeRate: ExchangeRate = {
        from,
        to,
        rate,
        timestamp: new Date()
      };
      
      exchangeRateCache.set(cacheKey, exchangeRate);
      console.log('✅ AI Exchange rate:', `1 ${from} = ${rate} ${to}`);
      return rate;
    } else {
      console.warn('⚠️ Invalid rate from AI, trying fallback API...');
      // Try using a free exchange rate API as fallback
      return await getFallbackExchangeRate(from, to);
    }
    
  } catch (error) {
    console.error('❌ AI Exchange rate failed:', error);
    console.log('🔄 Trying fallback API...');
    try {
      return await getFallbackExchangeRate(from, to);
    } catch (fallbackError) {
      console.error('❌ Fallback API also failed:', fallbackError);
      throw new Error(`שגיאה בהמרת מטבע מ-${from} ל-${to}: לא ניתן לקבל שער המרה נוכחי`);
    }
  }
};

export const convertCurrency = async (amount: number, from: Currency, to: Currency): Promise<number> => {
  const rate = await getCurrentExchangeRate(from, to);
  return amount * rate;
};

// Enhanced conversion with rate display
export const convertCurrencyWithRate = async (amount: number, from: Currency, to: Currency): Promise<{convertedAmount: number, rate: number, displayText: string}> => {
  const rate = await getCurrentExchangeRate(from, to);
  const convertedAmount = amount * rate;
  const displayText = `${convertedAmount.toFixed(2)} (שער: 1 ${from} = ${rate.toFixed(4)} ${to})`;
  
  return {
    convertedAmount,
    rate,
    displayText
  };
};

// Get multiple rates at once for display
export const getExchangeRatesForDisplay = async (baseCurrency: Currency): Promise<Record<Currency, number>> => {
  const currencies: Currency[] = ['EUR', 'USD', 'ILS'];
  const rates: Record<Currency, number> = {} as Record<Currency, number>;
  
  for (const currency of currencies) {
    if (currency !== baseCurrency) {
      rates[currency] = await getCurrentExchangeRate(baseCurrency, currency);
    } else {
      rates[currency] = 1;
    }
  }
  
  return rates;
};