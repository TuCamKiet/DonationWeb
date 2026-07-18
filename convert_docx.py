import markdown
from htmldocx import HtmlToDocx
from docx import Document

# Đường dẫn file Markdown gốc
md_path = r"C:\Users\Kiet\.gemini\antigravity\brain\2f450d19-00b3-41f0-b946-d3d8869e7296\newsletter_architecture.md"
docx_path = r"D:\1.WORK\ProjectThienNguyen\HuongDan_Newsletter.docx"

# Đọc nội dung Markdown
with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Chuyển đổi Markdown sang HTML (hỗ trợ bảng và code block)
html = markdown.markdown(text, extensions=['tables', 'fenced_code'])

# Tạo file Document mới
doc = Document()

# Chuyển HTML vào Document
new_parser = HtmlToDocx()
new_parser.add_html_to_document(html, doc)

# Lưu file DOCX
doc.save(docx_path)
print(f"Thành công! Đã lưu file DOCX tại: {docx_path}")
