

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user',
    'client_admin',
    'consultant'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "full_name" "text",
    "bio" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_id" "uuid",
    "is_company_admin" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_profile"("p_id" "uuid", "p_email" "text", "p_role" "text") RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Validate the role is valid for the user_role enum
  IF p_role NOT IN ('user', 'admin', 'client_admin', 'consultant') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Insert the profile
  RETURN QUERY
  INSERT INTO public.profiles (id, email, role)
  VALUES (p_id, p_email, p_role::user_role)
  RETURNING *;
END;
$$;


ALTER FUNCTION "public"."admin_create_profile"("p_id" "uuid", "p_email" "text", "p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_feature"("feature_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_plan TEXT;
  feature_available BOOLEAN := FALSE;
BEGIN
  -- Get the user's current subscription level
  user_plan := public.get_user_subscription_level();
  
  -- Check if the feature is available on the user's plan
  -- This is a simplified version - in production you might want more granular control
  IF user_plan = 'free' AND feature_name IN ('training', 'community') THEN
    feature_available := TRUE;
  ELSIF user_plan = 'Kickstart ESG' AND feature_name IN ('training', 'community', 'diagnosis', 'basic_reporting') THEN
    feature_available := TRUE;
  ELSIF user_plan = 'SustainOps' THEN
    -- SustainOps has access to all features
    feature_available := TRUE;
  ELSIF EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Admins have access to all features
    feature_available := TRUE;
  END IF;
  
  RETURN feature_available;
END;
$$;


ALTER FUNCTION "public"."can_access_feature"("feature_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_subscription_level"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  subscription_status TEXT;
  subscription_plan TEXT;
BEGIN
  -- Check if user has an active subscription
  SELECT 
    s.status, p.name INTO subscription_status, subscription_plan
  FROM 
    user_subscriptions s
    JOIN subscription_plans p ON s.plan_id = p.id
  WHERE 
    s.user_id = auth.uid()
    AND (s.status = 'active' OR s.status = 'trialing')
    AND (s.current_period_end > now() OR s.trial_end > now())
  ORDER BY 
    p.price DESC -- Get the highest tier if multiple
  LIMIT 1;
  
  -- Return the subscription level or 'free' if none found
  IF subscription_status IS NULL THEN
    RETURN 'free';
  ELSE
    RETURN subscription_plan;
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_user_subscription_level"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email LIKE '%@eliago.com' THEN 'admin'::public.user_role
      ELSE 'client_admin'::public.user_role
    END
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_user_activity_time"("p_user_id" "uuid", "p_seconds_active" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  points_to_award integer;
  thirty_min_blocks integer;
BEGIN
  -- Calculate how many 30-minute blocks the user has been active
  thirty_min_blocks := p_seconds_active / 1800; -- 1800 seconds = 30 minutes
  
  -- Calculate points (10 points per 30-minute block)
  points_to_award := thirty_min_blocks * 10;
  
  -- Only proceed if there are points to award
  IF points_to_award > 0 THEN
    -- First update the user_engagement_stats table
    UPDATE public.user_engagement_stats
    SET 
      time_spent_seconds = time_spent_seconds + p_seconds_active,
      total_points = total_points + points_to_award,
      last_active_at = now()
    WHERE user_id = p_user_id;
    
    -- If no row exists yet, insert one
    IF NOT FOUND THEN
      INSERT INTO public.user_engagement_stats (
        user_id,
        time_spent_seconds,
        total_points,
        last_active_at
      ) VALUES (
        p_user_id,
        p_seconds_active,
        points_to_award,
        now()
      );
    END IF;
    
    -- If points were awarded, record this activity
    IF points_to_award > 0 THEN
      INSERT INTO public.user_activities (
        user_id,
        activity_type,
        points_earned,
        metadata
      ) VALUES (
        p_user_id,
        'time_spent',
        points_to_award,
        jsonb_build_object(
          'seconds_active', p_seconds_active,
          'thirty_min_blocks', thirty_min_blocks,
          'timestamp', now()
        )
      );
    END IF;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error recording user activity time: %', SQLERRM;
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."record_user_activity_time"("p_user_id" "uuid", "p_seconds_active" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_engagement_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO public.user_engagement_stats (user_id, total_points, activity_count)
  VALUES (NEW.user_id, NEW.points_earned, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_points = user_engagement_stats.total_points + NEW.points_earned,
    activity_count = user_engagement_stats.activity_count + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_engagement_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  calling_user_id uuid;
  calling_user_role text;
  target_user_current_role text;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Get the role of the calling user
  SELECT role INTO calling_user_role FROM public.profiles WHERE id = calling_user_id;
  
  -- Get current role of the target user
  SELECT role INTO target_user_current_role FROM public.profiles WHERE id = user_id;
  
  -- Log the operation attempt for debugging
  RAISE NOTICE 'Role update attempt: User % (role: %) trying to update user % from role % to %', 
               calling_user_id, calling_user_role, user_id, target_user_current_role, new_role;
  
  -- Check if the calling user is an admin
  IF calling_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update user roles. Your role: %', calling_user_role;
  END IF;
  
  -- Validate the role is valid
  IF new_role NOT IN ('user', 'admin', 'client_admin', 'consultant') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Skip update if the role is the same
  IF target_user_current_role = new_role THEN
    RAISE NOTICE 'User % already has role %. No update needed.', user_id, new_role;
    RETURN TRUE;
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role::user_role 
  WHERE id = user_id;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update role for user %. User not found.', user_id;
  END IF;
  
  -- Log successful update
  RAISE NOTICE 'Successfully updated user % role from % to %', 
              user_id, target_user_current_role, new_role;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating role: %', SQLERRM;
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_is_company_admin"("company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE company_id = user_is_company_admin.company_id
    AND id = auth.uid()
    AND is_company_admin = true
  );
$$;


ALTER FUNCTION "public"."user_is_company_admin"("company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_is_company_member"("company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE company_id = user_is_company_member.company_id
    AND id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."user_is_company_member"("company_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessment_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assessment_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "form_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assessment_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "criteria" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "certificate_url" "text",
    "points_earned" integer DEFAULT 0 NOT NULL,
    "issued_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_message" "text" NOT NULL,
    "assistant_response" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."code_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "redeemed_at" timestamp with time zone DEFAULT "now"(),
    "company_id" "uuid"
);


ALTER TABLE "public"."code_redemptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "industry" "text",
    "country" "text",
    "website" "text",
    "registry_number" "text",
    "registry_city" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "file_type" "text",
    "file_size" integer,
    "url" "text" NOT NULL,
    "uploaded_by" "uuid",
    "document_type" "text" DEFAULT 'value_chain'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."company_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content_item_id" "uuid" NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "quiz_score" integer,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."content_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content_type" "text" NOT NULL,
    "content" "text",
    "video_url" "text",
    "sequence_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "content_items_content_type_check" CHECK (("content_type" = ANY (ARRAY['video'::"text", 'text'::"text", 'quiz'::"text"])))
);


ALTER TABLE "public"."content_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "points" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emission_factors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text",
    "name" "text" NOT NULL,
    "category" "text",
    "subcategory" "text",
    "unit" "text",
    "emission_value" numeric,
    "uncertainty_percent" numeric,
    "source" "text" DEFAULT 'ADEME Base Carbone v17'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."emission_factors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hubspot_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "hubspot_id" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "company_name" "text",
    "sustainability_score" integer DEFAULT 0,
    "last_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hubspot_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hubspot_integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "access_token" "text",
    "refresh_token" "text",
    "token_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hubspot_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hubspot_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "contact_id" "uuid",
    "hubspot_id" "text" NOT NULL,
    "content" "text",
    "sustainability_keywords" "text"[],
    "sustainability_score" integer DEFAULT 0,
    "analyzed" boolean DEFAULT false,
    "last_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hubspot_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "module_id" "uuid" NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."module_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "sequence_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partner_commissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "partner_id" "uuid" NOT NULL,
    "code_id" "uuid" NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partner_commissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."point_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "transaction_type" "text" NOT NULL,
    "description" "text",
    "reference_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."point_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promotion_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "stripe_promotion_id" "text",
    "discount_percentage" integer,
    "discount_amount" numeric,
    "is_partner_code" boolean DEFAULT false,
    "partner_id" "uuid",
    "max_redemptions" integer,
    "redemption_count" integer DEFAULT 0,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promotion_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "answer_text" "text" NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "sequence_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quiz_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_item_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "text" NOT NULL,
    "points" integer DEFAULT 1 NOT NULL,
    "sequence_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quiz_questions_question_type_check" CHECK (("question_type" = ANY (ARRAY['multiple_choice'::"text", 'true_false'::"text"])))
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "points_required" integer NOT NULL,
    "image_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "stripe_price_id" "text",
    "description" "text",
    "features" "jsonb",
    "price" numeric,
    "billing_interval" "text" NOT NULL,
    "trial_days" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sustainability_opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "contact_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "opportunity_score" integer DEFAULT 0 NOT NULL,
    "opportunity_status" "text" DEFAULT 'new'::"text",
    "source" "text" DEFAULT 'hubspot'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sustainability_opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "points_earned" integer DEFAULT 0 NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_engagement_stats" (
    "user_id" "uuid" NOT NULL,
    "total_points" integer DEFAULT 0 NOT NULL,
    "activity_count" integer DEFAULT 0 NOT NULL,
    "time_spent_seconds" integer DEFAULT 0 NOT NULL,
    "last_active_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "login_streak" integer DEFAULT 0 NOT NULL,
    "last_login_date" "date",
    "level" integer DEFAULT 1 NOT NULL,
    "company_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_engagement_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_enrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "progress_percentage" integer DEFAULT 0 NOT NULL,
    "points_earned" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."user_enrollments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "redeemed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "points_spent" integer NOT NULL
);


ALTER TABLE "public"."user_rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_id" "uuid",
    "status" "text" NOT NULL,
    "stripe_subscription_id" "text",
    "stripe_customer_id" "text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "trial_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."value_chains" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "is_current" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."value_chains" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assessment_progress"
    ADD CONSTRAINT "assessment_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_progress"
    ADD CONSTRAINT "assessment_progress_user_id_assessment_type_key" UNIQUE ("user_id", "assessment_type");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_user_id_course_id_key" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."chat_history"
    ADD CONSTRAINT "chat_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."code_redemptions"
    ADD CONSTRAINT "code_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_documents"
    ADD CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_completions"
    ADD CONSTRAINT "content_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_completions"
    ADD CONSTRAINT "content_completions_user_id_content_item_id_key" UNIQUE ("user_id", "content_item_id");



ALTER TABLE ONLY "public"."content_items"
    ADD CONSTRAINT "content_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emission_factors"
    ADD CONSTRAINT "emission_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hubspot_contacts"
    ADD CONSTRAINT "hubspot_contacts_company_id_hubspot_id_key" UNIQUE ("company_id", "hubspot_id");



ALTER TABLE ONLY "public"."hubspot_contacts"
    ADD CONSTRAINT "hubspot_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hubspot_integrations"
    ADD CONSTRAINT "hubspot_integrations_company_id_key" UNIQUE ("company_id");



ALTER TABLE ONLY "public"."hubspot_integrations"
    ADD CONSTRAINT "hubspot_integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hubspot_notes"
    ADD CONSTRAINT "hubspot_notes_company_id_hubspot_id_key" UNIQUE ("company_id", "hubspot_id");



ALTER TABLE ONLY "public"."hubspot_notes"
    ADD CONSTRAINT "hubspot_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_completions"
    ADD CONSTRAINT "module_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_completions"
    ADD CONSTRAINT "module_completions_user_id_module_id_key" UNIQUE ("user_id", "module_id");



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_commissions"
    ADD CONSTRAINT "partner_commissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."point_transactions"
    ADD CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_codes"
    ADD CONSTRAINT "promotion_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promotion_codes"
    ADD CONSTRAINT "promotion_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sustainability_opportunities"
    ADD CONSTRAINT "sustainability_opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_engagement_stats"
    ADD CONSTRAINT "user_engagement_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_enrollments"
    ADD CONSTRAINT "user_enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_enrollments"
    ADD CONSTRAINT "user_enrollments_user_id_course_id_key" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."value_chains"
    ADD CONSTRAINT "value_chains_pkey" PRIMARY KEY ("id");



CREATE INDEX "emission_factors_name_code_idx" ON "public"."emission_factors" USING "btree" ("name", "code");



CREATE INDEX "idx_value_chains_company_id" ON "public"."value_chains" USING "btree" ("company_id");



CREATE INDEX "profiles_company_id_idx" ON "public"."profiles" USING "btree" ("company_id");



CREATE OR REPLACE TRIGGER "update_engagement_stats_after_activity" AFTER INSERT ON "public"."user_activities" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_engagement_stats"();



ALTER TABLE ONLY "public"."assessment_progress"
    ADD CONSTRAINT "assessment_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."code_redemptions"
    ADD CONSTRAINT "code_redemptions_code_id_fkey" FOREIGN KEY ("code_id") REFERENCES "public"."promotion_codes"("id");



ALTER TABLE ONLY "public"."code_redemptions"
    ADD CONSTRAINT "code_redemptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."code_redemptions"
    ADD CONSTRAINT "code_redemptions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id");



ALTER TABLE ONLY "public"."code_redemptions"
    ADD CONSTRAINT "code_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_documents"
    ADD CONSTRAINT "company_documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_documents"
    ADD CONSTRAINT "company_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."content_completions"
    ADD CONSTRAINT "content_completions_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_completions"
    ADD CONSTRAINT "content_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_items"
    ADD CONSTRAINT "content_items_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_history"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hubspot_contacts"
    ADD CONSTRAINT "hubspot_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."hubspot_integrations"
    ADD CONSTRAINT "hubspot_integrations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."hubspot_notes"
    ADD CONSTRAINT "hubspot_notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."hubspot_notes"
    ADD CONSTRAINT "hubspot_notes_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hubspot_contacts"("id");



ALTER TABLE ONLY "public"."module_completions"
    ADD CONSTRAINT "module_completions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_completions"
    ADD CONSTRAINT "module_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_commissions"
    ADD CONSTRAINT "partner_commissions_code_id_fkey" FOREIGN KEY ("code_id") REFERENCES "public"."promotion_codes"("id");



ALTER TABLE ONLY "public"."partner_commissions"
    ADD CONSTRAINT "partner_commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."partner_commissions"
    ADD CONSTRAINT "partner_commissions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id");



ALTER TABLE ONLY "public"."point_transactions"
    ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_codes"
    ADD CONSTRAINT "promotion_codes_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sustainability_opportunities"
    ADD CONSTRAINT "sustainability_opportunities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."sustainability_opportunities"
    ADD CONSTRAINT "sustainability_opportunities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hubspot_contacts"("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_engagement_stats"
    ADD CONSTRAINT "user_engagement_stats_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."user_engagement_stats"
    ADD CONSTRAINT "user_engagement_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_enrollments"
    ADD CONSTRAINT "user_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_enrollments"
    ADD CONSTRAINT "user_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."value_chains"
    ADD CONSTRAINT "value_chains_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



CREATE POLICY "Admins can manage emission factors" ON "public"."emission_factors" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"public"."user_role"))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."get_current_user_role"() = 'admin'::"text"));



