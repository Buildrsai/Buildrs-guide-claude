import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-medium transition-opacity duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:
          'bg-text-primary text-bg-base rounded-md hover:opacity-85',
        secondary:
          'bg-transparent text-text-secondary border border-border-default rounded-md hover:border-border-strong hover:text-text-primary hover:bg-white/[0.04]',
        ghost:
          'bg-transparent text-text-secondary border border-transparent rounded-md hover:text-text-primary hover:bg-white/[0.04]',
      },
      size: {
        sm:  'h-8  px-3   text-xs',
        md:  'h-9  px-[18px] text-sm',
        lg:  'h-10 px-5   text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
