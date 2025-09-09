// Inventory Models basados en la API Swagger

export interface ProductDto {
  id: number;
  productName?: string;
  sku?: string;
  description?: string;
  unitOfMeasure?: string;
  currentStock: number;
  minimumStock: number;
}

export interface CreateProductDto {
  productName?: string;
  sku?: string;
  description?: string;
  unitOfMeasure?: string;
  currentStock: number;
  minimumStock: number;
}

export interface UpdateProductDto {
  productName?: string;
  description?: string;
  unitOfMeasure?: string;
  currentStock: number;
  minimumStock: number;
}

export interface ProductStockDto {
  id: number;
  productName?: string;
  sku?: string;
  currentStock: number;
  minimumStock: number;
  isLowStock?: boolean; // readonly en el API
}
