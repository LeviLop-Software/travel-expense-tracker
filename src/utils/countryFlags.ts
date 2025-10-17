// מפת דגלי מדינות
export const countryFlags: { [key: string]: string } = {
  'ישראל': '🇮🇱',
  'צרפת': '🇫🇷',
  'בריטניה': '🇬🇧',
  'גרמניה': '🇩🇪',
  'איטליה': '🇮🇹',
  'ספרד': '🇪🇸',
  'יוון': '🇬🇷',
  'מלטה': '🇲🇹',
  'קפריסין': '🇨🇾',
  'הולנד': '🇳🇱',
  'בלגיה': '🇧🇪',
  'שוויץ': '🇨🇭',
  'אוסטריה': '🇦🇹',
  'פורטוגל': '🇵🇹',
  'טורקיה': '🇹🇷',
  'מצרים': '🇪🇬',
  'ירדן': '🇯🇴',
  'ארה"ב': '🇺🇸',
  'קנדה': '🇨🇦',
  'יפן': '🇯🇵',
  'תאילנד': '🇹🇭',
  'הודו': '🇮🇳',
  'סין': '🇨🇳',
  'אוסטרליה': '🇦🇺',
  'דרום אפריקה': '🇿🇦',
  'ברזיל': '🇧🇷',
  'ארגנטינה': '🇦🇷',
  'צ\'ילה': '🇨🇱',
  'מקסיקו': '🇲🇽',
  'default': '🌍'
};

export const getCountryFlag = (country: string): string => {
  return countryFlags[country] || countryFlags.default;
};

// פונקציות נוספות שצריכות לקיים תאימות עם הקוד הקיים
export const parseDestinations = (destinations: string): string[] => {
  return destinations.split(',').map(d => d.trim()).filter(d => d.length > 0);
};

export const formatDestinations = (destinations: string[]): string => {
  return destinations.join(', ');
};