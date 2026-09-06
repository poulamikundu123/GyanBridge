import { apiFetch } from "./api";

/**
 * Authoritative Backend API Client
 *
 * Replaces the legacy fake Prisma ORM adapter. All queries call real FastAPI endpoints,
 * querying the SQLite database and triggering real Python business engines.
 */

export const studentApi = {
  getDashboard: async () => {
    return await apiFetch("/student/dashboard");
  },

  getProfile: async (profileId?: string) => {
    const endpoint = profileId
      ? `/student/profile-view/${profileId}`
      : "/student/profile-view";
    try {
      return await apiFetch(endpoint);
    } catch {
      return null;
    }
  },

  getOpportunities: async () => {
    const res = await apiFetch("/student/opportunities");
    return Array.isArray(res) ? res : res?.opportunities ?? [];
  },

  getCareerRoles: async () => {
    const res = await apiFetch("/student/career-roles");
    return res?.roles ?? (Array.isArray(res) ? res : []);
  },

  getSkills: async () => {
    const res = await apiFetch("/student/skills");
    return res?.skills ?? (Array.isArray(res) ? res : []);
  },

  getPortfolio: async () => {
    return await apiFetch("/student/portfolio");
  },

  getLearningPrograms: async () => {
    const res = await apiFetch("/student/learning/programs");
    return Array.isArray(res) ? res : res?.programs ?? [];
  },

  getLearningRecommendations: async () => {
    const res = await apiFetch("/student/learning/recommendations");
    return Array.isArray(res) ? res : res?.recommendations ?? [];
  },

  getMentors: async () => {
    const res = await apiFetch("/student/mentorship/mentors");
    return res?.mentors ?? (Array.isArray(res) ? res : []);
  },

  getMentorshipRequests: async () => {
    const res = await apiFetch("/student/mentorship/requests");
    return Array.isArray(res) ? res : res?.requests ?? [];
  },

  getApplications: async () => {
    const res = await apiFetch("/student/applications");
    return Array.isArray(res) ? res : res?.applications ?? [];
  },

  getMeta: async () => {
    return await apiFetch("/student/meta");
  },
};

export const industryApi = {
  getDashboard: async () => {
    return await apiFetch("/industry/dashboard");
  },

  getOpportunities: async () => {
    const res = await apiFetch("/industry/opportunities");
    return res?.opportunities ?? (Array.isArray(res) ? res : []);
  },

  getCandidates: async (opportunityId?: string) => {
    const url = opportunityId
      ? `/industry/candidates?opportunity_id=${encodeURIComponent(opportunityId)}`
      : "/industry/candidates";
    const res = await apiFetch(url);
    return Array.isArray(res) ? res : res?.candidates ?? [];
  },

  getApplication: async (applicationId: string) => {
    return await apiFetch(`/industry/applications/${applicationId}`);
  },

  getProfile: async () => {
    return await apiFetch("/industry/profile");
  },

  getTraining: async () => {
    const res = await apiFetch("/industry/training");
    return Array.isArray(res) ? res : res?.programs ?? [];
  },

  createTraining: async (data: any) => {
    return await apiFetch("/industry/training", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCollaborations: async () => {
    const res = await apiFetch("/industry/collaborations");
    return Array.isArray(res) ? res : res?.collaborations ?? [];
  },

  getMeta: async () => {
    return await apiFetch("/industry/meta");
  },
};

export const institutionApi = {
  getDashboard: async () => {
    return await apiFetch("/institution/dashboard");
  },

  getStudents: async () => {
    const res = await apiFetch("/institution/students");
    return Array.isArray(res) ? res : res?.students ?? [];
  },

  getDemandGap: async () => {
    const res = await apiFetch("/institution/demand");
    return Array.isArray(res) ? res : res?.skills ?? [];
  },

  getReports: async (reportType: string = "NAAC") => {
    return await apiFetch(`/institution/reports?report_type=${encodeURIComponent(reportType)}`);
  },

  getPlacements: async () => {
    const res = await apiFetch("/institution/placements");
    return Array.isArray(res) ? res : res?.placements ?? [];
  },

  getCollaborations: async () => {
    const res = await apiFetch("/institution/collaborations");
    return res?.partners ?? (Array.isArray(res) ? res : []);
  },

  getOpportunities: async () => {
    const res = await apiFetch("/institution/opportunities");
    return Array.isArray(res) ? res : res?.opportunities ?? [];
  },
};

export const facultyApi = {
  getDashboard: async () => {
    return await apiFetch("/faculty/dashboard");
  },

  getOpportunities: async () => {
    const res = await apiFetch("/faculty/opportunities");
    return Array.isArray(res) ? res : res?.opportunities ?? [];
  },

  getMentorships: async () => {
    const res = await apiFetch("/faculty/mentorships");
    return res?.mentorship_requests ?? res?.requests ?? (Array.isArray(res) ? res : []);
  },

  getMentorshipOffering: async () => {
    try {
      const res = await apiFetch("/faculty/mentorship-offering");
      return res?.offering ?? null;
    } catch {
      return null;
    }
  },

  updateMentorshipOffering: async (data: { expertise?: string; availability?: string; bio?: string }) => {
    return await apiFetch("/faculty/mentorship-offering", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getResearch: async () => {
    const res = await apiFetch("/faculty/research");
    return Array.isArray(res) ? res : res?.projects ?? [];
  },
};

export const resumeApi = {
  getLatest: async () => {
    try {
      return await apiFetch("/resume/latest");
    } catch {
      return null;
    }
  },
};

export const assessmentApi = {
  getTests: async () => {
    const res = await apiFetch("/assessment/tests");
    return Array.isArray(res) ? res : [];
  },

  getHistory: async (studentId?: string) => {
    const url = studentId ? `/assessment/history/${studentId}` : "/assessment/history";
    try {
      return await apiFetch(url);
    } catch {
      return { attempts: [], skillProgression: [] };
    }
  },
};
