/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_ADMOB_PRODUCTION?: string;
  readonly VITE_ADMOB_REWARDED_ID?: string;
  readonly VITE_ADMOB_BANNER_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
