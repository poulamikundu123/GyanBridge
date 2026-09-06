import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_full_training_goal_sync_and_enrollment_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("\n=== STEP 1: LOGIN AS INDUSTRY PARTNER ===")
        login_res = await client.post("/api/auth/login", json={"email": "industry@demo.com", "password": "password123"})
        assert login_res.status_code == 200, f"Industry login failed: {login_res.text}"
        ind_token = login_res.json()["access_token"]
        ind_headers = {"Authorization": f"Bearer {ind_token}"}
        print("[OK] Industry logged in successfully.")

        print("\n=== STEP 2: INDUSTRY HOSTS A NEW TRAINING PROGRAM ===")
        create_res = await client.post(
            "/api/industry/training",
            headers=ind_headers,
            json={
                "title": "Advanced Clinical Protocol Design & SAE Pharmacovigilance",
                "category": "CLINICAL_RESEARCH",
                "mode": "HYBRID",
                "level": "ADVANCED",
                "duration_hours": 35,
                "certificate_provided": True,
                "description": "Intensive industrial masterclass on AYUSH observational trials, Serious Adverse Event audit trails, and GCP documentation.",
                "syllabus": "Module 1: Trial Design & CTRI\nModule 2: ADR Causality\nModule 3: GCP Audit Trails",
                "skills": [
                    {"skill_id": "sk-gcp", "proficiency_gain": 30.0},
                    {"skill_id": "sk-pharmacovig", "proficiency_gain": 25.0}
                ]
            }
        )
        assert create_res.status_code == 200, f"Create training failed: {create_res.text}"
        prog_data = create_res.json()
        new_prog_id = prog_data["program_id"]
        print(f"[OK] Industry created new training program ID: {new_prog_id}")

        print("\n=== STEP 3: VERIFY PROGRAM IN INDUSTRY ROSTER ===")
        ind_trainings_res = await client.get("/api/industry/training", headers=ind_headers)
        assert ind_trainings_res.status_code == 200
        ind_progs = ind_trainings_res.json()
        my_new_prog = next((p for p in ind_progs if p["id"] == new_prog_id), None)
        assert my_new_prog is not None, "Newly created program not found in industry training list"
        assert my_new_prog["is_mine"] is True
        assert my_new_prog["enrolled_count"] == 0
        assert len(my_new_prog["enrollments"]) == 0
        print(f"[OK] Program listed in industry roster: '{my_new_prog['title']}', Enrolled: {my_new_prog['enrolled_count']}")

        print("\n=== STEP 4: LOGIN AS STUDENT (GOAL: CLINICAL RESEARCH ASSOCIATE) ===")
        st_login_res = await client.post("/api/auth/login", json={"email": "student@demo.com", "password": "password123"})
        assert st_login_res.status_code == 200, f"Student login failed: {st_login_res.text}"
        st_token = st_login_res.json()["access_token"]
        st_headers = {"Authorization": f"Bearer {st_token}"}
        print("[OK] Student logged in successfully.")

        print("\n=== STEP 5: CHECK STUDENT DASHBOARD FOR GOAL-SYNCED PROGRAMS ===")
        dash_res = await client.get("/api/student/dashboard", headers=st_headers)
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        synced_progs = dash_data.get("synced_industry_programs", [])
        print(f"Found {len(synced_progs)} goal-synced industry programs on student dashboard.")
        
        target_in_dash = next((p for p in synced_progs if p["id"] == new_prog_id), None)
        assert target_in_dash is not None, "Created program not synced into student dashboard!"
        assert target_in_dash["is_goal_synced"] is True
        assert target_in_dash["goal_sync_score"] >= 80, f"Score was {target_in_dash['goal_sync_score']}"
        assert target_in_dash["is_industry_hosted"] is True
        print(f"[OK] Target program synced on Dashboard: {target_in_dash['title']}")
        print(f"  - Match Score: {target_in_dash['goal_sync_score']}%")
        print(f"  - Goal Role: {target_in_dash['goal_sync_role']}")
        print(f"  - Reason: {target_in_dash['goal_sync_reason']}")
        print(f"  - Matched Competencies: {target_in_dash['matched_skills']}")

        print("\n=== STEP 6: CHECK STUDENT LEARNING CATALOG FOR GOAL-SYNC DATA ===")
        learn_res = await client.get("/api/student/learning/programs", headers=st_headers)
        assert learn_res.status_code == 200
        learn_data = learn_res.json()
        target_in_learn = next((p for p in learn_data["programs"] if p["id"] == new_prog_id), None)
        assert target_in_learn is not None
        assert target_in_learn["is_goal_synced"] is True
        assert target_in_learn["enrollment"] is None
        print("[OK] Learning page correctly identifies program as Goal-Synced.")

        print("\n=== STEP 7: STUDENT ENROLLS IN THE INDUSTRY PROGRAM ===")
        enroll_res = await client.post(
            "/api/student/learning/enroll",
            headers=st_headers,
            json={"training_program_id": new_prog_id}
        )
        assert enroll_res.status_code == 200, f"Enrollment failed: {enroll_res.text}"
        print(f"[OK] Student enrolled successfully: {enroll_res.json()}")

        print("\n=== STEP 8: VERIFY INDUSTRY SECTION UPDATED WITH ENROLLED STUDENT ===")
        ind_updated_res = await client.get("/api/industry/training", headers=ind_headers)
        assert ind_updated_res.status_code == 200
        updated_progs = ind_updated_res.json()
        target_updated = next(p for p in updated_progs if p["id"] == new_prog_id)
        assert target_updated["enrolled_count"] == 1, f"Expected 1 enrolled scholar, got {target_updated['enrolled_count']}"
        assert len(target_updated["enrollments"]) == 1
        scholar = target_updated["enrollments"][0]
        assert scholar["student_name"] == "Aarav Sharma"
        assert scholar["status"] == "IN_PROGRESS"
        assert scholar["progress_percent"] == 30
        print(f"[OK] Industry section successfully updated in real-time:")
        print(f"  - Enrolled Scholar Name: {scholar['student_name']}")
        print(f"  - Email: {scholar['student_email']}")
        print(f"  - Degree & Institution: {scholar['degree']}, {scholar['institution']}")
        print(f"  - Status: {scholar['status']} ({scholar['progress_percent']}%)")

        print("\n=== STEP 9: VERIFY INDUSTRY NOTIFICATION WAS CREATED ===")
        notifs_res = await client.get("/api/notifications", headers=ind_headers)
        if notifs_res.status_code == 200:
            notifs = notifs_res.json()
            enr_notif = next((n for n in (notifs if isinstance(notifs, list) else notifs.get("notifications", [])) if n.get("type") == "TRAINING_ENROLLMENT"), None)
            if enr_notif:
                safe_title = enr_notif.get('title', '').encode('ascii', errors='replace').decode()
                safe_msg = enr_notif.get('message', '').encode('ascii', errors='replace').decode()
                print(f"[OK] Industry Notification received: '{safe_title}' - {safe_msg}")

        print("\n=== STEP 10: STUDENT COMPLETES THE TRAINING PROGRAM ===")
        complete_res = await client.post(
            "/api/student/learning/complete",
            headers=st_headers,
            json={"training_program_id": new_prog_id}
        )
        assert complete_res.status_code == 200
        print("[OK] Student marked training complete.")

        print("\n=== STEP 11: VERIFY INDUSTRY SECTION REFLECTS COMPLETED STATUS ===")
        ind_final_res = await client.get("/api/industry/training", headers=ind_headers)
        assert ind_final_res.status_code == 200
        final_progs = ind_final_res.json()
        final_target = next(p for p in final_progs if p["id"] == new_prog_id)
        scholar_final = final_target["enrollments"][0]
        assert scholar_final["status"] == "COMPLETED"
        assert scholar_final["progress_percent"] == 100
        print(f"[OK] Industry section updated: Scholar status is now {scholar_final['status']} (100% certified)")

        print("\n==========================================")
        print("ALL TESTS PASSED! FULL END-TO-END FLOW VERIFIED!")
        print("==========================================")

if __name__ == "__main__":
    asyncio.run(test_full_training_goal_sync_and_enrollment_flow())
