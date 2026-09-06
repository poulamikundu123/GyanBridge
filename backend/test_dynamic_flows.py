import asyncio
import sys
import os
import uuid
from datetime import datetime

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.seed.seed_data import seed_database

async def run_dynamic_tests():
    print("=" * 65)
    print("🌟 RUNNING FULL DYNAMIC APP VALIDATION (REGISTRATION & PORTAL FLOWS)")
    print("=" * 65)
    
    await seed_database()
    unique_suffix = uuid.uuid4().hex[:6]
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # -------------------------------------------------------------
        # 1. DYNAMIC STUDENT REGISTRATION & LIFECYCLE
        # -------------------------------------------------------------
        student_email = f"student_{unique_suffix}@ayush.org"
        print(f"\n1. Registering dynamic student: {student_email}")
        reg_payload = {
            "role": "STUDENT",
            "name": f"Kavita Sharma {unique_suffix}",
            "email": student_email,
            "password": "Password@123",
            "phone": "+91 9123456780",
            "degree": "BAMS",
            "institution": f"Government Ayurveda College {unique_suffix}",
            "disciplineName": "Ayurveda",
            "currentYear": "3rd Year",
            "graduationYear": 2027
        }
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 200, f"Student register failed: {res.text}"
        data = res.json()
        assert data["success"] is True
        token = data["access_token"]
        student_headers = {"Authorization": f"Bearer {token}"}
        print(f"   ✅ Student registered successfully! User ID: {data['user_id']}")

        # Verify /auth/me
        me_res = await client.get("/api/auth/me", headers=student_headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == student_email
        print(f"   ✅ Auth /me verified: Role = {me_data['role']}, Profile ID = {me_data.get('profile_id')}")

        # Verify Student Profile View
        prof_res = await client.get("/api/student/profile-view", headers=student_headers)
        assert prof_res.status_code == 200
        prof_data = prof_res.json()
        assert prof_data["degree"] == "BAMS"
        assert f"Government Ayurveda College {unique_suffix}" in prof_data["institution"]
        print(f"   ✅ Profile retrieved: {prof_data['name']}, Institution: {prof_data['institution']}")

        # -------------------------------------------------------------
        # 2. DYNAMIC INDUSTRY REGISTRATION & OPPORTUNITY POSTING
        # -------------------------------------------------------------
        industry_email = f"recruiter_{unique_suffix}@pharma.com"
        print(f"\n2. Registering dynamic industry partner: {industry_email}")
        ind_payload = {
            "role": "INDUSTRY",
            "name": f"Aditi Rao {unique_suffix}",
            "email": industry_email,
            "password": "Password@123",
            "phone": "+91 9876543210",
            "companyName": f"Himalayan Bio-Herbals {unique_suffix}",
            "sectorName": "Herbal Pharmaceuticals & Nutraceuticals",
            "location": "Bengaluru, Karnataka",
            "website": "https://himalayan-bioherbals.example.com"
        }
        ind_reg = await client.post("/api/auth/register", json=ind_payload)
        assert ind_reg.status_code == 200, f"Industry register failed: {ind_reg.text}"
        ind_data = ind_reg.json()
        ind_token = ind_data["access_token"]
        ind_headers = {"Authorization": f"Bearer {ind_token}"}
        print(f"   ✅ Industry partner registered! Company: Himalayan Bio-Herbals {unique_suffix}")

        # Industry creates a new dynamic opportunity
        print("\n3. Industry posting new opportunity...")
        meta_res = await client.get("/api/industry/meta", headers=ind_headers)
        assert meta_res.status_code == 200
        sectors = meta_res.json().get("sectors", [])
        disciplines = meta_res.json().get("disciplines", [])
        skills = meta_res.json().get("skills", [])
        
        opp_payload = {
            "title": f"Junior Formulation Scientist {unique_suffix}",
            "description": "Formulation development and chromatographic assay evaluation.",
            "opportunity_type": "FULL_TIME",
            "work_mode": "ONSITE",
            "location": "Bengaluru, Karnataka",
            "stipend_salary": "₹7,50,000 / year",
            "stipendSalary": "₹7,50,000 / year",
            "eligibility_degree": "BAMS / B.Pharm (Ayurveda)",
            "sector_id": sectors[0]["id"] if sectors else "sec-herbal",
            "discipline_id": disciplines[0]["id"] if disciplines else "disc-ayu",
            "deadline": "2026-11-30T00:00:00Z",
            "skills": [
                {"skill_id": skills[0]["id"] if skills else "sk-gcp", "required_proficiency": 75, "is_mandatory": True, "weight": 1.0}
            ]
        }
        opp_create = await client.post("/api/industry/opportunities", json=opp_payload, headers=ind_headers)
        assert opp_create.status_code == 200, f"Opp creation failed: {opp_create.text}"
        opp_res_data = opp_create.json()
        opp_id = opp_res_data["opportunity_id"]
        print(f"   ✅ Opportunity created! ID: {opp_id}, Title: {opp_payload['title']}")

        # -------------------------------------------------------------
        # 3. STUDENT APPLIES FOR NEW OPPORTUNITY
        # -------------------------------------------------------------
        print("\n4. Student discovering and applying to the dynamic opportunity...")
        app_res = await client.post(
            f"/api/student/opportunities/{opp_id}/apply",
            json={"cover_note": "Excited to apply my pharmaceutical standardization skills."},
            headers=student_headers
        )
        assert app_res.status_code == 200, f"Application failed: {app_res.text}"
        app_data = app_res.json()
        application_id = app_data["application_id"]
        print(f"   ✅ Application submitted! ID: {application_id}, Match: {app_data['match_score_percentage']}%")

        # Student checks applications list
        stu_apps = await client.get("/api/student/applications", headers=student_headers)
        assert stu_apps.status_code == 200
        assert len(stu_apps.json()) >= 1
        print(f"   ✅ Student applications retrieved: {len(stu_apps.json())} active submission(s)")

        # -------------------------------------------------------------
        # 4. INDUSTRY REVIEWS CANDIDATE & UPDATES PIPELINE
        # -------------------------------------------------------------
        print("\n5. Industry recruiter checking candidates pool...")
        candidates = await client.get("/api/industry/candidates", headers=ind_headers)
        assert candidates.status_code == 200
        cand_list = candidates.json()
        assert len(cand_list) >= 1
        found_cand = next((c for c in cand_list if c["application_id"] == application_id), None)
        assert found_cand is not None, "Candidate application not found in recruiter pool"
        print(f"   ✅ Candidate found in recruiter pool: {found_cand['candidate_name']} ({found_cand['candidate_email']})")

        # Industry inspects candidate detail
        detail_res = await client.get(f"/api/industry/applications/{application_id}", headers=ind_headers)
        assert detail_res.status_code == 200
        print(f"   ✅ Application detail retrieved: {detail_res.json()['opportunity']['title']}")

        # Recruiter shortlists candidate
        stage_res = await client.put(
            f"/api/industry/applications/{application_id}/status",
            json={"status": "SHORTLISTED", "notes": "Impressive background from Govt Ayurveda College."},
            headers=ind_headers
        )
        assert stage_res.status_code == 200
        print(f"   ✅ Candidate status updated to: SHORTLISTED")

        # -------------------------------------------------------------
        # 5. DYNAMIC INSTITUTION & FACULTY REGISTRATION
        # -------------------------------------------------------------
        inst_email = f"dean_{unique_suffix}@ayushuni.edu.in"
        print(f"\n6. Registering dynamic institution: {inst_email}")
        inst_payload = {
            "role": "INSTITUTION",
            "name": f"Prof. Arvind Narang {unique_suffix}",
            "email": inst_email,
            "password": "Password@123",
            "phone": "+91 9456789012",
            "institutionName": f"National AYUSH Academy {unique_suffix}",
            "city": "Varanasi",
            "state": "Uttar Pradesh",
            "institutionType": "STATE_AYUSH"
        }
        inst_reg = await client.post("/api/auth/register", json=inst_payload)
        assert inst_reg.status_code == 200
        inst_token = inst_reg.json()["access_token"]
        inst_headers = {"Authorization": f"Bearer {inst_token}"}
        inst_dash = await client.get("/api/institution/dashboard", headers=inst_headers)
        inst_data = inst_dash.json()
        print(f"   ✅ Institution dashboard verified: Total Students = {inst_data.get('total_students')}, Placement Rate = {inst_data.get('placement_rate_percentage')}%")

        # -------------------------------------------------------------
        # 6. DEMO PERSONAS ISOLATION CHECK
        # -------------------------------------------------------------
        print("\n7. Verifying Demo Personas remain unaffected...")
        demo_res = await client.post("/api/auth/demo-login", json={"role": "STUDENT", "profileType": "PRELOADED"})
        assert demo_res.status_code == 200
        demo_data = demo_res.json()
        assert demo_data["success"] is True
        print(f"   ✅ Evaluator 1-Click Demo Persona operational: {demo_data['name']} ({demo_data['role']})")

    print("\n" + "=" * 65)
    print("🎉 ALL DYNAMIC APP & REGISTRATION FLOWS PASSED FLAWLESSLY!")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(run_dynamic_tests())
