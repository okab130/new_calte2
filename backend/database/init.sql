-- 医療カルテシステム データベース初期化スクリプト
-- PostgreSQL 14以降対応

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. 基本マスタテーブル
-- ==========================================

-- 施設マスタ
CREATE TABLE IF NOT EXISTS facilities (
    facility_id SERIAL PRIMARY KEY,
    facility_code VARCHAR(20) UNIQUE NOT NULL,
    facility_name VARCHAR(200) NOT NULL,
    postal_code VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 診療科マスタ
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_code VARCHAR(20) UNIQUE NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 職員マスタ
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    staff_code VARCHAR(20) UNIQUE NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name_kana VARCHAR(50),
    first_name_kana VARCHAR(50),
    department_id INT REFERENCES departments(department_id),
    position VARCHAR(50),
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ロールマスタ
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    staff_id INT REFERENCES staff(staff_id),
    role_id INT REFERENCES roles(role_id),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_count INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT
);

-- ==========================================
-- 2. 患者関連テーブル
-- ==========================================

-- 患者テーブル
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    patient_number VARCHAR(20) UNIQUE NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name_kana VARCHAR(50),
    first_name_kana VARCHAR(50),
    birth_date DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    postal_code VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(20),
    mobile_number VARCHAR(20),
    email VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    updated_by INT REFERENCES users(user_id),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 患者保険情報
CREATE TABLE IF NOT EXISTS patient_insurance (
    insurance_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    insurance_type VARCHAR(20) NOT NULL,
    insurance_number VARCHAR(50),
    insurer_name VARCHAR(100),
    valid_from DATE,
    valid_until DATE,
    coverage_ratio DECIMAL(3,2),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    updated_by INT REFERENCES users(user_id)
);

-- 患者アレルギー情報
CREATE TABLE IF NOT EXISTS patient_allergies (
    allergy_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    allergen_name VARCHAR(100) NOT NULL,
    allergen_type VARCHAR(50),
    severity VARCHAR(20),
    reaction TEXT,
    onset_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id)
);

-- ==========================================
-- 3. 診療関連テーブル
-- ==========================================

-- 来院記録
CREATE TABLE IF NOT EXISTS visits (
    visit_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    visit_date DATE NOT NULL,
    visit_time TIME,
    department_id INT REFERENCES departments(department_id),
    attending_doctor_id INT REFERENCES staff(staff_id),
    visit_type VARCHAR(20) CHECK (visit_type IN ('OUTPATIENT', 'EMERGENCY', 'SCHEDULED')),
    visit_status VARCHAR(20) DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    updated_by INT REFERENCES users(user_id)
);

-- カルテ記録
CREATE TABLE IF NOT EXISTS medical_records (
    record_id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visits(visit_id),
    patient_id INT REFERENCES patients(patient_id),
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    version INT DEFAULT 1,
    is_signed BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP,
    signed_by INT REFERENCES users(user_id),
    signature_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    updated_by INT REFERENCES users(user_id)
);

-- バイタルサイン
CREATE TABLE IF NOT EXISTS vital_signs (
    vital_id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visits(visit_id),
    patient_id INT REFERENCES patients(patient_id),
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    body_temperature DECIMAL(4,1),
    systolic_bp INT,
    diastolic_bp INT,
    pulse_rate INT,
    respiratory_rate INT,
    spo2 INT,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id)
);

-- ==========================================
-- 4. オーダー関連テーブル
-- ==========================================

