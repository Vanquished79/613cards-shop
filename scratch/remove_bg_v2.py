from PIL import Image
import os

def remove_black_background(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    
    # We will adjust the black point to remove dark halos.
    # Any pixel with luminance below BLACK_POINT will be fully transparent.
    BLACK_POINT = 25
    
    for item in datas:
        r, g, b, a = item
        lum = max(r, g, b)
        
        if lum <= BLACK_POINT:
            newData.append((0, 0, 0, 0))
        else:
            # Scale alpha smoothly from 0 to 255
            alpha = int((lum - BLACK_POINT) * (255.0 / (255 - BLACK_POINT)))
            
            # Since the original pixel had 'lum' brightness but now has 'alpha' opacity,
            # we need to boost the RGB values so it looks correct against a black background.
            # display_color = original_color
            # But with opacity: display_color = new_color * alpha/255
            # So new_color = original_color * 255 / alpha
            # Wait, if we use the original color unmodified but with our new alpha,
            # it might look too dark. Let's boost it properly:
            
            # We want to boost the colors slightly so the glow remains bright.
            boost_factor = 255.0 / lum
            
            new_r = int(min(255, r * boost_factor))
            new_g = int(min(255, g * boost_factor))
            new_b = int(min(255, b * boost_factor))
            
            # If we boost to max brightness, it loses the subtle glow color, turning it white.
            # Actually, just preserving the hue is enough:
            # A pixel that was (20, 10, 0) becomes (255, 127, 0) with alpha=something.
            
            newData.append((new_r, new_g, new_b, alpha))

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}!")

if __name__ == "__main__":
    remove_black_background('public/logo.png', 'public/logo-transparent.png')
