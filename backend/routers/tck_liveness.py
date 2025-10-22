from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from tcheckerpy.tools import tck_liveness

router = APIRouter(prefix="/tck_liveness", tags=["tck_liveness"])

class TckLivenessBody(BaseModel):
    sysdecl: str
    labels: list[str]
    algorithm: int
    certificate: int
    block_size: int | None = None
    table_size: int | None = None

@router.put("")
async def liveness(body: TckLivenessBody = Body(...)):

    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="Request body and sysdecls cannot be empty")

    _, stats, certificate = tck_liveness.liveness(
        body.sysdecl,
        labels=body.labels,
        algorithm=tck_liveness.Algorithm(body.algorithm),
        certificate=tck_liveness.Certificate(body.certificate),
        block_size=body.block_size,
        table_size=body.table_size
    )
   
    return {"stats": stats, "certificate": certificate}
