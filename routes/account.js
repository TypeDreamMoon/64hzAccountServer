// routes/account.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { UserDatabase, ServerDatabase, BanDatabase } = require('../models');
const auth = require('../middleware/auth');
const banCheck = require('../middleware/ban');
const { validateUserName, validatePassword } = require('../utils/validators');
require("dotenv").config();

const router = express.Router();

// JWT 密钥
const SECRET = process.env.JWT_SECRET || process.env.SECRET;

// 登录限流：15 分钟内最多 10 次
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: '请求过于频繁，请稍后再试。'
  }
});

// 获取全局用户ID 并原子递增
async function getNextGlobalUid() {
  const result = await ServerDatabase.findOneAndUpdate(
    { server_name: 'account' },
    { $inc: { server_global_user_counter: 1 } },
    { new: true, upsert: true }
  );
  return result.server_global_user_counter;
}

/**
 * 注册新用户
 */
router.post('/register', async (req, res, next) => {
  try {
    const { user_name, user_password } = req.body;
    if (!user_name || !user_password) {
      return res.status(422).json({
        error: 'MISSING_FIELDS',
        message: '用户名和密码不能为空。'
      });
    }

    const userNameError = validateUserName(user_name);
    if (userNameError) {
      return res.status(422).json({ error: 'INVALID_USERNAME', message: userNameError });
    }

    const passwordError = validatePassword(user_password);
    if (passwordError) {
      return res.status(422).json({ error: 'INVALID_PASSWORD', message: passwordError });
    }

    const user_id = await getNextGlobalUid();
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const user = await UserDatabase.create({ user_name, user_password: hashedPassword, user_id });

    res.status(201).json({ message: '用户注册成功', user: { user_name: user.user_name, user_id: user.user_id } });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.user_name) {
      return res.status(422).json({ error: 'USERNAME_EXISTS', message: '用户名已存在。' });
    }
    next(err);
  }
});

/**
 * 用户登录
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { user_name, user_password } = req.body;
    if (!user_name || !user_password) {
      return res.status(422).json({ error: 'MISSING_FIELDS', message: '用户名和密码不能为空。' });
    }

    const userNameError = validateUserName(user_name);
    if (userNameError) {
      return res.status(422).json({ error: 'INVALID_USERNAME', message: userNameError });
    }
    const passwordError = validatePassword(user_password);
    if (passwordError) {
      return res.status(422).json({ error: 'INVALID_PASSWORD', message: passwordError });
    }

    const user = await UserDatabase.findOne({ user_name });
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在。' });
    }

    const match = await bcrypt.compare(user_password, user.user_password);
    if (!match) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: '用户名或密码错误。' });
    }

    const isBanned = await BanDatabase.exists({ user_id: user.user_id });
    if (isBanned) {
      return res.status(403).json({ error: 'USER_BANNED', message: '您的账号已被封禁。' });
    }

    const payload = { user_id: user.user_id, user_name: user.user_name };
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
});

/**
 * 获取当前用户信息
 */
router.get('/auth', auth, banCheck, (req, res) => {
  res.json({ user: req.user });
});

/**
 * 封禁用户
 */
router.post('/ban', auth, async (req, res, next) => {
  try {
    const { user_id, ban_reason, ban_time, unban_time } = req.body;
    if (!user_id || !ban_reason || !ban_time || !unban_time) {
      return res.status(422).json({ error: 'MISSING_FIELDS', message: 'user_id、ban_reason、ban_time、unban_time 均为必填。' });
    }

    const user = await UserDatabase.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: '未找到对应用户。' });
    }

    await BanDatabase.create({ user_id, ban_reason, ban_time: new Date(ban_time), unban_time: new Date(unban_time) });
    res.status(201).json({ message: '用户已封禁' });
  } catch (err) {
    next(err);
  }
});

/**
 * 解封用户
 */
router.delete('/ban/:user_id', auth, async (req, res, next) => {
  try {
    const uid = parseInt(req.params.user_id, 10);
    const result = await BanDatabase.deleteMany({ user_id: uid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'BAN_NOT_FOUND', message: '未找到封禁记录。' });
    }
    res.json({ message: '用户已解封' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
