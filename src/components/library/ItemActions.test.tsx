import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ItemActions from './ItemActions';

const mockItem = {
  id: 'item-1',
  type: 'ebook',
  title: 'Título de Teste',
  author: 'Autor',
  description: 'Desc',
  coverUrl: '',
  media: undefined,
  date: new Date().toISOString(),
  publishedDate: undefined,
  category: undefined,
  tags: [],
  readUrl: undefined,
  downloadUrl: undefined,
  downloads: 0,
  views: 0,
};

describe('ItemActions', () => {
  test('renderiza botão de três pontos', () => {
    render(<ItemActions item={mockItem as any} onDelete={jest.fn()} />);
    const trigger = screen.getByLabelText('Abrir menu de ações');
    expect(trigger).toBeInTheDocument();
  });

  test('abre e fecha menu dropdown', () => {
    render(<ItemActions item={mockItem as any} onDelete={jest.fn()} />);
    const trigger = screen.getByLabelText('Abrir menu de ações');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    // Fecha ao clicar novamente no botão
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('fluxo de exclusão abre modal de confirmação', () => {
    render(<ItemActions item={mockItem as any} onDelete={jest.fn()} />);
    const trigger = screen.getByLabelText('Abrir menu de ações');
    fireEvent.click(trigger);
    const deleteBtn = screen.getByRole('menuitem', { name: /Apagar item/i });
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja apagar/i)).toBeInTheDocument();
  });

  test('confirma exclusão e chama onDelete', async () => {
    const onDelete = jest.fn().mockResolvedValue({ error: null });
    render(<ItemActions item={mockItem as any} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Abrir menu de ações'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Apagar item/i }));

    const confirmButton = screen.getByRole('button', { name: /Apagar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('item-1');
    });
  });

  test('exibe erro quando onDelete falha', async () => {
    const onDelete = jest.fn().mockResolvedValue({ error: { message: 'Falha mock' } });
    render(<ItemActions item={mockItem as any} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Abrir menu de ações'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Apagar item/i }));

    const confirmButton = screen.getByRole('button', { name: /Apagar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Falha ao apagar item|Falha mock/i)).toBeInTheDocument();
    });
  });
});
import '@testing-library/jest-dom';