const router = require('express').Router();
const ctrl = require('../controllers/agentController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, ctrl.chat);
router.get('/sessions', protect, ctrl.listSessions);
router.get('/sessions/:id', protect, ctrl.getSession);

module.exports = router;
