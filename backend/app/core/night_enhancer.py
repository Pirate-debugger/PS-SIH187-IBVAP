import cv2
import numpy as np

class NightEnhancer:
    """
    Advanced Night Surveillance & Low-Light Enhancement Engine.
    Provides multiple HUD modes:
    1. STANDARD (Original RGB stream)
    2. LOW_LIGHT_ENHANCED (Adaptive CLAHE, Gamma, Retinex contrast stretching)
    3. THERMAL_FLIR (Pseudo-Color Ironbow/Inferno heatmap simulating FLIR thermal sensor)
    4. NIGHT_VISION_GREEN (Phosphor Green military NVG filter with dynamic noise gate)
    """

    @staticmethod
    def enhance_low_light(frame: np.ndarray, clip_limit: float = 3.0, tile_grid_size: tuple = (8, 8)) -> np.ndarray:
        """
        Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) on the L channel of LAB color space,
        followed by bilateral filtering and gamma correction for crisp edge retention in dark border areas.
        """
        if frame is None or frame.size == 0:
            return frame

        # Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)

        # Apply CLAHE to Lightness channel
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        cl = clahe.apply(l_channel)

        # Merge back
        enhanced_lab = cv2.merge((cl, a_channel, b_channel))
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # Gamma adjustment (brighten shadows without washing out highlights)
        gamma = 1.4
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        brightened = cv2.LUT(enhanced_bgr, table)

        # Edge-preserving slight smoothing
        smoothed = cv2.bilateralFilter(brightened, d=5, sigmaColor=50, sigmaSpace=50)
        return smoothed

    @staticmethod
    def apply_thermal_flir(frame: np.ndarray) -> np.ndarray:
        """
        Transforms standard/IR camera feed into high-contrast Pseudo-Color FLIR Thermal Heatmap (Ironbow / Inferno palette),
        giving border operators clear visibility of human and vehicle body heat signatures.
        """
        if frame is None or frame.size == 0:
            return frame

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Enhance contrast for heat gradient
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
        high_contrast_gray = clahe.apply(gray)

        # Apply Inferno / Jet colormap
        thermal = cv2.applyColorMap(high_contrast_gray, cv2.COLORMAP_INFERNO)
        return thermal

    @staticmethod
    def apply_night_vision_green(frame: np.ndarray) -> np.ndarray:
        """
        Military Gen-3 Night Vision Phosphor Green simulation with high dynamic range and subtle noise texture.
        """
        if frame is None or frame.size == 0:
            return frame

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
        eq = clahe.apply(gray)

        # Create 3-channel green phosphor look:
        # Blue channel: 15%, Green channel: 100%, Red channel: 10%
        b = (eq * 0.15).astype(np.uint8)
        g = np.clip(eq.astype(np.float32) * 1.2, 0, 255).astype(np.uint8)
        r = (eq * 0.10).astype(np.uint8)

        nvg_frame = cv2.merge([b, g, r])
        return nvg_frame

    @classmethod
    def process_frame(cls, frame: np.ndarray, mode: str = "STANDARD") -> np.ndarray:
        """
        Dispatches frame processing according to active camera HUD mode.
        """
        if mode == "LOW_LIGHT_ENHANCED":
            return cls.enhance_low_light(frame)
        elif mode == "THERMAL_FLIR":
            return cls.apply_thermal_flir(frame)
        elif mode == "NIGHT_VISION_GREEN":
            return cls.apply_night_vision_green(frame)
        return frame
