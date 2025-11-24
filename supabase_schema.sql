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
  id text primary key,
  username text unique not null,
  password text not null,
  role text not null,
  name text not null
);

-- Patients Table
create table patients (
  id text primary key,
  name text not null,
  age text,
  contact text,
  complaint text,
  "registeredAt" timestamptz
);

-- Queue Table
create table queue (
  id text primary key,
  "patientId" text references patients(id),
  "patientName" text,
  status text,
  "joinedAt" timestamptz
);

-- Medicines Table
create table medicines (
  id text primary key,
  name text not null,
  stock int default 0,
  unit text,
  price int default 0
);

-- Examinations Table
create table examinations (
  id text primary key,
  "patientId" text references patients(id),
  "patientName" text,
  diagnosis text,
  notes text,
  "hasPrescription" boolean,
  date timestamptz
);

-- Prescriptions Table
create table prescriptions (
  id text primary key,
  "patientId" text references patients(id),
  "patientName" text,
  medicines jsonb, -- Stores array of medicine objects
  status text
);

-- Transactions Table
create table transactions (
  id text primary key,
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

insert into medicines (id, name, stock, unit, price) values
('1', 'Paracetamol 500mg', 102, 'Tablet', 5000),
('2', 'Amoxicillin 500mg', 42, 'Kapsul', 12000),
('3', 'Vitamin C', 200, 'Tablet', 2000),
('4', 'OBH Sirup', 18, 'Botol', 15000);

insert into patients (id, name, age, contact, complaint, "registeredAt") values
('1763608123833', 'marcel', '25', '213123', 'batuk-batuk', '2025-11-20T03:08:43.833Z'),
('1763670737703', 'shadow', '25', '123123', 'sakit pinggang', '2025-11-20T20:32:17.703Z'),
('1763671565361', 'varel', '19', '12312', 'waw', '2025-11-20T20:46:05.361Z'),
('1763672048626', 'venal', '21', '213132', 'wadadwa', '2025-11-20T20:54:08.626Z'),
('1763672384151', 'bam', '18', '123123', 'wadad', '2025-11-20T20:59:44.151Z'),
('test-patient-1', 'Budi Santoso', '45', '08123456789', 'Demam tinggi dan pusing', '2025-11-21T08:00:00.000Z'),
('test-patient-2', 'Siti Aminah', '30', '081234567890', 'Sakit Kepala', '2025-11-21T09:00:00.000Z');

insert into queue (id, "patientId", "patientName", status, "joinedAt") values
('1763608123843', '1763608123833', 'marcel', 'completed', '2025-11-20T03:08:43.843Z'),
('1763670737714', '1763670737703', 'shadow', 'completed', '2025-11-20T20:32:17.714Z'),
('1763671565370', '1763671565361', 'varel', 'completed', '2025-11-20T20:46:05.370Z'),
('1763672048634', '1763672048626', 'venal', 'completed', '2025-11-20T20:54:08.634Z'),
('1763672384163', '1763672384151', 'bam', 'completed', '2025-11-20T20:59:44.163Z'),
('test-queue-1', 'test-patient-1', 'Budi Santoso', 'completed', '2025-11-21T08:00:00.000Z'),
('test-queue-2', 'test-patient-2', 'Siti Aminah', 'examining', '2025-11-21T09:00:00.000Z');

insert into examinations (id, "patientId", "patientName", diagnosis, notes, "hasPrescription", date) values
('1763625290646', '1763608123833', 'marcel', 'flu', 'banyak istirahat', false, '2025-11-20T07:54:50.646Z'),
('1763670796119', '1763670737703', 'shadow', 'tulang belakang patah', 'harus operasi', true, '2025-11-20T20:33:16.119Z'),
('1763671863005', '1763671565361', 'varel', 'ewew', 'awaw', false, '2025-11-20T20:51:03.005Z'),
('1763672064005', '1763672048626', 'venal', 'awd', 'awd', false, '2025-11-20T20:54:24.005Z'),
('1763672406403', '1763672384151', 'bam', 'awda', 'adwaw', true, '2025-11-20T21:00:06.403Z'),
('1763723730415', 'test-patient-1', 'Budi Santoso', 'waw', '123', false, '2025-11-21T11:15:30.415Z');

insert into prescriptions (id, "patientId", "patientName", medicines, status) values
('1763670796139', '1763670737703', 'shadow', '[{"id": "2", "name": "Amoxicillin 500mg", "dosage": "1x1", "amount": "5"}]', 'completed'),
('1763672406420', '1763672384151', 'bam', '[{"id": "2", "name": "Amoxicillin 500mg", "dosage": "2", "amount": "3"}, {"id": "4", "name": "OBH Sirup", "dosage": "321", "amount": "2"}]', 'completed');

insert into transactions (id, "patientId", "patientName", amount, method, items, date) values
('1763625318279', '1763608123833', 'marcel', 50000, 'Tunai', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 0}]', '2025-11-20T07:55:18.279Z'),
('1763670856156', '1763670737703', 'shadow', 65000, 'Tunai', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 15000}]', '2025-11-20T20:34:16.156Z'),
('1763672013526', '1763671565361', 'varel', 50000, 'QRIS', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 0}]', '2025-11-20T20:53:33.526Z'),
('1763672338453', '1763672048626', 'venal', 50000, 'Debit', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 0}]', '2025-11-20T20:58:58.453Z'),
('1763672443044', '1763672384151', 'bam', 80000, 'Tunai', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 30000}]', '2025-11-20T21:00:43.044Z'),
('1763724499625', 'test-patient-1', 'Budi Santoso', 50000, 'Tunai', '[{"name": "Jasa Pemeriksaan", "amount": 50000}, {"name": "Obat-obatan", "amount": 0}]', '2025-11-21T11:28:19.625Z');
