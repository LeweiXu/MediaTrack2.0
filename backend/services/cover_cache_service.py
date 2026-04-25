from __future__ import annotations

import hashlib
import ipaddress
import socket
from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.parse import urljoin, urlparse

import anyio
import httpx
from PIL import Image, ImageOps, UnidentifiedImageError

from config import get_settings

settings = get_settings()

MAX_SOURCE_BYTES = 12 * 1024 * 1024
TIMEOUT = httpx.Timeout(12.0, connect=5.0)
MAX_REDIRECTS = 3


class CoverCacheError(Exception):
    pass


def cover_cache_key(cover_url: str) -> str:
    return hashlib.sha256(cover_url.encode("utf-8")).hexdigest()


def _cover_cache_dir(kind: str) -> Path:
    cache_dir = Path(settings.COVER_CACHE_DIR).expanduser()
    return cache_dir / kind


def thumbnail_cache_path(cover_url: str) -> Path:
    return _cover_cache_dir("thumbnails") / f"{cover_cache_key(cover_url)}.jpg"


def full_cover_cache_path(cover_url: str) -> Path:
    return _cover_cache_dir("full") / f"{cover_cache_key(cover_url)}.jpg"


def _is_public_host(hostname: str) -> bool:
    try:
        addresses = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror:
        return False

    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            return False
    return True


def validate_cover_url(cover_url: str) -> None:
    parsed = urlparse(cover_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise CoverCacheError("Invalid cover URL")
    if not _is_public_host(parsed.hostname):
        raise CoverCacheError("Cover URL host is not allowed")


async def get_cached_thumbnail_path(cover_url: str) -> Path:
    validate_cover_url(cover_url)

    thumbnail_path = thumbnail_cache_path(cover_url)
    if thumbnail_path.exists():
        return thumbnail_path

    full_path = full_cover_cache_path(cover_url)
    if full_path.exists():
        await anyio.to_thread.run_sync(_write_thumbnail_from_file, full_path, thumbnail_path)
        return thumbnail_path

    source_bytes = await _fetch_cover(cover_url)
    await anyio.to_thread.run_sync(_write_full_and_thumbnail, source_bytes, full_path, thumbnail_path)
    return thumbnail_path


async def get_cached_full_cover_path(cover_url: str) -> Path:
    validate_cover_url(cover_url)

    full_path = full_cover_cache_path(cover_url)
    if full_path.exists():
        return full_path

    source_bytes = await _fetch_cover(cover_url)
    await anyio.to_thread.run_sync(_write_full_cover, source_bytes, full_path)
    return full_path


async def _fetch_cover(cover_url: str) -> bytes:
    current_url = cover_url
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=False) as client:
        for _ in range(MAX_REDIRECTS + 1):
            validate_cover_url(current_url)
            async with client.stream("GET", current_url, headers={"User-Agent": "LOG-Media-Library/1.0"}) as response:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        raise CoverCacheError("Cover image redirect is missing a location")
                    current_url = urljoin(current_url, location)
                    continue

                return await _read_image_response(response)

    raise CoverCacheError("Cover image redirected too many times")


async def _read_image_response(response: httpx.Response) -> bytes:
    response.raise_for_status()

    content_type = response.headers.get("content-type", "")
    if content_type and not content_type.lower().startswith("image/"):
        raise CoverCacheError("Cover URL did not return an image")

    chunks: list[bytes] = []
    size = 0
    async for chunk in response.aiter_bytes():
        size += len(chunk)
        if size > MAX_SOURCE_BYTES:
            raise CoverCacheError("Cover image is too large")
        chunks.append(chunk)
    return b"".join(chunks)


def _write_full_and_thumbnail(source_bytes: bytes, full_path: Path, thumbnail_path: Path) -> None:
    try:
        image = _load_cover_image(source_bytes)
        _write_jpeg(image, full_path, quality=82)

        thumbnail = image.copy()
        thumbnail.thumbnail(
            (settings.COVER_THUMBNAIL_WIDTH, settings.COVER_THUMBNAIL_HEIGHT),
            Image.Resampling.LANCZOS,
        )
        _write_jpeg(thumbnail, thumbnail_path, quality=72)
    except (OSError, UnidentifiedImageError) as exc:
        raise CoverCacheError("Failed to process cover image") from exc


def _write_full_cover(source_bytes: bytes, path: Path) -> None:
    try:
        image = _load_cover_image(source_bytes)
        _write_jpeg(image, path, quality=82)
    except (OSError, UnidentifiedImageError) as exc:
        raise CoverCacheError("Failed to process cover image") from exc


def _write_thumbnail_from_file(source_path: Path, thumbnail_path: Path) -> None:
    try:
        with Image.open(source_path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail(
                (settings.COVER_THUMBNAIL_WIDTH, settings.COVER_THUMBNAIL_HEIGHT),
                Image.Resampling.LANCZOS,
            )
            _write_jpeg(image, thumbnail_path, quality=72)
    except (OSError, UnidentifiedImageError) as exc:
        raise CoverCacheError("Failed to process cover image") from exc


def _load_cover_image(source_bytes: bytes) -> Image.Image:
    with Image.open(BytesIO(source_bytes)) as image:
        return ImageOps.exif_transpose(image).convert("RGB")


def _write_jpeg(image: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path: Path | None = None

    try:
        with NamedTemporaryFile(dir=path.parent, suffix=".jpg", delete=False) as tmp:
            tmp_path = Path(tmp.name)
            image.save(tmp, format="JPEG", quality=quality, optimize=True, progressive=True)
    except OSError as exc:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        raise CoverCacheError("Failed to process cover image") from exc

    tmp_path.replace(path)