CREATE POLICY "Admins have full access to redemptions" ON "public"."code_redemptions" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Allow authenticated users to delete content_items" ON "public"."content_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete courses" ON "public"."courses" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete modules" ON "public"."modules" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete quiz_answers" ON "public"."quiz_answers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete quiz_questions" ON "public"."quiz_questions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert content_items" ON "public"."content_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert courses" ON "public"."courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert modules" ON "public"."modules" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert own certificates" ON "public"."certificates" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to insert own completions" ON "public"."module_completions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to insert own content completions" ON "public"."content_completions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to insert own enrollments" ON "public"."user_enrollments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to insert quiz_answers" ON "public"."quiz_answers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert quiz_questions" ON "public"."quiz_questions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read all certificates" ON "public"."certificates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read all completions" ON "public"."module_completions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read all content completions" ON "public"."content_completions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read all enrollments" ON "public"."user_enrollments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read content_items" ON "public"."content_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read courses" ON "public"."courses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read modules" ON "public"."modules" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read quiz_answers" ON "public"."quiz_answers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read quiz_questions" ON "public"."quiz_questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update content_items" ON "public"."content_items" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update courses" ON "public"."courses" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update modules" ON "public"."modules" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update own certificates" ON "public"."certificates" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to update own completions" ON "public"."module_completions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to update own content completions" ON "public"."content_completions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to update own enrollments" ON "public"."user_enrollments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to update quiz_answers" ON "public"."quiz_answers" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update quiz_questions" ON "public"."quiz_questions" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Anyone can view active rewards" ON "public"."rewards" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view badges" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Anyone can view emission factors" ON "public"."emission_factors" FOR SELECT USING (true);



