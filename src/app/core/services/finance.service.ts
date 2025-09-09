import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AccountDto,
  CreateAccountDto,
  UpdateAccountDto,
  AccountSummaryDto,
  FinancialTransactionDto,
  CreateFinancialTransactionDto,
  UpdateFinancialTransactionDto,
  FinancialSummaryDto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Accounts endpoints
  getAccounts(): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>(`${this.baseUrl}/api/finance/Accounts`);
  }

  createAccount(account: CreateAccountDto): Observable<AccountDto> {
    return this.http.post<AccountDto>(`${this.baseUrl}/api/finance/Accounts`, account);
  }

  getAccountById(id: string): Observable<AccountDto> {
    return this.http.get<AccountDto>(`${this.baseUrl}/api/finance/Accounts/${id}`);
  }

  updateAccount(id: string, account: UpdateAccountDto): Observable<AccountDto> {
    return this.http.put<AccountDto>(`${this.baseUrl}/api/finance/Accounts/${id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/finance/Accounts/${id}`);
  }

  getAccountsByType(accountType: string): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>(`${this.baseUrl}/api/finance/Accounts/by-type/${accountType}`);
  }

  getActiveAccounts(): Observable<AccountSummaryDto[]> {
    return this.http.get<AccountSummaryDto[]>(`${this.baseUrl}/api/finance/Accounts/active`);
  }

  // Financial Transactions endpoints
  getFinancialTransactions(): Observable<FinancialTransactionDto[]> {
    return this.http.get<FinancialTransactionDto[]>(`${this.baseUrl}/api/FinancialTransactions`);
  }

  createFinancialTransaction(transaction: CreateFinancialTransactionDto): Observable<FinancialTransactionDto> {
    return this.http.post<FinancialTransactionDto>(`${this.baseUrl}/api/FinancialTransactions`, transaction);
  }

  getFinancialTransactionById(id: number): Observable<FinancialTransactionDto> {
    return this.http.get<FinancialTransactionDto>(`${this.baseUrl}/api/FinancialTransactions/${id}`);
  }

  updateFinancialTransaction(id: number, transaction: UpdateFinancialTransactionDto): Observable<FinancialTransactionDto> {
    return this.http.put<FinancialTransactionDto>(`${this.baseUrl}/api/FinancialTransactions/${id}`, transaction);
  }

  deleteFinancialTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/FinancialTransactions/${id}`);
  }

  getFinancialTransactionsByType(type: string): Observable<FinancialTransactionDto[]> {
    return this.http.get<FinancialTransactionDto[]>(`${this.baseUrl}/api/FinancialTransactions/by-type/${type}`);
  }

  getFinancialSummary(startDate?: string, endDate?: string): Observable<FinancialSummaryDto> {
    let url = `${this.baseUrl}/api/FinancialTransactions/summary`;
    const params: string[] = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<FinancialSummaryDto>(url);
  }
}
