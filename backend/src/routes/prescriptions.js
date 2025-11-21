const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.use(authMiddleware);

// 処方オーダー作成
router.post('/', checkRole('DOCTOR'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      visitId,
      patientId,
      prescriptionType,
      medications,
      notes
    } = req.body;

    // 処方オーダー作成
    const orderResult = await client.query(
      `INSERT INTO prescription_orders (
        visit_id, patient_id, prescription_type, notes, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [visitId, patientId, prescriptionType, notes, req.user.userId, req.user.userId]
    );

    const orderId = orderResult.rows[0].order_id;

    // 処方明細作成
    for (const med of medications) {
      await client.query(
        `INSERT INTO prescription_details (
          order_id, medication_id, dosage, dosage_unit, 
          frequency, duration_days, quantity, instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          med.medicationId,
          med.dosage,
          med.dosageUnit,
          med.frequency,
          med.durationDays,
          med.quantity,
          med.instructions
        ]
      );
    }

    await client.query('COMMIT');

    // 作成した処方オーダーを取得
    const result = await pool.query(
      `SELECT 
        po.*,
        pd.detail_id,
        pd.medication_id,
        m.medication_name,
        pd.dosage,
        pd.dosage_unit,
        pd.frequency,
        pd.duration_days,
        pd.quantity,
        pd.instructions
      FROM prescription_orders po
      LEFT JOIN prescription_details pd ON po.order_id = pd.order_id
      LEFT JOIN medications m ON pd.medication_id = m.medication_id
      WHERE po.order_id = $1`,
      [orderId]
    );

    res.status(201).json({
      order: orderResult.rows[0],
      details: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create prescription error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  } finally {
    client.release();
  }
});

// 患者の処方履歴
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT 
        po.*,
        v.visit_date,
        s.last_name as doctor_last_name,
        s.first_name as doctor_first_name
      FROM prescription_orders po
      JOIN visits v ON po.visit_id = v.visit_id
      LEFT JOIN users u ON po.created_by = u.user_id
      LEFT JOIN staff s ON u.staff_id = s.staff_id
      WHERE po.patient_id = $1
      ORDER BY po.order_date DESC
      LIMIT 50`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 処方オーダー詳細
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await pool.query(
      `SELECT 
        po.*,
        p.patient_number,
        p.last_name,
        p.first_name,
        v.visit_date
      FROM prescription_orders po
      JOIN patients p ON po.patient_id = p.patient_id
      JOIN visits v ON po.visit_id = v.visit_id
      WHERE po.order_id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: { message: '処方オーダーが見つかりません', status: 404 } });
    }

    const detailsResult = await pool.query(
      `SELECT 
        pd.*,
        m.medication_name,
        m.generic_name,
        m.dosage_form,
        m.strength,
        m.unit
      FROM prescription_details pd
      JOIN medications m ON pd.medication_id = m.medication_id
      WHERE pd.order_id = $1`,
      [orderId]
    );

    res.json({
      order: orderResult.rows[0],
      details: detailsResult.rows
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

// 薬剤検索
router.get('/medications/search', async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;

    let query = `
      SELECT * FROM medications 
      WHERE is_deleted = FALSE
    `;
    const params = [];

    if (keyword) {
      query += ` AND (medication_name LIKE $1 OR generic_name LIKE $1)`;
      params.push(`%${keyword}%`);
    }

    query += ` ORDER BY medication_name LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Search medications error:', error);
    res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
  }
});

module.exports = router;
