import asyncio
import sys
import os
from httpx import AsyncClient, ASGITransport

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.main import app
from app.seed.seed_data import seed_database

async def run_smoke_tests():
    print("=" * 60)
    print("🚀 STARTING AYUSH BACKEND COMPREHENSIVE SMOKE TEST")
    print("=" * 60)

    # Ensure database is seeded with latest taxonomy and programs
    await seed_database()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health Check
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("✅ 1. Health check passed:", res.json())

        # 2. Demo Login - Fresh Student
        res = await client.post("/api/auth/demo-login", json={"role": "STUDENT", "profileType": "FRESH"})
        assert res.status_code == 200, f"Student demo login failed: {res.text}"
        student_auth = res.json()
        student_token = student_auth["token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        print(f"✅ 2. Fresh Student Demo Login successful: User ID {student_auth['user']['id']}, Name: {student_auth['user']['name']}")

        # 3. Student Dashboard
        res = await client.get("/api/student/dashboard", headers=student_headers)
        assert res.status_code == 200, f"Student dashboard failed: {res.text}"
        dash = res.json()
        print(f"✅ 3. Student Dashboard loaded: Readiness Score = {dash['kpis']['readiness_score']}%, Total Skills = {dash['kpis']['total_skills_count']}")

        # 4. List Career Roles
        res = await client.get("/api/student/career-roles", headers=student_headers)
        assert res.status_code == 200, f"Career roles failed: {res.text}"
        roles_data = res.json()
        target_role = roles_data["roles"][0]
        print(f"✅ 4. Retrieved {len(roles_data['roles'])} Career Roles. Selecting target role: '{target_role['title']}' (ID: {target_role['id']})")

        # 5. Set Career Target
        res = await client.post("/api/student/career-target", json={"career_role_id": target_role["id"]}, headers=student_headers)
        assert res.status_code == 200, f"Set career target failed: {res.text}"
        print(f"✅ 5. Target Career Role set to '{target_role['title']}'. Updated Readiness: {res.json()['newReadinessScore']}%")

        # 6. Resume Upload & Analysis
        sample_resume = (
            "Ayush Sharma, BAMS Graduate from All India Institute of Ayurveda.\n"
            "Clinical Experience: Conducted clinical trials following AYUSH GCP guidelines, Pharmacovigilance, and Ayurvedic formulations.\n"
            "Technical Skills: Dravyaguna, Panchakarma, Phytochemistry, Good Clinical Practice, Herbal Drug Standardization.\n"
            "Managed adverse drug reaction reporting and patient case documentations."
        )
        res = await client.post(
            "/api/student/resume/upload",
            data={"raw_text_input": sample_resume, "career_role_id": target_role["id"]},
            headers=student_headers
        )
        assert res.status_code == 200, f"Resume upload failed: {res.text}"
        resume_res = res.json()
        print(f"✅ 6. AI Resume Analysis complete: Alignment Score = {resume_res['alignmentScore']}%, Detected Skills = {len(resume_res['detectedSkills'])}, Suggestions = {len(resume_res['bulletImprovements'])}")

        # 7. Start Skill Assessment
        res = await client.post("/api/student/assessment/start", json={"career_role_id": target_role["id"]}, headers=student_headers)
        assert res.status_code == 200, f"Start assessment failed: {res.text}"
        assess_start = res.json()
        attempt_id = assess_start["attemptId"]
        questions = assess_start["questions"]
        print(f"✅ 7. Assessment started for '{assess_start['testTitle']}': Attempt ID {attempt_id}, Questions: {len(questions)}")

        # 8. Submit Assessment Answers
        answers = []
        for q in questions:
            opts = q.get("options", [])
            selected_opt = opts[0]["id"] if opts else None
            answers.append({"questionId": q["id"], "selectedOptionId": selected_opt})

        res = await client.post(
            "/api/student/assessment/submit",
            json={"attemptId": attempt_id, "answers": answers},
            headers=student_headers
        )
        assert res.status_code == 200, f"Assessment submission failed: {res.text}"
        assess_result = res.json()
        print(f"✅ 8. Assessment submitted & graded: Score = {assess_result['overallScorePercentage']}%, New Career Readiness = {assess_result['careerReadinessScore']}%")

        # 9. Learning & Training Recommendations
        res = await client.get("/api/student/learning/recommendations", headers=student_headers)
        assert res.status_code == 200, f"Learning recommendations failed: {res.text}"
        recs = res.json()
        print(f"✅ 9. Learning Recommendations generated: {len(recs['recommendations'])} programs recommended for {len(recs['critical_gaps'])} critical gaps.")

        # 10. List Training Programs & Enroll
        res = await client.get("/api/student/learning/programs", headers=student_headers)
        assert res.status_code == 200
        progs = res.json()["programs"]
        assert len(progs) > 0, "No training programs found"
        selected_prog = progs[0]

        res = await client.post("/api/student/learning/enroll", json={"training_program_id": selected_prog["id"]}, headers=student_headers)
        assert res.status_code == 200
        print(f"✅ 10. Enrolled in Training Program: '{selected_prog['title']}'")

        # 11. Complete Training Program (Upgrades skills & generates certificate)
        res = await client.post("/api/student/learning/complete", json={"training_program_id": selected_prog["id"]}, headers=student_headers)
        assert res.status_code == 200
        comp_data = res.json()
        print(f"✅ 11. Completed Training Program! Certificate: {comp_data['certificateUrl']}, Skills Upgraded: {len(comp_data['boostedSkills'])}")

        # 12. Browse Matched Opportunities
        res = await client.get("/api/student/opportunities", headers=student_headers)
        assert res.status_code == 200
        opps = res.json()
        assert len(opps) > 0, "No opportunities found"
        top_opp = opps[0]
        print(f"✅ 12. Browsed Matched Opportunities: Top opportunity '{top_opp['title']}' with Match Score: {top_opp['match_score']}%")

        # 13. Apply to Opportunity
        res = await client.post(
            "/api/student/apply",
            json={
                "opportunity_id": top_opp["id"],
                "cover_note": "I have completed verified GCP certifications and clinical trials coursework.",
                "resume_url": "https://ayush-platform.gov.in/resumes/ayush_bams.pdf"
            },
            headers=student_headers
        )
        assert res.status_code == 200
        app_sub = res.json()
        application_id = app_sub["application_id"]
        print(f"✅ 13. Application submitted successfully! Application ID: {application_id}, Match Score: {app_sub['match_score']}%")

        # 14. Industry Recruiter Login
        res = await client.post("/api/auth/demo-login", json={"role": "INDUSTRY", "profileType": "STANDARD"})
        assert res.status_code == 200
        ind_auth = res.json()
        ind_headers = {"Authorization": f"Bearer {ind_auth['token']}"}
        print(f"✅ 14. Industry Recruiter Login successful: {ind_auth['user']['name']} ({ind_auth['user']['email']})")

        # 15. Industry Dashboard & Candidate Pool
        res = await client.get("/api/industry/dashboard", headers=ind_headers)
        assert res.status_code == 200
        ind_dash = res.json()
        print(f"✅ 15. Industry Dashboard: {ind_dash['company_name']}, Active Job Postings = {ind_dash['active_opportunities_count']}, Total Applicants = {ind_dash['total_applicants_count']}")

        res = await client.get("/api/industry/candidates", headers=ind_headers)
        assert res.status_code == 200
        candidates = res.json()
        print(f"✅ 16. Candidate Pool: {len(candidates)} applicants found.")

        # Find our submitted application or use top candidate
        target_app = next((c for c in candidates if c["application_id"] == application_id), candidates[0] if candidates else None)
        assert target_app is not None, "No candidate application found"

        # 17. Update Application Status to SHORTLISTED
        res = await client.post(
            "/api/industry/application-status",
            json={
                "application_id": target_app["application_id"],
                "status": "SHORTLISTED",
                "notes": "Impressive clinical skills and verified certification"
            },
            headers=ind_headers
        )
        assert res.status_code == 200
        print(f"✅ 17. Application {target_app['application_id']} status updated to SHORTLISTED")

        # 18. Submit Supervisor Feedback & Verified Competency Rating
        target_skills = target_app.get("skills", [])
        skill_ratings = []
        if target_skills:
            skill_ratings.append({"skill_id": target_skills[0].get("name", "skill-gcp"), "rating": 4.8})

        res = await client.post(
            "/api/industry/feedback",
            json={
                "application_id": target_app["application_id"],
                "overall_rating": 4.9,
                "written_feedback": "Demonstrated exceptional competence in botanical formulation research and GCP compliance.",
                "strengths": "Fast learner, meticulous data collection, ethical clinical practices",
                "improvements": "Can further explore international herbal regulatory submissions",
                "skill_ratings": skill_ratings
            },
            headers=ind_headers
        )
        assert res.status_code == 200
        print(f"✅ 18. Verified Industry Feedback submitted! Result: {res.json()['message']}")

        # 19. Academician / Faculty Login & Verification
        res = await client.post("/api/auth/demo-login", json={"role": "ACADEMICIAN", "profileType": "STANDARD"})
        assert res.status_code == 200
        acad_auth = res.json()
        acad_headers = {"Authorization": f"Bearer {acad_auth['token']}"}
        print(f"✅ 19. Academician Login successful: {acad_auth['user']['name']}")

        res = await client.get("/api/academician/dashboard", headers=acad_headers)
        assert res.status_code == 200
        acad_dash = res.json()
        print(f"✅ 20. Academician Dashboard: Institution = {acad_dash['profile']['institution']}, Available FDPs = {acad_dash['available_fdps_count']}")

        # Test /faculty parity endpoint
        res = await client.get("/api/faculty/dashboard", headers=acad_headers)
        assert res.status_code == 200
        print(f"✅ 21. /faculty Dashboard parity check passed!")

        # 22. Institution Admin Login
        res = await client.post("/api/auth/demo-login", json={"role": "INSTITUTION", "profileType": "STANDARD"})
        assert res.status_code == 200
        inst_auth = res.json()
        inst_headers = {"Authorization": f"Bearer {inst_auth['token']}"}
        print(f"✅ 22. Institution Admin Login successful: {inst_auth['user']['name']}")

        res = await client.get("/api/institution/dashboard", headers=inst_headers)
        assert res.status_code == 200
        inst_dash = res.json()
        print(f"✅ 23. Institution Dashboard: Total Students = {inst_dash['total_students']}, Placement Rate = {inst_dash['placement_rate_percentage']}%, Avg Skill = {inst_dash['average_skill_score']}")

        res = await client.get("/api/institution/demand", headers=inst_headers)
        assert res.status_code == 200
        demand_data = res.json()
        assert isinstance(demand_data, list)
        print(f"✅ 24. Curriculum vs Industry Demand analysis: Analyzed {len(demand_data)} core curriculum vs industry competency gaps.")

        # 25. Check Student Notifications
        res = await client.get("/api/notifications", headers=student_headers)
        assert res.status_code == 200
        notifs_data = res.json()
        print(f"✅ 25. Student Notifications checked: {len(notifs_data['notifications'])} notifications received (Unread: {notifs_data['unreadCount']})")
        for n in notifs_data["notifications"][:3]:
            print(f"    📢 [{n['type']}] {n['title']} - {n['message']}")

    print("\n" + "=" * 60)
    print("🎉 ALL 25 BACKEND SMOKE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_smoke_tests())
