import * as Sentry from '@sentry/nextjs'

/**
 * Helper to capture M-Pesa errors with specific context for better debugging.
 */
export function captureMpesaError(
  error: unknown,
  context: {
    orderId?: string
    amount?: number
    operation: 'stk-push' | 'callback' | 'b2c-payout'
  }
) {
  Sentry.withScope(scope => {
    scope.setTag('mpesa.operation', context.operation)
    if (context.orderId) scope.setTag('order.id', context.orderId)
    if (context.amount) scope.setExtra('amount', context.amount)
    Sentry.captureException(error)
  })
}

/**
 * Helper to capture Order errors with user and action context.
 */
export function captureOrderError(
  error: unknown,
  context: { orderId?: string; userId?: string; action: string }
) {
  Sentry.withScope(scope => {
    scope.setTag('order.action', context.action)
    if (context.orderId) scope.setTag('order.id', context.orderId)
    if (context.userId) scope.setUser({ id: context.userId })
    Sentry.captureException(error)
  })
}
