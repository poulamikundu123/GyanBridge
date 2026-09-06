import asyncio
import sys
import os
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.main import app

async def test_logins():
    roles = [
        ("student@demo.com", "password123", "STUDENT"),
        ("industry@demo.com", "password123", "INDUSTRY"),
        ("faculty@demo.com", "password123", "ACADEMICIAN"),
        ("admin@demo.com", "password123", "INSTITUTION")
    ]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        for email, pwd, expected_role in roles:
            r = await client.post("/api/auth/login", json={"email": email, "password": pwd})
            assert r.status_code == 200, f"Login failed for {email}: {r.text}"
            data = r.json()
            assert data["role"] == expected_role, f"Expected {expected_role}, got {data['role']}"
            print(f"PASS: {email} -> Role: {data['role']} | Name: {data['name']} | ProfileID: {data['profile_id']}")
    
    print("\nALL 4 ROLES AUTHENTICATED SUCCESSFULLY IN FASTAPI!")

if __name__ == "__main__":
    asyncio.run(test_logins())