CREATE POLICY "Client admins can view their company redemptions" ON "public"."code_redemptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("auth"."users" "admin_user"
     JOIN "public"."profiles" "admin_profile" ON (("admin_profile"."id" = "admin_user"."id")))
  WHERE (("admin_user"."id" = "auth"."uid"()) AND (("admin_user"."role")::"text" = 'client_admin'::"text") AND (EXISTS ( SELECT 1
           FROM ("auth"."users" "code_user"
             JOIN "public"."profiles" "code_user_profile" ON (("code_user_profile"."id" = "code_user"."id")))
          WHERE (("code_redemptions"."user_id" = "code_user"."id") AND ("code_user_profile"."company_id" = "admin_profile"."company_id"))))))));



CREATE POLICY "Company admins can delete companies" ON "public"."companies" FOR DELETE USING ("public"."user_is_company_admin"("id"));



CREATE POLICY "Company admins can manage sustainability opportunities" ON "public"."sustainability_opportunities" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE (("profiles"."company_id" = "sustainability_opportunities"."company_id") AND ("profiles"."is_company_admin" = true)))));



CREATE POLICY "Company admins can manage their HubSpot integration" ON "public"."hubspot_integrations" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE (("profiles"."company_id" = "hubspot_integrations"."company_id") AND ("profiles"."is_company_admin" = true)))));



