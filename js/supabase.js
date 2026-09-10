/* StokCerdas — Supabase SDK Authentication & Multi-Tenant Data Facade */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseConfig.js';

/**
 * Register a new user with Supabase Auth
 */
export async function signUpUser({ email, password, name, businessName, businessType }) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client belum dikonfigurasi.');
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || 'Pengguna Baru',
        businessName: businessName || 'Toko Saya',
        businessType: businessType || 'UMKM Kuliner'
      }
    }
  });

  if (error) {
    throw error;
  }

  // Auto-create business record in Supabase businesses table if user exists
  if (data.user) {
    try {
      const bizId = `biz-${data.user.id.slice(0, 8)}`;
      await client.from('businesses').upsert({
        id: bizId,
        user_id: data.user.id,
        name: businessName || 'Toko Saya',
        type: businessType || 'UMKM Kuliner',
        owner: name || 'Pengguna Baru',
        location: 'Indonesia'
      });
    } catch (e) {
      console.warn('Gagal membuat profil bisnis awal di Supabase:', e);
    }
  }

  return data;
}

/**
 * Login user with Supabase Auth (email + password)
 */
export async function signInUser({ email, password }) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client belum dikonfigurasi.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Logout current user from Supabase Auth
 */
export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) {
    console.warn('Error saat sign out Supabase:', error.message);
  }
}

/**
 * Get active session from Supabase
 */
export async function getCurrentSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data ? data.session : null;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data ? data.user : null;
}

/**
 * Fetch all records for a table (RLS auto-filters by user_id)
 */
export async function fetchTableData(tableName) {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from(tableName)
    .select('*');

  if (error) {
    console.warn(`Gagal mengambil data ${tableName} dari Supabase:`, error.message);
    return [];
  }

  return data || [];
}

/**
 * Insert a new record into a Supabase table with user_id attached
 */
export async function insertRecord(tableName, record, userId) {
  const client = getSupabaseClient();
  if (!client) return record;

  const payload = {
    ...record,
    user_id: userId
  };

  const { data, error } = await client
    .from(tableName)
    .insert([payload])
    .select();

  if (error) {
    console.warn(`Gagal insert ke ${tableName}:`, error.message);
  }

  return (data && data[0]) ? data[0] : record;
}

/**
 * Update an existing record in a Supabase table
 */
export async function updateRecord(tableName, recordId, updates) {
  const client = getSupabaseClient();
  if (!client) return updates;

  const { data, error } = await client
    .from(tableName)
    .update(updates)
    .eq('id', recordId)
    .select();

  if (error) {
    console.warn(`Gagal update ${tableName} (id=${recordId}):`, error.message);
  }

  return (data && data[0]) ? data[0] : updates;
}

/**
 * Delete a record from a Supabase table
 */
export async function deleteRecord(tableName, recordId) {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from(tableName)
    .delete()
    .eq('id', recordId);

  if (error) {
    console.warn(`Gagal delete ${tableName} (id=${recordId}):`, error.message);
  }
}
