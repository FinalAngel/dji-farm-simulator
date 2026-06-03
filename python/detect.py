#!/usr/bin/env python3
"""
YOLO animal detector for Lito X1 Cockpit.

Reads a flight video, samples frames at a fixed rate, runs an Ultralytics YOLO
model, and prints a JSON array of detections to stdout. Each detection carries the
frame timestamp and the bounding-box *center pixel*; the Electron app geolocates it
to lng/lat using the matching .SRT telemetry sample.

    python detect.py --video flight.mp4 --sample-fps 2 --min-conf 0.4

NOTE ON DEER: the default COCO model has classes cow/horse/sheep/dog/person but NOT
deer. For reliable fawn/deer detection, pass a custom-trained model via --model
(ideally on a THERMAL drone flown at dawn — see the project README).
"""
import argparse
import json
import sys

# Classes we care about. COCO names on the left; the app maps these to its taxonomy.
KEEP = {"cow", "horse", "sheep", "dog", "person", "bird", "cat", "deer"}


def log(*a):
    print(*a, file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--model", default="yolov8n.pt")
    ap.add_argument("--sample-fps", type=float, default=2.0)
    ap.add_argument("--min-conf", type=float, default=0.4)
    args = ap.parse_args()

    try:
        import cv2
        from ultralytics import YOLO
    except Exception as e:  # pragma: no cover
        log(f"missing dependency: {e}")
        return 2

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        log(f"cannot open video: {args.video}")
        return 3

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(1, int(round(fps / max(0.1, args.sample_fps))))
    model = YOLO(args.model)
    names = model.names

    results_out = []
    frame_idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_idx % step == 0:
            t = frame_idx / fps
            preds = model.predict(frame, conf=args.min_conf, verbose=False)
            for r in preds:
                for box in r.boxes:
                    cls_name = names[int(box.cls[0])]
                    if cls_name not in KEEP:
                        continue
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    results_out.append({
                        "cls": cls_name,
                        "confidence": conf,
                        "frameTimeS": round(t, 2),
                        "px": round((x1 + x2) / 2, 1),
                        "py": round((y1 + y2) / 2, 1),
                    })
        frame_idx += 1

    cap.release()
    log(f"processed {frame_idx} frames, {len(results_out)} detections")
    print(json.dumps(results_out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
