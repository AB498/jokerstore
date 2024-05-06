# pip install request spire.doc pillow psutil

import requests
import subprocess
import re
import time
import os
import psutil
import signal
import sys
import json
import heapq
import io


from spire.doc import *
from spire.doc.common import *

from PIL import Image

from io import StringIO
import uuid

import tempfile


import argparse
import ast

parser = argparse.ArgumentParser(description="Optional app description")
parser.add_argument("data", help="A required integer positional argument")

args = parser.parse_args()

# print("Argument values:")

docData = args.data
# docData = docData.replace("'", '"')

# docData = re.sub(r"(\w+)\s?:", r'"\1":', docData)

# docData = re.sub(r":\s?(?!(\d+|true|false))(\w+)", r':"\2"', docData)


docData = json.loads(docData)
# print(docData.get("body"))


def get_replaced_id(body, up_files):

    new_uuid = str(uuid.uuid4())

    calling_dir = os.path.dirname(os.path.abspath(__file__))

    in_file = os.path.join(calling_dir, "backend/templates/", body["template"])
    doc = Document()
    doc.LoadFromFile(in_file)

    pictures = []

    for i in range(doc.Sections.Count):
        sec = doc.Sections.get_Item(i)

        # Iterate through all paragraphs in each section
        for j in range(sec.Paragraphs.Count):
            para = sec.Paragraphs.get_Item(j)
            # Iterate through all child objects in each paragraph
            for k in range(para.ChildObjects.Count):
                docObj = para.ChildObjects.get_Item(k)

                # Find the images and add them to the list
                if docObj.DocumentObjectType == DocumentObjectType.Picture:
                    # print(docObj.Width, docObj.Height)
                    pictures.append(docObj)

                if docObj.DocumentObjectType == DocumentObjectType.TextBox:
                    # print(docObj.Body.Paragraphs.get_Item(0).Text)
                    for key, val in body["stringMap"].items():
                        if docObj.Body.Paragraphs.get_Item(0).Text == key:
                            docObj.Body.Paragraphs.get_Item(0).Text = val

    pictures = [(docObj.Width * docObj.Height, docObj) for docObj in pictures]
    heapq.heapify(pictures)

    for key, val in body["imageMap"].items():
        area, picture = pictures[int(val)]

        w, h = picture.Width, picture.Height
        if int(key) >= len(up_files) or up_files[int(key)] is None:
            continue
        img_file = up_files[int(key)]

        picture.LoadImage(os.path.join(calling_dir, "backend/uploads/", img_file))
        picture.Width, picture.Height = w, h
        # print(picture.Width, picture.Height)

    imageStream = doc.SaveImageToStreams(0, ImageType.Bitmap)

    with open("ReplaceImage.jpg", "wb") as imageFile:
        imageFile.write(imageStream.ToArray())

    img = Image.open("ReplaceImage.jpg")
    # crop image to half height from top and bottom
    img = img.crop((0, img.height // 4, img.width, img.height * 3 // 4))
    # final_img = "tmp"+new_uuid+".png"
    _, final_img = tempfile.mkstemp(
        suffix=".png",
        prefix="uploaded_",
        dir=os.path.join(calling_dir, "backend/results/"),
    )
    img.save(final_img)

    try:
        os.remove("ReplaceImage.jpg")
    except:
        pass

    # doc.SaveToFile("ReplaceImage.pdf", FileFormat.PDF)

    doc.Close()

    return os.path.relpath(final_img, os.path.join(calling_dir, "backend/results/"))


def fileAsBytes(file_path):
    return_data = io.BytesIO()
    with open(file_path, "rb") as fo:
        return_data.write(fo.read())
    return_data.seek(0)
    return return_data


def delete_file(file_path):
    try:
        os.remove(file_path)
        # print(f"File '{file_path}' has been deleted.")
        return True
    except FileNotFoundError:
        # print(f"File '{file_path}' does not exist.")
        return False
    except PermissionError:
        # print(f"You do not have permission to delete the file '{file_path}'.")
        return False
    except Exception as e:
        # print(f"An error occurred while trying to delete the file '{file_path}': {e}")
        return False


def gen_id():

    # print("form", docData)

    body = docData["body"]
    # print("form", body)

    uploaded_files = body["files"]
    # print("form", [file for file in uploaded_files])

    result_file = get_replaced_id(body, uploaded_files)
    return result_file


resfilename = gen_id()

print(resfilename)
