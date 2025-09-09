import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SupplierDto,
  CreateSupplierDto,
  UpdateSupplierDto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Suppliers endpoints
  getSuppliers(): Observable<SupplierDto[]> {
    return this.http.get<SupplierDto[]>(`${this.baseUrl}/api/Suppliers`);
  }

  createSupplier(supplier: CreateSupplierDto): Observable<SupplierDto> {
    return this.http.post<SupplierDto>(`${this.baseUrl}/api/Suppliers`, supplier);
  }

  getSupplierById(id: number): Observable<SupplierDto> {
    return this.http.get<SupplierDto>(`${this.baseUrl}/api/Suppliers/${id}`);
  }

  updateSupplier(id: number, supplier: UpdateSupplierDto): Observable<SupplierDto> {
    return this.http.put<SupplierDto>(`${this.baseUrl}/api/Suppliers/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Suppliers/${id}`);
  }

  searchSuppliers(name?: string): Observable<SupplierDto[]> {
    let url = `${this.baseUrl}/api/Suppliers/search`;
    if (name) {
      url += `?name=${encodeURIComponent(name)}`;
    }
    return this.http.get<SupplierDto[]>(url);
  }
}
