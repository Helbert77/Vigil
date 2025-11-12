import React, { act } from 'react';
import { render, fireEvent } from '@testing-library/react';
import MobileBottomNav from '@/src/components/layout/MobileBottomNav';

describe('MobileBottomNav', () => {
  test('renderiza 6 itens e navega ao clicar', () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = render(
      <MobileBottomNav currentPage={'Home'} onNavigate={onNavigate} unreadNotificationsCount={3} unreadMessagesCount={2} />
    );
    fireEvent.click(getByLabelText('Home'));
    fireEvent.click(getByLabelText('Notifications'));
    fireEvent.click(getByLabelText('Messages'));
    fireEvent.click(getByLabelText('Communities'));
    fireEvent.click(getByLabelText('Biblioteca'));
    fireEvent.click(getByLabelText('Timeline'));
    expect(onNavigate).toHaveBeenCalledTimes(6);
    expect(onNavigate).toHaveBeenCalledWith('Home');
    expect(onNavigate).toHaveBeenCalledWith('Notifications');
    expect(onNavigate).toHaveBeenCalledWith('Messages');
    expect(onNavigate).toHaveBeenCalledWith('Communities');
    expect(onNavigate).toHaveBeenCalledWith('Library');
    expect(onNavigate).toHaveBeenCalledWith('Timeline');
  });

  test('oculta ao rolar para baixo e mostra ao rolar para cima', () => {
    const onNavigate = jest.fn();
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    const { container } = render(
      <MobileBottomNav currentPage={'Home'} onNavigate={onNavigate} />
    );
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      Object.defineProperty(window, 'scrollY', { value: 140, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    const root = container.querySelector('div[role="navigation"]')!;
    expect(root.className).toMatch(/translate-y-full/);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 80, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(root.className).toMatch(/translate-y-0/);
  });
});
