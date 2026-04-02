export interface RequestContext<TParams = unknown, TQuery = unknown, TBody = unknown> {
  params: TParams;
  query: TQuery;
  body: TBody;
}

export interface HttpResponse<TData> {
  statusCode: number;
  data: TData;
}

export const ok = <TData>(data: TData): HttpResponse<TData> => ({
  statusCode: 200,
  data,
});

export const created = <TData>(data: TData): HttpResponse<TData> => ({
  statusCode: 201,
  data,
});
