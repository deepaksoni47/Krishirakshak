from typing import TypedDict, Optional, List, Dict, Any
from backend.schemas.farmer_case import FarmerCase

class AgentState(TypedDict):
    """
    State representing the data passed between agents in the KrishiRakshak AI workflow.
    """
    farmer_case: FarmerCase
    workflow_path: List[str]
    route: Optional[str]
