export const panoramasRoutes = [
  { method: "GET", path: "/api/v1/events", handler: "panoramasController.list" },
  { method: "GET", path: "/api/v1/events/:id", handler: "panoramasController.getById" },
  { method: "POST", path: "/api/v1/events", handler: "panoramasController.create" },
  { method: "PATCH", path: "/api/v1/events/:id", handler: "panoramasController.update" },
] as const;
