// Finance Models basados en la API Swagger

export interface AccountDto {
  id: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
  description?: string;
  balance: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccountDto {
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
  description?: string;
  balance: number;
  isActive: boolean;
}

export interface UpdateAccountDto {
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
  description?: string;
  balance?: number;
  isActive?: boolean;
}

export interface AccountSummaryDto {
  id: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
  balance: number;
  isActive: boolean;
}

export interface FinancialTransactionDto {
  id: number;
  transactionType?: string;
  amount: number;
  transactionDate: string;
  description?: string;
  accountId: number;
  accountType?: string;
}

export interface CreateFinancialTransactionDto {
  transactionType?: string;
  amount: number;
  transactionDate: string;
  description?: string;
  accountId: number;
}

export interface UpdateFinancialTransactionDto {
  transactionType?: string;
  amount?: number;
  transactionDate?: string;
  description?: string;
  accountId?: number;
}

export interface FinancialSummaryDto {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  periodStart: string;
  periodEnd: string;
}
