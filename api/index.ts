let appPromise: any;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      const serverModule = await import('../server.ts');
      const startServer = serverModule.default || serverModule.startServer;
      appPromise = startServer();
    }
    const app = await appPromise;
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).send(JSON.stringify({
      error: 'Serverless execution error',
      message: error?.message || String(error),
      stack: error?.stack
    }, null, 2));
  }
}
