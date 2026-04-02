import { localesRoutes } from "./modules/locales/locales.routes";
import { panoramasRoutes } from "./modules/panoramas/panoramas.routes";

export const appRoutes = [...localesRoutes, ...panoramasRoutes] as const;
