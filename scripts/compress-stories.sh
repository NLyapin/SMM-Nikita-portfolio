#!/bin/bash
# Конвертация PNG сторис в JPG с уменьшением разрешения (макс. 1080px). Требуется sips (macOS).
# Запуск из корня проекта: bash scripts/compress-stories.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTDIR="$ROOT/images/stories"
mkdir -p "$OUTDIR"

# Исходные файлы по порядку (будут story-01.jpg … story-08.jpg)
SOURCES=(
  "19922506.png"
  "19922507.png"
  "19922508.png"
  "19922509.png"
  "19922510.png"
  "19922511.png"
  "19922514.png"
  "19922516.png"
)

for i in "${!SOURCES[@]}"; do
  src="${SOURCES[$i]}"
  n=$((i + 1))
  out="$OUTDIR/story-$(printf '%02d' "$n").jpg"
  if [[ ! -f "$ROOT/$src" ]]; then
    echo "Пропуск (не найден): $src"
    continue
  fi
  echo "Обработка $src -> $out"
  sips -s format jpeg -s formatOptions 85 -Z 1080 "$ROOT/$src" --out "$out"
done
echo "Готово. Файлы в $OUTDIR"
