// Purchases Models basados en la API Swagger

export interface SupplierDto {
  id: number;
  supplierName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface CreateSupplierDto {
  supplierName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  supplierName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}
