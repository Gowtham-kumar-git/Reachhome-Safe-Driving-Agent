from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from ultralytics import YOLO

app = Flask(__name__)
model = YOLO("yolov8n.pt")


@app.route('/')
def index():
    return render_template('mainpage.html')


@app.route('/detect', methods=['POST'])
def detect():
    data = request.json['image']
    encoded_data = data.split(',')[1]
    img_data = base64.b64decode(encoded_data)
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model.predict(source=frame, conf=0.4, device=0, verbose=False)

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            if label in ["car", "truck", "person", "bus", "motorbike"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    _, buffer = cv2.imencode('.jpg', frame)
    frame_encoded = base64.b64encode(buffer).decode('utf-8')
    return jsonify({'image': f'data:image/jpeg;base64,{frame_encoded}'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
