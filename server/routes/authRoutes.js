const router  = require('express').Router();
const ctrl    = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',             ctrl.register);
router.post('/login',                ctrl.login);
router.post('/forgot-password',      ctrl.forgotPassword);
router.patch('/reset-password/:token', ctrl.resetPassword);
router.get('/me',    protect, ctrl.getMe);
router.patch('/me',  protect, ctrl.updateProfile);

module.exports = router;
