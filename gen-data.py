import io
import glob
import json
import os
import sys
import shutil
import subprocess

SRC_DIR = '.'
DATA_DIR = './data'
THUMBS_DIR = os.path.join(DATA_DIR, 'thumbs')
IGNORE_FILES = ['.DS_Store']

def is_student_dir(path):
    parts = path.split('-')
    if len(parts) >= 2:
        if len(parts[0]) == 2:
            return True

def get_student_name(path):
    return path.split('-')[1]

def get_student_id(path):
    return path.split('-')[0]

def copy_image(data, path, filename):
    return shutil.copy(path, os.path.join(DATA_DIR, data['id'] + '-' + filename))

def append_description(data, desc_dir):
    txt_files = glob.glob(os.path.join(desc_dir, '*.txt'))
    if len(txt_files) > 0:
        with io.open(txt_files[0], mode='r', encoding='latin-1') as f:
            data['description'] = f.read()
    else:
        data['description'] = ''

def append_main_img(data, main_img_dir):
    images = os.listdir(main_img_dir)
    if len(images) > 0:
        for img in images:
            if not img in IGNORE_FILES:
                data['main_image'] = copy_image(data, os.path.join(main_img_dir, images[0]), images[0])
                break

def append_extra_img(data, extra_img_dir):
    images = os.listdir(extra_img_dir)
    if len(images) > 0:
        extra_images = []
        for img in images:
            if not img in IGNORE_FILES:
                extra_images.append(copy_image(data, os.path.join(extra_img_dir, img), img))
        data['extra_images'] = extra_images

def append_proto_img(data, proto_img_dir):
    images = os.listdir(proto_img_dir)
    if len(images) > 0:
        proto_images = []
        for img in images:
            if not img in IGNORE_FILES:
                proto_images.append(copy_image(data, os.path.join(proto_img_dir, img), img))
        data['prototype_images'] = proto_images

def write_data_file(data):
    with open(os.path.join(DATA_DIR, 'data.json'), 'w') as f:
        json.dump(data, f)

def mkdir(path):
  try:
      os.mkdir(path)
  except FileExistsError:
      pass

def main():
    if len(sys.argv) >= 2:
        SRC_DIR = sys.argv[1]

    mkdir(DATA_DIR)

    students = []
    for student in os.listdir(SRC_DIR):
        if is_student_dir(student):
            data = {
                "id": get_student_id(student),
                "name": get_student_name(student),
            }
            print(student)
            student_dir = os.path.join(SRC_DIR, student)
            append_description(data, os.path.join(student_dir, '01-Description'))
            append_main_img(data, os.path.join(student_dir, '02-Main Image'))
            append_extra_img(data, os.path.join(student_dir, '03-Images'))
            append_proto_img(data, os.path.join(student_dir, '04-Prototyping Library'))
            students.append(data)
    write_data_file(students)

    # optimize
    print('Optimizing images...')
    subprocess.call(['imageoptim', DATA_DIR])

    # create thumbnails
    print('Creating thumbnails...')
    mkdir(THUMBS_DIR)
    subprocess.call(['mogrify', '-path', THUMBS_DIR, '-thumbnail', '100x100^', '-gravity', 'center', '-extent', '100x100', os.path.join(DATA_DIR, '*')])

if __name__ == '__main__':
    main()
