import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as ProductActions from '../../store/product.action';
import { Store } from '@ngrx/store';
import { Product } from '../../model/Product';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {

  productForm: FormGroup;
  @Input() product!: Product;

  constructor(private fb: FormBuilder, private store: Store) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.maxLength(500)],
    });


  }
    

  onSubmit() {
    if (this.productForm.valid) {
      if(this.product.id > -1) {
        this.productForm.addControl('id', this.fb.control(this.product.id));
        this.store.dispatch(ProductActions.updateProduct({product: this.productForm.value }));
        this.productForm.removeControl('id');
        this.productForm.reset();
      } else {
        this.store.dispatch(ProductActions.addProduct({product: this.productForm.value }));
        this.productForm.reset();
      }
    }
  }

}
