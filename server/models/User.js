const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },
  role:     { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  profile: {
    bio:        { type: String },
    location:   { type: String },
    skills:     [String],
    resumeURL:  { type: String },
    linkedinURL:{ type: String },
    githubURL:  { type: String },
    portfolioURL:{ type: String },
    title:      { type: String },
    experience: { type: Number },
    salary: {
      min: { type: Number },
      max: { type: Number },
    },
    jobTypes:   [String],
    education: [{
      degree:  String,
      school:  String,
      year:    String,
    }],
    experienceList: [{
      role:        String,
      company:     String,
      duration:    String,
      description: String,
    }],
  },
  savedJobs:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true  },
  resetToken:   { type: String  },
  resetExpiry:  { type: Date    },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);