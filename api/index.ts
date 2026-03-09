let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = import('../apps/api/src/app.js').then(m => m.default);
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
