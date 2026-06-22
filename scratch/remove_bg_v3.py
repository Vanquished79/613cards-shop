from PIL import Image

def process_logo(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    
    for item in datas:
        r, g, b, a = item
        
        # Calculate luminance/alpha proxy
        alpha_proxy = max(r, g, b)
        
        if alpha_proxy < 5:
            # Complete black = fully transparent
            newData.append((0, 0, 0, 0))
        else:
            # We assume the pixel is a blend of the true color and black.
            # True Color * Alpha = Current Color
            # True Color = Current Color / Alpha
            # This perfectly preserves antialiased edges!
            new_a = alpha_proxy
            new_r = int(min(255, (r * 255) / new_a))
            new_g = int(min(255, (g * 255) / new_a))
            new_b = int(min(255, (b * 255) / new_a))
            
            # Since this logo has no wide glows, we don't need a heavy threshold.
            newData.append((new_r, new_g, new_b, new_a))

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}!")

if __name__ == "__main__":
    import sys
    in_file = r'C:\Users\abull\.gemini\antigravity\brain\8c439eb7-df9c-4afc-bb97-7fedb9a2663d\new_613_logo_1782156834188.png'
    out_file = r'C:\Users\abull\.gemini\antigravity\scratch\trading_card_shop\public\logo-transparent.png'
    process_logo(in_file, out_file)
