import uuid
import datetime
import json
from typing import Optional, List
from backend.db.models import SessionLocal, CaseModel, CaseEventModel, init_db

# Initialize database tables on module import
init_db()

class CaseRepository:
    @staticmethod
    def create_case(crop: str, location: str) -> CaseModel:
        db = SessionLocal()
        try:
            case_id = f"case_{uuid.uuid4().hex[:8]}"
            case = CaseModel(
                case_id=case_id,
                crop=crop,
                location=location,
                status="active",
                is_active=True
            )
            db.add(case)
            db.commit()
            db.refresh(case)
            return case
        finally:
            db.close()

    @staticmethod
    def get_case(case_id: str) -> Optional[CaseModel]:
        db = SessionLocal()
        try:
            return db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
        finally:
            db.close()

    @staticmethod
    def update_case_status(case_id: str, status: str, latest_summary: str = None) -> Optional[CaseModel]:
        db = SessionLocal()
        try:
            case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
            if case:
                case.status = status
                if latest_summary:
                    case.latest_summary = latest_summary
                case.updated_at = datetime.datetime.utcnow()
                db.commit()
                db.refresh(case)
            return case
        finally:
            db.close()


class CaseEventRepository:
    @staticmethod
    def create_event(
        case_id: str,
        event_type: str,
        snapshot: str,
        disease_name: Optional[str] = None,
        confidence: Optional[float] = None,
        severity: Optional[str] = None,
        risk_score: Optional[int] = None,
        risk_level: Optional[str] = None,
        treatment_summary: Optional[str] = None,
        critic_outcome: Optional[str] = None,
        clarification_state: Optional[str] = None
    ) -> CaseEventModel:
        db = SessionLocal()
        try:
            event_id = f"evt_{uuid.uuid4().hex[:8]}"
            event = CaseEventModel(
                event_id=event_id,
                case_id=case_id,
                event_type=event_type,
                snapshot=snapshot,
                disease_name=disease_name,
                confidence=confidence,
                severity=severity,
                risk_score=risk_score,
                risk_level=risk_level,
                treatment_summary=treatment_summary,
                critic_outcome=critic_outcome,
                clarification_state=clarification_state,
                timestamp=datetime.datetime.utcnow()
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            return event
        finally:
            db.close()

    @staticmethod
    def get_latest_event(case_id: str) -> Optional[CaseEventModel]:
        db = SessionLocal()
        try:
            return db.query(CaseEventModel).filter(CaseEventModel.case_id == case_id).order_by(CaseEventModel.timestamp.desc()).first()
        finally:
            db.close()

    @staticmethod
    def get_events_for_case(case_id: str) -> List[CaseEventModel]:
        db = SessionLocal()
        try:
            return db.query(CaseEventModel).filter(CaseEventModel.case_id == case_id).order_by(CaseEventModel.timestamp.asc()).all()
        finally:
            db.close()
