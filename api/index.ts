import startServer from '../server.ts';

let appPromise: any;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = startServer();
  }
  const app = await appPromise;
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
