const TransactionType = {
  REGULAR: 1,
  FEE: 2,
} as const;

/**
 * TransactionType enum represents the type of transaction.
 * - REGULAR: A standard transaction.
 * - FEE: A transaction that is specifically for fees.
 */
type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export default TransactionType;