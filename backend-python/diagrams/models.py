from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    diagrams = relationship("Diagram", back_populates="project", cascade="all, delete-orphan")


class Diagram(Base):
    __tablename__ = "diagrams"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    schema_json = Column(Text, nullable=True) # Contains the React Flow JSON data
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="diagrams")
