import { createClient } from 'npm:@supabase/supabase-js@2.108.2';
import nodemailer from 'npm:nodemailer@9.0.0';
import {
  errorBody,
  json,
  methodGuard,
  requireSupabaseSecretKey,
  supabaseUrl,
} from '../_shared/http.ts';

type EmailKind = 'payment_received' | 'account_delivery' | 'manual_completed';

type OrderRow = {
  id: string;
  customer_email: string;
  package_name: string;
  amount: number;
  status: string;
  delivery_type: string;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  accounts: { email: string; password: string } | null;
};

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const smtpFrom = '4K Premium <ninhhieu8668@gmail.com>';
const smtpUser = 'ninhhieu8668@gmail.com';
const smtpPassword = 'njvfbqzjjikneaut';

const createSmtpTransport = () =>
  nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: smtpUser, pass: smtpPassword },
  });

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const emailShell = (
  title: string,
  eyebrow: string,
  body: string,
) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#141414;font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#141414;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:100%;">
            <tr>
              <td style="padding:32px;background:#1f1f1f;border:1px solid #333333;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
                <div style="margin:0 0 24px;text-align:center;">
                  <div style="display:inline-block;margin:0 0 10px;padding:8px 12px;border-radius:4px;background:#e50914;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;line-height:1;">4K PREMIUM</div>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:#a3a3a3;letter-spacing:-0.01em;">${eyebrow}</p>
                </div>
                ${body}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px;font-size:12px;line-height:1.6;color:#666666;">
                4K Premium &mdash; Cung cấp tài khoản dịch vụ
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const infoRow = (label: string, value: string) => `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #333333;color:#a3a3a3;font-size:13px;line-height:1.5;">${label}</td>
    <td align="right" style="padding:12px 0;border-bottom:1px solid #333333;color:#ffffff;font-size:14px;line-height:1.5;font-weight:700;">${value}</td>
  </tr>`;

const orderRows = (order: OrderRow, packageName: string, amount: string) => `
  ${infoRow('Mã đơn', escapeHtml(order.id))}
  ${infoRow('Gói', packageName)}
  ${infoRow('Số tiền', amount)}`;

