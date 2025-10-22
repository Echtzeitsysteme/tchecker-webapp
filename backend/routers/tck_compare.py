from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from tcheckerpy.tools import tck_compare

router = APIRouter(prefix="/tck_compare", tags=["tck_compare"])

class TckCompareBody(BaseModel):
    first_sysdecl: str
    second_sysdecl: str
    relationship: int
    generate_witness: bool
    block_size: int | None = None
    table_size: int | None = None

@router.put("")
async def compare(body: TckCompareBody = Body(...)):

    if not body or not body.first_sysdecl or not body.second_sysdecl:
        raise HTTPException(status_code=422, detail="Request body and sysdecls cannot be empty")

    _, stats, witness = tck_compare.compare(
        body.first_sysdecl,
        body.second_sysdecl,
        relationship=tck_compare.Relationship(body.relationship),
        generate_witness=body.generate_witness,
        block_size=body.block_size,
        table_size=body.table_size
    )

    return {"stats": stats, "witness": witness}
