from app.routers.academician import (
    get_academician_dashboard,
    get_academician_opportunities,
    get_research_collaboration_hub,
    create_research_project,
    get_academician_mentorships,
    handle_mentorship_action_post,
    handle_mentorship_request,
    get_academician_profile,
    update_academician_profile,
    get_academician_mentorship_offering,
    update_academician_mentorship_offering
)
from fastapi import APIRouter

router = APIRouter(prefix="/faculty", tags=["Faculty"])

router.add_api_route("/dashboard", get_academician_dashboard, methods=["GET"])
router.add_api_route("/opportunities", get_academician_opportunities, methods=["GET"])
router.add_api_route("/research", get_research_collaboration_hub, methods=["GET"])
router.add_api_route("/research", create_research_project, methods=["POST"])
router.add_api_route("/mentorships", get_academician_mentorships, methods=["GET"])
router.add_api_route("/mentorship-offering", get_academician_mentorship_offering, methods=["GET"])
router.add_api_route("/mentorship-offering", update_academician_mentorship_offering, methods=["PUT"])
router.add_api_route("/mentorship-action", handle_mentorship_action_post, methods=["POST"])
router.add_api_route("/mentorship/{request_id}/action", handle_mentorship_request, methods=["PUT"])
router.add_api_route("/profile", get_academician_profile, methods=["GET"])
router.add_api_route("/profile", update_academician_profile, methods=["PUT"])
