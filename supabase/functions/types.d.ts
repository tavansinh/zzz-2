declare namespace Deno {
  const env: {
    get: (key: string) => string | undefined;
  };

  const serve: (
    handler: (request: Request) => Response | Promise<Response>,
  ) => void;
}

declare module 'npm:@supabase/supabase-js@2.108.2' {
  export * from '@supabase/supabase-js';
}
