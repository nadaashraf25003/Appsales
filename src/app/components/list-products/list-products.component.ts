import { Component, inject } from '@angular/core';
import { AddModalFormComponent } from "../add-modal-form/add-modal-form.component";
import * as ProductActions from '../../store/product.action';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../model/Product';
import { Store } from '@ngrx/store';
import { selectAllProducts, selectLoading } from '../../store/product.selector';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-list-products',
  imports: [AddModalFormComponent, CommonModule],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent {

  products$: Observable<Product[]>;
  loading$: Observable<boolean>;

  product!: Product;
  label!: string;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(private store: Store) {
    this.products$ = this.store.select(selectAllProducts);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  deleteProduct(id: number) {
    this.store.dispatch(ProductActions.deleteProduct({productId: id }));
  }

  openModalAdd(): void {
    this.product = {id: -1, name: '', quantity: 0, price: 0, description: ''};
    this.label = 'Add';
  }

  openModalUpdate(product: Product): void {
    this.product = product;
    this.label = 'Update';
  }

  goToDetail(name: string) {
    this.router.navigate(['detail', name]);

  }



}
