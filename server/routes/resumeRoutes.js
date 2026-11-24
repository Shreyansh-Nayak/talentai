const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/resumeController');
const { protect, restrict } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', protect, restrict('seeker'), upload.single('resume'), ctrl.uploadMyResume);
router.get('/my-url', protect, restrict('seeker'), ctrl.getMyResumeUrl);
router.delete('/', protect, restrict('seeker'), ctrl.deleteMyResume);
router.get('/application/:applicationId', protect, restrict('employer'), ctrl.getApplicantResumeUrl);
router.get('/my-text', protect, restrict('seeker'), ctrl.getMyResumeText);

module.exports = router;