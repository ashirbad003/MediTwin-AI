from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, ChatRequest
from app.rag.rag_engine import rag_engine
from app.services.admin_service import create_audit_log
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/rag",
    tags=["RAG Medical Knowledge Engine"]
)


@router.post("/query", response_model=RAGQueryResponse)
def query_medical_rag_api(
    req: RAGQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Queries the Medical Knowledge Retrieval-Augmented Generation (RAG) system.
    Returns evidence-grounded answers with authentic citations from clinical practice guidelines.
    """
    mode = req.mode or ("doctor" if current_user.role in ["doctor", "admin"] else "patient")
    result = rag_engine.generate_response(query=req.query, mode=mode)
    
    create_audit_log(
        db,
        action="RAG_MEDICAL_QUERY",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="RAG_Engine",
        resource_id=mode,
        details={"query": req.query, "top_source": result["grounded_citations"][0]["document_title"] if result["grounded_citations"] else None}
    )
    
    return result


@router.post("/chat")
def chat_medical_assistant_api(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interactive multi-turn clinical chat assistant grounded in RAG retrieval.
    """
    last_msg = req.messages[-1].content if req.messages else "Hello"
    mode = req.mode or ("doctor" if current_user.role in ["doctor", "admin"] else "patient")
    
    rag_result = rag_engine.generate_response(query=last_msg, mode=mode)
    
    return {
        "status": "success",
        "message": {
            "role": "assistant",
            "content": rag_result["answer"]
        },
        "citations": rag_result["grounded_citations"],
        "disclaimer": rag_result["clinical_disclaimer"]
    }
