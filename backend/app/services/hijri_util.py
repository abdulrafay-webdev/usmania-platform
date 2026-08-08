from datetime import date
from hijri_converter import Gregorian

def convert_gregorian_to_hijri(g_date: date) -> str:
    """Converts a Python date object to Hijri formatted date string e.g. '23 Safar 1448 AH'"""
    try:
        if not g_date:
            g_date = date.today()
        hijri = Gregorian(g_date.year, g_date.month, g_date.day).to_hijri()
        # Month names in English transliteration
        month_names = [
            "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
            "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
            "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
        ]
        month_name = month_names[hijri.month - 1] if 1 <= hijri.month <= 12 else str(hijri.month)
        return f"{hijri.day} {month_name} {hijri.year} AH"
    except Exception as e:
        return f"Hijri Date Unavailable"
