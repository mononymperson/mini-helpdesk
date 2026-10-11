from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field


DataT = TypeVar("DataT")

class Pagination(BaseModel):
    current_page: int
    per_page: int
    total_pages: int
    total_items: int


class ResponseJson(BaseModel, Generic[DataT]):
    model_config = ConfigDict(from_attributes=True)

    data: DataT | None = None
    message: str
    errors: dict[str, str] | None = Field(
        default=None,
        examples=[{"email": "email is required"}],
    )

class ResponseWithPagination(ResponseJson[DataT], Generic[DataT]):
    pagination: Pagination | None = Field(
        default=None,
        examples=[{
            "current_page": "int",
            "per_page": "int",
            "total_pages": "int",
            "total_items": "int",
        }],
    )

class ResponseValidationError(BaseModel):
    data: None = None
    message: str = "Validation failed"
    errors: dict[str, str] = Field(
        default_factory=dict,
        examples=[{"field": "field is required"}],
    )
