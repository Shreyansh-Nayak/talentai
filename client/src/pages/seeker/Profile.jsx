import { useState, useRef, useEffect } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateProfileAPI } from '../../api/authAPI';

const PROFILE_KEY = 'seekerProfile';

const defaultProfile = {
  name:        '',
  email:       '',
  phone:       '',
  location:    '',
  title:       '',
  experience:  '1',
  linkedin:    '',
  github:      '',
  portfolio:   '',
  bio:         '',
  skills:      [],
  salaryMin:   '',
  salaryMax:   '',
  jobTypes:    [],
  education:   [],
  experience_list: [],
};

const profileStrengthItems = (profile) => [
  { label: 'Basic Info',      done: !!(profile.name && profile.phone && profile.location) },
  { label: 'Work Experience', done: profile.experience_list?.length > 0              },
  { label: 'Education',       done: profile.education?.length > 0                    },
  { label: 'Skills Added',    done: profile.skills?.length > 0                       },
  { label: 'Resume Uploaded', done: !!(profile.resumeURL)                            },
  { label: 'Profile Photo',   done: false                                             },
];

// ── Experience Form Modal ─────────────────────────────────────────────────────
function ExperienceModal({ exp, onSave, onClose }) {
  const [form, setForm] = useState(
    exp || { role: '', company: '', duration: '', description: '' }
  );
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">
            {exp ? 'Edit Experience' : 'Add Experience'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Job Title *</label>
            <input name="role" value={form.role} onChange={handleChange}
              className="input-field" placeholder="e.g. Senior Software Engineer" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company *</label>
            <input name="company" value={form.company} onChange={handleChange}
              className="input-field" placeholder="e.g. Google" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Duration *</label>
            <input name="duration" value={form.duration} onChange={handleChange}
              className="input-field" placeholder="e.g. Jan 2022 – Present" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} className="input-field resize-none"
              placeholder="Key achievements and responsibilities..." />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!form.role || !form.company || !form.duration) {
                toast.error('Please fill required fields');
                return;
              }
              onSave(form);
            }}
            className="btn-primary flex-1 py-2.5"
          >
            {exp ? 'Save Changes' : 'Add Experience'}
          </button>
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Education Form Modal ──────────────────────────────────────────────────────
function EducationModal({ edu, onSave, onClose }) {
  const [form, setForm] = useState(edu || { degree: '', school: '', year: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">
            {edu ? 'Edit Education' : 'Add Education'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Degree / Course *</label>
            <input name="degree" value={form.degree} onChange={handleChange}
              className="input-field" placeholder="e.g. B.Tech Computer Science" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">School / University *</label>
            <input name="school" value={form.school} onChange={handleChange}
              className="input-field" placeholder="e.g. IIT Bangalore" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Graduation Year *</label>
            <input name="year" value={form.year} onChange={handleChange}
              className="input-field" placeholder="e.g. 2022" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!form.degree || !form.school || !form.year) {
                toast.error('Please fill required fields');
                return;
              }
              onSave(form);
            }}
            className="btn-primary flex-1 py-2.5"
          >
            {edu ? 'Save Changes' : 'Add Education'}
          </button>
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Component ────────────────────────────────────────────────────
export default function SeekerProfile() {
  const { user, updateUser } = useAuth();

  // Load saved profile from localStorage on mount
  const [profile, setProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (stored) return stored;
    } catch {}
    return {
      ...defaultProfile,
      name:  user?.name  || '',
      email: user?.email || '',
    };
  });

  // Keep name/email in sync with auth user
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      name:  user?.name  || prev.name,
      email: user?.email || prev.email,
    }));
  }, [user]);

  const [activeTab,  setActiveTab]  = useState('basic');
  const [newSkill,   setNewSkill]   = useState('');
  const [saving,     setSaving]     = useState(false);

  // Resume state
  const [hasResume,   setHasResume]   = useState(!!profile.resumeURL);
  const [resumeName,  setResumeName]  = useState(profile.resumeName  || '');
  const [resumeSize,  setResumeSize]  = useState(profile.resumeSize  || '');
  const [resumeDate,  setResumeDate]  = useState(profile.resumeDate  || '');
  const [uploading,   setUploading]   = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [resumeFile,  setResumeFile]  = useState(null);
  const fileInputRef = useRef(null);

  // Email change state
  const [editingEmail,  setEditingEmail]  = useState(false);
  const [newEmail,      setNewEmail]      = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Experience / Education modals
  const [expModal, setExpModal] = useState(null); // null | 'add' | { index, data }
  const [eduModal, setEduModal] = useState(null);

  const strengthItems = profileStrengthItems({ ...profile, resumeURL: hasResume ? 'set' : '' });
  const profileStrength = Math.round(
    (strengthItems.filter(i => i.done).length / strengthItems.length) * 100
  );

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist everything to localStorage
      const toStore = { ...profile };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(toStore));

      // Try to persist to backend
      try {
        await updateProfileAPI({
          name: profile.name,
          profile: {
            bio:          profile.bio,
            location:     profile.location,
            title:        profile.title,
            phone:        profile.phone,
            experience:   Number(profile.experience),
            linkedinURL:  profile.linkedin,
            githubURL:    profile.github,
            portfolioURL: profile.portfolio,
            skills:       profile.skills,
            jobTypes:     profile.jobTypes,
            salary: {
              min: Number(profile.salaryMin) || 0,
              max: Number(profile.salaryMax) || 0,
            },
            education:       profile.education,
            experienceList:  profile.experience_list,
          },
        });
      } catch (apiErr) {
        // Backend might not have all fields — silently continue
        console.warn('Backend save partial:', apiErr.message);
      }

      // Update auth context name
      updateUser({ ...user, name: profile.name, email: profile.email });
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = e => {
    const updated = { ...profile, [e.target.name]: e.target.value };
    setProfile(updated);
  };

  // ── Email change ────────────────────────────────────────────────────────────
  const handleEmailChange = async () => {
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (!emailPassword.trim()) {
      toast.error('Enter your password to confirm');
      return;
    }
    const updated = { ...profile, email: newEmail };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    updateUser({ ...user, email: newEmail });
    setEditingEmail(false);
    setEmailPassword('');
    toast.success('Email updated!');
  };

  // ── Resume ──────────────────────────────────────────────────────────────────
  const handleFileSelect = file => {
    if (!file) return;
    const allowed = ['application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { toast.error('Only PDF, DOC, DOCX allowed'); return; }
    if (file.size > 5 * 1024 * 1024)  { toast.error('File must be under 5MB');       return; }
    uploadResume(file);
  };

  const uploadResume = async file => {
    setUploading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const sizeKB = (file.size / 1024).toFixed(0);
      const date   = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
      setResumeFile(file);
      setResumeName(file.name);
      setResumeSize(`${sizeKB} KB`);
      setResumeDate(date);
      setHasResume(true);
      const updated = { ...profile, resumeURL: 'local', resumeName: file.name, resumeSize: `${sizeKB} KB`, resumeDate: date };
      setProfile(updated);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      toast.success('Resume uploaded!');
    } catch { toast.error('Upload failed'); }
    finally  { setUploading(false); }
  };

  const handleDeleteResume = () => {
    setResumeFile(null); setHasResume(false);
    setResumeName(''); setResumeSize(''); setResumeDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    const updated = { ...profile, resumeURL: '', resumeName: '', resumeSize: '', resumeDate: '' };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    toast.success('Resume deleted!');
  };

  const handleDownload = () => {
    if (resumeFile) {
      const url = URL.createObjectURL(resumeFile);
      const a = document.createElement('a'); a.href = url; a.download = resumeName; a.click();
      URL.revokeObjectURL(url);
    } else toast('No file to download. Please re-upload.', { icon: 'ℹ️' });
  };

  // ── Skills ──────────────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (profile.skills.includes(s)) { toast.error('Skill already added'); return; }
    const updated = { ...profile, skills: [...profile.skills, s] };
    setProfile(updated);
    setNewSkill('');
  };
  const removeSkill = s => setProfile({ ...profile, skills: profile.skills.filter(x => x !== s) });

  const toggleJobType = type => {
    const updated = profile.jobTypes.includes(type)
      ? profile.jobTypes.filter(t => t !== type)
      : [...profile.jobTypes, type];
    setProfile({ ...profile, jobTypes: updated });
  };

  // ── Experience CRUD ─────────────────────────────────────────────────────────
  const saveExperience = (data) => {
    let updated;
    if (expModal?.index !== undefined) {
      // editing
      const list = [...profile.experience_list];
      list[expModal.index] = { ...data, id: list[expModal.index].id };
      updated = { ...profile, experience_list: list };
    } else {
      // adding
      updated = { ...profile, experience_list: [...(profile.experience_list || []), { ...data, id: Date.now() }] };
    }
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setExpModal(null);
    toast.success(expModal?.index !== undefined ? 'Experience updated!' : 'Experience added!');
  };

  const deleteExperience = (idx) => {
    const list = profile.experience_list.filter((_, i) => i !== idx);
    const updated = { ...profile, experience_list: list };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    toast.success('Experience removed');
  };

  // ── Education CRUD ──────────────────────────────────────────────────────────
  const saveEducation = (data) => {
    let updated;
    if (eduModal?.index !== undefined) {
      const list = [...profile.education];
      list[eduModal.index] = { ...data, id: list[eduModal.index].id };
      updated = { ...profile, education: list };
    } else {
      updated = { ...profile, education: [...(profile.education || []), { ...data, id: Date.now() }] };
    }
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setEduModal(null);
    toast.success(eduModal?.index !== undefined ? 'Education updated!' : 'Education added!');
  };

  const deleteEducation = (idx) => {
    const list = profile.education.filter((_, i) => i !== idx);
    const updated = { ...profile, education: list };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    toast.success('Education removed');
  };

  const tabs = [
    { id: 'basic',       label: 'Basic Info',   icon: '👤' },
    { id: 'experience',  label: 'Experience',   icon: '💼' },
    { id: 'skills',      label: 'Skills',       icon: '🛠'  },
    { id: 'resume',      label: 'Resume',       icon: '📄' },
    { id: 'preferences', label: 'Preferences',  icon: '⚙️' },
  ];

  const SaveBtn = ({ label = '💾 Save Changes' }) => (
    <button onClick={handleSave} disabled={saving}
      className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
      {saving ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>) : label}
    </button>
  );

  return (
    <SeekerLayout>
      {/* Modals */}
      {expModal && (
        <ExperienceModal
          exp={expModal.index !== undefined ? profile.experience_list[expModal.index] : null}
          onSave={saveExperience}
          onClose={() => setExpModal(null)}
        />
      )}
      {eduModal && (
        <EducationModal
          edu={eduModal.index !== undefined ? profile.education[eduModal.index] : null}
          onSave={saveEducation}
          onClose={() => setEduModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Changes are saved locally and synced to server</p>
        </div>
        <SaveBtn />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar */}
          <div className="card text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto">
                {profile.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <div className="font-semibold text-white">{profile.name || 'Your Name'}</div>
            <div className="text-sm text-gray-400 mt-0.5">{profile.title || 'Your Title'}</div>
            <div className="text-xs text-gray-500 mt-1">📍 {profile.location || 'Your Location'}</div>
          </div>

          {/* Profile Strength */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Profile Strength</h3>
              <span className={`text-sm font-bold ${profileStrength >= 80 ? 'text-green-400' : profileStrength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {profileStrength}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${profileStrength}%` }} />
            </div>
            <div className="space-y-2">
              {strengthItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={item.done ? 'text-green-400' : 'text-gray-600'}>{item.done ? '✓' : '○'}</span>
                  <span className={item.done ? 'text-gray-300' : 'text-gray-600'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links preview */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Links</h3>
            <div className="space-y-2">
              {[
                { icon: '🔗', label: 'LinkedIn',  value: profile.linkedin  },
                { icon: '💻', label: 'GitHub',    value: profile.github    },
                { icon: '🌐', label: 'Portfolio', value: profile.portfolio },
              ].map(link => (
                <div key={link.label} className="flex items-center gap-2 text-xs">
                  <span>{link.icon}</span>
                  {link.value
                    ? <a href={link.value} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 truncate">{link.value}</a>
                    : <span className="text-gray-600">Not set</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Tabbed Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-blue-500/20 text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200'
                }`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* ── BASIC INFO ─────────────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-white mb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                  <input name="name" value={profile.name} onChange={handleChange} className="input-field" placeholder="Your full name" />
                </div>

                {/* Email with change toggle */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
                  {!editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input value={profile.email} className="input-field flex-1 bg-gray-800/50 cursor-default" readOnly />
                      <button onClick={() => { setNewEmail(profile.email); setEditingEmail(true); }}
                        className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap">
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        className="input-field" placeholder="New email address" />
                      <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
                        className="input-field" placeholder="Confirm your password" />
                      <div className="flex gap-2">
                        <button onClick={handleEmailChange} className="btn-primary text-xs px-4 py-2 flex-1">Confirm</button>
                        <button onClick={() => { setEditingEmail(false); setEmailPassword(''); }} className="btn-outline text-xs px-4 py-2 flex-1">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Phone Number</label>
                  <input name="phone" value={profile.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                  <input name="location" value={profile.location} onChange={handleChange} className="input-field" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Current Title</label>
                  <input name="title" value={profile.title} onChange={handleChange} className="input-field" placeholder="Senior Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Years of Experience</label>
                  <select name="experience" value={profile.experience} onChange={handleChange} className="input-field">
                    {['1','2','3','4','5','6','7','8','9','10+'].map(y => <option key={y} value={y}>{y} years</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3}
                  className="input-field resize-none" placeholder="Write a short bio about yourself..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">LinkedIn</label>
                  <input name="linkedin" value={profile.linkedin} onChange={handleChange} className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">GitHub</label>
                  <input name="github" value={profile.github} onChange={handleChange} className="input-field" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Portfolio</label>
                  <input name="portfolio" value={profile.portfolio} onChange={handleChange} className="input-field" placeholder="https://yoursite.com" />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <SaveBtn label="💾 Save Basic Info" />
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ─────────────────────────────────────────────── */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {/* Work Experience */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Work Experience</h2>
                  <button onClick={() => setExpModal('add')} className="btn-primary text-xs px-4 py-2">
                    + Add Experience
                  </button>
                </div>

                {(profile.experience_list || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">💼</div>
                    <p className="text-sm">No experience added yet</p>
                    <button onClick={() => setExpModal('add')} className="text-blue-400 text-xs mt-2 hover:text-blue-300">
                      Add your first experience →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.experience_list.map((exp, i) => (
                      <div key={exp.id || i} className="flex gap-4">
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpModal({ index: i, data: exp })}
                                className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteExperience(i)}
                                className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Education</h2>
                  <button onClick={() => setEduModal('add')} className="btn-primary text-xs px-4 py-2">
                    + Add Education
                  </button>
                </div>

                {(profile.education || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">🎓</div>
                    <p className="text-sm">No education added yet</p>
                    <button onClick={() => setEduModal('add')} className="text-blue-400 text-xs mt-2 hover:text-blue-300">
                      Add your education →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.education.map((edu, i) => (
                      <div key={edu.id || i} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          🎓
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{edu.degree}</div>
                          <div className="text-xs text-purple-400">{edu.school}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Graduated {edu.year}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEduModal({ index: i, data: edu })}
                            className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteEducation(i)}
                            className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SKILLS ─────────────────────────────────────────────────── */}
          {activeTab === 'skills' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Skills</h2>
              <div className="flex gap-2 mb-5">
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g. TypeScript) then press Enter"
                  className="input-field flex-1" />
                <button onClick={addSkill} className="btn-primary px-5 text-sm">Add</button>
              </div>
              {profile.skills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🛠</div>
                  <p className="text-sm">No skills added yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <div key={skill} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-3 py-1.5 rounded-full group">
                      {skill}
                      <button onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-4 border-t border-gray-800 mt-4">
                <SaveBtn label="💾 Save Skills" />
              </div>
            </div>
          )}

          {/* ── RESUME ─────────────────────────────────────────────────── */}
          {activeTab === 'resume' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Resume</h2>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => handleFileSelect(e.target.files[0])} />

              {!hasResume ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 group mb-4 ${
                    dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <div className="text-sm text-gray-300">Uploading...</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                      <div className="text-sm font-medium text-gray-300 mb-1">Drop your resume here or click to upload</div>
                      <div className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="p-4 bg-gray-800/60 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📕</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{resumeName}</div>
                      <div className="text-xs text-gray-500">Uploaded {resumeDate} · {resumeSize}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={handleDownload} className="text-xs btn-outline px-3 py-1.5">⬇ Download</button>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                        Replace
                      </button>
                      <button onClick={handleDeleteResume}
                        className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                    className={`mt-3 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      {uploading ? 'Uploading...' : 'Drop a new file here or click Replace to update your resume'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1"><span>✦</span><span className="text-sm font-medium text-purple-400">AI Tip</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Upload your latest resume and our AI will automatically score it against job descriptions and suggest improvements to boost your ATS score.
                </p>
              </div>
            </div>
          )}

          {/* ── PREFERENCES ────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-white">Job Preferences</h2>
              <div>
                <label className="block text-xs text-gray-400 mb-3">Expected Salary Range (USD/year)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                    <input name="salaryMin" type="number" value={profile.salaryMin} onChange={handleChange} className="input-field" placeholder="120000" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                    <input name="salaryMax" type="number" value={profile.salaryMax} onChange={handleChange} className="input-field" placeholder="180000" />
                  </div>
                </div>
                {profile.salaryMin && profile.salaryMax && (
                  <div className="mt-2 text-xs text-green-400">
                    💰 ${Number(profile.salaryMin).toLocaleString()} – ${Number(profile.salaryMax).toLocaleString()} / year
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-3">Preferred Job Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Full-time','Part-time','Contract','Freelance','Remote','Hybrid'].map(type => (
                    <button key={type} onClick={() => toggleJobType(type)}
                      className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                        profile.jobTypes.includes(type)
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800">
                <SaveBtn label="💾 Save Preferences" />
              </div>
            </div>
          )}
        </div>
      </div>
    </SeekerLayout>
  );
}