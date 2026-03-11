import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui/card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has bg-elevated background', () => {
    render(<Card data-testid="card">Test</Card>)
    expect(screen.getByTestId('card')).toHaveClass('bg-bg-elevated')
  })

  it('accepts and passes through className', () => {
    render(<Card data-testid="card" className="custom">Test</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom')
  })
})
