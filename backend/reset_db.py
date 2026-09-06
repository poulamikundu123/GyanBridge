import asyncio
from app.seed.seed_data import seed_database

async def main():
    print("Resetting AYUSH platform database and reseeding canonical data...")
    await seed_database(force_reset=True)
    print("Database reset and reseeded successfully!")

if __name__ == "__main__":
    asyncio.run(main())