const buildMail = (order: OrderRow, kind: EmailKind) => {
  const packageName = escapeHtml(order.package_name);
  const amount = currency.format(order.amount);

  if (kind === 'account_delivery') {
    if (!order.accounts) throw new Error('missing assigned account');

    const email = escapeHtml(order.accounts.email);
    const password = escapeHtml(order.accounts.password);
    const html = emailShell(
      `Tài khoản cho đơn ${order.id}`,
      'Đơn hàng đã hoàn thành',
      `<h1 style="margin:0 0 8px;font-size:24px;line-height:1.1;color:#ffffff;font-weight:700;letter-spacing:-0.02em;text-align:center;">Tài khoản của bạn đã sẵn sàng</h1>
      <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;line-height:1.6;text-align:center;">Cảm ơn bạn đã mua gói dịch vụ tại 4K Premium.</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;background:#141414;border:1px solid #333333;border-radius:8px;">
        <tr>
          <td style="padding:18px;">
            <div style="margin:0 0 12px;color:#a3a3a3;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Thông tin đăng nhập</div>
            <div style="margin:0 0 10px;padding:12px 14px;border-radius:6px;background:#2d2d2d;color:#ffffff;font-size:15px;line-height:1.5;font-weight:700;word-break:break-all;">${email}</div>
            <div style="padding:12px 14px;border-radius:6px;background:#2d2d2d;color:#ffffff;font-size:15px;line-height:1.5;font-weight:700;word-break:break-all;">${password}</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
        ${orderRows(order, packageName, amount)}
      </table>
      <p style="margin:0;padding:14px 16px;background:#141414;border-left:4px solid #e50914;border-radius:6px;color:#a3a3a3;font-size:13px;line-height:1.6;">Không chia sẻ thông tin tài khoản này công khai. Nếu cần hỗ trợ, liên hệ admin để được xử lý nhanh.</p>`,
    );

    return {
      subject: `Tài khoản cho đơn ${order.id}`,
      text: `Đơn hàng ${order.id} đã hoàn thành.\nGói: ${order.package_name}\nSố tiền: ${amount}\n\nTài khoản:\nEmail: ${order.accounts.email}\nMật khẩu: ${order.accounts.password}\n`,
      html,
    };
  }

  if (kind === 'payment_received') {
    const html = emailShell(
      `Đã nhận thanh toán đơn ${order.id}`,
      'Xác nhận thanh toán',
      `<h1 style="margin:0 0 8px;font-size:24px;line-height:1.1;color:#ffffff;font-weight:700;letter-spacing:-0.02em;text-align:center;">Thanh toán đã được xác nhận</h1>
      <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;line-height:1.6;text-align:center;">Admin đang xử lý đơn của bạn. Bạn sẽ nhận thêm email khi đơn hoàn tất.</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
        ${orderRows(order, packageName, amount)}
      </table>
      <div style="padding:16px;background:#141414;border:1px solid #333333;border-radius:8px;text-align:center;">
        <div style="margin:0 0 6px;color:#46d369;font-size:13px;font-weight:700;">Đã nhận thanh toán</div>
        <div style="color:#a3a3a3;font-size:13px;line-height:1.6;">Vui lòng giữ email này để đối chiếu khi cần hỗ trợ.</div>
      </div>`,
    );

    return {
      subject: `Đã nhận thanh toán đơn ${order.id}`,
      text: `Đơn hàng ${order.id} đã được xác nhận thanh toán.\nGói: ${order.package_name}\nSố tiền: ${amount}\nAdmin đang xử lý đơn của bạn.`,
      html,
    };
  }

  const html = emailShell(
    `Đơn hàng ${order.id} đã hoàn thành`,
    'Hoàn tất đơn hàng',
    `<h1 style="margin:0 0 8px;font-size:24px;line-height:1.1;color:#ffffff;font-weight:700;letter-spacing:-0.02em;text-align:center;">Đơn hàng đã hoàn thành</h1>
    <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;line-height:1.6;text-align:center;">Cảm ơn bạn đã sử dụng dịch vụ của 4K Premium.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      ${orderRows(order, packageName, amount)}
    </table>
    <p style="margin:0;padding:14px 16px;background:#141414;border-left:4px solid #e50914;border-radius:6px;color:#a3a3a3;font-size:13px;line-height:1.6;">Nếu cần hỗ trợ thêm, hãy liên hệ admin kèm mã đơn ở trên.</p>`,
  );

  return {
    subject: `Đơn hàng ${order.id} đã hoàn thành`,
    text: `Đơn hàng ${order.id} đã hoàn thành.\nGói: ${order.package_name}\nSố tiền: ${amount}\nCảm ơn bạn đã sử dụng dịch vụ.`,
    html,
  };
};

Deno.serve(async (req) => {
  const guarded = methodGuard(req, 'POST');
  if (guarded) return guarded;

  let stage = 'start';

  try {
    stage = 'auth header';
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json({ error: 'unauthorized' }, 401);

    stage = 'payload';
    const { orderId, kind } = (await req.json()) as {
      orderId?: string;
      kind?: EmailKind;
    };

    if (!orderId || !kind) return json({ error: 'missing payload' }, 400);
    if (
      !['payment_received', 'account_delivery', 'manual_completed'].includes(
        kind,
      )
    ) {
      return json({ error: 'invalid email kind' }, 400);
    }

    stage = 'supabase client';
    const serviceKey = requireSupabaseSecretKey();
    const admin = createClient(supabaseUrl, serviceKey);

    stage = 'auth user';
    const { data: authData, error: authError } =
      await admin.auth.getUser(token);
    if (authError || !authData.user)
      return json({ error: 'unauthorized' }, 401);

    stage = 'admin check';
    const { data: adminUser, error: adminError } = await admin
      .from('admin_users')
      .select('id')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!adminUser) return json({ error: 'forbidden' }, 403);

    stage = 'order fetch';
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select(
        'id, customer_email, package_name, amount, status, delivery_type, paid_at, completed_at, cancelled_at, accounts!orders_account_id_fkey(email, password)',
      )
      .eq('id', orderId)
      .single<OrderRow>();

    if (orderError) throw orderError;

    stage = 'smtp send';
    const transporter = createSmtpTransport();
    const mail = buildMail(order, kind);
    await transporter.sendMail({
      from: smtpFrom,
      to: order.customer_email,
      ...mail,
    });

    return json({ ok: true });
  } catch (err) {
    const body = errorBody(err, stage);
    console.error('err send-order-email', body);
    return json(body, 500);
  }
});
