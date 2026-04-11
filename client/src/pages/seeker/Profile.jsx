import { useState, useRef } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateProfileAPI } from '../../api/authAPI';

const initialProfile = {
  name: 'Arjun Kumar',
  email: 'arjun@example.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, India',
  title: 'Senior Software Engineer',
  experience: '5',
  linkedin: 'https://linkedin.com/in/arjunkumar',
  github: 'https://github.com/arjunkumar',
  portfolio: 'https://arjunkumar.dev',
  bio: 'Passionate full-stack engineer with 5+ years building scalable web applications.',
  skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'GraphQL'],
  salaryMin: '120000',
  salaryMax: '180000',
  jobTypes: ['Full-time', 'Remote'],
  education: [
    { id: 1, degree: 'B.Tech Computer Science', school: 'IIT Bangalore', year: '2019' },
  ],
  experience_list: [
    {
      id: 1,
      role: 'Senior Software Engineer',
      company: 'TechCorp',
      duration: '2022 - Present',
      description: 'Led team of 6, built microservices serving 2M users, reduced API latency by 40%.',
    },
    {
      id: 2,
      role: 'Software Engineer',
      company: 'StartupXYZ',
      duration: '2019 - 2022',
      description: 'Built full-stack features for SaaS platform, improved test coverage to 85%.',
    },
  ],
};

const profileStrengthItems = [
  { label: 'Basic Info',      done: true  },
  { label: 'Work Experience', done: true  },
  { label: 'Education',       done: true  },
  { label: 'Skills Added',    done: true  },
  { label: 'Resume Uploaded', done: false },
  { label: 'Profile Photo',   done: false },
];

