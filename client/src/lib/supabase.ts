/**
 * Supabase Client Configuration
 * 
 * In production, set these environment variables:
 *   VITE_SUPABASE_URL — Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Your Supabase anonymous key
 * 
 * The frontend uses the anon key (public, row-level security enforced).
 * The backend uses the service key (private, full access).
 */

// Placeholder configuration — replace with your Supabase project details
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
};

// Render backend API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api.onrender.com';

/**
 * Helper to make API calls to the Render backend
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      data: null as T,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
