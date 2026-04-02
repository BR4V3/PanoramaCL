export const localesRoutes = [
  { method: "GET", path: "/api/v1/locals", handler: "localesController.list" },
  { method: "GET", path: "/api/v1/locals/:id", handler: "localesController.getById" },
  { method: "POST", path: "/api/v1/locals", handler: "localesController.create" },
  { method: "PATCH", path: "/api/v1/locals/:id", handler: "localesController.update" },
] as const;
