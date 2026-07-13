import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Link as LinkIcon, Camera } from "lucide-react";

interface AvatarUploaderProps {
  value: string | File;
  onChange: (val: string | File) => void;
  disabled?: boolean;
}

export default function AvatarUploader({ value, onChange, disabled = false }: AvatarUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleSelection = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Chỉ hỗ trợ ảnh.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh < 5MB.");
      return;
    }
    setError("");
    onChange(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelection(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`avatar-uploader ${disabled ? 'disabled' : ''}`} 
      onDragOver={(e) => { 
        e.preventDefault(); 
        if (!disabled) setIsDragging(true); 
      }}
      onDragLeave={() => { if (!disabled) setIsDragging(false); }}
      onDrop={onDrop}
      style={{ 
        display: "flex", 
        gap: "1rem", 
        alignItems: "flex-start",
        padding: "0",
        borderRadius: "var(--radius-md)",
        background: isDragging ? "var(--green-50)" : "transparent",
        border: isDragging ? "2px dashed var(--green-600)" : "2px dashed transparent",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {/* Circle Preview / Dropzone */}
      <div 
        className={disabled ? "" : "interactive"}
        onClick={() => { if (!disabled) fileInputRef.current?.click(); }}
        style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          background: "var(--cream)", 
          border: "1px solid var(--border)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative"
        }}
        title="Nhấn để chọn ảnh"
      >
         {previewUrl ? (
           <img src={previewUrl} alt="Avatar" style={{width: "100%", height: "100%", objectFit: "cover"}} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/80?text=L%E1%BB%97i"; }} />
         ) : (
           <UploadCloud size={24} color="var(--clay-400)" />
         )}
         
         <div style={{
           position: "absolute",
           bottom: 0, left: 0, right: 0,
           background: "rgba(0,0,0,0.5)",
           color: "white",
           fontSize: "10px",
           textAlign: "center",
           padding: "2px 0",
         }}>
           <Camera size={12} style={{display: "inline-block", verticalAlign: "middle"}} />
         </div>
      </div>

      {/* Inputs on the right */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
         {/* Small dashed dropzone */}
         <div 
           className={disabled ? "" : "interactive"}
           onClick={() => { if (!disabled) fileInputRef.current?.click(); }}
           style={{ 
             display: "flex", 
             flexDirection: "column",
             alignItems: "center", 
             justifyContent: "center", 
             gap: "0.25rem",
             padding: "0.8rem", 
             border: "1px dashed var(--clay-400)", 
             borderRadius: "var(--radius-sm)",
             background: "var(--cream)", // Distinct background color
             color: "var(--clay-600)",
             transition: "all 0.2s ease"
           }}
           onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green-600)"; e.currentTarget.style.color = "var(--green-700)"; e.currentTarget.style.background = "var(--green-50)"; }}
           onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--clay-400)"; e.currentTarget.style.color = "var(--clay-600)"; e.currentTarget.style.background = "var(--cream)"; }}
         >
            <UploadCloud size={20} />
            <span style={{ fontSize: "0.75rem", fontWeight: 500, textAlign: "center" }}>Kéo thả ảnh vào đây, hoặc click để chọn</span>
         </div>
         <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
           <LinkIcon size={14} style={{ position: "absolute", left: "10px", color: "var(--clay-500)", zIndex: 10, pointerEvents: "none" }} />
           <input
             className="input"
             type="url"
             placeholder="https://..."
             value={typeof value === "string" ? value : ""}
             onChange={(e) => onChange(e.target.value)}
             disabled={disabled}
             style={{ paddingLeft: "30px", width: "100%", fontSize: "0.85rem", padding: "0.5rem 0.5rem 0.5rem 30px" }}
           />
         </div>
         {error && <span style={{ color: "var(--red-600)", fontSize: "0.8rem" }}>{error}</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSelection(e.target.files[0]);
          }
        }}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
}
