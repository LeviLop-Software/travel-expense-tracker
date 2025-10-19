import { ExpenseCategory } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CountryInfo {
  country: string;
  flag: string;
}

const countries: { [key: string]: CountryInfo } = {
  // Israel
  'ישראל': { country: 'ישראל', flag: '🇮🇱' },
  'israel': { country: 'ישראל', flag: '🇮🇱' },
  'תל אביב': { country: 'ישראל', flag: '🇮🇱' },
  'tel aviv': { country: 'ישראל', flag: '🇮🇱' },
  'ירושלים': { country: 'ישראל', flag: '🇮🇱' },
  'jerusalem': { country: 'ישראל', flag: '🇮🇱' },
  'חיפה': { country: 'ישראל', flag: '��' },
  'haifa': { country: 'ישראל', flag: '🇮🇱' },
  'אילת': { country: 'ישראל', flag: '🇮🇱' },
  'eilat': { country: 'ישראל', flag: '🇮🇱' },

  // UK
  'בריטניה': { country: 'בריטניה', flag: '🇬🇧' },
  'uk': { country: 'בריטניה', flag: '��' },
  'united kingdom': { country: 'בריטניה', flag: '🇬🇧' },
  'לונדון': { country: 'בריטניה', flag: '🇬🇧' },
  'london': { country: 'בריטניה', flag: '🇬🇧' },
  'manchester': { country: 'בריטניה', flag: '🇬🇧' },
  'liverpool': { country: 'בריטניה', flag: '🇬🇧' },
  'edinburgh': { country: 'בריטניה', flag: '🇬🇧' },

  // France
  'צרפת': { country: 'צרפת', flag: '🇫🇷' },
  'france': { country: 'צרפת', flag: '🇫🇷' },
  'פריז': { country: 'צרפת', flag: '🇫🇷' },
  'paris': { country: 'צרפת', flag: '🇫🇷' },
  'lyon': { country: 'צרפת', flag: '🇫🇷' },
  'nice': { country: 'צרפת', flag: '🇫🇷' },
  'marseille': { country: 'צרפת', flag: '🇫🇷' },
  'cannes': { country: 'צרפת', flag: '🇫🇷' },

  // Germany
  'גרמניה': { country: 'גרמניה', flag: '🇩🇪' },
  'germany': { country: 'גרמניה', flag: '🇩🇪' },
  'ברלין': { country: 'גרמניה', flag: '🇩🇪' },
  'berlin': { country: 'גרמניה', flag: '🇩🇪' },
  'munich': { country: 'גרמניה', flag: '🇩🇪' },
  'hamburg': { country: 'גרמניה', flag: '🇩🇪' },
  'frankfurt': { country: 'גרמניה', flag: '🇩🇪' },

  // Italy
  'איטליה': { country: 'איטליה', flag: '🇮🇹' },
  'italy': { country: 'איטליה', flag: '🇮🇹' },
  'רומא': { country: 'איטליה', flag: '🇮🇹' },
  'rome': { country: 'איטליה', flag: '🇮🇹' },
  'milano': { country: 'איטליה', flag: '🇮🇹' },
  'venice': { country: 'איטליה', flag: '🇮🇹' },
  'florence': { country: 'איטליה', flag: '🇮🇹' },
  'naples': { country: 'איטליה', flag: '🇮🇹' },

  // Spain
  'ספרד': { country: 'ספרד', flag: '🇪🇸' },
  'spain': { country: 'ספרד', flag: '🇪🇸' },
  'מדריד': { country: 'ספרד', flag: '🇪🇸' },
  'madrid': { country: 'ספרד', flag: '🇪🇸' },
  'barcelona': { country: 'ספרד', flag: '�🇸' },
  'seville': { country: 'ספרד', flag: '🇪🇸' },
  'valencia': { country: 'ספרד', flag: '🇪🇸' },

  // Greece
  'יוון': { country: 'יוון', flag: '🇬🇷' },
  'greece': { country: 'יוון', flag: '🇬🇷' },
  'אתונה': { country: 'יוון', flag: '🇬🇷' },
  'athens': { country: 'יוון', flag: '🇬🇷' },
  'mykonos': { country: 'יוון', flag: '🇬🇷' },
  'santorini': { country: 'יוון', flag: '🇬🇷' },
  'crete': { country: 'יוון', flag: '🇬🇷' },

  // Malta
  'מלטה': { country: 'מלטה', flag: '🇲🇹' },
  'malta': { country: 'מלטה', flag: '🇲🇹' },
  'valletta': { country: 'מלטה', flag: '🇲🇹' },

  // USA
  'ארצות הברית': { country: 'ארצות הברית', flag: '🇺🇸' },
  'usa': { country: 'ארצות הברית', flag: '🇺🇸' },
  'america': { country: 'ארצות הברית', flag: '🇺🇸' },
  'ניו יורק': { country: 'ארצות הברית', flag: '🇺🇸' },
  'new york': { country: 'ארצות הברית', flag: '🇺🇸' },
  'los angeles': { country: 'ארצות הברית', flag: '🇺🇸' },
  'miami': { country: 'ארצות הברית', flag: '🇺🇸' },
  'las vegas': { country: 'ארצות הברית', flag: '🇺🇸' },
  'chicago': { country: 'ארצות הברית', flag: '🇺🇸' },

  // Thailand
  'תאילנד': { country: 'תאילנד', flag: '🇹🇭' },
  'thailand': { country: 'תאילנד', flag: '🇹🇭' },
  'bangkok': { country: 'תאילנד', flag: '🇹🇭' },
  'phuket': { country: 'תאילנד', flag: '🇹🇭' },
  'pattaya': { country: 'תאילנד', flag: '🇹🇭' },

  // Turkey
  'תורכיה': { country: 'תורכיה', flag: '🇹🇷' },
  'turkey': { country: 'תורכיה', flag: '🇹🇷' },
  'istanbul': { country: 'תורכיה', flag: '🇹🇷' },
  'antalya': { country: 'תורכיה', flag: '🇹🇷' },

  // Cyprus
  'קפריסין': { country: 'קפריסין', flag: '🇨🇾' },
  'cyprus': { country: 'קפריסין', flag: '🇨🇾' },
  'nicosia': { country: 'קפריסין', flag: '🇨🇾' },

  // Netherlands  
  'הולנד': { country: 'הולנד', flag: '🇳🇱' },
  'netherlands': { country: 'הולנד', flag: '🇳🇱' },
  'amsterdam': { country: 'הולנד', flag: '�🇱' },

  // Japan
  'יפן': { country: 'יפן', flag: '🇯🇵' },
  'japan': { country: 'יפן', flag: '🇯🇵' },
  'tokyo': { country: 'יפן', flag: '🇯🇵' },
  'osaka': { country: 'יפן', flag: '🇯🇵' },
};

