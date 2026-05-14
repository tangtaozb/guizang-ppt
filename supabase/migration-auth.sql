-- Auth Integration Migration
-- Run this in Supabase SQL Editor AFTER the initial migration (migration.sql)
-- This sets up automatic profile creation when users sign up via email OTP

-- ══════════════════════════════════════
-- 1. Auto-create profile on user sign-up
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, nickname, plan, credits)
  VALUES (
    NEW.id,
    '',
    COALESCE(SPLIT_PART(NEW.email, '@', 1), '用户'),
    'free',
    100
  );
  -- Welcome credits
  INSERT INTO public.credit_records (user_id, type, amount, description, project_title)
  VALUES (NEW.id, 'purchase', 100, '新用户赠送积分', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
