// Business (enterprise) registration. It creates a login on the server, so it is rate
// limited and every field is checked here, not only in the form.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
const { escapeHtml, cleanText, isEmail, legacyToV2 } = require('./security-lib.js');

// Storage paths the form writes into the kyc-documents bucket: a random id and the extension.
const DOCUMENT_PATH_RE = /^[0-9a-f-]{36}\.(pdf|jpe?g|png)$/i;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'admin@spetonline.co.za';
const SENDER_NAME = process.env.SENDER_NAME || 'SPET Online';
const SITE_URL = process.env.SITE_URL || 'https://spetonline.co.za';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildConfirmationEmailHtml(firstName, companyName, actionLink, forApple) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #0a141d; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">SPET Online Enterprise</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Confirm your email</h2>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Hi ${escapeHtml(firstName) || 'there'}, thanks for registering <strong>${escapeHtml(companyName)}</strong> for a SPET Online Enterprise account.
        Please confirm your email address to activate your login.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(actionLink)}" style="display: inline-block; background: #0071e3; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 999px;">
          Confirm Email Address
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
        ${forApple
          ? `Once confirmed, sign in to continue with your Apple products. Our team will review your business details, which usually takes one business day.`
          : `Once confirmed, our team will still need to review and approve your business account — this usually takes
        one business day. You'll be able to log in once both steps are complete.`}
      </p>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af;">
        Sekkati Petroleum Energy and Technology (Pty) Ltd · Trading as SPET Online
      </p>
    </div>
  </div>
  `;
}

async function sendEmail({ to, toName, subject, htmlContent }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${errText}`);
  }

  return response.json();
}

const badRequest = (error) => ({ statusCode: 400, headers: CORS, body: JSON.stringify({ error }) });

