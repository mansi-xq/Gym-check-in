/*
  # Gym Tracker Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text, optional)
      - `share_code` (text, unique)
      - `created_at` (timestamp)
    
    - `checkins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `checked_in` (boolean)
      - `created_at` (timestamp)
    
    - `friends`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `friend_id` (uuid, foreign key)
      - `friend_name` (text)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `reminder_time` (text)
      - `notifications_enabled` (boolean)
      - `weekly_goal` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for friends to view each other's check-ins
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  share_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  checked_in boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_name text NOT NULL,
  status text DEFAULT 'accepted',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reminder_time text DEFAULT '18:00',
  notifications_enabled boolean DEFAULT false,
  weekly_goal integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow reading users by share_code for friend requests
CREATE POLICY "Users can be found by share_code"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Checkins policies
CREATE POLICY "Users can manage own checkins"
  ON checkins
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Friends can view each other's checkins
CREATE POLICY "Friends can view checkins"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT friend_id FROM friends 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Friends policies
CREATE POLICY "Users can manage own friendships"
  ON friends
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_users_share_code ON users(share_code);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;