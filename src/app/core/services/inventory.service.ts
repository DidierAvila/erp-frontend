import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductStockDto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Products endpoints
  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/api/Products`);
  }

  createProduct(product: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.baseUrl}/api/Products`, product);
  }

  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/api/Products/${id}`);
  }

  updateProduct(id: number, product: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.baseUrl}/api/Products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Products/${id}`);
  }

  getProductBySku(sku: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/api/Products/by-sku/${sku}`);
  }

  getLowStockProducts(): Observable<ProductStockDto[]> {
    return this.http.get<ProductStockDto[]>(`${this.baseUrl}/api/Products/low-stock`);
  }
}
