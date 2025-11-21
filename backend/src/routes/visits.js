const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 来院記録作成
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      visitDate,
      visitTime,
      departmentId,
      attendingDoctorId,
      visitType
    } = req.body;

    const result = await pool.query(
      `INSERT INTO visits (
        patient_id, visit_date, visit_time, department_id, 
        attending_doctor_id, visit_type, visit_status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'WAITING', $7)
      RETURNING *`,
      [patientId, visitDate, visitTime, departmentId, attendingDoctorId, visitType, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 患者の来院履歴取得
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT 
        v.*,
        d.department_name,
        s.last_name as doctor_last_name,
        s.first_name as doctor_first_name
      FROM visits v
      LEFT JOIN departments d ON v.department_id = d.department_id
      LEFT JOIN staff s ON v.attending_doctor_id = s.staff_id
      WHERE v.patient_id = $1
      ORDER BY v.visit_date DESC, v.visit_time DESC
      LIMIT 50`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 来院記録詳細
router.get('/:visitId', async (req, res) => {
  try {
    const { visitId } = req.params;

    const result = await pool.query(
      `SELECT 
        v.*,
        p.patient_number,
        p.last_name,
        p.first_name,
        p.birth_date,
        p.gender,
        d.department_name,
        s.last_name as doctor_last_name,
        s.first_name as doctor_first_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.patient_id
      LEFT JOIN departments d ON v.department_id = d.department_id
      LEFT JOIN staff s ON v.attending_doctor_id = s.staff_id
      WHERE v.visit_id = $1`,
      [visitId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: '来院記録が見つかりません', status: 404 } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 本日の来院一覧
router.get('/today/list', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        v.*,
        p.patient_number,
        p.last_name,
        p.first_name,
        p.last_name_kana,
        p.first_name_kana,
        d.department_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.patient_id
      LEFT JOIN departments d ON v.department_id = d.department_id
      WHERE v.visit_date = CURRENT_DATE
      ORDER BY v.visit_time`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get today visits error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

module.exports = router;
