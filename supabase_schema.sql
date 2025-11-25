-- Enable UUID extension (optional, but good practice)
create extension if not exists "uuid-ossp";

-- Drop existing tables to ensure a clean slate (ORDER MATTERS due to foreign keys)
drop table if exists transactions cascade;
drop table if exists prescriptions cascade;
drop table if exists examinations cascade;
drop table if exists queue cascade;
drop table if exists patients cascade;
drop table if exists medicines cascade;
drop table if exists users cascade;

-- Users Table
create table users (
  id text primary key default uuid_generate_v4(),
  username text unique not null,
  password text not null,
  role text not null,
  name text not null
);

-- Patients Table
create table patients (
  id text primary key default uuid_generate_v4(),
  name text not null,
  age text,
  contact text,
  complaint text,
  "registeredAt" timestamptz
);

-- Queue Table
create table queue (
  id text primary key default uuid_generate_v4(),
  "patientId" text references patients(id),
  "patientName" text,
  status text,
  "joinedAt" timestamptz
);

-- Medicines Table
create table medicines (
  id text primary key default uuid_generate_v4(),
  name text not null,
  stock int default 0,
  unit text,
  price int default 0
);

-- Examinations Table
create table examinations (
  id text primary key default uuid_generate_v4(),
  "patientId" text references patients(id),
  "patientName" text,
  diagnosis text,
  notes text,
  "hasPrescription" boolean,
  date timestamptz
);

-- Prescriptions Table
create table prescriptions (
  id text primary key default uuid_generate_v4(),
  "patientId" text references patients(id),
  "patientName" text,
  medicines jsonb, -- Stores array of medicine objects
  status text
);

-- Transactions Table
create table transactions (
  id text primary key default uuid_generate_v4(),
  "patientId" text references patients(id),
  "patientName" text,
  amount int,
  method text,
  items jsonb, -- Stores array of item objects
  date timestamptz
);

-- Initial Data (from db.json)
insert into users (id, username, password, role, name) values
('admin', 'admin', '123', 'admin', 'Administrator'),
('doctor', 'doctor', '123', 'doctor', 'Dr. Sentosa'),
('pharmacy', 'pharmacy', '123', 'pharmacy', 'Apoteker');

insert into medicines (name, stock, unit, price) values
('Paracetamol 500mg', 102, 'Tablet', 5000),
('Amoxicillin 500mg', 42, 'Kapsul', 12000),
('Vitamin C', 200, 'Tablet', 2000),
('OBH Sirup', 18, 'Botol', 15000);

-- Note: For linked data like patients/queue/exams, we'd typically insert and retrieve IDs.
-- For simplicity in this SQL file, we'll let them generate new UUIDs if we were inserting fresh data.
-- But to keep the 'test-patient' logic working if needed, we can still insert specific IDs if we want,
-- or just rely on the app to create new ones.
-- Below are examples without hardcoded IDs (except users/medicines where we might want specific initial state).

