const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.use(authMiddleware);

// カルテ作成・更新
router.post('/', checkRole('DOCTOR'), async (req, res) => {
  try {
    const {
      visitId,
      patientId,
      subjective,
      objective,
      assessment,
      plan
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_records (
        visit_id, patient_id, subjective, objective, 
        assessment, plan, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [visitId, patientId, subjective, objective, assessment, plan, req.user.userId, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// カルテ署名
router.post('/:recordId/sign', checkRole('DOCTOR'), async (req, res) => {
  try {
    const { recordId } = req.params;

    const result = await pool.query(
      `UPDATE medical_records SET
        is_signed = TRUE,
        signed_at = CURRENT_TIMESTAMP,
        signed_by = $1,
        signature_data = $2
      WHERE record_id = $3 AND is_signed = FALSE
      RETURNING *`,
      [req.user.userId, 'DIGITAL_SIGNATURE', recordId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'カルテが見つかりません、または既に署名済みです', status: 404 } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sign medical record error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 患者のカルテ一覧
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT 
        mr.*,
        v.visit_date,
        s.last_name as doctor_last_name,
        s.first_name as doctor_first_name
      FROM medical_records mr
      JOIN visits v ON mr.visit_id = v.visit_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      LEFT JOIN staff s ON u.staff_id = s.staff_id
      WHERE mr.patient_id = $1
      ORDER BY mr.record_date DESC
      LIMIT 50`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// カルテ詳細
router.get('/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;

    const result = await pool.query(
      `SELECT 
        mr.*,
        p.patient_number,
        p.last_name,
        p.first_name,
        v.visit_date,
        s.last_name as doctor_last_name,
        s.first_name as doctor_first_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      JOIN visits v ON mr.visit_id = v.visit_id
      LEFT JOIN users u ON mr.created_by = u.user_id
      LEFT JOIN staff s ON u.staff_id = s.staff_id
      WHERE mr.record_id = $1`,
      [recordId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'カルテが見つかりません', status: 404 } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

module.exports = router;
