const router  = require('express').Router();
const ctrl    = require('../controllers/jobController');
const { protect, restrict } = require('../middleware/auth');

router.get('/',       ctrl.getAllJobs);
router.get('/my',     protect, restrict('employer'), ctrl.getMyJobs);
router.get('/:id',    ctrl.getJob);
router.post('/',      protect, restrict('employer','admin'), ctrl.createJob);
router.put('/:id',    protect, restrict('employer','admin'), ctrl.updateJob);
router.delete('/:id', protect, restrict('employer','admin'), ctrl.deleteJob);

module.exports = router;