CREATE POLICY "Company admins can update companies" ON "public"."companies" FOR UPDATE USING ("public"."user_is_company_admin"("id"));



CREATE POLICY "Company admins can view company users' engagement stats" ON "public"."user_engagement_stats" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_company_admin" = true) AND ("profiles"."company_id" = "user_engagement_stats"."company_id")))));



CREATE POLICY "Company admins can view their HubSpot integration" ON "public"."hubspot_integrations" FOR SELECT USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE (("profiles"."company_id" = "hubspot_integrations"."company_id") AND ("profiles"."is_company_admin" = true)))));



CREATE POLICY "Company members can view their HubSpot contacts" ON "public"."hubspot_contacts" FOR SELECT USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."company_id" = "hubspot_contacts"."company_id"))));



CREATE POLICY "Company members can view their HubSpot notes" ON "public"."hubspot_notes" FOR SELECT USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."company_id" = "hubspot_notes"."company_id"))));



CREATE POLICY "Company members can view their sustainability opportunities" ON "public"."sustainability_opportunities" FOR SELECT USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."company_id" = "sustainability_opportunities"."company_id"))));



CREATE POLICY "Content items are viewable by all authenticated users" ON "public"."content_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Courses are viewable by all authenticated users" ON "public"."courses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Modules are viewable by all authenticated users" ON "public"."modules" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Quiz answers are viewable by all authenticated users" ON "public"."quiz_answers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Quiz questions are viewable by all authenticated users" ON "public"."quiz_questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Service role can insert chat history" ON "public"."chat_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create companies" ON "public"."companies" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create value chains for their company" ON "public"."value_chains" FOR INSERT WITH CHECK ((( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Users can delete their own documents" ON "public"."company_documents" FOR DELETE USING ((("uploaded_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."company_id" = "company_documents"."company_id") AND ("profiles"."is_company_admin" = true))))));



