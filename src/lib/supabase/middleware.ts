import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "./env";

export async function updateSession(request: NextRequest) {
  // Rebuild response when cookies refresh so request + response stay in sync (Supabase SSR pattern).
  let response = NextResponse.next({ request });

  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() validates the JWT and refreshes the session; setAll writes cookies to request + response.
  const { data } = await supabase.auth.getUser();

  return { response, user: data.user };
}
