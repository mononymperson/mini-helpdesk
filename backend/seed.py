from app.db.session import SessionLocal
from app.models import Business, User, Role
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Business).count() > 0:
            print("Data already exists, skipping seed")
            return
        # Business 1
        biz1 = Business(name="Tech Solutions Inc", slug="tech-solutions")
        biz2 = Business(name="Support Co", slug="support-co")
        db.add_all([biz1, biz2])
        db.flush()
        # Users for biz1
        db.add_all([
            User(business_id=biz1.id, name="Alice Admin", email="alice.admin@techsol.com", password_hash=hash_password("password123"), role=Role.ADMIN),
            User(business_id=biz1.id, name="Bob Agent", email="bob.agent@techsol.com", password_hash=hash_password("password123"), role=Role.AGENT),
            User(business_id=biz1.id, name="Carol Customer", email="carol.customer@techsol.com", password_hash=hash_password("password123"), role=Role.CUSTOMER),
            User(business_id=biz1.id, name="Dave Customer", email="dave.customer@techsol.com", password_hash=hash_password("password123"), role=Role.CUSTOMER),
        ])
        # Users for biz2
        db.add_all([
            User(business_id=biz2.id, name="Eve Admin", email="eve.admin@supportco.com", password_hash=hash_password("password123"), role=Role.ADMIN),
            User(business_id=biz2.id, name="Frank Agent", email="frank.agent@supportco.com", password_hash=hash_password("password123"), role=Role.AGENT),
            User(business_id=biz2.id, name="Grace Customer", email="grace.customer@supportco.com", password_hash=hash_password("password123"), role=Role.CUSTOMER),
            User(business_id=biz2.id, name="Henry Customer", email="henry.customer@supportco.com", password_hash=hash_password("password123"), role=Role.CUSTOMER),
        ])
        db.commit()
        print("Seed completed")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