const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch {
      return badRequest('Invalid request');
    }
    if (!data || typeof data !== 'object') return badRequest('Invalid request');

    const company_name = cleanText(data.company_name, 160);
    const registration_number = cleanText(data.registration_number, 40);
    const vat_number = cleanText(data.vat_number, 40);
    const industry = cleanText(data.industry, 80);
    const company_size = cleanText(data.company_size, 40);
    const website = cleanText(data.website, 200);
    const contact_first_name = cleanText(data.contact_first_name, 60);
    const contact_last_name = cleanText(data.contact_last_name, 60);
    const contact_email = cleanText(data.contact_email, 254).toLowerCase();
    const physical_address = cleanText(data.physical_address, 300);
    const city = cleanText(data.city, 100);
    const province = cleanText(data.province, 60);
    const postal_code = cleanText(data.postal_code, 10);
    const password = typeof data.password === 'string' ? data.password : '';
    const redirect = data.redirect;
    const documentPath = (value) => (typeof value === 'string' && DOCUMENT_PATH_RE.test(value) ? value : null);
    const id_document_url = documentPath(data.id_document_url);
    const company_registration_document_url = documentPath(data.company_registration_document_url);
    const proof_of_address_document_url = documentPath(data.proof_of_address_document_url);

    if (!company_name || !contact_first_name || !contact_last_name || !physical_address || !city || !province) {
      return badRequest('Please complete all the required fields.');
    }
    if (!isEmail(contact_email)) return badRequest('Please enter a valid email address.');
    if (!/^\d{4}$/.test(postal_code)) return badRequest('Postal code must be 4 digits.');
    // Supabase hashes passwords with bcrypt, which reads at most 72 bytes.
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      return badRequest('Your password must be 8 to 72 characters.');
    }
    if (website && !/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(website)) {
      return badRequest('Please enter a valid website address, or leave it blank.');
    }
    for (const field of ['id_document_url', 'company_registration_document_url', 'proof_of_address_document_url']) {
      if (data[field] && !documentPath(data[field])) return badRequest('Please upload your documents again.');
    }

    // Only Apple pages are accepted, so a crafted request can't redirect elsewhere.
    const appleReturn = typeof redirect === 'string' && /^\/enterprise\/apple(\/|\?|$)/.test(redirect) ? redirect : null;
    const loginPath = appleReturn ? `/enterprise/login?redirect=${encodeURIComponent(appleReturn)}` : '/enterprise/login';

    // 1. Create the user (unconfirmed) and get a real confirmation link in one call.
    // Previously used admin.createUser({ email_confirm: true }), which auto-confirmed
    // every enterprise account and never sent a verification email at all — despite the
    // success screen promising one. generateLink creates the user AND returns the
    // action_link needed to actually deliver that promise via Brevo below.
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: contact_email,
      password: password,
      options: {
        data: {
          full_name: `${contact_first_name} ${contact_last_name}`,
          role: 'enterprise',
        },
        redirectTo: `${SITE_URL}${loginPath}`,
      },
    });

    if (authError) {
      console.error('create-enterprise-account auth error:', authError.message);
      // Same wording whether or not the address is registered, so the form can't be used to
      // find out who has an account.
      return badRequest('We could not register this email address. If you already have an account, please sign in or reset your password.');
    }
    const userId = authData.user.id;
    const confirmationLink = authData.properties.action_link;

    // 2. Insert enterprise_accounts record
    const { data: account, error: accountError } = await supabase
      .from('enterprise_accounts')
      .insert({
        company_name: company_name.trim(),
        registration_number: registration_number?.trim() || null,
        vat_number: vat_number?.trim() || null,
        industry: industry,
        company_size: company_size,
        website: website?.trim() || null,
        id_document_url: id_document_url || null,
        company_registration_document_url: company_registration_document_url || null,
        proof_of_address_document_url: proof_of_address_document_url || null,
        physical_address: physical_address.trim(),
        city: city.trim(),
        province: province,
        postal_code: postal_code.trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    if (accountError) {
      // Cleanup auth user if account fails
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Account Error: ${accountError.message}`);
    }

    // 3. Wait securely for the Supabase profile trigger to create the profile row
    let profileReady = false;
    for (let i = 0; i < 5; i++) {
      await new Promise(res => setTimeout(res, 1000));
      const { data: prof } = await supabase.from('profiles').select('id').eq('id', userId).single();
      if (prof) {
        profileReady = true;
        break;
      }
    }

    if (!profileReady) {
      throw new Error('Profile was not created in time. Please contact support.');
    }

    // 4. Link the new auth user to the enterprise account
    const { error: memberError } = await supabase.from('enterprise_account_members').insert({
      account_id: account.id,
      profile_id: userId,
      role: 'owner',
    });

    if (memberError) {
      throw new Error(`Member Link Error: ${memberError.message}`);
    }

    // 5. Update profile with enterprise status + role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        enterprise_status: 'pending',
        role: 'enterprise',
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Profile Update Error: ${profileError.message}`);
    }

    // 6. Send the confirmation email. Non-fatal: the account and KYC documents are
    // already saved, so a transient email failure shouldn't lose the application —
    // matching how send-order-email failures don't fail the parent operation elsewhere.
    try {
      await sendEmail({
        to: contact_email,
        toName: `${contact_first_name} ${contact_last_name}`,
        subject: 'Confirm your email — SPET Online Enterprise',
        htmlContent: buildConfirmationEmailHtml(contact_first_name, company_name, confirmationLink, !!appleReturn),
      });
    } catch (emailErr) {
      console.error('Failed to send enterprise confirmation email:', emailErr);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, accountId: account.id })
    };

  } catch (err) {
    console.error('create-enterprise-account error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'We could not complete your registration. Please try again, or contact us.' })
    };
  }
};

export default legacyToV2(handler);

// Three registrations per visitor per minute: enough for typing mistakes, too few for a
// script creating accounts or sending confirmation emails to strangers.
export const config = {
  path: '/api/enterprise-register',
  rateLimit: { windowLimit: 3, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
// revert: env vars restored to plain (non-secret) after runtime incident
