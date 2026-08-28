#!/bin/bash
set -e

echo ">>> Installing .NET 8 SDK..."
# build image ใหม่ของ Vercel ไม่มี /dev/stdin — ดาวน์โหลดเป็นไฟล์ก่อนค่อยรัน
curl -sSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
bash /tmp/dotnet-install.sh --channel 8.0 --install-dir "$HOME/.dotnet"
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$PATH:$HOME/.dotnet"

echo ">>> Restoring packages..."
dotnet restore src/EcmisWeb.csproj

echo ">>> Publishing Blazor WASM..."
dotnet publish src/EcmisWeb.csproj -c Release -o release --nologo

echo ">>> Post-process..."
cp release/wwwroot/index.html release/wwwroot/404.html
touch release/wwwroot/.nojekyll

echo ">>> Build complete!"
