const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// ログイン
router.post('/login',
  [
    body('username').notEmpty().withMessage('ユーザー名は必須です'),
    body('password').notEmpty().withMessage('パスワードは必須です')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // ユーザー検索
      const userResult = await pool.query(
        `SELECT u.*, r.role_name, s.last_name, s.first_name 
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.role_id
         LEFT JOIN staff s ON u.staff_id = s.staff_id
         WHERE u.username = $1 AND u.is_active = TRUE`,
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: { message: 'ユーザー名またはパスワードが正しくありません', status: 401 } });
      }

      const user = userResult.rows[0];

      // アカウントロックチェック
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(403).json({ 
          error: { 
            message: 'アカウントがロックされています。しばらくしてから再試行してください。', 
            status: 403 
          } 
        });
      }

      // パスワード検証
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        // ログイン失敗回数を増やす
        const failedCount = user.failed_login_count + 1;
        const lockUntil = failedCount >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

        await pool.query(
          'UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE user_id = $3',
          [failedCount, lockUntil, user.user_id]
        );

        return res.status(401).json({ error: { message: 'ユーザー名またはパスワードが正しくありません', status: 401 } });
      }

      // ログイン成功 - 失敗カウントリセット、最終ログイン更新
      await pool.query(
        'UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );

      // JWTトークン生成
      const token = jwt.sign(
        {
          userId: user.user_id,
          username: user.username,
          role: user.role_name,
          staffId: user.staff_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        token,
        user: {
          userId: user.user_id,
          username: user.username,
          role: user.role_name,
          lastName: user.last_name,
          firstName: user.first_name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: { message: 'サーバーエラーが発生しました', status: 500 } });
    }
  }
);

// トークン検証
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: { message: '認証トークンが必要です', status: 401 } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ユーザー情報を再取得
    const userResult = await pool.query(
      `SELECT u.*, r.role_name, s.last_name, s.first_name 
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN staff s ON u.staff_id = s.staff_id
       WHERE u.user_id = $1 AND u.is_active = TRUE`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: { message: 'ユーザーが見つかりません', status: 401 } });
    }

    const user = userResult.rows[0];

    res.json({
      valid: true,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role_name,
        lastName: user.last_name,
        firstName: user.first_name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ error: { message: '無効なトークンです', status: 401 } });
  }
});

module.exports = router;
