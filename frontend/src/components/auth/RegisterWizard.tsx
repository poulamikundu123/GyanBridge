"use client";

import React, { useState } from "react";
import { GraduationCap, Building2, School, UserCheck, ArrowRight } from "lucide-react";

interface RegisterWizardProps {
  onSuccess: (redirectUrl: string) => void;
  onError: (msg: string) => void;
  onSwitchToLogin: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function RegisterWizard({
  onSuccess,
  onError,
  onSwitchToLogin,
  loading,
  setLoading,
}: RegisterWizardProps) {
  const [registerRole, setRegisterRole] = useState<"STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION">("STUDENT");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Student
  const [disciplineName, setDisciplineName] = useState("Ayurveda");
  const [degree, setDegree] = useState("BAMS");
  const [institution, setInstitution] = useState("");
  const [currentYear, setCurrentYear] = useState("Final Year");
  const [graduationYear, setGraduationYear] = useState("2026");

  // Industry
  const [companyName, setCompanyName] = useState("");
  const [sectorName, setSectorName] = useState("Clinical Research & Observational Trials");
  const [location, setLocation] = useState("New Delhi, India");
  const [website, setWebsite] = useState("");

  // Faculty
  const [facultyInstitution, setFacultyInstitution] = useState("All India Institute of Ayurveda");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [department, setDepartment] = useState("Dravyaguna & Clinical Research");
  const [specialization, setSpecialization] = useState("Herbal Pharmacology & Clinical Protocols");

  // Institution
  const [institutionName, setInstitutionName] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [stateName, setStateName] = useState("Delhi");
  const [institutionType, setInstitutionType] = useState("STATE_AYUSH");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");

    const payload: any = {
      role: registerRole,
      name,
      email: registerEmail,
      password: registerPassword,
      phone,
    };

    if (registerRole === "STUDENT") {
      payload.disciplineName = disciplineName;
      payload.degree = degree;
      payload.institution = institution || "AYUSH Medical College";
      payload.currentYear = currentYear;
      payload.graduationYear = graduationYear;
    } else if (registerRole === "INDUSTRY") {
      payload.companyName = companyName || name;
      payload.sectorName = sectorName;
      payload.location = location;
      payload.website = website;
    } else if (registerRole === "FACULTY") {
      payload.institution = facultyInstitution;
      payload.designation = designation;
      payload.department = department;
      payload.specialization = specialization;
      payload.disciplineName = disciplineName;
    } else if (registerRole === "INSTITUTION") {
      payload.institutionName = institutionName || name;
      payload.city = city;
      payload.state = stateName;
      payload.institutionType = institutionType;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.redirectUrl || data.redirect_url || "/student/dashboard");
      } else {
        const detailMsg =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
            ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ")
            : data.error || data.message || "Registration failed. Please check your fields.";
        onError(detailMsg);
        setLoading(false);
      }
    } catch {
      onError("Network or server connection issue during registration");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center pb-1">
        <h2 className="text-lg font-bold text-slate-900">Create New AYUSH Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your role in the AYUSH ecosystem to initialize your personalized skill workspace
        </p>
      </div>

      {/* Step 1: Select Role */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
          Select Your Persona / Sector:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { role: "STUDENT", label: "Student / Scholar", icon: GraduationCap },
            { role: "INDUSTRY", label: "Industry Partner", icon: Building2 },
            { role: "FACULTY", label: "Faculty / Academician", icon: School },
            { role: "INSTITUTION", label: "Institution Admin", icon: UserCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = registerRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => setRegisterRole(item.role as any)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                <span className="text-xs leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Role-Specific Dynamic Fields */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Common Fields */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {registerRole === "INDUSTRY"
                ? "Authorized Representative Name *"
                : registerRole === "INSTITUTION"
                ? "Administrator / Dean Name *"
                : "Full Name *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Kavita Nair"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="e.g. kavita@example.com"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
            <input
              type="password"
              required
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* STUDENT ROLE FIELDS */}
          {registerRole === "STUDENT" && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">AYUSH Discipline *</label>
                <select
                  value={disciplineName}
                  onChange={(e) => setDisciplineName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Ayurveda">Ayurveda</option>
                  <option value="Yoga & Naturopathy">Yoga & Naturopathy</option>
                  <option value="Unani">Unani</option>
                  <option value="Siddha">Siddha</option>
                  <option value="Homoeopathy">Homoeopathy</option>
                  <option value="Cross-disciplinary AYUSH">Cross-disciplinary AYUSH</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree / Program *</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="BAMS">BAMS (Ayurvedic Medicine & Surgery)</option>
                  <option value="BHMS">BHMS (Homoeopathic Medicine)</option>
                  <option value="BUMS">BUMS (Unani Medicine)</option>
                  <option value="BSMS">BSMS (Siddha Medicine)</option>
                  <option value="BNYS">BNYS (Naturopathy & Yoga)</option>
                  <option value="MPharm (Ayurveda)">MPharm (Ayurvedic Pharmacy)</option>
                  <option value="MSc Life Sciences">MSc Life Sciences / Phytochemistry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">College / Institution *</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Government Ayurvedic Medical College"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Academic Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="1st Year">1st Year (Fresh Scholar)</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Intern">Intern / Post-Graduate</option>
                </select>
              </div>
            </>
          )}

          {/* INDUSTRY ROLE FIELDS */}
          {registerRole === "INDUSTRY" && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. BioVeda Pharmaceuticals"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry Sector *</label>
                <select
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Clinical Research & Observational Trials">Clinical Research & Trials</option>
                  <option value="AYUSH Phytopharmaceuticals & Drug Discovery">Phytopharmaceuticals & R&D</option>
                  <option value="Nutraceuticals & Dietary Supplements">Nutraceuticals & Supplements</option>
                  <option value="Wellness, Preventive Healthcare & Naturopathy">Wellness & Preventive Care</option>
                  <option value="Digital Health & AYUSH Informatics">Digital Health & Informatics</option>
                  <option value="Quality Control, Regulatory Affairs & Pharmacovigilance">Quality Control & Regulatory</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headquarters / City *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {/* FACULTY ROLE FIELDS */}
          {registerRole === "FACULTY" && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Institution *</label>
                <input
                  type="text"
                  required
                  value={facultyInstitution}
                  onChange={(e) => setFacultyInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Ayurveda, Jaipur"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Designation *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor / Research Guide"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Dravyaguna / Kayachikitsa"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Research Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Reverse Pharmacology, Clinical Protocol"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {/* INSTITUTION ROLE FIELDS */}
          {registerRole === "INSTITUTION" && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">University / College Name *</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Gujarat Ayurved University"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Category *</label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="CENTRAL_UNIVERSITY">National / Central Institute</option>
                  <option value="STATE_AYUSH">State AYUSH University</option>
                  <option value="DEEMED">Deemed to be University</option>
                  <option value="RESEARCH_COUNCIL">Research Council (CCRAS/CCRH)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Gujarat"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jamnagar"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-[8px] bg-[#17171c] hover:bg-[#282830] text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:translate-y-[0.5px] disabled:opacity-60"
        >
          {loading ? (
            <span>Initializing Your Workspace...</span>
          ) : (
            <>
              <span>Complete Registration & Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-[#003c33] hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}
