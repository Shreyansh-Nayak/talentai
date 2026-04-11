const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  logo:        { type: String },
  website:     { type: String },
  location:    { type: String },
  size:        { type: String, enum: ['1-10','11-50','51-200','201-500','500+'] },
  industry:    { type: String },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobsPosted:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isVerified:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);