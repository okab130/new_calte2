const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// すべてのルートに認証を適用
router.use(authMiddleware);

// 患者検索
router.get('/search', async (req, res) => {
  try {
    const { 
      patientNumber, 
      lastNameKana, 
      firstNameKana, 
      birthDate, 
      phoneNumber,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT 
        patient_id,
        patient_number,
        last_name,
        first_name,
        last_name_kana,
        first_name_kana,
        birth_date,
        gender,
        phone_number,
        mobile_number,
        email,
        EXTRACT(YEAR FROM AGE(birth_date)) as age
      FROM patients
      WHERE is_deleted = FALSE
    `;
    
    const params = [];
    let paramCount = 0;

    if (patientNumber) {
      paramCount++;
      query += ` AND patient_number = $${paramCount}`;
      params.push(patientNumber);
    }

    if (lastNameKana) {
      paramCount++;
      query += ` AND last_name_kana LIKE $${paramCount}`;
      params.push(`${lastNameKana}%`);
    }

    if (firstNameKana) {
      paramCount++;
      query += ` AND first_name_kana LIKE $${paramCount}`;
      params.push(`${firstNameKana}%`);
    }

    if (birthDate) {
      paramCount++;
      query += ` AND birth_date = $${paramCount}`;
      params.push(birthDate);
    }

    if (phoneNumber) {
      paramCount++;
      query += ` AND (phone_number LIKE $${paramCount} OR mobile_number LIKE $${paramCount})`;
      params.push(`%${phoneNumber.replace(/-/g, '')}%`);
    }

    query += ` ORDER BY patient_number LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      patients: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Patient search error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 患者詳細取得
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT 
        p.*,
        EXTRACT(YEAR FROM AGE(p.birth_date)) as age,
        pi.insurance_type,
        pi.insurance_number,
        pi.insurer_name,
        pi.coverage_ratio
      FROM patients p
      LEFT JOIN patient_insurance pi ON p.patient_id = pi.patient_id AND pi.is_primary = TRUE
      WHERE p.patient_id = $1 AND p.is_deleted = FALSE`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: '患者が見つかりません', status: 404 } });
    }

    // アレルギー情報取得
    const allergies = await pool.query(
      `SELECT * FROM patient_allergies 
       WHERE patient_id = $1 
       ORDER BY created_at DESC`,
      [patientId]
    );

    const patient = result.rows[0];
    patient.allergies = allergies.rows;

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 患者新規登録
router.post('/',
  [
    body('lastName').notEmpty().withMessage('姓は必須です'),
    body('firstName').notEmpty().withMessage('名は必須です'),
    body('birthDate').isDate().withMessage('正しい生年月日を入力してください'),
    body('gender').isIn(['M', 'F', 'O']).withMessage('性別を選択してください')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        birthDate,
        gender,
        postalCode,
        address,
        phoneNumber,
        mobileNumber,
        email,
        emergencyContactName,
        emergencyContactPhone
      } = req.body;

      // 患者番号を自動生成
      const lastPatientResult = await pool.query(
        'SELECT patient_number FROM patients ORDER BY patient_id DESC LIMIT 1'
      );

      let newPatientNumber = '000001';
      if (lastPatientResult.rows.length > 0) {
        const lastNumber = parseInt(lastPatientResult.rows[0].patient_number);
        newPatientNumber = String(lastNumber + 1).padStart(6, '0');
      }

      const result = await pool.query(
        `INSERT INTO patients (
          patient_number, last_name, first_name, last_name_kana, first_name_kana,
          birth_date, gender, postal_code, address, phone_number, mobile_number,
          email, emergency_contact_name, emergency_contact_phone, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          newPatientNumber, lastName, firstName, lastNameKana, firstNameKana,
          birthDate, gender, postalCode, address, phoneNumber, mobileNumber,
          email, emergencyContactName, emergencyContactPhone, req.user.userId
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
    }
  }
);

// 患者情報更新
router.put('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      postalCode,
      address,
      phoneNumber,
      mobileNumber,
      email,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    const result = await pool.query(
      `UPDATE patients SET
        last_name = COALESCE($1, last_name),
        first_name = COALESCE($2, first_name),
        last_name_kana = COALESCE($3, last_name_kana),
        first_name_kana = COALESCE($4, first_name_kana),
        postal_code = COALESCE($5, postal_code),
        address = COALESCE($6, address),
        phone_number = COALESCE($7, phone_number),
        mobile_number = COALESCE($8, mobile_number),
        email = COALESCE($9, email),
        emergency_contact_name = COALESCE($10, emergency_contact_name),
        emergency_contact_phone = COALESCE($11, emergency_contact_phone),
        updated_by = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $13 AND is_deleted = FALSE
      RETURNING *`,
      [
        lastName, firstName, lastNameKana, firstNameKana,
        postalCode, address, phoneNumber, mobileNumber,
        email, emergencyContactName, emergencyContactPhone,
        req.user.userId, patientId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: '患者が見つかりません', status: 404 } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

module.exports = router;
