import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerLayout from '../../components/common/EmployerLayout';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { createJobAPI }  from '../../api/jobsAPI';
import { generateJDAPI } from '../../api/aiAPI';

const initialForm = {
  title: '',
  description: '',
  skills: '',
  location: '',
  type: 'Full-time',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  experience: '3',
  openings: '1',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(initialForm);
  const [posting, setPosting]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // AI JD Generator state
  const [aiRole, setAiRole]     = useState('');
  const [aiSkills, setAiSkills] = useState('');
  const [aiTone, setAiTone]     = useState('Professional');
  const [aiExp, setAiExp]       = useState('Senior (5+ years)');
  const [aiOutput, setAiOutput] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.title || !form.description || !form.location) {
    toast.error('Please fill in all required fields');
    return;
  }
  setPosting(true);
  try {
    await createJobAPI({
      title:       form.title,
      description: form.description,
      skills:      form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      location:    form.location,
      type:        form.type,
      experience:  Number(form.experience),
      openings:    Number(form.openings),
      salary: {
        min:      Number(form.salaryMin) || 0,
        max:      Number(form.salaryMax) || 0,
        currency: form.currency,
      },
    });
    toast.success('Job posted successfully!');
    navigate('/employer/jobs');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to post job');
  } finally {
    setPosting(false);
  }
};

  const generateJD = async () => {
  if (!aiRole.trim()) {
    toast.error('Please enter a role title first');
    return;
  }
  setAiLoading(true);
  setAiOutput('');
  try {
    const data = await generateJDAPI({
      title:      aiRole,
      skills:     aiSkills,
      experience: aiExp,
      tone:       aiTone,
    });
    setAiOutput(data.description);
    setForm((prev) => ({
      ...prev,
      title:       aiRole,
      description: data.description,
      skills:      aiSkills,
    }));
    toast.success('JD generated and filled in!');
  } catch (err) {
    // Fallback to mock
    await new Promise((r) => setTimeout(r, 1000));
    const mockJD = `We are looking for a ${aiRole}...\n\nResponsibilities:\n• Lead development...\n• Collaborate with teams...\n\nRequirements:\n• ${aiExp} experience\n• ${aiSkills || 'relevant skills'}`;
    setAiOutput(mockJD);
    setForm((prev) => ({ ...prev, title: aiRole, description: mockJD }));
    toast.success('JD generated! (demo mode)');
  } finally {
    setAiLoading(false);
  }
};
  const skillsList = form.skills
    ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <EmployerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
          <p className="text-gray-400 text-sm mt-1">
            Fill in the details or use AI to generate a job description
          </p>
        </div>
        <button
          onClick={() => navigate('/employer/jobs')}
          className="btn-outline text-sm px-4 py-2"
        >
          ← Back to Jobs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT — Job Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-5"
        >

          {/* Basic Details */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Job Details</h2>

            <div className="space-y-4">

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior React Developer"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={8}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Required Skills
                  <span className="text-gray-600 ml-1">(comma separated)</span>
                </label>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, TypeScript, AWS..."
                  className="input-field"
                />
                {/* Skill tags preview */}
                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Job Meta */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Remote / City, Country"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Job Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Hybrid</option>
                  <option>Remote</option>
                  <option>Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Experience Required
                </label>
                <select
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="0">Fresher (0 yrs)</option>
                  <option value="1">1+ years</option>
                  <option value="2">2+ years</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="8">8+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  No. of Openings
                </label>
                <input
                  name="openings"
                  type="number"
                  min="1"
                  value={form.openings}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

            </div>
          </div>

          {/* Salary */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Salary Range</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option>USD</option>
                  <option>INR</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>AUD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Minimum</label>
                <input
                  name="salaryMin"
                  type="number"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="100000"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Maximum</label>
                <input
                  name="salaryMax"
                  type="number"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="150000"
                  className="input-field"
                />
              </div>
            </div>

            {/* Salary preview */}
            {form.salaryMin && form.salaryMax && (
              <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <span className="text-sm text-green-400 font-medium">
                  💰 {form.currency} {Number(form.salaryMin).toLocaleString()} –{' '}
                  {Number(form.salaryMax).toLocaleString()} / year
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={posting}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
            >
              {posting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : '🚀 Publish Job Post'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                toast.success('Form cleared');
              }}
              className="btn-outline px-5 py-3 text-sm"
            >
              Clear
            </button>
          </div>

        </form>

        {/* RIGHT — AI JD Generator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-sm">
                ✨
              </div>
              <div>
                <div className="text-sm font-semibold text-white">AI JD Generator</div>
                <div className="text-xs text-gray-500">Auto-fill form with AI</div>
              </div>
            </div>

            <div className="space-y-3">

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Role Title</label>
                <input
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value)}
                  placeholder="e.g. Senior DevOps Engineer"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Key Skills</label>
                <input
                  value={aiSkills}
                  onChange={(e) => setAiSkills(e.target.value)}
                  placeholder="Kubernetes, Terraform, AWS..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Experience Level</label>
                <select
                  value={aiExp}
                  onChange={(e) => setAiExp(e.target.value)}
                  className="input-field text-sm"
                >
                  <option>Junior (0-2 years)</option>
                  <option>Mid (3-5 years)</option>
                  <option>Senior (5+ years)</option>
                  <option>Lead (8+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Tone</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="input-field text-sm"
                >
                  <option>Professional</option>
                  <option>Startup-friendly</option>
                  <option>Technical</option>
                  <option>Inclusive & Diverse</option>
                </select>
              </div>

              <button
                onClick={generateJD}
                disabled={aiLoading}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                    Generating...
                  </>
                ) : '✨ Generate Job Description'}
              </button>

            </div>

            {/* AI Output Preview */}
            {aiOutput && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">Generated Preview</span>
                  <button
                    onClick={() => {
                      setForm((prev) => ({ ...prev, description: aiOutput }));
                      toast.success('Applied to form!');
                    }}
                    className="text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    Apply →
                  </button>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {aiOutput}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">💡 Tips for a Great Job Post</h3>
            <ul className="space-y-2">
              {[
                'Be specific about required vs nice-to-have skills',
                'Include salary range — posts with salary get 40% more applicants',
                'Mention remote/hybrid options upfront',
                'Keep job titles simple and searchable',
                'List 5-8 key responsibilities maximum',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </EmployerLayout>
  );
}