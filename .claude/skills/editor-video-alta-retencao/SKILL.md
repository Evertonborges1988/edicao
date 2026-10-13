---
name: editor-video-alta-retencao
description: Edita vídeos brutos automaticamente para maximizar retenção em redes sociais (Shorts, Reels, TikTok, YouTube e LinkedIn). Corta por fala, remove silêncios e repetições e gera legendas palavra por palavra. Use quando o usuário enviar um vídeo bruto e pedir para editar, cortar, legendar ou "rodar a skill de edição".
---

# Editor de vídeo de alta retenção

Edita vídeos brutos automaticamente para maximizar a retenção em Shorts, Reels, TikTok, YouTube e LinkedIn: corta por fala, remove silêncios e repetições e gera legendas palavra por palavra.

## Pré-requisitos

- `ffmpeg` e `ffprobe` no PATH (`brew install ffmpeg` no Mac; no Windows, baixar do site oficial e adicionar ao PATH).
- `openai-whisper` (`pip install openai-whisper`).

Verifique com `ffmpeg -version` e `whisper --help`. Se faltar algo, avise o usuário com o comando de instalação.

## Fluxo

1. **Entrada**: confirme o caminho do vídeo bruto e a plataforma de destino (padrão: vertical 9:16, 1080x1920, para Shorts/Reels/TikTok; LinkedIn e YouTube aceitam 16:9 ou 1:1 se o usuário pedir).
2. **Transcrição**: rode o Whisper com timestamps por palavra (`word_timestamps=True`), idioma detectado automaticamente (padrão `pt`).
3. **Cortes por fala**: mantenha só os trechos com fala. Remova silêncios maiores que ~0,35 s, deixando ~0,08 s de respiro nas bordas para não cortar seco.
4. **Repetições**: identifique falsos começos, tropeços e frases repetidas (a mesma frase dita duas vezes, "é... né... tipo"). Mantenha a melhor tomada, geralmente a última, e remova as demais.
5. **Legendas palavra por palavra**: uma palavra (ou no máximo 2) por vez, grandes, centralizadas no terço inferior, caixa alta, com contorno; destaque a palavra atual. Gere em `.ass` e grave no vídeo (burn-in).
6. **Render**: H.264 + AAC, 30 fps, `-movflags +faststart`, loudness normalizado (`loudnorm`).
7. **Entrega**: informe o arquivo final, a duração original vs. final e o que foi removido. Mantenha o `.srt`/`.ass` ao lado.

## Como executar

O script `scripts/editar.py` faz o fluxo completo:

```bash
python3 .claude/skills/editor-video-alta-retencao/scripts/editar.py entrada.mp4 saida.mp4 \
  --modelo small --idioma pt --silencio 0.35 --formato 9x16
```

Para revisar antes de renderizar, use `--so-plano`: gera o `plano.json` com os trechos mantidos e removidos. Mostre o resumo ao usuário e ajuste se ele pedir.

## Regras de edição

- Nunca altere o sentido do que foi dito; na dúvida sobre uma repetição, mantenha.
- Gancho: se os primeiros 3 s forem fracos, sugira ao usuário uma frase mais forte do próprio vídeo para abrir (não reordene sem confirmar).
- Não apague o original; sempre grave em arquivo novo.
- Corrija erros óbvios de transcrição nas legendas (nomes próprios, termos técnicos) sem mudar o áudio.
