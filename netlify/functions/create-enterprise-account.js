const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    // 1. Create the user using the Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: contact_email,
      password: password,
      email_confirm: true, // auto-confirm since we don't have email confirmations enabled
      user_metadata: {
        full_name: `${contact_first_name} ${contact_last_name}`,
        role: 'enterprise',
      },
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    const userId = authData.user.id;

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
