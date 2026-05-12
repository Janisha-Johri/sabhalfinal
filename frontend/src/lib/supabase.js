import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// AUTH HELPERS
// ============================================================

export async function signUp(email, password, role, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
    },
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

// ============================================================
// CASE HELPERS
// ============================================================

export async function insertCase(caseData) {
  const { data, error } = await supabase
    .from("cases")
    .insert(caseData)
    .select()
    .single();
  return { data, error };
}

export async function updateCase(caseId, updates) {
  const { data, error } = await supabase
    .from("cases")
    .update(updates)
    .eq("id", caseId)
    .select()
    .single();
  return { data, error };
}

export async function getPatientCases(patientId) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getAllCases() {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}