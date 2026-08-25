import math
import time
import cv2
import numpy as np
from typing import Tuple, List, Dict, Any
from app.models.schemas import BoundingBox

class ScenarioSimulator:
    """
    High-Fidelity Dynamic Video & Scenario Generator for SSB Border Intelligence.
    Generates 6 distinct tactical border surveillance scenes with realistic visual terrain,
    moving targets, license plates, thermal heatmaps, and fence infrastructure.
    """

    def __init__(self):
        self.frame_counts: Dict[str, int] = {}
        self.scenario_state: Dict[str, Any] = {}

    def get_frame_count(self, camera_id: str) -> int:
        if camera_id not in self.frame_counts:
            self.frame_counts[camera_id] = 0
        self.frame_counts[camera_id] += 1
        return self.frame_counts[camera_id]

    def render_scenario_frame(
        self, camera_id: str, scenario_id: int, width: int = 640, height: int = 360
    ) -> Tuple[np.ndarray, List[BoundingBox], Dict[str, Any]]:
        """
        Renders a photo-realistic simulated CCTV frame for the given scenario and camera.
        Returns: (cv2_image_frame, list_of_ground_truth_detections, scenario_metadata)
        """
        t = self.get_frame_count(camera_id) * 0.04  # simulated time in seconds
        detections: List[BoundingBox] = []
        meta: Dict[str, Any] = {}

        if scenario_id == 1:
            # SCENARIO 1: Restricted Zone Intrusion (BOP-CAM-01 Zero Line)
            frame = self._render_terrain_bop01(width, height)
            
            # Intruder walks from top-left (North safe area) down into the central Red Restricted Zone
            cycle = (t * 0.25) % 1.0  # repeats every 4 seconds
            # Person path from y=0.25 to y=0.75
            norm_x = 0.35 + 0.15 * math.sin(cycle * math.pi)
            norm_y = 0.25 + 0.50 * cycle

            px = int(norm_x * width)
            py = int(norm_y * height)
            pw, ph = 26, 68

            self._draw_human_figure(frame, px, py, pw, ph, is_crawling=False)

            # Ground truth bounding box (normalized)
            x1 = max(0.0, (px - pw // 2) / width)
            y1 = max(0.0, (py - ph // 2) / height)
            x2 = min(1.0, (px + pw // 2) / width)
            y2 = min(1.0, (py + ph // 2) / height)

            detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.94, label="person", class_id=0))
            meta["scenario_name"] = "Zero-Line Restricted Zone Intrusion"
            meta["intruder_y"] = norm_y

        elif scenario_id == 2:
            # SCENARIO 2: Perimeter Loitering Detection (BOP-CAM-02 Western Wire Grid)
            frame = self._render_terrain_bop02(width, height)

            # Subject paces back and forth along the fence line (lingering > 8 sec)
            pace = math.sin(t * 0.6)  # Oscillates smoothly
            norm_x = 0.50 + 0.18 * pace
            norm_y = 0.55 + 0.04 * math.cos(t * 0.3)

            px = int(norm_x * width)
            py = int(norm_y * height)
            pw, ph = 24, 64

            self._draw_human_figure(frame, px, py, pw, ph, is_crawling=False, coat_color=(40, 40, 80))

            x1 = max(0.0, (px - pw // 2) / width)
            y1 = max(0.0, (py - ph // 2) / height)
            x2 = min(1.0, (px + pw // 2) / width)
            y2 = min(1.0, (py + ph // 2) / height)

            detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.91, label="person", class_id=0))
            meta["scenario_name"] = "Perimeter Loitering Suspicion"

        elif scenario_id == 3:
            # SCENARIO 3: Blacklisted Vehicle & ANPR Trigger (BOP-CAM-03 Checkpost Alpha)
            frame = self._render_terrain_checkpost(width, height)

            # Bolero SUV approaches the checkpost barrier from distance
            cycle = (t * 0.15) % 1.0
            scale = 0.6 + 0.4 * cycle
            norm_x = 0.50
            norm_y = 0.35 + 0.35 * cycle

            vx = int(norm_x * width)
            vy = int(norm_y * height)
            vw = int(140 * scale)
            vh = int(90 * scale)

            self._draw_suv_vehicle(frame, vx, vy, vw, vh, plate_text="HR26DK8337")

            x1 = max(0.0, (vx - vw // 2) / width)
            y1 = max(0.0, (vy - vh // 2) / height)
            x2 = min(1.0, (vx + vw // 2) / width)
            y2 = min(1.0, (vy + vh // 2) / height)

            detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.96, label="car", class_id=2))
            meta["scenario_name"] = "Flagged Smuggler Vehicle ANPR Hit"
            meta["plate_number"] = "HR26DK8337"

        elif scenario_id == 4:
            # SCENARIO 4: Night-Time Stealth Infiltration (BOP-CAM-04 Riverine Marsh)
            frame = self._render_terrain_riverine_night(width, height)

            # Stealth intruder crawling in low-light marsh reeds
            cycle = (t * 0.2) % 1.0
            norm_x = 0.25 + 0.50 * cycle
            norm_y = 0.60 + 0.10 * math.sin(cycle * math.pi * 2)

            px = int(norm_x * width)
            py = int(norm_y * height)
            pw, ph = 45, 24  # Crawling aspect ratio

            self._draw_human_figure(frame, px, py, pw, ph, is_crawling=True)

            x1 = max(0.0, (px - pw // 2) / width)
            y1 = max(0.0, (py - ph // 2) / height)
            x2 = min(1.0, (px + pw // 2) / width)
            y2 = min(1.0, (py + ph // 2) / height)

            detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.88, label="person", class_id=0))
            meta["scenario_name"] = "Night-Time Low-Light Stealth Infiltration"

        elif scenario_id == 5:
            # SCENARIO 5: Multi-Person Directional Perimeter Breach (BOP-CAM-05 North Boundary)
            frame = self._render_terrain_bop05(width, height)

            # Group of 2-3 persons moving together South across virtual tripwire
            cycle = (t * 0.22) % 1.0
            for i, offset_x in enumerate([-0.12, 0.0, 0.14]):
                norm_x = 0.50 + offset_x + 0.02 * math.sin(t + i)
                norm_y = 0.25 + 0.52 * cycle + (i * 0.04)

                px = int(norm_x * width)
                py = int(norm_y * height)
                pw, ph = 24, 62

                self._draw_human_figure(frame, px, py, pw, ph, is_crawling=False)

                x1 = max(0.0, (px - pw // 2) / width)
                y1 = max(0.0, (py - ph // 2) / height)
                x2 = min(1.0, (px + pw // 2) / width)
                y2 = min(1.0, (py + ph // 2) / height)

                detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.92, label="person", class_id=0))

            meta["scenario_name"] = "Multi-Person Directional Boundary Breach"

        else:
            # SCENARIO 6: Checkpost Anomaly / Unattended Cargo (BOP-CAM-06 Gate Bravo)
            frame = self._render_terrain_gate_bravo(width, height)

            # Stationary suspicious cargo package in transit zone + patrol vehicle passing
            cx, cy = int(0.55 * width), int(0.68 * height)
            cw, ch = 30, 26
            # Draw package
            cv2.rectangle(frame, (cx - cw // 2, cy - ch // 2), (cx + cw // 2, cy + ch // 2), (40, 70, 110), -1)
            cv2.rectangle(frame, (cx - cw // 2, cy - ch // 2), (cx + cw // 2, cy + ch // 2), (0, 200, 255), 2)
            cv2.putText(frame, "PKG", (cx - 12, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

            # Occasional vehicle in background
            cycle = (t * 0.18) % 1.0
            vx = int((0.15 + 0.70 * cycle) * width)
            vy = int(0.38 * height)
            vw, vh = 100, 50
            self._draw_suv_vehicle(frame, vx, vy, vw, vh, plate_text="SSB01DEF01")

            x1 = max(0.0, (vx - vw // 2) / width)
            y1 = max(0.0, (vy - vh // 2) / height)
            x2 = min(1.0, (vx + vw // 2) / width)
            y2 = min(1.0, (vy + vh // 2) / height)
            detections.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=0.95, label="car", class_id=2))

            meta["scenario_name"] = "Checkpost Barrier Unattended Cargo Anomaly"

        return frame, detections, meta

    # ================= Background Terrain Generators =================

    def _render_terrain_bop01(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        # Horizon and Sky
        frame[0:int(h * 0.35), :] = [55, 45, 35]
        # Distant hills
        cv2.ellipse(frame, (int(w * 0.3), int(h * 0.35)), (int(w * 0.4), int(h * 0.2)), 0, 0, 360, (40, 50, 40), -1)
        cv2.ellipse(frame, (int(w * 0.8), int(h * 0.35)), (int(w * 0.5), int(h * 0.25)), 0, 0, 360, (35, 45, 35), -1)
        # Ground / Grass terrain
        frame[int(h * 0.35):, :] = [30, 48, 38]
        # Border Fence line
        cv2.line(frame, (0, int(h * 0.42)), (w, int(h * 0.42)), (100, 110, 115), 2)
        for fx in range(0, w, 40):
            cv2.line(frame, (fx, int(h * 0.38)), (fx, int(h * 0.48)), (120, 130, 135), 2)
            cv2.line(frame, (fx, int(h * 0.40)), (fx + 40, int(h * 0.46)), (80, 90, 95), 1)
        # Sector Pillar Marker
        cv2.rectangle(frame, (int(w * 0.15), int(h * 0.35)), (int(w * 0.18), int(h * 0.55)), (200, 210, 220), -1)
        cv2.putText(frame, "84/2", (int(w * 0.15) - 2, int(h * 0.45)), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 1)
        return frame

    def _render_terrain_bop02(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        # Dusk border terrain
        frame[0:int(h * 0.30), :] = [30, 25, 45]
        frame[int(h * 0.30):, :] = [25, 38, 30]
        # Barbed wire zigzag along fence
        cv2.line(frame, (0, int(h * 0.40)), (w, int(h * 0.40)), (70, 75, 80), 2)
        cv2.line(frame, (0, int(h * 0.48)), (w, int(h * 0.48)), (70, 75, 80), 2)
        for fx in range(0, w, 30):
            cv2.line(frame, (fx, int(h * 0.35)), (fx, int(h * 0.55)), (110, 115, 120), 2)
        return frame

    def _render_terrain_checkpost(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        # Checkpost tarmac and inspection lane
        frame[0:int(h * 0.30), :] = [60, 50, 45]
        # Asphalt road
        pts = np.array([[int(w * 0.35), int(h * 0.30)], [int(w * 0.65), int(h * 0.30)], [w, h], [0, h]])
        cv2.fillPoly(frame, [pts], (45, 45, 48))
        # Yellow lane dividers
        cv2.line(frame, (int(w * 0.5), int(h * 0.32)), (int(w * 0.5), h), (0, 200, 230), 2)
        # Checkpost booth & barrier
        cv2.rectangle(frame, (int(w * 0.72), int(h * 0.28)), (int(w * 0.95), int(h * 0.65)), (120, 130, 140), -1)
        cv2.putText(frame, "SSB CHECKPOST", (int(w * 0.73), int(h * 0.34)), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)
        # Barrier arm
        cv2.line(frame, (int(w * 0.35), int(h * 0.55)), (int(w * 0.72), int(h * 0.55)), (0, 0, 220), 4)
        return frame

    def _render_terrain_riverine_night(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        # Dark low-light night background
        frame[:, :] = [18, 20, 18]
        # Water/marsh river reflection
        cv2.ellipse(frame, (int(w * 0.5), int(h * 0.7)), (int(w * 0.6), int(h * 0.3)), 0, 0, 360, (26, 32, 28), -1)
        # Reeds / grass silhouettes
        for rx in range(10, w, 25):
            h_var = int(25 + 15 * math.sin(rx))
            cv2.line(frame, (rx, h), (rx + 5, h - h_var), (15, 28, 18), 2)
        return frame

    def _render_terrain_bop05(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        # Open field border
        frame[0:int(h * 0.30), :] = [50, 45, 40]
        frame[int(h * 0.30):, :] = [32, 45, 34]
        # Virtual Fence boundary line
        cv2.line(frame, (0, int(h * 0.50)), (w, int(h * 0.50)), (60, 80, 100), 2)
        return frame

    def _render_terrain_gate_bravo(self, w: int, h: int) -> np.ndarray:
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        frame[0:int(h * 0.32), :] = [45, 40, 38]
        frame[int(h * 0.32):, :] = [38, 42, 40]
        # Gate barrier
        cv2.rectangle(frame, (int(w * 0.15), int(h * 0.35)), (int(w * 0.25), int(h * 0.65)), (90, 100, 110), -1)
        cv2.rectangle(frame, (int(w * 0.75), int(h * 0.35)), (int(w * 0.85), int(h * 0.65)), (90, 100, 110), -1)
        return frame

    # ================= Target Silhouette Drawers =================

    def _draw_human_figure(
        self, frame: np.ndarray, x: int, y: int, w: int, h: int, is_crawling: bool = False,
        coat_color: tuple = (35, 45, 55)
    ):
        if is_crawling:
            # Crawling horizontal body
            cv2.ellipse(frame, (x, y), (w // 2, h // 2), 0, 0, 360, coat_color, -1)
            cv2.circle(frame, (x + w // 2 - 4, y - 2), 6, (60, 70, 80), -1)
        else:
            # Upright human figure: head, torso, legs
            head_r = max(4, h // 8)
            head_y = y - h // 2 + head_r
            # Head
            cv2.circle(frame, (x, head_y), head_r, (120, 140, 150), -1)
            # Torso
            torso_top = head_y + head_r
            torso_bottom = y + h // 6
            cv2.rectangle(frame, (x - w // 3, torso_top), (x + w // 3, torso_bottom), coat_color, -1)
            # Legs
            cv2.line(frame, (x - w // 4, torso_bottom), (x - w // 4, y + h // 2), (25, 30, 35), max(2, w // 8))
            cv2.line(frame, (x + w // 4, torso_bottom), (x + w // 4, y + h // 2), (25, 30, 35), max(2, w // 8))

    def _draw_suv_vehicle(self, frame: np.ndarray, x: int, y: int, w: int, h: int, plate_text: str = "HR26DK8337"):
        # Vehicle body
        cv2.rectangle(frame, (x - w // 2, y - h // 4), (x + w // 2, y + h // 2), (45, 60, 50), -1)
        # Cabin/Windshield
        cv2.rectangle(frame, (x - w // 3, y - h // 2), (x + w // 3, y - h // 4), (60, 80, 95), -1)
        # Headlights
        cv2.circle(frame, (x - w // 3, y + h // 8), 5, (100, 240, 255), -1)
        cv2.circle(frame, (x + w // 3, y + h // 8), 5, (100, 240, 255), -1)
        # Tires
        cv2.rectangle(frame, (x - w // 2 - 4, y + h // 4), (x - w // 2 + 6, y + h // 2 + 4), (15, 15, 15), -1)
        cv2.rectangle(frame, (x + w // 2 - 6, y + h // 4), (x + w // 2 + 4, y + h // 2 + 4), (15, 15, 15), -1)
        # License Plate Box (White/Yellow Indian Plate)
        pw, ph = int(w * 0.42), int(h * 0.22)
        plate_y = y + h // 4
        cv2.rectangle(frame, (x - pw // 2, plate_y - ph // 2), (x + pw // 2, plate_y + ph // 2), (240, 240, 240), -1)
        cv2.rectangle(frame, (x - pw // 2, plate_y - ph // 2), (x + pw // 2, plate_y + ph // 2), (0, 0, 0), 1)
        # Text on plate
        font_scale = max(0.28, w / 400.0)
        cv2.putText(frame, plate_text, (x - pw // 2 + 2, plate_y + 3), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), 1)
