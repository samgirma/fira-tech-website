import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white shadow hover:bg-brand-700',
        secondary: 'border-transparent bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200',
        destructive: 'border-transparent bg-red-600 text-white shadow hover:bg-red-700',
        outline: 'text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-700',
        success: 'border-transparent bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300',
        warning: 'border-transparent bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300',
        info: 'border-transparent bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
        purple: 'border-transparent bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
        gold: 'border-transparent bg-gold-100 dark:bg-gold-950 text-gold-900 dark:text-gold-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
