import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { mockQuery } from './__mocks__/query';
import { QueryCodeEditor } from './QueryCodeEditor';

const props = {
  query: mockQuery,
  language: '',
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
  getSuggestions: jest.fn(),
  getTemplateSrv: jest.fn(),
};

describe('QueryCodeEditor', () => {
  // The editor never finishes loading in the testing environment
  // so we cannot test a lot here
  it('should render', async () => {
    render(<QueryCodeEditor {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
