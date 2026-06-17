const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export const supabaseUrl = 'https://rgksdszqcxrpnoqmgslt.supabase.co';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const methodGuard = (req: Request, method: string) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== method) {
    return json({ error: 'method not allowed' }, 405);
  }

  return null;
};

export const requireSupabaseSecretKey = () => {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys) as Record<string, string | undefined>;
    const secretKey = parsed.default;
    if (secretKey) return secretKey;
  }

  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;

  throw new Error('missing Supabase secret key');
};

export const errorBody = (err: unknown, stage: string) => {
  if (err instanceof Error) {
    return {
      error: err.message,
      stage,
      code: null,
      details: null,
      hint: null,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const data = err as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      name?: unknown;
    };

    return {
      error:
        typeof data.message === 'string'
          ? data.message
          : typeof data.name === 'string'
            ? data.name
            : 'unknown edge function error',
      stage,
      code: typeof data.code === 'string' ? data.code : null,
      details: typeof data.details === 'string' ? data.details : null,
      hint: typeof data.hint === 'string' ? data.hint : null,
    };
  }

  return {
    error: String(err),
    stage,
    code: null,
    details: null,
    hint: null,
  };
};