export const detectCountryFromDestination = (destination: string): CountryInfo | null => {
  if (!destination) return null;
  
  // נקה את היעד מדגלים קיימים ומרווחים נוספים
  const cleanDest = destination
    .replace(/🇮🇱|🇺🇸|🇬🇧|🇫🇷|🇩🇪|🇮🇹|🇪🇸|🇬🇷|🇲🇹|🇹🇭|🇹🇷|🇨🇾|🇳🇱|🇯🇵/g, '') // הסר דגלים ידועים
    .toLowerCase()
    .trim();
  
  // בדיקה ישירה
  let result = countries[cleanDest];
  if (result) return result;
  
  // בדיקה חלקית - אם המחרוזת מכילה שם של מדינה/עיר
  for (const [key, countryInfo] of Object.entries(countries)) {
    if (cleanDest.includes(key) || key.includes(cleanDest)) {
      return countryInfo;
    }
  }
  
  return null;
};

export const detectCountryWithAI = async (destination: string): Promise<CountryInfo | null> => {
  // קודם ננסה זיהוי מקומי
  const localResult = detectCountryFromDestination(destination);
  if (localResult) {
    console.log('🏠 Local country detected:', localResult);
    return localResult;
  }

  console.log('🤖 AI Country Detection for:', destination);
  
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ No Gemini API key found');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.1,
      }
    });

    const prompt = `זהה מדינה מיעד: "${destination}". החזר JSON: {"country": "שם המדינה בעברית", "flag": "דגל"}. אם לא מכיר: {"country": null, "flag": null}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (parsed.country && parsed.flag) {
        console.log('✅ AI Country detected:', parsed);
        return { country: parsed.country, flag: parsed.flag };
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', text);
    }
    
  } catch (error) {
    console.error('❌ AI Country detection failed:', error);
  }
  
  console.log('❓ No country detected for:', destination);
  return null;
};

// מילות מפתח לקטגוריות
const categoryKeywords: { [key in ExpenseCategory]: string[] } = {
  flight: ['טיסה', 'flight', 'אל על', 'elal', 'wizz', 'ryanair', 'easyjet', 'טיסות', 'כרטיס טיסה', 'plane', 'airplane', 'טיסת'],
  accommodation: ['מלון', 'hotel', 'אירוח', 'לינה', 'נופש', 'resort', 'airbnb', 'booking', 'hostel', 'inn', 'suite', 'חדר'],
  food: ['אוכל', 'מסעדה', 'food', 'restaurant', 'ארוחה', 'ארוחת', 'ארוחות', 'קפה', 'coffee', 'bar', 'פיצה', 'pizza', 'שתייה', 'drink', 'מקדונלדס', 'burger', 'breakfast', 'lunch', 'dinner', 'ארוחת בקר', 'ארוחת צהרים', 'ארוחת ערב'],
  transport: ['תחבורה', 'transport', 'אוטובוס', 'bus', 'רכבת', 'train', 'מונית', 'taxi', 'uber', 'דלק', 'gas', 'חנייה', 'parking', 'רכב', 'car', 'השכרת רכב', 'rental', 'נסיעה'],
  insurance: ['ביטוח', 'insurance', 'ביטוח נסיעות', 'travel insurance', 'ביטוח רפואי', 'health insurance'],
  activity: ['בידור', 'activity', 'פעילות', 'כניסה', 'ticket', 'מוזיאון', 'museum', 'קולנוע', 'cinema', 'תיאטרון', 'theater', 'פארק', 'park', 'שעשועים', 'attraction', 'tour', 'טיול מאורגן', 'כרטיס כניסה', 'אטרקציה', 'קניות', 'shopping', 'חנות', 'store', 'מזכרת', 'souvenir'],
  misc: ['שונות', 'misc', 'אחר', 'other', 'עמלה', 'fee', 'טיפ', 'tip', 'חילופי כסף', 'עמלת המרה']
};

export const detectCategoryFromDescription = async (description: string): Promise<ExpenseCategory> => {
  if (!description) return 'misc';
  
  console.log('🤖 AI Category Detection for:', description);
  
  // קודם ננסה זיהוי מקומי
  const lowerDesc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        console.log('🏠 Local category detected:', category, 'by keyword:', keyword);
        return category as ExpenseCategory;
      }
    }
  }
  
  // אם לא נמצא - נשתמש ב-AI
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ No Gemini API key found');
      return 'misc';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.1,
      }
    });

    const prompt = `סווג הוצאה: "${description}". קטגוריות: flight, accommodation, food, transport, insurance, activity, misc. החזר רק שם הקטגוריה.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim().toLowerCase();
    
    // ודא שהקטגוריה חוקית
    const validCategories: ExpenseCategory[] = ['flight', 'accommodation', 'food', 'transport', 'insurance', 'activity', 'misc'];
    if (validCategories.includes(category as ExpenseCategory)) {
      console.log('✅ AI Category detected:', category);
      return category as ExpenseCategory;
    }
    
  } catch (error) {
    console.error('❌ AI Category detection failed:', error);
  }
  
  console.log('❓ No category detected, defaulting to misc');
  return 'misc';
};

// פונקציות נוספות לתאימות עם הקוד הקיים
export const suggestCategoryWithConfidence = (description: string) => {
  return { category: 'misc' as ExpenseCategory, confidence: 0.5 };
};

export const detectCategoryWithAI = async (description: string): Promise<{ category: ExpenseCategory; confidence: number } | null> => {
  const category = await detectCategoryFromDescription(description);
  return { category, confidence: 0.8 };
};
