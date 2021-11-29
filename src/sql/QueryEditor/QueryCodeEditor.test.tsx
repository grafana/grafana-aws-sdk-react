import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { mockQuery, SQLOptions, SQLQuery } from './__mocks__/query';
import { select } from 'react-select-event';
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
