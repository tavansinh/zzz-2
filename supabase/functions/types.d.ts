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

declare module 'npm:nodemailer@9.0.0' {
  type MailOptions = {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
  };

  type TransportOptions = {
    service?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };

  type Transporter = {
    sendMail: (options: MailOptions) => Promise<unknown>;
  };

  const nodemailer: {
    createTransport: (options: TransportOptions) => Transporter;
  };

  export default nodemailer;
}
