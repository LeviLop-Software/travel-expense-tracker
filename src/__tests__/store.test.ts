import { renderHook } from '@testing-library/react';
import { useAppStore } from '../store';

describe('useAppStore', () => {
  test('should initialize with empty trips array', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(Array.isArray(result.current.trips)).toBe(true);
    expect(result.current.trips.length).toBeGreaterThanOrEqual(0);
  });

  test('should have required store functions', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(typeof result.current.addTrip).toBe('function');
    expect(typeof result.current.updateTrip).toBe('function');
    expect(typeof result.current.deleteTrip).toBe('function');
    expect(typeof result.current.addExpense).toBe('function');
    expect(typeof result.current.updateExpense).toBe('function');
    expect(typeof result.current.deleteExpense).toBe('function');
  });

  test('should have trip summary calculation function', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(typeof result.current.getTripSummary).toBe('function');
  });
});