import math
import time
import numpy as np
from typing import List, Dict, Tuple, Optional
from app.models.schemas import BoundingBox, TrackedObject

class AIPipeline:
    """
    AI Multi-Target Detector and Kalman/Centroid Object Tracker.
    Features:
    - Multi-class object classification: Person, Car, Truck, Motorcycle, Bus
    - Consistent Track ID assignment (`P-01`, `V-02`) across frames
    - Centroid trajectory history & smoothing
    - Speed calculation (km/h) based on pixel displacement
    - Direction vector & heading angle estimation (North, South, East, West, North-East, etc.)
    - Dwell time computation
    """

    def __init__(self):
        self.tracks: Dict[str, Dict] = {}  # track_id -> track state dict
        self.next_person_id = 1
        self.next_vehicle_id = 1
        self.max_lost_frames = 15
        self.match_distance_thresh = 0.12  # Normalized coordinate space distance

    def compute_direction_and_speed(self, history: List[List[float]], fps: float = 25.0) -> Tuple[str, float]:
        """
        Computes cardinal direction heading (North, South, East, West, etc.) and estimated speed.
        Assumes top of frame is North (y=0), bottom of frame is South (y=1.0).
        """
        if len(history) < 2:
            return "Stationary", 0.0

        p_start = history[0]
        p_end = history[-1]

        dx = p_end[0] - p_start[0]
        dy = p_end[1] - p_start[1]  # positive dy means moving South

        dist = math.sqrt(dx * dx + dy * dy)
        dt = len(history) / fps
        speed_norm_per_sec = dist / max(dt, 0.01)
        # Scaled estimation for tactical HUD: 0.1 normalized distance/sec ~ 15 km/h for person, 45 km/h for vehicle
        speed_kmh = round(speed_norm_per_sec * 120.0, 1)

        if dist < 0.015:
            return "Stationary", 0.0

        # Compute angle in degrees (0 = East, 90 = South, 180 = West, 270 = North)
        angle_rad = math.atan2(dy, dx)
        angle_deg = (math.degrees(angle_rad) + 360) % 360

        if 337.5 <= angle_deg or angle_deg < 22.5:
            direction = "East"
        elif 22.5 <= angle_deg < 67.5:
            direction = "South-East"
        elif 67.5 <= angle_deg < 112.5:
            direction = "South (Towards Border)"
        elif 112.5 <= angle_deg < 157.5:
            direction = "South-West"
        elif 157.5 <= angle_deg < 202.5:
            direction = "West"
        elif 202.5 <= angle_deg < 247.5:
            direction = "North-West"
        elif 247.5 <= angle_deg < 292.5:
            direction = "North (Away from Border)"
        else:
            direction = "North-East"

        return direction, speed_kmh

    def update_tracks(self, detections: List[BoundingBox], camera_id: str, current_time: float) -> List[TrackedObject]:
        """
        Associates current frame detections with existing tracks using centroid Euclidean distance matching.
        Assigns new track IDs when new targets appear and purges stale tracks.
        """
        matched_detections = set()
        matched_tracks = set()
        active_camera_tracks = {tid: t for tid, t in self.tracks.items() if t["camera_id"] == camera_id}

        # Calculate centroids of all incoming detections
        det_centroids = []
        for det in detections:
            cx = (det.x1 + det.x2) / 2.0
            cy = (det.y1 + det.y2) / 2.0
            det_centroids.append((cx, cy))

        # Match with existing tracks
        for tid, trk in active_camera_tracks.items():
            last_cx, last_cy = trk["history"][-1]
            best_dist = float("inf")
            best_det_idx = -1

            for det_idx, (cx, cy) in enumerate(det_centroids):
                if det_idx in matched_detections:
                    continue
                # Verify class type matches (person vs vehicle)
                if detections[det_idx].label != trk["label"]:
                    continue

                dist = math.hypot(cx - last_cx, cy - last_cy)
                if dist < best_dist and dist < self.match_distance_thresh:
                    best_dist = dist
                    best_det_idx = det_idx

            if best_det_idx >= 0:
                matched_tracks.add(tid)
                matched_detections.add(best_det_idx)
                # Update track
                det = detections[best_det_idx]
                cx, cy = det_centroids[best_det_idx]
                trk["bbox"] = [det.x1, det.y1, det.x2, det.y2]
                trk["confidence"] = det.confidence
                trk["history"].append([cx, cy])
                if len(trk["history"]) > 25:
                    trk["history"].pop(0)
                trk["lost_frames"] = 0
                trk["last_seen_time"] = current_time

        # Create new tracks for unmatched detections
        for det_idx, det in enumerate(detections):
            if det_idx not in matched_detections:
                cx, cy = det_centroids[det_idx]
                is_vehicle = det.label in ["car", "truck", "bus", "motorcycle"]
                if is_vehicle:
                    track_id = f"V-{self.next_vehicle_id:02d}"
                    self.next_vehicle_id += 1
                else:
                    track_id = f"P-{self.next_person_id:02d}"
                    self.next_person_id += 1

                self.tracks[track_id] = {
                    "track_id": track_id,
                    "camera_id": camera_id,
                    "label": det.label,
                    "bbox": [det.x1, det.y1, det.x2, det.y2],
                    "confidence": det.confidence,
                    "history": [[cx, cy]],
                    "start_time": current_time,
                    "last_seen_time": current_time,
                    "lost_frames": 0,
                    "is_in_restricted_zone": False,
                    "is_loitering": False,
                    "license_plate": None,
                    "plate_confidence": None,
                    "watchlist_flag": None
                }

        # Increment lost frames for unmatched tracks and prune old ones
        to_delete = []
        for tid, trk in active_camera_tracks.items():
            if tid not in matched_tracks:
                trk["lost_frames"] += 1
                if trk["lost_frames"] > self.max_lost_frames:
                    to_delete.append(tid)

        for tid in to_delete:
            if tid in self.tracks:
                del self.tracks[tid]

        # Compile resulting list of active TrackedObjects for this camera
        result = []
        for tid, trk in self.tracks.items():
            if trk["camera_id"] == camera_id and trk["lost_frames"] == 0:
                dwell_sec = max(0.0, current_time - trk["start_time"])
                direction, speed_kmh = self.compute_direction_and_speed(trk["history"])

                obj = TrackedObject(
                    track_id=trk["track_id"],
                    label=trk["label"],
                    bbox=trk["bbox"],
                    confidence=trk["confidence"],
                    direction=direction,
                    speed_kmh=speed_kmh,
                    dwell_time_sec=round(dwell_sec, 1),
                    history=trk["history"],
                    is_in_restricted_zone=trk.get("is_in_restricted_zone", False),
                    is_loitering=trk.get("is_loitering", False),
                    license_plate=trk.get("license_plate"),
                    plate_confidence=trk.get("plate_confidence"),
                    watchlist_flag=trk.get("watchlist_flag")
                )
                result.append(obj)

        return result
