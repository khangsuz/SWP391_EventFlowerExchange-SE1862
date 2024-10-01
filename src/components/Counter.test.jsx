import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import this line
import Counter from './Counter';

describe('Counter Component', () => {
    test('renders counter with initial value', () => {
        render(<Counter />);
        const counterValue = screen.getByText('0');
        expect(counterValue).toBeInTheDocument();
    });

    test('increases counter value when button is clicked', () => {
        render(<Counter />);
        const button = screen.getByText('Increase');
        fireEvent.click(button);
        const counterValue = screen.getByText('1');
        expect(counterValue).toBeInTheDocument();
    });
});

export default Counter;