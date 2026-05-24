import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://hxxaxyruliquidvkocei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eGF4eXJ1bGlxdWlkdmtvY2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQxMDQsImV4cCI6MjA5NDU4MDEwNH0.4xsWN9s8b-yJwy3WOm6das5zZGTxbHsRs3SQM2IkuL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSignupEmail() {
  console.log('Testing Supabase Email Delivery (Signup)...');
  const testEmail = 'test-delivery-' + Date.now() + '@spetonline.co.za';
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User'
      }
    }
  });

  if (error) {
    console.error('Error from Supabase:', error.message);
  } else {
    console.log(`Success! Signup request sent for ${testEmail}.`);
    console.log('If Supabase email is working and rate limits are not exceeded, the email should be dispatched.');
    console.log('Response data:', data);
  }
}

testSignupEmail();
