import { detectCategoryWithAI } from '../utils/aiHelpers';

// Mock הפונקציה לבדיקות
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => 
        Promise.resolve({
          response: {
            text: () => JSON.stringify({
              category: 'food',
              confidence: 0.9,
              reasoning: 'זוהה כאוכל על בסיס התיאור'
            })
          }
        })
      )
    }))
  }))
}));

describe('AI Helpers', () => {
  beforeEach(() => {
    // ניקוי environment variables לבדיקות
    delete process.env.REACT_APP_GEMINI_API_KEY;
  });

  test('should return default category when no API key', async () => {
    const result = await detectCategoryWithAI('ארוחת בוקר');
    
    expect(result).toBeDefined();
    expect(result!.category).toBeDefined();
    expect(result!.confidence).toBeDefined();
    expect(typeof result!.confidence).toBe('number');
  });

  test('should detect food category correctly', async () => {
    // סימולציה של API key
    process.env.REACT_APP_GEMINI_API_KEY = 'test-key';
    
    const result = await detectCategoryWithAI('ארוחת בוקר במסעדה');
    
    expect(result).toBeDefined();
    expect(result!.category).toBe('food');
    expect(result!.confidence).toBeGreaterThan(0);
  });

  test('should handle AI errors gracefully', async () => {
    // Mock שגיאה
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn(() => {
        throw new Error('API Error');
      })
    }));

    process.env.REACT_APP_GEMINI_API_KEY = 'test-key';
    
    const result = await detectCategoryWithAI('טיסה לטוקיו');
    
    // אמור לחזור לזיהוי מקומי
    expect(result).toBeDefined();
    expect(result!.category).toBeDefined();
  });
});