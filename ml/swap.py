import os
import cv2
import torch
import torch.nn as nn
import numpy as np

from util import load_images
from models import toTensor, var_to_np
from train import model, images_A_mean, images_B_mean

IMAGES_FOLDER = 'data'
SWAPS_FOLDER = 'data/swaps'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
model.eval()


def swap_faces(image_a_path, image_b_path):
    image_a, image_b = load_images([
        os.path.join(IMAGES_FOLDER, 'trump', image_a_path),
        os.path.join(IMAGES_FOLDER, 'cage', image_b_path)]
    ) / 255.0

    image_a += images_B_mean - images_A_mean
    image_b += images_A_mean - images_B_mean

    # Preprocess loaded images
    image_a = cv2.resize(image_a, (64, 64))
    image_b = cv2.resize(image_b, (64, 64))

    image_a = toTensor(image_a).to(device).float()
    image_b = toTensor(image_b).to(device).float()

    # Forward with opposite encoders
    result_a = var_to_np(model(image_a, 'B'))
    result_b = var_to_np(model(image_b, 'A'))
    result_a = np.moveaxis(np.squeeze(result_a), 0, 2)
    result_b = np.moveaxis(np.squeeze(result_b), 0, 2)

    result_a = np.clip(result_a * 255, 0, 255).astype('uint8')
    result_b = np.clip(result_b * 255, 0, 255).astype('uint8')

    image_a_filename = os.path.splitext(image_a_path)[0]
    image_b_filename = os.path.splitext(image_b_path)[0]

    result_a_filename = f'{image_a_filename}-{image_b_filename}.jpg'
    result_b_filename = f'{image_b_filename}-{image_a_filename}.jpg'

    cv2.imwrite(os.path.join(SWAPS_FOLDER, result_a_filename), result_a)
    cv2.imwrite(os.path.join(SWAPS_FOLDER, result_b_filename), result_b)

    return result_a_filename, result_b_filename


if __name__ == '__main__':
    image_a = '3146925.jpg'
    image_b = '825415.jpg'
    swap_faces(image_a, image_b)
