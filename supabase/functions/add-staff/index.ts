import { createClient } from 'npm:@supabase/supabase-js@2.108.2';
import {
  json,
  methodGuard,
  requireSupabaseSecretKey,
  supabaseUrl,
} from '../_shared/http.ts';

type SupabaseClient = ReturnType<typeof createClient>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requireCallerAdmin = async (
  admin: SupabaseClient,
  token: string,
): Promise<{ id: string; email: string } | Response> => {
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'unauthorized' }, 401);

  const { data: caller, error: callerErr } = await admin
    .from('admin_users')
    .select('role')
    .eq('id', authData.user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (callerErr) throw callerErr;
  if (caller?.role !== 'admin') return json({ error: 'forbidden' }, 403);

  return { id: authData.user.id, email: authData.user.email ?? '' };
};

type ExistingAdmin = {
  id: string;
  role: string;
  is_active: boolean;
  is_protected: boolean;
};

const reactivateStaff = async (
  admin: SupabaseClient,
  existing: ExistingAdmin,
): Promise<Response> => {
  const { error } = await admin
    .from('admin_users')
    .update({
      is_active: true,
      is_protected: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
  if (error) throw error;
  return json({ ok: true, reactivated: true });
};

const linkExistingUserAsStaff = async (
  admin: SupabaseClient,
  userId: string,
  email: string,
  creatorId: string,
): Promise<Response> => {
  const { error } = await admin.from('admin_users').insert({
    id: userId,
    email,
    role: 'staff',
    is_active: true,
    is_protected: false,
    created_by: creatorId,
  });
  if (error) throw error;
  return json({ ok: true, created: true });
};

const createAuthUserAndStaff = async (
  admin: SupabaseClient,
  email: string,
  creatorId: string,
): Promise<Response> => {
  const { data: newAuth, error: signUpErr } = await admin.auth.admin.createUser(
    {
      email,
      email_confirm: true,
    },
  );
  if (signUpErr) throw signUpErr;
  if (!newAuth.user) throw new Error('createUser returned no user');

  return linkExistingUserAsStaff(admin, newAuth.user.id, email, creatorId);
};

const handleExistingAdmin = (existing: ExistingAdmin): Response | null => {
  if (existing.is_protected || existing.role === 'admin') {
    return json({ error: 'cannot add protected admin' }, 400);
  }
  if (existing.is_active) {
    return json({ error: 'already a staff' }, 400);
  }
  return null;
};

Deno.serve(async (req) => {
  const guarded = methodGuard(req, 'POST');
  if (guarded) return guarded;

  try {
    const token = (req.headers.get('Authorization') ?? '').replace(
      'Bearer ',
      '',
    );
    if (!token) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(supabaseUrl, requireSupabaseSecretKey());
    const caller = await requireCallerAdmin(admin, token);
    if (caller instanceof Response) return caller;

    const { email: rawEmail } = (await req.json()) as { email?: string };
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return json({ error: 'invalid email' }, 400);
    }

    const { data: existingAdmin } = await admin
      .from('admin_users')
      .select('id, role, is_active, is_protected')
      .eq('email', email)
      .maybeSingle();

    if (existingAdmin) {
      const blocked = handleExistingAdmin(existingAdmin);
      if (blocked) return blocked;
      return reactivateStaff(admin, existingAdmin);
    }

    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return linkExistingUserAsStaff(admin, existingUser.id, email, caller.id);
    }

    return createAuthUserAndStaff(admin, email, caller.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'err adding staff';
    return json({ error: message }, 500);
  }
});
