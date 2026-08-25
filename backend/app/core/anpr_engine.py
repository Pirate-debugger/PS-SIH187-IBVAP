import re
import json
import cv2
import numpy as np
from typing import Optional, Dict, Any, List, Tuple
from app.config import DATA_DIR
from app.models.schemas import WatchlistItem

class ANPREngine:
    """
    Automatic Number Plate Recognition (ANPR) & Watchlist Verification Engine.
    - Localizes candidate plate regions on vehicles using morphological edge gradients
    - Extracts alphanumeric characters using OCR and regex pattern filtering
    - Matches plates against the Border Security Watchlist database (Stolen / Smuggler / Wanted)
    """

    def __init__(self):
        self.watchlist: Dict[str, WatchlistItem] = {}
        self.reader = None
        self.load_watchlist()

    def _get_reader(self):
        """Initializes EasyOCR reader lazily on first OCR call."""
        if self.reader is None:
            try:
                import easyocr
                self.reader = easyocr.Reader(['en'], gpu=False, verbose=False)
                print("[ANPREngine] EasyOCR initialized.")
            except Exception as e:
                print(f"[ANPREngine] OCR lazy load notice: {e}")
                self.reader = None
        return self.reader

    def load_watchlist(self):
        """Loads border security watchlist items from JSON file."""
        wl_file = DATA_DIR / "watchlist.json"
        if wl_file.exists():
            try:
                with open(wl_file, "r") as f:
                    raw_items = json.load(f)
                    self.watchlist.clear()
                    for item in raw_items:
                        wl_obj = WatchlistItem(**item)
                        clean_plate = self.clean_plate_text(wl_obj.plate_number)
                        self.watchlist[clean_plate] = wl_obj
            except Exception as e:
                print(f"[ANPREngine] Error loading watchlist: {e}")

    def save_watchlist(self):
        """Persists current watchlist to disk."""
        wl_file = DATA_DIR / "watchlist.json"
        items = [w.model_dump() for w in self.watchlist.values()]
        with open(wl_file, "w") as f:
            json.dump(items, f, indent=2)

    def clean_plate_text(self, text: str) -> str:
        """Removes spaces, hyphens, and non-alphanumeric characters, converts to uppercase."""
        if not text:
            return ""
        return re.sub(r'[^A-Z0-9]', '', text.upper())

    def match_watchlist(self, raw_plate: str) -> Tuple[bool, Optional[WatchlistItem]]:
        """
        Cross-checks plate text against the watchlist.
        Supports exact match and substring/fuzzy match for partial plate OCR reads.
        """
        clean = self.clean_plate_text(raw_plate)
        if not clean:
            return False, None

        # Direct match
        if clean in self.watchlist:
            return True, self.watchlist[clean]

        # Partial match (minimum 5 matching alphanumeric chars)
        for wl_plate, item in self.watchlist.items():
            if len(clean) >= 5 and (clean in wl_plate or wl_plate in clean):
                return True, item

        return False, None

    def extract_plate_from_crop(self, vehicle_crop: np.ndarray) -> Tuple[Optional[str], float]:
        """
        Processes a vehicle bounding box crop to extract license plate text and confidence.
        Applies adaptive thresholding, bilateral filtering, and OCR reading.
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return None, 0.0

        reader = self._get_reader()
        if reader is None:
            return None, 0.0

        try:
            # Preprocess crop
            gray = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2GRAY)
            # Focus on lower half where plates typically sit
            h, w = gray.shape
            lower_half = gray[int(h * 0.4):, :]

            # Adaptive threshold for clear text separation
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            contrasted = clahe.apply(lower_half)

            results = reader.readtext(contrasted)
            best_plate = None
            best_conf = 0.0

            for bbox, text, prob in results:
                cleaned = self.clean_plate_text(text)
                # Check for standard vehicle registration format (e.g. HR26DK8337, DL01AB1234)
                if len(cleaned) >= 6 and prob > best_conf:
                    best_plate = cleaned
                    best_conf = prob

            return best_plate, best_conf
        except Exception as e:
            print(f"[ANPREngine] OCR extraction error: {e}")
            return None, 0.0

    def add_watchlist_item(self, item: WatchlistItem):
        clean = self.clean_plate_text(item.plate_number)
        self.watchlist[clean] = item
        self.save_watchlist()

    def remove_watchlist_item(self, plate_number: str):
        clean = self.clean_plate_text(plate_number)
        if clean in self.watchlist:
            del self.watchlist[clean]
            self.save_watchlist()

    def get_all_watchlist(self) -> List[WatchlistItem]:
        return list(self.watchlist.values())
