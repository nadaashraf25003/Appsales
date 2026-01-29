import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from '../store/product.reducer';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectProductState,
  (state) => state.error
);

export const selectProduct = createSelector(
  selectProductState,
  (state) => state.product
);