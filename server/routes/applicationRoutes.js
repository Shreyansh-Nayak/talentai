const router  = require('express').Router();
const ctrl    = require('../controllers/applicationController');
const { protect, restrict } = require('../middleware/auth');

// Seeker routes
router.post('/',     protect, restrict('seeker'),   ctrl.applyToJob);
router.get('/my',    protect, restrict('seeker'),   ctrl.getMyApplications);

// Employer routes
router.get('/employer/all',      protect, restrict('employer'), ctrl.getAllEmployerApplications);
router.get('/job/:jobId',        protect, restrict('employer'), ctrl.getJobApplications);
router.patch('/:id/status',      protect, restrict('employer'), ctrl.updateApplicationStatus);

module.exports = router;