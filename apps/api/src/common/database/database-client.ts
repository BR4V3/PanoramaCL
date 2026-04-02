export interface DbQueryResult<T> {
  rows: T[];
}

export interface DatabaseClient {
  query<T>(sql: string, params?: unknown[]): Promise<DbQueryResult<T>>;
}
