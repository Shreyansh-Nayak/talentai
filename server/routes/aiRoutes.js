const router  = require('express').Router();
const ctrl    = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/ats-score',      protect, ctrl.atsScore);
router.post('/enhance-resume', protect, ctrl.enhanceResume);
router.post('/interview-prep', protect, ctrl.interviewPrep);
router.post('/generate-jd',    protect, ctrl.generateJD);
router.post('/job-match',      protect, ctrl.jobMatch);

module.exports = router;