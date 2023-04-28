import {
  type UsePaginationInstanceProps,
  type UsePaginationOptions,
  type UsePaginationState,
  type UseSortByColumnProps,
  type UseSortByColumnOptions,
  type UseSortByHooks,
  type UseSortByInstanceProps,
  type UseSortByOptions,
  type UseSortByState,
} from 'react-table'

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UsePaginationOptions<D>,
      UseSortByOptions<D> {}

  export interface TableInstance<D extends object>
    extends UsePaginationInstanceProps<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<D extends object>
    extends UsePaginationState<D>,
      UseSortByState<D> {}

  export interface Hooks<D extends object> extends UseSortByHooks<D> {}

  export interface ColumnInterface<D extends object>
    extends UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object>
    extends UseSortByColumnProps<D> {}
}
