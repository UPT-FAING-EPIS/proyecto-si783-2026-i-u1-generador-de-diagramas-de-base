from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.core.database import get_db
from diagrams.models import Project, Diagram
from diagrams.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    DiagramCreate, DiagramUpdate, DiagramResponse
)
from backend.models.schemas import ConexionRequest, DatabaseSchema
from backend.connectors.connector_factory import get_connector
from backend.analyzers.schema_analyzer import analyze_schema
from pydantic import BaseModel

class GenerateDiagramRequest(BaseModel):
    connection: ConexionRequest
    selected_tables: List[str]
    name: str

router = APIRouter(tags=["ER Diagrams"])

# ==========================================
# PROJECTS
# ==========================================

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    return db.query(Project).order_by(Project.created_at.desc()).all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/projects", response_model=ProjectResponse)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(name=req.name, description=req.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, req: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if req.name is not None:
        project.name = req.name
    if req.description is not None:
        project.description = req.description
        
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}

# ==========================================
# DIAGRAMS
# ==========================================

@router.get("/diagrams", response_model=List[DiagramResponse])
def list_diagrams(projectId: Optional[int] = None, db: Session = Depends(get_db)):
    """List diagrams, optionally filtered by projectId"""
    query = db.query(Diagram)
    if projectId:
        query = query.filter(Diagram.project_id == projectId)
    return query.order_by(Diagram.created_at.desc()).all()

@router.get("/diagrams/{diagram_id}", response_model=DiagramResponse)
def get_diagram(diagram_id: int, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.post("/diagrams", response_model=DiagramResponse)
def create_diagram(req: DiagramCreate, db: Session = Depends(get_db)):
    diagram = Diagram(
        name=req.name, 
        schema_json=req.schema_json, 
        project_id=req.project_id
    )
    db.add(diagram)
    db.commit()
    db.refresh(diagram)
    return diagram

@router.patch("/diagrams/{diagram_id}", response_model=DiagramResponse)
def update_diagram(diagram_id: int, req: DiagramUpdate, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    if req.name is not None:
        diagram.name = req.name
    if req.schema_json is not None:
        diagram.schema_json = req.schema_json
        
    db.commit()
    db.refresh(diagram)
    return diagram

@router.delete("/diagrams/{diagram_id}")
def delete_diagram(diagram_id: int, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    db.delete(diagram)
    db.commit()
    return {"ok": True}

import json

@router.post("/diagrams/generate", response_model=DiagramResponse)
def generate_diagram_from_db(req: GenerateDiagramRequest, projectId: int = Query(...), db: Session = Depends(get_db)):
    """Generates an ER diagram from the database and saves it to a project"""
    
    project = db.query(Project).filter(Project.id == projectId).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        with get_connector(req.connection) as connector:
            full_schema = analyze_schema(connector)
            
        selected_tables = [t for t in full_schema.tables if t.name in req.selected_tables]
        
        nodes = []
        edges = []
        y_offset = 0
        x_offset = 0
        
        for idx, table in enumerate(selected_tables):
            node_id = table.name
            nodes.append({
                "id": node_id,
                "type": "table",
                "position": {"x": x_offset, "y": y_offset},
                "data": {
                    "name": table.name,
                    "columns": [
                        {
                            "name": col.name,
                            "type": col.data_type,
                            "isPrimary": col.is_primary_key,
                            "isForeign": bool(col.foreign_key)
                        } for col in table.columns
                    ]
                }
            })
            
            x_offset += 350
            if (idx + 1) % 3 == 0:
                x_offset = 0
                y_offset += 400
                
            for col in table.columns:
                if col.foreign_key and col.foreign_key.get("table") in req.selected_tables:
                    edges.append({
                        "id": f"e-{col.foreign_key['table']}-{table.name}-{col.name}",
                        "source": col.foreign_key["table"],
                        "target": table.name,
                        "type": "smoothstep",
                        "animated": True,
                        "label": "1:N"
                    })
                    
        flow_json = json.dumps({"nodes": nodes, "edges": edges})
        
        diagram = Diagram(
            name=req.name,
            schema_json=flow_json,
            project_id=projectId
        )
        db.add(diagram)
        db.commit()
        db.refresh(diagram)
        return diagram
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

