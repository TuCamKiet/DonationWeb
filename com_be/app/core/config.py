from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7
    # OAuth client ID from Google Cloud Console; when set, tokens are
    # rejected unless they were issued for this app.
    google_client_id: str | None = None
    firebase_credentials_path: str | None = None
    firebase_project_id: str | None = None
    cors_origins: list[str] = ["http://localhost:5173"]

    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None

    @property
    def async_database_url(self) -> str:
        """DATABASE_URL rewritten for asyncpg.

        asyncpg rejects libpq-only query params (sslmode, channel_binding);
        strip them here — SSL is passed via connect_args instead.
        """
        if self.database_url.startswith("sqlite"):
            return self.database_url

        scheme, netloc, path, query, fragment = urlsplit(self.database_url)
        if scheme == "postgresql":
            scheme = "postgresql+asyncpg"
        params = [(k, v) for k, v in parse_qsl(query) if k not in ("sslmode", "channel_binding")]
        return urlunsplit((scheme, netloc, path, urlencode(params), fragment))

    @property
    def database_ssl_required(self) -> bool:
        query = dict(parse_qsl(urlsplit(self.database_url).query))
        return query.get("sslmode", "") not in ("", "disable")


@lru_cache
def get_settings() -> Settings:
    return Settings()
