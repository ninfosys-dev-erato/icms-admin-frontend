import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImportantLinksList } from '../../../../src/domains/important-links/components/important-links-list';

// Mock translations - simple identity function for keys
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the queries module so we can control returned data
jest.mock('../../../../src/domains/important-links/hooks/use-important-links-queries', () => ({
  useImportantLinks: (query: any) => ({
    data: {
      data: [
        {
          id: '1',
          linkTitle: { en: 'Active Link', ne: '' },
          linkUrl: 'https://example.com/active',
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          linkTitle: { en: 'Inactive Link', ne: '' },
          linkUrl: 'https://example.com/inactive',
          order: 2,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
    },
    isLoading: false,
  }),
  useSearchImportantLinks: () => ({ data: undefined, isLoading: false }),
}));

const renderWithIntl = (component: React.ReactElement) =>
  render(<IntlProvider messages={{ 'important-links': enMessages }} locale="en">{component}</IntlProvider>);

describe('ImportantLinksList - status filter', () => {
  it('shows only inactive links when statusFilter is inactive', () => {
    renderWithIntl(<ImportantLinksList statusFilter="inactive" />);

    // Should display only the inactive link title
    expect(screen.queryByText('Active Link')).not.toBeInTheDocument();
    expect(screen.getByText('Inactive Link')).toBeInTheDocument();
  });

  it('shows only active links when statusFilter is active', () => {
    renderWithIntl(<ImportantLinksList statusFilter="active" />);

    expect(screen.getByText('Active Link')).toBeInTheDocument();
    expect(screen.queryByText('Inactive Link')).not.toBeInTheDocument();
  });
});