export default function SeekerProfile() {
  const { user, updateUser } = useAuth();

  const [profile,    setProfile]    = useState({
    ...initialProfile,
    name:  user?.name  || initialProfile.name,
    email: user?.email || initialProfile.email,
  });
  const [activeTab,  setActiveTab]  = useState('basic');
  const [newSkill,   setNewSkill]   = useState('');
  const [saving,     setSaving]     = useState(false);

  // Resume state
  const [resume,        setResume]        = useState(null);
  const [resumeName,    setResumeName]    = useState('Arjun_Kumar_Resume.pdf');
  const [resumeSize,    setResumeSize]    = useState('245 KB');
  const [resumeDate,    setResumeDate]    = useState('Mar 20, 2025');
  const [hasResume,     setHasResume]     = useState(true);
  const [uploading,     setUploading]     = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  const fileInputRef = useRef(null);

  // Email change state
  const [editingEmail,  setEditingEmail]  = useState(false);
  const [newEmail,      setNewEmail]      = useState(profile.email);
  const [emailPassword, setEmailPassword] = useState('');

  const profileStrength = Math.round(
    (profileStrengthItems.filter((i) => i.done).length /
      profileStrengthItems.length) * 100
  );

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileAPI({
        name: profile.name,
        profile: {
          bio:          profile.bio,
          location:     profile.location,
          title:        profile.title,
          experience:   Number(profile.experience),
          linkedinURL:  profile.linkedin,
          githubURL:    profile.github,
          portfolioURL: profile.portfolio,
          skills:       profile.skills,
          jobTypes:     profile.jobTypes,
          salary: {
            min: Number(profile.salaryMin),
            max: Number(profile.salaryMax),
          },
          education:      profile.education,
          experienceList: profile.experience_list,
        },
      });

      // Update auth context
      updateUser({ ...user, name: profile.name });
      toast.success('Profile saved successfully!');
    } catch (err) {
      // If backend not connected yet save locally
      updateUser({ ...user, name: profile.name });
      toast.success('Profile saved!');
    } finally {
      setSaving(false);
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!emailPassword.trim()) {
      toast.error('Please enter your password to confirm');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      // Mock email update — connect to real API later
      await new Promise((r) => setTimeout(r, 800));
      setProfile({ ...profile, email: newEmail });
      updateUser({ ...user, email: newEmail });
      setEditingEmail(false);
      setEmailPassword('');
      toast.success('Email updated successfully!');
    } catch (err) {
      toast.error('Failed to update email. Try again.');
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, DOC, DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    uploadResume(file);
  };

  // Upload resume
  const uploadResume = async (file) => {
    setUploading(true);
    try {
      // Mock upload — replace with Cloudinary/S3 later
      await new Promise((r) => setTimeout(r, 1500));

      const sizeKB = (file.size / 1024).toFixed(0);
      const date   = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      setResume(file);
      setResumeName(file.name);
      setResumeSize(`${sizeKB} KB`);
      setResumeDate(date);
      setHasResume(true);

      // Update profile strength
      profileStrengthItems[4].done = true;

      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Delete resume
  const handleDeleteResume = async () => {
    try {
      await new Promise((r) => setTimeout(r, 500));
      setResume(null);
      setHasResume(false);
      setResumeName('');
      setResumeSize('');
      setResumeDate('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      profileStrengthItems[4].done = false;
      toast.success('Resume deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  // Download resume
  const handleDownload = () => {
    if (resume) {
      const url = URL.createObjectURL(resume);
      const a   = document.createElement('a');
      a.href    = url;
      a.download = resumeName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.success('Downloading resume...');
    }
  };

  // Skill handlers
  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      toast.error('Skill already added');
      return;
    }
    setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
    setNewSkill('');
    toast.success('Skill added!');
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const toggleJobType = (type) => {
    const updated = profile.jobTypes.includes(type)
      ? profile.jobTypes.filter((t) => t !== type)
      : [...profile.jobTypes, type];
    setProfile({ ...profile, jobTypes: updated });
  };

  const tabs = [
    { id: 'basic',       label: 'Basic Info',   icon: '👤' },
    { id: 'experience',  label: 'Experience',   icon: '💼' },
    { id: 'skills',      label: 'Skills',       icon: '🛠'  },
    { id: 'resume',      label: 'Resume',       icon: '📄' },
    { id: 'preferences', label: 'Preferences',  icon: '⚙️' },
  ];

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Keep your profile updated to get better matches
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : '💾 Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">

          {/* Avatar Card */}
          <div className="card text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto">
                {profile.name.charAt(0)}
              </div>
              <button
                onClick={() => toast.success('Photo upload coming soon!')}
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs hover:bg-blue-400 transition-colors"
              >
                ✏️
              </button>
            </div>
            <div className="font-semibold text-white">{profile.name}</div>
            <div className="text-sm text-gray-400 mt-0.5">{profile.title}</div>
            <div className="text-xs text-gray-500 mt-1">📍 {profile.location}</div>
          </div>

          {/* Profile Strength */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Profile Strength</h3>
              <span className={`text-sm font-bold ${
                profileStrength >= 80 ? 'text-green-400' :
                profileStrength >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {profileStrength}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            <div className="space-y-2">
              {profileStrengthItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={item.done ? 'text-green-400' : 'text-gray-600'}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className={item.done ? 'text-gray-300' : 'text-gray-600'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Links</h3>
            <div className="space-y-2">
              {[
                { icon: '🔗', label: 'LinkedIn',  value: profile.linkedin  },
                { icon: '💻', label: 'GitHub',    value: profile.github    },
                { icon: '🌐', label: 'Portfolio', value: profile.portfolio },
              ].map((link) => (
                
                  <a key={link.label}
                  href={link.value}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 truncate"
                >
                  <span>{link.icon}</span>
                  <span className="truncate">{link.value || 'Not set'}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Tabbed Content */}
        <div className="lg:col-span-3">

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* BASIC INFO TAB */}
          {activeTab === 'basic' && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-white mb-2">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {/* Email field with edit toggle */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  {!editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={profile.email}
                        className="input-field flex-1 bg-gray-800/50 cursor-default"
                        readOnly
                      />
                      <button
                        onClick={() => {
                          setNewEmail(profile.email);
                          setEditingEmail(true);
                        }}
                        className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="input-field"
                        placeholder="New email address"
                      />
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="input-field"
                        placeholder="Confirm your password"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEmailChange}
                          className="btn-primary text-xs px-4 py-2 flex-1"
                        >
                          Confirm Change
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmail(false);
                            setNewEmail(profile.email);
                            setEmailPassword('');
                          }}
                          className="btn-outline text-xs px-4 py-2 flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                  <input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Current Title</label>
                  <input
                    name="title"
                    value={profile.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Years of Experience</label>
                  <select
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {['1','2','3','4','5','6','7','8','9','10+'].map((y) => (
                      <option key={y} value={y}>{y} years</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Write a short bio about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">LinkedIn</label>
                  <input
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">GitHub</label>
                  <input
                    name="github"
                    value={profile.github}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Portfolio</label>
                  <input
                    name="portfolio"
                    value={profile.portfolio}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>

              {/* Save button inside tab */}
              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Work Experience</h2>
                  <button
                    onClick={() => toast.success('Add experience coming soon!')}
                    className="text-xs btn-outline px-3 py-1.5"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.experience_list.map((exp, i) => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        {i < profile.experience_list.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-800 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">{exp.role}</div>
                            <div className="text-xs text-blue-400">{exp.company}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{exp.duration}</div>
                          </div>
                          <button
                            onClick={() => toast.success('Edit coming soon!')}
                            className="text-gray-600 hover:text-gray-400 text-xs"
                          >
                            ✏️
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Education</h2>
                  <button
                    onClick={() => toast.success('Add education coming soon!')}
                    className="text-xs btn-outline px-3 py-1.5"
                  >
                    + Add
                  </button>
                </div>
                {profile.education.map((edu) => (
                  <div key={edu.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      🎓
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{edu.degree}</div>
                      <div className="text-xs text-purple-400">{edu.school}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Graduated {edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Skills</h2>

              <div className="flex gap-2 mb-5">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g. TypeScript) then press Enter"
                  className="input-field flex-1"
                />
                <button onClick={addSkill} className="btn-primary px-5 text-sm">
                  Add
                </button>
              </div>

              {profile.skills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🛠</div>
                  <p className="text-sm">No skills added yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-3 py-1.5 rounded-full group"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-800 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : '💾 Save Skills'}
                </button>
              </div>
            </div>
          )}

          {/* RESUME TAB */}
          {activeTab === 'resume' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Resume</h2>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              {/* Upload area — show only when no resume */}
              {!hasResume && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true);  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 group mb-4 ${
                    dragOver
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <div className="text-sm text-gray-300">Uploading resume...</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                      <div className="text-sm font-medium text-gray-300 mb-1">
                        Drop your resume here or click to upload
                      </div>
                      <div className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</div>
                    </>
                  )}
                </div>
              )}

              {/* Current resume — show when resume exists */}
              {hasResume && (
                <div className="mb-4">
                  <div className="p-4 bg-gray-800/60 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📕
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {resumeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded {resumeDate} · {resumeSize}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={handleDownload}
                        className="text-xs btn-outline px-3 py-1.5"
                      >
                        ⬇ Download
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={handleDeleteResume}
                        className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>

                  {/* Upload new after delete option */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true);  }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`mt-3 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-xs text-gray-400">Uploading...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Drop a new file here or click Replace to update your resume
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AI tip */}
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span>✦</span>
                  <span className="text-sm font-medium text-purple-400">AI Tip</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Upload your latest resume and our AI will automatically score it
                  against job descriptions and suggest improvements to boost your ATS score.
                </p>
                <button
                  onClick={() => toast.success('Opening ATS Scorer...')}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  Go to ATS Scorer →
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-white">Job Preferences</h2>

              {/* Salary range */}
              <div>
                <label className="block text-xs text-gray-400 mb-3">
                  Expected Salary Range (USD/year)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                    <input
                      name="salaryMin"
                      type="number"
                      value={profile.salaryMin}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="120000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                    <input
                      name="salaryMax"
                      type="number"
                      value={profile.salaryMax}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="180000"
                    />
                  </div>
                </div>
                {profile.salaryMin && profile.salaryMax && (
                  <div className="mt-2 text-xs text-green-400">
                    💰 ${Number(profile.salaryMin).toLocaleString()} – ${Number(profile.salaryMax).toLocaleString()} / year
                  </div>
                )}
              </div>

              {/* Job types */}
              <div>
                <label className="block text-xs text-gray-400 mb-3">
                  Preferred Job Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Full-time','Part-time','Contract','Freelance','Remote','Hybrid'].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleJobType(type)}
                      className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                        profile.jobTypes.includes(type)
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { label: 'Open to Work',     desc: "Show recruiters you're actively looking" },
                { label: 'Email Job Alerts', desc: 'Get notified when matching jobs are posted' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4 bg-gray-800/60 rounded-xl"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => toast.success(`${item.label} updated!`)}
                    className="w-12 h-6 bg-green-500 rounded-full relative transition-colors flex-shrink-0"
                  >
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : '💾 Save Preferences'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </SeekerLayout>
  );
}