import logging
import httpx
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.core.config import get_settings
from app.models.order import Order
from app.models.user import User

logger = logging.getLogger(__name__)

# Set up Jinja2 environment for email templates
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

def send_order_confirmation_email(user_email: str, order: Order, user: User) -> None:
    """
    Sends an order confirmation email asynchronously via Resend API.
    Catches all exceptions to prevent background task failure from crashing the app.
    """
    settings = get_settings()
    
    # If Resend settings are not fully configured, log and return
    if not settings.resend_api_key:
        logger.warning(f"Resend API Key is missing. Skipping confirmation email for order {order.id}.")
        return

    try:
        # Load and render template
        template = env.get_template("order_email.html")
        html_content = template.render(order=order, user=user)

        # Call Resend API
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "from": settings.resend_from_email,
                "to": [user_email],
                "subject": f"Xác nhận đơn hàng đóng góp: {order.id}",
                "html": html_content
            },
            timeout=10.0
        )
        
        response.raise_for_status()
        logger.info(f"Successfully sent order confirmation email via Resend to {user_email} for order {order.id}")
    except Exception as e:
        # We catch all exceptions so that errors (e.g. network issues, invalid credentials) 
        # do not affect the main flow even though it's running in background.
        logger.error(f"Failed to send order confirmation email to {user_email} via Resend. Error: {e}", exc_info=True)