-- 薬剤マスタ
CREATE TABLE IF NOT EXISTS medications (
    medication_id SERIAL PRIMARY KEY,
    medication_code VARCHAR(20) UNIQUE NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 処方オーダー
CREATE TABLE IF NOT EXISTS prescription_orders (
    order_id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visits(visit_id),
    patient_id INT REFERENCES patients(patient_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prescription_type VARCHAR(20) CHECK (prescription_type IN ('INTERNAL', 'EXTERNAL', 'INJECTION')),
    status VARCHAR(20) DEFAULT 'ORDERED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    updated_by INT REFERENCES users(user_id)
);

-- 処方明細
CREATE TABLE IF NOT EXISTS prescription_details (
    detail_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES prescription_orders(order_id),
    medication_id INT REFERENCES medications(medication_id),
    dosage DECIMAL(10,2),
    dosage_unit VARCHAR(20),
    frequency VARCHAR(50),
    duration_days INT,
    quantity DECIMAL(10,2),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. インデックス作成
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_patients_number ON patients(patient_number);
CREATE INDEX IF NOT EXISTS idx_patients_kana ON patients(last_name_kana, first_name_kana);
CREATE INDEX IF NOT EXISTS idx_patients_birth ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit ON medical_records(visit_id);
CREATE INDEX IF NOT EXISTS idx_prescription_orders_patient ON prescription_orders(patient_id);

-- ==========================================
-- 6. 初期データ投入
-- ==========================================

-- ロールの初期データ
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'システム管理者'),
('DOCTOR', '医師'),
('NURSE', '看護師'),
('CLERK', '医療事務'),
('PHARMACIST', '薬剤師')
ON CONFLICT (role_name) DO NOTHING;

-- 診療科の初期データ
INSERT INTO departments (department_code, department_name, display_order) VALUES
('INT', '内科', 1),
('SUR', '外科', 2),
('PED', '小児科', 3),
('OBS', '産婦人科', 4),
('ORT', '整形外科', 5)
ON CONFLICT (department_code) DO NOTHING;

-- 施設の初期データ
INSERT INTO facilities (facility_code, facility_name, postal_code, address, phone_number) VALUES
('MAIN', 'メディカルクリニック', '100-0001', '東京都千代田区千代田1-1-1', '03-1234-5678')
ON CONFLICT (facility_code) DO NOTHING;

-- デモ用職員データ
INSERT INTO staff (staff_code, last_name, first_name, last_name_kana, first_name_kana, department_id, position) VALUES
('DOC001', '山田', '太郎', 'ヤマダ', 'タロウ', 1, '医師'),
('NUR001', '佐藤', '花子', 'サトウ', 'ハナコ', 1, '看護師'),
('CLK001', '鈴木', '一郎', 'スズキ', 'イチロウ', 1, '医療事務')
ON CONFLICT (staff_code) DO NOTHING;

-- デモ用ユーザーデータ（パスワード: password123）
INSERT INTO users (username, password_hash, staff_id, role_id, email) VALUES
('doctor', '$2b$10$rKvWJe.xGZx8vYJ6YnxQqO5VWp7ZlQ7yMHxV4F8K9kGn6vZQxJyGS', 1, 2, 'doctor@example.com'),
('nurse', '$2b$10$rKvWJe.xGZx8vYJ6YnxQqO5VWp7ZlQ7yMHxV4F8K9kGn6vZQxJyGS', 2, 3, 'nurse@example.com'),
('clerk', '$2b$10$rKvWJe.xGZx8vYJ6YnxQqO5VWp7ZlQ7yMHxV4F8K9kGn6vZQxJyGS', 3, 4, 'clerk@example.com')
ON CONFLICT (username) DO NOTHING;

-- デモ用患者データ
INSERT INTO patients (patient_number, last_name, first_name, last_name_kana, first_name_kana, birth_date, gender, phone_number, created_by) VALUES
('000001', '山田', '太郎', 'ヤマダ', 'タロウ', '1980-01-01', 'M', '03-1234-5678', 1),
('000002', '佐藤', '花子', 'サトウ', 'ハナコ', '1975-05-15', 'F', '03-2345-6789', 1),
('000003', '鈴木', '一郎', 'スズキ', 'イチロウ', '1990-03-20', 'M', '03-3456-7890', 1),
('000004', '田中', '美咲', 'タナカ', 'ミサキ', '1988-07-12', 'F', '03-4567-8901', 1),
('000005', '高橋', '健太', 'タカハシ', 'ケンタ', '1995-11-08', 'M', '03-5678-9012', 1)
ON CONFLICT (patient_number) DO NOTHING;

-- デモ用薬剤データ
INSERT INTO medications (medication_code, medication_name, generic_name, dosage_form, strength, unit) VALUES
('MED001', 'カロナール錠200mg', 'アセトアミノフェン', '錠剤', '200', 'mg'),
('MED002', 'アモキシシリンカプセル250mg', 'アモキシシリン', 'カプセル', '250', 'mg'),
('MED003', 'ロキソニン錠60mg', 'ロキソプロフェン', '錠剤', '60', 'mg')
ON CONFLICT (medication_code) DO NOTHING;

-- 完了メッセージ
SELECT 'Database initialization completed successfully!' AS message;
