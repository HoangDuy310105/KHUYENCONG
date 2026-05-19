import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"c:\Users\ADMIN\.gemini\antigravity\scratch\KhuyenCong\Tai_lieu\TUẦN 3_ Thiết kế Hệ thống & Cấu hình môi trường.docx"
output_txt = r"c:\Users\ADMIN\.gemini\antigravity\scratch\KhuyenCong\tuan_3_full_content.txt"

def extract_full_text(path, out_path):
    if not os.path.exists(path):
        print(f"Error: File not found at {path}")
        return
    
    with zipfile.ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        body = root.find('w:body', ns)
        if body is None:
            print("No body found")
            return
            
        def process_element(elem):
            if elem.tag.endswith('p'):
                text_runs = elem.findall('.//w:t', ns)
                p_text = "".join([node.text for node in text_runs if node.text])
                if p_text.strip():
                    paragraphs.append(f"P: {p_text}")
            elif elem.tag.endswith('tbl'):
                paragraphs.append("--- TABLE START ---")
                for row in elem.findall('.//w:tr', ns):
                    row_cells = []
                    for cell in row.findall('.//w:tc', ns):
                        cell_runs = cell.findall('.//w:t', ns)
                        cell_text = "".join([node.text for node in cell_runs if node.text])
                        row_cells.append(cell_text.strip())
                    paragraphs.append(" | ".join(row_cells))
                paragraphs.append("--- TABLE END ---")
            else:
                for child in elem:
                    process_element(child)

        for child in body:
            process_element(child)
            
        with open(out_path, 'w', encoding='utf-8') as f:
            for idx, item in enumerate(paragraphs):
                f.write(f"[{idx+1}] {item}\n\n")
        print(f"Full content saved to {out_path}")

if __name__ == "__main__":
    extract_full_text(docx_path, output_txt)
