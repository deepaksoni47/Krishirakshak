import datetime
import os
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class CaseModel(Base):
    __tablename__ = "cases"
    
    case_id = Column(String, primary_key=True, index=True)
    crop = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="active")  # "active" | "monitoring" | "escalated" | "resolved" | "closed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    latest_summary = Column(Text, nullable=True)

class CaseEventModel(Base):
    __tablename__ = "case_events"
    
    event_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False)
    event_type = Column(String, default="diagnosis")  # "diagnosis" | "follow_up"
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    snapshot = Column(Text, nullable=False)  # JSON string of FarmerCase details
    disease_name = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    severity = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    treatment_summary = Column(Text, nullable=True)
    critic_outcome = Column(String, nullable=True)
    clarification_state = Column(String, nullable=True)

# Database Engine initialization
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "krishirakshak.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Ensure data directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
