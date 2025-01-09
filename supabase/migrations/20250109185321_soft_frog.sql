/*
  # Create workout tracking tables

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `description` (text)
      - `created_at` (timestamptz)

    - `workout_exercises`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, references workouts)
      - `exercise_id` (uuid, references exercises)
      - `sets` (integer)
      - `reps` (integer)
      - `weight` (numeric)
      - `duration` (interval)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  type text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  sets integer,
  reps integer,
  weight numeric,
  duration interval,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for workouts
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  USING (auth.uid() = user_id);

-- Policies for exercises (globally readable)
CREATE POLICY "Exercises are readable by all authenticated users"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for workout_exercises
CREATE POLICY "Users can manage their own workout exercises"
  ON workout_exercises
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );