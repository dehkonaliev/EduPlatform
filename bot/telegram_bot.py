import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django

django.setup()

from authentication.models import CustomUser

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("Set TELEGRAM_BOT_TOKEN environment variable before running the bot.")

BOT_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"


def send_message(chat_id, text, reply_markup=None):
    payload = {"chat_id": chat_id, "text": text}
    if reply_markup:
        payload["reply_markup"] = reply_markup

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{BOT_API_URL}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def get_updates(offset=0):
    params = {"offset": offset, "timeout": 30}
    url = f"{BOT_API_URL}/getUpdates?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(request, timeout=40) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_phone(phone_number: str):
    if not phone_number:
        return None

    digits = re.sub(r"\D", "", phone_number)
    if not digits:
        return None

    if digits.startswith("998") and len(digits) == 12:
        digits = digits[3:]
    elif digits.startswith("998") and len(digits) > 9:
        digits = digits[3:]

    if digits.startswith("0") and len(digits) == 10:
        digits = digits[1:]

    if len(digits) == 9:
        return digits

    if len(digits) == 10 and digits.startswith("0"):
        return digits[1:]

    return digits


def get_verification_code(phone_number: str):
    normalized = normalize_phone(phone_number)
    if not normalized:
        return None, "I could not understand the phone number. Please try again."

    user = CustomUser.objects.filter(phone_number=normalized).first()
    if not user:
        return None, (
            "I could not find an account with this phone number. "
            "Please make sure you used the same number that you registered with on the website."
        )

    verification = user.codes.filter(is_used=False).order_by("-expire_time").first()
    if not verification:
        return None, (
            "No active verification code was found yet. "
            "Please request a code on the website first."
        )

    return verification.code, (
        f"Your verification code is: {verification.code}\n"
        "Use it on the website to verify your phone number."
    )


def build_contact_keyboard():
    return {
        "keyboard": [[{"text": "Share phone number", "request_contact": True}]],
        "resize_keyboard": True,
        "one_time_keyboard": True,
    }


def handle_update(update):
    message = update.get("message") or {}
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    if not chat_id:
        return

    text = message.get("text", "")
    contact = message.get("contact") or {}

    if not text and not contact:
        return

    if text.startswith("/start") or text.startswith("/help"):
        send_message(
            chat_id,
            "Welcome! Send your phone number or share it with the button below to receive your verification code.",
            reply_markup=build_contact_keyboard(),
        )
        return

    phone_number = None
    if contact:
        phone_number = contact.get("phone_number")
    elif text:
        phone_number = text.strip()

    if not phone_number:
        send_message(chat_id, "Please send your phone number or use the share button.")
        return

    code, response_text = get_verification_code(phone_number)
    send_message(chat_id, response_text)


def main():
    print("Telegram bot started. Waiting for updates...")
    offset = 0
    while True:
        try:
            result = get_updates(offset=offset)
            if result.get("ok"):
                for update in result.get("result", []):
                    offset = max(offset, update.get("update_id", 0) + 1)
                    handle_update(update)
            else:
                print("Telegram API error:", result)
                time.sleep(5)
        except KeyboardInterrupt:
            print("Bot stopped by user.")
            break
        except Exception as exc:
            print(f"Unexpected error: {exc}")
            time.sleep(5)


if __name__ == "__main__":
    main()
