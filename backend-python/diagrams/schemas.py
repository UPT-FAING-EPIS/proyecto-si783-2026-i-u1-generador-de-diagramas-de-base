from pydantic import BaseModel
from typing import Any, Dict, Optional
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
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_public: bool
    share_access: str

    class Config:
        from_attributes = True

class DiagramBase(BaseModel):
    name: str
    schema_json: Optional[str] = None
    project_id: int
    sql_content: str = ""
    active_dialect: str = "postgresql"

class DiagramCreate(DiagramBase):
    pass

class DiagramUpdate(BaseModel):
    name: Optional[str] = None
    schema_json: Optional[str] = None
    sql_content: Optional[str] = None
    active_dialect: Optional[str] = None

class DiagramResponse(DiagramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VersionCreate(BaseModel):
    project_id: int
    message: str
    flow_json: Dict[str, Any]
    sql_content: str = ""
    active_dialect: str = "postgresql"
    snapshots: Dict[str, str]


class VersionSummary(BaseModel):
    id: int
    version_number: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class VersionDetail(VersionSummary):
    flow_json: Dict[str, Any]
    sql_content: str
    active_dialect: str
    snapshots: Dict[str, str]
