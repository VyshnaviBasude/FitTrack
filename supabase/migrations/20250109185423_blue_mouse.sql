/*
  # Create nutrition tracking tables

  1. New Tables
    - `meals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `date` (date)
      - `meal_type` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `food_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `calories` (integer)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `created_at` (timestamptz)

    - `meal_foods`
      - `id` (uuid, primary key)
      - `meal_id` (uuid, references meals)
      - `food_id` (uuid, references food_items)
      - `serving_size` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories integer NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meal_foods table
CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  food_id uuid REFERENCES food_items(id) NOT NULL,
  serving_size numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can manage their own meals"
  ON meals
  USING (auth.uid() = user_id);

-- Policies for food_items (globally readable)
CREATE POLICY "Food items are readable by all authenticated users"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for meal_foods
CREATE POLICY "Users can manage their own meal foods"
  ON meal_foods
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_foods.meal_id
      AND meals.user_id = auth.uid()
    )
  );