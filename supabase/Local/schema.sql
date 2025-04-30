-- Création des tables
CREATE TABLE value_chains (
  id integer NOT NULL
);

CREATE TABLE quiz_answers (
  id integer NOT NULL
);

CREATE TABLE quiz_questions (
  id integer NOT NULL
);

CREATE TABLE rewards (
  id integer NOT NULL
);

CREATE TABLE subscription_plans (
  id integer NOT NULL
);

CREATE TABLE sustainability_opportunities (
  id integer NOT NULL
);

CREATE TABLE user_activities (
  id integer NOT NULL
);

CREATE TABLE user_badges (
  id integer NOT NULL
);

CREATE TABLE user_engagement_stats (
  id integer NOT NULL
);

CREATE TABLE user_enrollments (
  id integer NOT NULL
);

CREATE TABLE user_rewards (
  id integer NOT NULL
);

CREATE TABLE user_subscriptions (
  id integer NOT NULL
);

CREATE TABLE users (
  id integer NOT NULL,
  email character varying NOT NULL,
  password character varying NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
);

CREATE TABLE profiles (
  id integer NOT NULL,
  user_id integer,
  full_name character varying,
  avatar_url text,
  website_url text,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
);

CREATE TABLE projects (
  id integer NOT NULL,
  user_id integer,
  title character varying NOT NULL,
  description text,
  status character varying,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
);

CREATE TABLE tasks (
  id integer NOT NULL,
  project_id integer,
  title character varying NOT NULL,
  description text,
  status character varying,
  due_date date,
  assigned_to integer,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
);

CREATE TABLE comments (
  id integer NOT NULL,
  task_id integer,
  user_id integer,
  content text NOT NULL,
  created_at timestamp without time zone
);

CREATE TABLE assessment_progress (
  id integer NOT NULL
);

CREATE TABLE badges (
  id integer NOT NULL
);

CREATE TABLE certificates (
  id integer NOT NULL
);

CREATE TABLE chat_history (
  id integer NOT NULL
);

CREATE TABLE code_redemptions (
  id integer NOT NULL
);

CREATE TABLE companies (
  id integer NOT NULL
);

CREATE TABLE company_documents (
  id integer NOT NULL
);

CREATE TABLE content_completions (
  id integer NOT NULL
);

CREATE TABLE content_items (
  id integer NOT NULL
);

CREATE TABLE courses (
  id integer NOT NULL
);

CREATE TABLE emission_factors (
  id integer NOT NULL
);

CREATE TABLE hubspot_contacts (
  id integer NOT NULL
);

CREATE TABLE hubspot_integrations (
  id integer NOT NULL
);

CREATE TABLE hubspot_notes (
  id integer NOT NULL
);

CREATE TABLE module_completions (
  id integer NOT NULL
);

CREATE TABLE modules (
  id integer NOT NULL
);

CREATE TABLE partner_commissions (
  id integer NOT NULL
);

CREATE TABLE point_transactions (
  id integer NOT NULL
);

CREATE TABLE promotion_codes (
  id integer NOT NULL
);