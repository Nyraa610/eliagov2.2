
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App component', () => {
  test('renders the app without crashing', () => {
    render(<App />);
    const linkElement = screen.getByText(/welcome/i);
    expect(linkElement).toBeInTheDocument();
  });
});
