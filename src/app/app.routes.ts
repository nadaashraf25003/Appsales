import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ListProductsComponent } from './components/list-products/list-products.component';

export const routes: Routes = [
    { path: '', component: ListProductsComponent },
    { path: 'detail/:name', component: ProductDetailComponent }
];
