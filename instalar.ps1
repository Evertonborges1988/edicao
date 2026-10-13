# Instala FFmpeg + Whisper e copia a skill editor-video-alta-retencao para o Claude Code.
# Uso (PowerShell, dentro da pasta do repositorio clonado):  .\instalar.ps1
$ErrorActionPreference = "Stop"

Write-Host "[1/3] Instalando FFmpeg..."
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
    Write-Host "FFmpeg instalado. Feche e abra o PowerShell depois deste script para o PATH atualizar."
} else {
    Write-Host "FFmpeg ja instalado."
}

Write-Host "[2/3] Instalando Whisper..."
python -m pip install --upgrade openai-whisper

Write-Host "[3/3] Copiando a skill..."
$destino = Join-Path $env:USERPROFILE ".claude\skills"
New-Item -ItemType Directory -Force -Path $destino | Out-Null
Copy-Item -Recurse -Force (Join-Path $PSScriptRoot ".claude\skills\editor-video-alta-retencao") $destino

Write-Host ""
Write-Host "Pronto. Agora:"
Write-Host '  cd "C:\Users\everton.borges\Downloads\Vídeo"'
Write-Host "  claude"
Write-Host '  e peca: "Use a skill editor-video-alta-retencao no arquivo NOME.mp4, formato 9:16"'
