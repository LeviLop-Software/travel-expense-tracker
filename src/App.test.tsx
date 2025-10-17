import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders travel expense tracker app', () => {
    render(<App />);
    const homeButton = screen.getByText(/דף הבית/i);
    expect(homeButton).toBeInTheDocument();
  });

  test('renders analytics button in navigation', () => {
    render(<App />);
    const analyticsButtons = screen.getAllByText(/אנליטיקה/i);
    expect(analyticsButtons.length).toBeGreaterThan(0);
  });

  test('renders app title in header', () => {
    render(<App />);
    const titles = screen.getAllByText(/מעקב הוצאות נסיעות/i);
    expect(titles.length).toBeGreaterThan(0);
  });
});