CREATE POLICY "Users can insert their own assessment progress" ON "public"."assessment_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can redeem codes" ON "public"."code_redemptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their company's value chains" ON "public"."value_chains" FOR UPDATE USING ((( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Users can update their own assessment progress" ON "public"."assessment_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can upload documents to their company" ON "public"."company_documents" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."company_id" = "company_documents"."company_id")))));



CREATE POLICY "Users can view and manage their own content completions" ON "public"."content_completions" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view and manage their own enrollments" ON "public"."user_enrollments" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view and manage their own module completions" ON "public"."module_completions" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view companies they are members of" ON "public"."companies" FOR SELECT USING ("public"."user_is_company_member"("id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view partner commissions for their subscriptions" ON "public"."partner_commissions" FOR SELECT USING (("subscription_id" IN ( SELECT "user_subscriptions"."id"
   FROM "public"."user_subscriptions"
  WHERE ("user_subscriptions"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their company documents" ON "public"."company_documents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."company_id" = "company_documents"."company_id")))));



CREATE POLICY "Users can view their company's value chains" ON "public"."value_chains" FOR SELECT USING ((( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Users can view their own activities" ON "public"."user_activities" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own assessment progress" ON "public"."assessment_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own badges" ON "public"."user_badges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own certificates" ON "public"."certificates" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own chat history" ON "public"."chat_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own engagement stats" ON "public"."user_engagement_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own point transactions" ON "public"."point_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own redemptions" ON "public"."code_redemptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own rewards" ON "public"."user_rewards" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users with admin role can insert companies" ON "public"."companies" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."assessment_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."code_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."emission_factors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "enable_company_creation_for_authenticated_users" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "enable_company_select_for_authenticated_users" ON "public"."companies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "enable_company_update_for_company_members" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_company_admin" = true)))));



ALTER TABLE "public"."hubspot_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hubspot_integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hubspot_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partner_commissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."point_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "promo_codes_admin_policy" ON "public"."promotion_codes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "promo_codes_select_policy" ON "public"."promotion_codes" FOR SELECT TO "authenticated" USING ((("is_active" = true) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



ALTER TABLE "public"."promotion_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "secu" ON "public"."user_engagement_stats" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscription_plans_admin_policy" ON "public"."subscription_plans" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "subscription_plans_select_policy" ON "public"."subscription_plans" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."sustainability_opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_engagement_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_enrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_subscriptions_select_policy" ON "public"."user_subscriptions" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "user_subscriptions_system_policy" ON "public"."user_subscriptions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."value_chains" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_profile"("p_id" "uuid", "p_email" "text", "p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_profile"("p_id" "uuid", "p_email" "text", "p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_profile"("p_id" "uuid", "p_email" "text", "p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_feature"("feature_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_feature"("feature_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_feature"("feature_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_subscription_level"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_subscription_level"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_subscription_level"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_user_activity_time"("p_user_id" "uuid", "p_seconds_active" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."record_user_activity_time"("p_user_id" "uuid", "p_seconds_active" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_user_activity_time"("p_user_id" "uuid", "p_seconds_active" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_engagement_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_engagement_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_engagement_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_company_member"("company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_company_member"("company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_company_member"("company_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."assessment_progress" TO "anon";
GRANT ALL ON TABLE "public"."assessment_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_progress" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."chat_history" TO "anon";
GRANT ALL ON TABLE "public"."chat_history" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_history" TO "service_role";



GRANT ALL ON TABLE "public"."code_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."code_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."code_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_documents" TO "anon";
GRANT ALL ON TABLE "public"."company_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."company_documents" TO "service_role";



GRANT ALL ON TABLE "public"."content_completions" TO "anon";
GRANT ALL ON TABLE "public"."content_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."content_completions" TO "service_role";



GRANT ALL ON TABLE "public"."content_items" TO "anon";
GRANT ALL ON TABLE "public"."content_items" TO "authenticated";
GRANT ALL ON TABLE "public"."content_items" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."emission_factors" TO "anon";
GRANT ALL ON TABLE "public"."emission_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."emission_factors" TO "service_role";



GRANT ALL ON TABLE "public"."hubspot_contacts" TO "anon";
GRANT ALL ON TABLE "public"."hubspot_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."hubspot_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."hubspot_integrations" TO "anon";
GRANT ALL ON TABLE "public"."hubspot_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."hubspot_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."hubspot_notes" TO "anon";
GRANT ALL ON TABLE "public"."hubspot_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."hubspot_notes" TO "service_role";



GRANT ALL ON TABLE "public"."module_completions" TO "anon";
GRANT ALL ON TABLE "public"."module_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."module_completions" TO "service_role";



GRANT ALL ON TABLE "public"."modules" TO "anon";
GRANT ALL ON TABLE "public"."modules" TO "authenticated";
GRANT ALL ON TABLE "public"."modules" TO "service_role";



GRANT ALL ON TABLE "public"."partner_commissions" TO "anon";
GRANT ALL ON TABLE "public"."partner_commissions" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_commissions" TO "service_role";



GRANT ALL ON TABLE "public"."point_transactions" TO "anon";
GRANT ALL ON TABLE "public"."point_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."point_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_codes" TO "anon";
GRANT ALL ON TABLE "public"."promotion_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_codes" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_answers" TO "anon";
GRANT ALL ON TABLE "public"."quiz_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_answers" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON TABLE "public"."rewards" TO "anon";
GRANT ALL ON TABLE "public"."rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."rewards" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."sustainability_opportunities" TO "anon";
GRANT ALL ON TABLE "public"."sustainability_opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."sustainability_opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."user_activities" TO "anon";
GRANT ALL ON TABLE "public"."user_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activities" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_engagement_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_engagement_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_engagement_stats" TO "service_role";



GRANT ALL ON TABLE "public"."user_enrollments" TO "anon";
GRANT ALL ON TABLE "public"."user_enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."user_enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."user_rewards" TO "anon";
GRANT ALL ON TABLE "public"."user_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."user_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."value_chains" TO "anon";
GRANT ALL ON TABLE "public"."value_chains" TO "authenticated";
GRANT ALL ON TABLE "public"."value_chains" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
