from fastapi import APIRouter

from app.api.endpoints import auth, user


router = APIRouter()
router.include_router(auth)
router.include_router(user)