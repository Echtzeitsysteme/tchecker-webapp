from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from tcheckerpy.tools import tck_syntax

router = APIRouter(prefix="/tck_syntax", tags=["tck_syntax"])

@router.put("/check", summary="Check syntax of a timed automaton")
def check(body: str = Body(...)):

    if not body or body.strip() == "":
        raise HTTPException(status_code=422, detail="Request body cannot be empty")

    try:
        tck_syntax.check(body)
        return {"status": "success", "message": "Syntax is correct"}
    except Exception as e:
        return {"status": "error", "message": e}

@router.put("/to_dot", summary="Convert timed automaton to DOT format")
def to_dot(body: str = Body(...)):

    if not body or body.strip() == "":
        raise HTTPException(status_code=422, detail="Request body cannot be empty")
        
    return tck_syntax.to_dot(body)

@router.put("/to_json", summary="Convert timed automaton to JSON format")
def to_json(body: str = Body(...)):

    if not body or body.strip() == "":
        raise HTTPException(status_code=422, detail="Request body cannot be empty")
    
    return tck_syntax.to_json(body)


class CreateSynchronizedProductBody(BaseModel):
    sysdecl: str
    process_name: str

@router.put("/create_synchronized_product", summary="Create a synchronized product of timed automata")
def create_product(body: CreateSynchronizedProductBody = Body(...)):

    if not body:
        raise HTTPException(status_code=422, detail="Request body cannot be empty")
        
    return tck_syntax.create_product(body.sysdecl, body.process_name)
