import pytesseract
from PIL import Image
import cv2
import csv
import os

# 👇 If you're on Windows, set the Tesseract OCR path (uncomment if needed)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"



def extract_text_by_lines_csv(image_path, csv_filename="text_lines.csv"):
    """Extract text line by line and save to CSV"""
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Line Number', 'Text'])
            for idx, line in enumerate(lines, 1):
                writer.writerow([idx, line])

        print(f"✅ Text lines extracted and saved to {csv_filename}")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    # ✅ Your image path (exact as you said)
    image_path = r"C:\Users\admin\OneDrive\Desktop\mini_project\frontend\uploads\1760333893793.jpg"
   

    print("\n=== Extracting text by lines ===")
    extract_text_by_lines_csv(image_path, "text_lines.csv")
