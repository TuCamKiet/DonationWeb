import { useState } from "react";
import type { Art } from "../data/types";

interface Props {
  art: Art;
  ratio?: string; // e.g. "4 / 3"
  rounded?: boolean;
  className?: string;
  label?: string;
  imgUrl?: string;
  style?: React.CSSProperties;
}

/**
 * Ảnh minh hoạ tạm (gradient + emoji) cho tới khi có ảnh thật.
 * Nếu truyền imgUrl, sẽ render ảnh thật. Có fallback tự động nếu ảnh lỗi.
 */
export default function Photo({
  art,
  ratio = "4 / 3",
  rounded = true,
  className = "",
  label,
  imgUrl,
  style,
}: Props) {
  const [imgError, setImgError] = useState(false);

  if (imgUrl && !imgError) {
    return (
      <div
        className={`photo photo--image ${rounded ? "photo--rounded" : ""} ${className}`}
        style={{ aspectRatio: ratio , ...style }}
      >
        <img
          src={imgUrl}
          alt={label || art.realPhotoNote || "Ảnh thực tế"}
          onError={() => setImgError(true)}
        />
        {label && <span className="photo__label">{label}</span>}
      </div>
    );
  }

  return (
    <div
      className={`photo ${rounded ? "photo--rounded" : ""} ${className}`}
      style={{
        aspectRatio: ratio,
        background: `linear-gradient(135deg, ${art.from}, ${art.to})`,
        ...style,
      }}
      role="img"
      aria-label={art.realPhotoNote ?? label ?? "Hình minh hoạ"}
      title={art.realPhotoNote}
    >
      <span className="photo__emoji" aria-hidden="true">
        {art.emoji}
      </span>
      {label && <span className="photo__label">{label}</span>}
      {art.realPhotoNote && (
        <span className="photo__pending" aria-hidden="true">
          ảnh minh hoạ
        </span>
      )}
    </div>
  );
}
