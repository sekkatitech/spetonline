const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'sales@spetonline.co.za';
const SENDER_NAME = process.env.SENDER_NAME || 'SPET Online';
const SITE_URL = process.env.SITE_URL || 'https://spetonline.co.za';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildConfirmationEmailHtml(firstName, companyName, actionLink) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #0a141d; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">SPET Online Enterprise</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Confirm your email</h2>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Hi ${firstName || 'there'}, thanks for registering <strong>${companyName}</strong> for a SPET Online Enterprise account.
        Please confirm your email address to activate your login.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${actionLink}" style="display: inline-block; background: #0071e3; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 999px;">
          Confirm Email Address
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
        Once confirmed, our team will still need to review and approve your business account — this usually takes
        one business day. You'll be able to log in once both steps are complete.
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const {
      company_name, registration_number, vat_number, industry, company_size, website,
      id_document_url, company_registration_document_url, proof_of_address_document_url,
      contact_first_name, contact_last_name, contact_email, contact_phone, contact_role,
      physical_address, city, province, postal_code, password
    } = data;

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
        redirectTo: `${SITE_URL}/enterprise/login`,
      },
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
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
        htmlContent: buildConfirmationEmailHtml(contact_first_name, company_name, confirmationLink),
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
      body: JSON.stringify({ error: err.message || 'An unexpected error occurred.' })
    };
  }
};
// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
// revert: env vars restored to plain (non-secret) after runtime incident
