import os
import sys

from flask import Flask, request, send_from_directory, render_template, abort, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

sys.path.append('ml')
from ml.swap import swap_faces

app = Flask(__name__, static_folder='./ui/build/static', template_folder='./ui/build')

# Allow 
CORS(app)

# Path for uploaded images
FACES_FOLDER = 'data/'
# ALLOWED_FACES = ['trump', 'cage']

# Allowed file extansions
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
app.config['FACES_FOLDER'] = FACES_FOLDER


@app.route("/api/images/<person>/", methods=['get'])
def get_image_names(person):
    person = secure_filename(person)
    try:
        image_names = os.listdir(os.path.join(FACES_FOLDER, person))
    except FileNotFoundError:
        abort(404)

    return jsonify(image_names)


@app.route("/api/image/<person>/<image_name>", methods=['get'])
def get_image(person, image_name):
    image_name = secure_filename(image_name)
    return send_from_directory(os.path.join(FACES_FOLDER, person), image_name)


@app.route("/api/swap/", methods=['get'])
def swap_images():
    image_a = secure_filename(request.args.get('imageA'))
    image_b = secure_filename(request.args.get('imageB'))
    result_a, result_b = swap_faces(image_a, image_b)
    return jsonify({'resultA': result_a, 'resultB': result_b})


@app.route("/")
def index():
    return render_template("/index.html")


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
