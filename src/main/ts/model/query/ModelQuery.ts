export interface ModelQuery {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
}

export interface OrderBy {
  field: string;
  ascending?: boolean;
}

