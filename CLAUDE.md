# My Green Keys — AI Context

## Project
My Green Keys (mygreenkeys.com) — a daily learning platform for kids 
aged 6–14. Combines typing lessons, Brain Sprint (math + eco lessons), 
Habit Quest (parent-set daily challenges), Ranger system (XP/streak/
badges), and Games. Tagline: "Learn to type. Help the planet."

## Founder
Waleed Bin Khalid — solo founder, pre-scale, based in Pakistan.
Primary email: mygreenkeys26@gmail.com
GitHub: github.com/waleedbinkhalid86/my-green-keys

## Tech stack
- Framework: Next.js 15 (App Router) + TypeScript
- Styling: Tailwind CSS + inline styles (inline preferred for new UI)
- Backend: Supabase (Frankfurt region, project wfrpxhiacixvzwpyxqjc)
  - Auth, Database (Postgres), RLS policies, Storage
- Hosting: Vercel (production: mygreenkeys.com)
- Payments: Paddle (Sandbox; Live pending Payoneer approval)
- Image generation: Runware (Flux Dev) for Pixar-style assets

## Brand
Forest Canopy palette (use ONLY these):
- #1B4332 — deepest forest green
- #2D6A4F — dark forest green (main brand)
- #52B788 — mid green (CTAs)
- #74C69D — light green (accents)
- #F2B705 — golden yellow (special highlights)
- #F0F9F4 / #FAFAF5 — pale backgrounds

Visual style: Pixar-style hero illustrations, glassmorphism cards, 
dotted backgrounds on inner pages.

Logo: public/logo-bgr.png (60px desktop, 48px mobile)

## Architecture
- Marketing homepage: src/app/page.tsx
- Global header: src/components/ConditionalSiteHeader.tsx
- Mobile drawer: src/components/MobileNavDrawer.tsx (below 768px)
- Kid hub: src/app/home/page.tsx
- Kid login: src/app/kid-login/page.tsx (6-char = parent kid, 8-char = class)
- Parent dashboard: src/app/dashboard/parent/page.tsx
- Teacher dashboard: src/app/dashboard/teacher/page.tsx
- Brain Sprint: src/app/brain-sprint/
- Habit Quest: src/components/parent/HabitQuestsSection.tsx
- Promo codes: src/lib/promo/ + supabase/migrations/promo_codes.sql

## Key Supabase tables
profiles, children, classes, class_enrollments, quests, quest_progress, 
quest_skips, custom_lessons, promo_codes, promo_code_redemptions, 
brain_sprint_progress, student_progress, streaks, ranger_xp_log, 
eco_garden, eco_photos, game_scores, certificates, parent_notifications

## Family ownership pattern
Kids' actions tick parent's quests via getFamilyOwnerId() in 
src/lib/kid-login/family-resolver.ts. Kids can read parent's quests + 
custom lessons via RLS. Kids cannot create/update/delete parent-owned 
content.

## Conventions (IMPORTANT)
- PowerShell: use `;` NOT `&&` for chained commands
  (e.g. `git add . ; git commit -m "msg" ; git push`)
- Inline styles preferred over Tailwind for new UI
- Forest Canopy color palette ONLY
- Sentence case for headings (not Title Case)
- Use next/image for images
- Supabase client from @/lib/supabase/client
- Server-side admin from @/lib/supabase/admin (service role)
- No emoji in UI text unless requested

## Don't
- Don't expose SUPABASE_SERVICE_ROLE_KEY to client
- Don't use localStorage for kid auth (Supabase sessions only)
- Don't break parent dashboard when modifying kid-side code
- Don't add Title Case anywhere
- Don't add ads or features that don't exist
- Don't claim COPPA compliance beyond what's actually implemented

## Communication style
- Direct, honest feedback — no flattery
- Concise, light formatting
- Push back when I'm wrong, don't just agree
- Provide complete Cursor prompts, not manual micro-steps
- Confident recommendations on "no preference"
- Pragmatic over perfectionist

## Current focus (May 2026)
- Payoneer pending → Paddle Live approval
- Organic Facebook (no ads until 50+ followers + testimonials)
- Pakistani schools (B2B) — main revenue opportunity
- Mobile responsiveness fixed (hamburger drawer)
- Security headers added (A grade)
