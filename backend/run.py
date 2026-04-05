"""
Entry point — run with:
    python main.py
or:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""
import uvicorn
from config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info",
    )
