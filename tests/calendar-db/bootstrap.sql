
-- Disposable PostgreSQL 17 fixture. NEVER use on Club Control LIVE.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE SCHEMA auth;
CREATE SCHEMA private;
CREATE SCHEMA extensions;
CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE auth.users(id uuid PRIMARY KEY,deleted_at timestamptz,is_anonymous boolean NOT NULL DEFAULT false,banned_until timestamptz);
CREATE TABLE public.teams(id uuid PRIMARY KEY,name text);
CREATE TABLE public.players(id uuid PRIMARY KEY,auth_user_id uuid,active boolean NOT NULL);
CREATE TABLE public.team_memberships(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),player_id uuid,team_id uuid,active boolean NOT NULL,starts_on date NOT NULL,ends_on date);
CREATE TABLE public.events(id uuid PRIMARY KEY,team_id uuid,event_type text,title text,starts_at timestamptz,ends_at timestamptz,venue text,address text,court text,meeting_at timestamptz,meeting_place text,status text,updated_at timestamptz,created_at timestamptz);
CREATE TABLE public.availability(player_id uuid,event_id uuid,status text);
INSERT INTO auth.users(id) VALUES ('00000000-0000-4000-8000-000000000101'),('00000000-0000-4000-8000-000000000102');
INSERT INTO public.teams(id,name) VALUES ('00000000-0000-4000-8000-000000000301','BEAC Női I'),('00000000-0000-4000-8000-000000000302','BEAC Női II');
INSERT INTO public.players(id,auth_user_id,active) VALUES
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000101',true),
('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000102',true);
INSERT INTO public.team_memberships(player_id,team_id,active,starts_on) VALUES
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000301',true,'2026-01-01'),
('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000302',true,'2026-01-01');
INSERT INTO public.events(id,team_id,event_type,title,starts_at,ends_at,venue,address,court,status,updated_at,created_at) VALUES
('00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000301','training','A edzés','2026-10-30 18:00+01','2026-10-30 20:00+01','Bogdánfy','Budapest','1','active',now(),now()),
('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000302','match','B meccs','2026-10-31 18:00+01',NULL,'Vendég','Budapest',NULL,'active',now(),now()),
('00000000-0000-4000-8000-000000000403','00000000-0000-4000-8000-000000000301','training','A lemondott','2026-11-01 18:00+01',NULL,'Bogdánfy','Budapest','2','cancelled',now(),now()),
('00000000-0000-4000-8000-000000000404','00000000-0000-4000-8000-000000000301','training','A ismeretlen','2026-11-02 18:00+01',NULL,'Bogdánfy','Budapest','2','active',now(),now()),
('00000000-0000-4000-8000-000000000405','00000000-0000-4000-8000-000000000301','match','A archív','2026-10-01 18:00+02',NULL,'Bogdánfy','Budapest','2','archived',now(),now());
INSERT INTO public.availability(player_id,event_id,status) VALUES
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000401','going'),
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000402','not_going'),
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000403','going'),
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000404','unknown'),
('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000402','going');
