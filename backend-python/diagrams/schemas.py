from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DiagramBase(BaseModel):
    name: str
    schema_json: Optional[str] = None
    project_id: int

class DiagramCreate(DiagramBase):
    pass

class DiagramUpdate(BaseModel):
    name: Optional[str] = None
    schema_json: Optional[str] = None

class DiagramResponse(DiagramBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
