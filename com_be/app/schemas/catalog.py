from datetime import date
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel


class Art(CamelModel):
    # "from" is a Python keyword; keep the JSON key via explicit alias.
    from_: str = Field(alias="from")
    to: str
    emoji: str
    real_photo_note: str | None = None


class ProductOut(CamelModel):
    id: str
    slug: str
    name: str
    price: int
    art: Art
    category: Literal["gio", "phu-kien"]
    maker: str
    region: str
    short: str
    description: str
    materials: list[str]
    size: str
    stock: int
    featured: bool = False
    story_slug: str | None = None
    image_url: str | None = None


class StoryOut(CamelModel):
    id: str
    slug: str
    kind: Literal["artisan", "school"]
    title: str
    person: str
    location: str
    excerpt: str
    body: list[str]
    art: Art
    image_url: str | None = None


class ImpactStatOut(CamelModel):
    key: str
    label: str
    value: float
    suffix: str | None = None
    prefix: str | None = None
    emoji: str


class Allocation(CamelModel):
    label: str
    amount: int
    color: str


class ReportOut(CamelModel):
    id: str
    period: str
    title: str
    summary: str
    total_raised: int
    allocations: list[Allocation]
    invoice_label: str


class UpcomingProjectOut(CamelModel):
    id: str
    title: str
    start_date: date
    note: str
    art: Art
