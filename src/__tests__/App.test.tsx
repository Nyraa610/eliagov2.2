
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Tell TypeScript about the custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

describe('App component', () => {
  test('renders the app without crashing', () => {
    render(<App />);
    const linkElement = screen.getByText(/welcome/i);
    expect(linkElement).toBeInTheDocument();
  });
});
