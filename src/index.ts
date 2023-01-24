import * as ff from '@google-cloud/functions-framework';

ff.http('TypescriptFunction', (req: ff.Request, res: ff.Response) => {
  res.send('OK');
});
