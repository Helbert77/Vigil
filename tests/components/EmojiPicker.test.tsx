import React, { createRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import EmojiPicker from '@/src/components/post/EmojiPicker';

describe('EmojiPicker - tema e funcionalidades', () => {
  const setup = () => {
    const onEmojiSelect = jest.fn();
    const onClose = jest.fn();
    const buttonRef = createRef<HTMLButtonElement>();
    const utils = render(
      <div>
        <button ref={buttonRef}>open</button>
        <EmojiPicker onEmojiSelect={onEmojiSelect} onClose={onClose} buttonRef={buttonRef} />
      </div>
    );
    return { utils, onEmojiSelect, onClose, buttonRef };
  };

  test('aplica tema claro e mantém funcionalidade básica', () => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    const { utils, onEmojiSelect, onClose } = setup();
    const input = utils.getByPlaceholderText('Buscar emojis...');
    expect(input).toBeInTheDocument();
    const emojiButtons = utils.getAllByRole('button', { name: /Selecionar emoji/ });
    fireEvent.click(emojiButtons[0]);
    expect(onEmojiSelect).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('aplica tema escuro e responde ao ESC para fechar', () => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    const { utils, onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('fecha ao clicar fora do painel', () => {
    jest.useFakeTimers();
    document.documentElement.classList.add('light');
    const { utils, onClose } = setup();
    jest.advanceTimersByTime(150);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
