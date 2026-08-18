#!/bin/bash
# Сжатие видео для веб-показа (Reels). Требуется ffmpeg.
# Запуск из корня проекта: bash scripts/compress-reels.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLIDE5="$ROOT/videos/reels-slide-5"
SLIDE6="$ROOT/videos/reels-slide-6"
mkdir -p "$SLIDE5" "$SLIDE6"

# Исходные файлы по порядку: 1–5 → слайд 5, 6–10 → слайд 6
SOURCES=(
  "0106(1).mp4"
  "0113(2).mp4"
  "0118.mp4"
  "0203(3).mov"
  "1206 (1)(2).mp4"
  "1207(1).mp4"
  "1209.mp4"
  "1223.mp4"
  "IMG_6366.MP4"
  "IMG_6368.MP4"
)

# Параметры: макс. высота 720px, CRF 26, AAC 128k, faststart для веб
for i in "${!SOURCES[@]}"; do
  src="${SOURCES[$i]}"
  n=$((i + 1))
  if [[ $n -le 5 ]]; then
    outdir="$SLIDE5"
  else
    outdir="$SLIDE6"
  fi
  out="$outdir/reels-$(printf '%02d' "$n").mp4"
  if [[ ! -f "$ROOT/$src" ]]; then
    echo "Пропуск (не найден): $src"
    continue
  fi
  echo "Обработка $src -> $out"
  ffmpeg -y -i "$ROOT/$src" \
    -c:v libx264 -crf 26 -preset medium -profile:v main -level 4.0 \
    -vf 'scale=-2:720' \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "$out"
done
echo "Готово. Слайд 5: $SLIDE5, слайд 6: $SLIDE6"
