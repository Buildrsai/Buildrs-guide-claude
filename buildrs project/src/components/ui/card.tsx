import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-bg-elevated border border-border-subtle rounded-lg transition-all duration-base hover:border-border-default hover:-translate-y-px',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }
