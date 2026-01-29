import { Component, Input } from '@angular/core';
import { ProductFormComponent } from '../product-form/product-form.component';
import { Product } from '../../model/Product';

@Component({
  selector: 'app-add-modal-form',
  imports: [ProductFormComponent],
  templateUrl: './add-modal-form.component.html',
  styleUrl: './add-modal-form.component.css'
})
export class AddModalFormComponent {

  @Input() product!: Product;
  @Input() label!: string;

  constructor() {}


}
