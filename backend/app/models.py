from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(10), default="")
    is_vip = Column(Boolean, default=False)
    vip_expiry = Column(String(20), nullable=True)
    streak = Column(Integer, default=0)
    total_days = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    speak_remaining = Column(Integer, default=5)
    write_remaining = Column(Integer, default=2)
    last_reset_date = Column(String(10), nullable=True)   # YYYY-MM-DD，记录最后一次每日重置日期
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("StudySession", back_populates="user")
    essays = relationship("Essay", back_populates="user")
    error_items = relationship("ErrorItem", back_populates="user")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String(20), nullable=False)  # speak | write | exam | improve
    duration_minutes = Column(Integer, default=0)
    score = Column(Float, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")


class Essay(Base):
    __tablename__ = "essays"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    mode = Column(String(10), default="quick")  # quick | deep
    overall_score = Column(Float, nullable=True)
    correction_result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="essays")


class ErrorItem(Base):
    __tablename__ = "error_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    error_type = Column(String(20), nullable=False)  # grammar | vocab | pronunciation
    content = Column(String(500), nullable=False)
    correction = Column(String(500), nullable=False)
    reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="error_items")


class Conversation(Base):
    """口语对话记录"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scene = Column(String(30), default="free")
    messages = Column(JSON, default=list)  # [{role, content, time, isVoice, tip}]
    last_scores = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
