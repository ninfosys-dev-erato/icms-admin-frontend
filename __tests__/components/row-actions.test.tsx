import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RowActions from '@/components/shared/row-actions';

describe('RowActions', () => {
  it('renders overflow menu and calls action', async () => {
    const user = userEvent.setup();
    const fn = jest.fn();

    render(
      <RowActions
        actions={[{ key: '1', itemText: 'Edit', onClick: fn }, { key: '2', itemText: 'Delete', onClick: fn, isDelete: true }]}
      />
    );

  // Carbon's OverflowMenu may render an accessible name like "Options".
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  await user.click(button);
    const edit = await screen.findByText('Edit');
    expect(edit).toBeInTheDocument();

    await user.click(edit);
    expect(fn).toHaveBeenCalled();
  });
});
