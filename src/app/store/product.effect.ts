import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../services/product.service';
import * as ProductActions from '../store/product.action';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ProductEffects {

  private actions$ =  inject(Actions);

  constructor(
    //private actions$: Actions,
    private productService: ProductService
  ) {}

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      mergeMap(() =>
        this.productService.getAllProducts().pipe(
          map((products) =>
            ProductActions.loadProductsSuccess({ products })
          ),
          catchError((error) =>
            of(ProductActions.loadProductsFailure({ error }))
          )
        )
      )
    )
  );

  addProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.addProduct),
      mergeMap(({ product }) =>
        this.productService.addProduct(product).pipe(
          map((newProduct) =>
            ProductActions.addProductSuccess({ product: newProduct })
          ),
          catchError((error) =>
            of(ProductActions.addProductFailure({ error }))
          )
        )
      )
    )
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      mergeMap(({ product }) =>
        this.productService.updateProduct(product).pipe(
          map((updatedProduct) =>
            ProductActions.updateProductSuccess({ product: updatedProduct })
          ),
          catchError((error) =>
            of(ProductActions.updateProductFailure({ error }))
          )
        )
      )
    )
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      mergeMap(({ productId }) =>
        this.productService.deleteProduct(productId).pipe(
          map(() =>
            ProductActions.deleteProductSuccess({ productId })
          ),
          catchError((error) =>
            of(ProductActions.deleteProductFailure({ error }))
          )
        )
      )
    )
  );

  findProductByName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductByName),
      mergeMap(action =>
        this.productService.findProductByName(action.name).pipe(
          map(product => ProductActions.loadProductByNameSuccess({ product })),
          catchError(error => of(ProductActions.loadProductByNameFailure({ error })))
        )
      )
    )
  );


}
