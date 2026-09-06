from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.system import Notification
from app.services.auth_service import get_current_user
from pydantic import BaseModel

class NotificationPatch(BaseModel):
    id: Optional[str] = None
    markAll: Optional[bool] = False
    mark_all: Optional[bool] = False

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
@router.get("/")
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    notifs = res.scalars().all()
    notifs_list = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "link": n.link,
            "isRead": n.is_read,
            "is_read": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None,
            "created_at": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifs
    ]
    unread_count = sum(1 for n in notifs if not n.is_read)
    return {
        "notifications": notifs_list,
        "unreadCount": unread_count,
        "unread_count": unread_count
    }

@router.patch("")
@router.patch("/")
async def patch_notifications(
    req: NotificationPatch,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    should_mark_all = req.markAll or req.mark_all
    if should_mark_all:
        await db.execute(
            update(Notification)
            .where(Notification.user_id == current_user.id, Notification.is_read == False)
            .values(is_read=True)
        )
        await db.commit()
        return {"success": True, "message": "All notifications marked as read"}
    elif req.id:
        res = await db.execute(
            select(Notification).where(
                Notification.id == req.id,
                Notification.user_id == current_user.id
            )
        )
        notif = res.scalar_one_or_none()
        if notif:
            notif.is_read = True
            await db.commit()
        return {"success": True}
    return {"success": True}

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notif = res.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    return {"success": True, "id": notif.id}
