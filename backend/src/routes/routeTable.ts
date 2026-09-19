import { Router, RequestHandler } from 'express';

export interface RouteDef {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
}

export function buildRouter(routes: RouteDef[]): Router {
  const router = Router();
  for (const route of routes) {
    router[route.method](route.url, ...(route.middlewares ?? []), route.handler);
  }
  return router;
}
