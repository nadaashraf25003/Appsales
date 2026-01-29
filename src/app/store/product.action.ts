import { createAction, props } from '@ngrx/store';
import { Product } from '../model/Product';


export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);
export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: any }>()
);

export const loadProductByName = createAction('[Product] Load Product by name',
   props<{ name: string }>()
  );
export const loadProductByNameSuccess = createAction(
  '[Product] Load Product By Name Success',
  props<{ product: Product | null}>()
);
export const loadProductByNameFailure = createAction(
  '[Product] Load Product By Name Failure',
  props<{ error: any }>()
);

export const addProduct = createAction(
  '[Product] Add Product',
  props<{ product: Product }>()
);
export const addProductSuccess = createAction(
  '[Product] Add Product Success',
  props<{ product: Product }>()
);
export const addProductFailure = createAction(
  '[Product] Add Product Failure',
  props<{ error: any }>()
);


export const updateProduct = createAction(
  '[Product] Update Product',
  props<{ product: Product }>()
);
export const updateProductSuccess = createAction(
  '[Product] Update Product Success',
  props<{ product: Product }>()
);
export const updateProductFailure = createAction(
  '[Product] Update Product Failure',
  props<{ error: any }>()
);


export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ productId: number }>()
);
export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ productId: number }>()
);
export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: any }>()
);
