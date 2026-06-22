from PIL import Image
import os

def remove_black_background(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        r, g, b, a = item
        lum = max(r, g, b)
        
        if lum == 0:
            newData.append((0, 0, 0, 0))
        else:
            alpha = lum
            new_r = int(min(255, (r * 255) / alpha))
            new_g = int(min(255, (g * 255) / alpha))
            new_b = int(min(255, (b * 255) / alpha))
            newData.append((new_r, new_g, new_b, alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}!")

if __name__ == "__main__":
    remove_black_background('public/logo.png', 'public/logo-transparent.png')
