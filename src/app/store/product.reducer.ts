import { createReducer, on } from '@ngrx/store';
import * as ProductActions from '../store/product.action';
import { Product } from '../model/Product';

export interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: any;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
};

export const productReducer = createReducer(
  initialState,

  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),


  on(ProductActions.loadProductByName, (state,{name}) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductByNameSuccess, (state, { product }) => ({
    ...state,
    product,
    loading: false,
  })),
  on(ProductActions.loadProductByNameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  
  on(ProductActions.addProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
  })),
  
  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map((p) =>
      p.id === product.id ? { ...p, ...product } : p
    ),
  })),
  
  on(ProductActions.deleteProductSuccess, (state, { productId }) => ({
    ...state,
    products: state.products.filter((p) => p.id !== productId),
  }))
);
