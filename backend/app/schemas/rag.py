from pydantic import BaseModel
from typing import Optional, List


class RAGCitation(BaseModel):
    document_title: str
    section: str
    source_type: str  # Clinical Guideline, Pharmacology Monograph, Research Protocol
    page_number: Optional[int] = None
    snippet: str
    relevance_score: float


class RAGQueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "doctor"  # "doctor" or "patient"
    patient_context_id: Optional[int] = None
    department_filter: Optional[str] = None


class RAGQueryResponse(BaseModel):
    query: str
    mode: str
    answer: str
    grounded_citations: List[RAGCitation]
    clinical_disclaimer: str
    generated_at: str


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: Optional[str] = "patient"  # patient or doctor
    patient_id: Optional[int] = None
