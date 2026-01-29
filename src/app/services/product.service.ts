import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/Product';

@Injectable({ providedIn: 'root' })
export class ProductService {

  
  private apiUrl = 'http://localhost:8080/product';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/listProduct`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/addProduct`, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiUrl}/updateProduct/${product.id}`,
      product
    );
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteProduct/${productId}`);
  }

  findProductByName(name: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/getProductByName/${name}`);
  }

}
