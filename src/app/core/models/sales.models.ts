// Sales Models basados en la API Swagger

export interface SalesOrderDto {
  id: number;
  orderDate: string;
  customerId: string;
  customerName?: string;
  totalAmount: number;
  status?: string;
  items?: SalesOrderItemDto[];
}

export interface CreateSalesOrderDto {
  customerId: string;
  status?: string;
  items?: CreateSalesOrderItemDto[];
}

export interface UpdateSalesOrderDto {
  customerId: string;
  status?: string;
  items?: UpdateSalesOrderItemDto[];
}

export interface SalesOrderItemDto {
  id: number;
  salesOrderId: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number; // readonly en el API
}

export interface CreateSalesOrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdateSalesOrderItemDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}
