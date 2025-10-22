from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from tcheckerpy.tools import tck_reach

router = APIRouter(prefix="/tck_reach", tags=["tck_reach"])

class TckReachBody(BaseModel):
    sysdecl: str
    labels: list[str]
    algorithm: int
    search_order: str
    certificate: int
    block_size: int | None = None
    table_size: int | None = None

@router.put("")
async def reach(body: TckReachBody = Body(...)):

    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="Request body, sysdecls and algorithm cannot be empty")
    
    _, stats, certificate = tck_reach.reach(
        body.sysdecl,
        tck_reach.Algorithm(body.algorithm),
        search_order=tck_reach.SearchOrder(body.search_order),
        certificate=tck_reach.Certificate(body.certificate),
        labels=body.labels,
        block_size=body.block_size,
        table_size=body.table_size
    )

    return {"stats": stats, "certificate": certificate}