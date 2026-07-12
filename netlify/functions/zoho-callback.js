// netlify/functions/zoho-callback.js
// One-time OAuth handshake — Zoho redirects here after authorization
// Exchanges the code for access + refresh tokens and stores them in Supabase

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const { code, error } = event.queryStringParameters || {};

  if (error) {
    return {
      statusCode: 400,
      body: `<html><body><h2>Authorization failed</h2><p>${error}</p></body></html>`,
      headers: { 'Content-Type': 'text/html' },
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      body: '<html><body><h2>No authorization code received</h2></body></html>',
      headers: { 'Content-Type': 'text/html' },
    };
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri:  process.env.ZOHO_REDIRECT_URI,
        code,
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      throw new Error(`Token exchange failed: ${tokens.error}`);
    }

    // Store tokens in Supabase (zoho_tokens table)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Build upsert data — only include refresh_token if Zoho returned one
    // (Zoho skips refresh_token on repeat authorizations)
    const upsertData = {
      id:           1,
      access_token: tokens.access_token,
      expires_at:   expiresAt,
      scope:        tokens.scope,
      updated_at:   new Date().toISOString(),
    };
    if (tokens.refresh_token) {
      upsertData.refresh_token = tokens.refresh_token;
    }

    const { error: dbError } = await supabase
      .from('zoho_tokens')
      .upsert(upsertData, { onConflict: 'id' });

    if (dbError) throw new Error(`DB error: ${dbError.message}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <html>
          <body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center">
            <h2 style="color:#2e7d32">Zoho Books Connected!</h2>
            <p>SPET Online is now connected to your Zoho Books account.</p>
            <p style="color:#666;font-size:14px">Tokens stored securely. You can close this tab.</p>
            <a href="https://spetonline-dashboard.netlify.app/finances" 
               style="display:inline-block;margin-top:20px;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none">
              Go to Finance Dashboard
            </a>
          </body>
        </html>
      `,
    };
  } catch (err) {
    console.error('Zoho OAuth error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<html><body><h2>Connection failed</h2><p>${err.message}</p></body></html>`,
    };
  }
};// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
