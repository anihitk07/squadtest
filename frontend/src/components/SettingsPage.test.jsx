import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('defaults to light theme when no preference exists', () => {
  render(<SettingsPage />);

  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(localStorage.getItem('theme')).toBe('light');
});

test('uses saved theme preference and toggles with persistence', () => {
  localStorage.setItem('theme', 'dark');
  render(<SettingsPage />);

  const toggle = screen.getByRole('button', { name: 'Switch to light mode' });
  expect(toggle).toBeTruthy();
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem('theme')).toBe('dark');

  fireEvent.click(toggle);
  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(localStorage.getItem('theme')).toBe('light');
});
