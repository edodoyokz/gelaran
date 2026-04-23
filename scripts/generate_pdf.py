import os
import glob
import img2pdf

def generate_pdf():
    stitch_dir = 'stitch-designs'
    output_pdf = 'Stitch_Designs_Report.pdf'
    
    if not os.path.exists(stitch_dir):
        print(f"Directory {stitch_dir} not found.")
        return

    # Get all high-res png files and sort alphabetically
    png_files = sorted(glob.glob(os.path.join(stitch_dir, '*_highres.png')))
    
    if not png_files:
        print("No PNG files found.")
        return
        
    print(f"Found {len(png_files)} PNG files. Generating lossless PDF...")
    
    # img2pdf provides lossless conversion
    with open(output_pdf, "wb") as f:
        f.write(img2pdf.convert(png_files))
        
    print(f"Successfully generated {output_pdf}")

if __name__ == '__main__':
    generate_pdf()
