import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SalesOrderDto,
  CreateSalesOrderDto,
  UpdateSalesOrderDto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Sales Orders endpoints
  getSalesOrders(): Observable<SalesOrderDto[]> {
    return this.http.get<SalesOrderDto[]>(`${this.baseUrl}/api/SalesOrders`);
  }

  createSalesOrder(salesOrder: CreateSalesOrderDto): Observable<SalesOrderDto> {
    return this.http.post<SalesOrderDto>(`${this.baseUrl}/api/SalesOrders`, salesOrder);
  }

  getSalesOrderById(id: number): Observable<SalesOrderDto> {
    return this.http.get<SalesOrderDto>(`${this.baseUrl}/api/SalesOrders/${id}`);
  }

  updateSalesOrder(id: number, salesOrder: UpdateSalesOrderDto): Observable<SalesOrderDto> {
    return this.http.put<SalesOrderDto>(`${this.baseUrl}/api/SalesOrders/${id}`, salesOrder);
  }

  deleteSalesOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/SalesOrders/${id}`);
  }

  getSalesOrdersByCustomer(customerId: string): Observable<SalesOrderDto[]> {
    return this.http.get<SalesOrderDto[]>(`${this.baseUrl}/api/SalesOrders/customer/${customerId}`);
  }

  getSalesOrdersByStatus(status: string): Observable<SalesOrderDto[]> {
    return this.http.get<SalesOrderDto[]>(`${this.baseUrl}/api/SalesOrders/status/${status}`);
  }

  getSalesOrderStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/api/SalesOrders/statuses`);
  }
}
