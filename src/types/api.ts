export interface PostResponse {
  viewAsString: string;
  status: boolean;
  statusCode: number;
  message: string;
  redirectURL: string;
  id: number;
  additionalMessage: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiry: string;
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  username: string;
  role: string;
}

export interface Product {
  id: number;
  productCode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: number;
  openingStock: number;
  minimumStock: number;
  currentStock: number;
}
