#!/usr/bin/env python3
"""Edição automática de alta retenção: corta silêncios/repetições e queima legendas palavra por palavra."""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path


def run(cmd):
    subprocess.run(cmd, check=True)


def transcrever(video, modelo, idioma):
    import whisper
    m = whisper.load_model(modelo)
    r = m.transcribe(str(video), language=idioma, word_timestamps=True)
    palavras = []
    for seg in r["segments"]:
        for w in seg.get("words", []):
            t = w["word"].strip()
            if t:
                palavras.append({"t": t, "ini": float(w["start"]), "fim": float(w["end"])})
    return palavras


def norm(t):
    return re.sub(r"\W+", "", t.lower())


def remover_repeticoes(palavras, janela=6):
    """Remove sequências repetidas imediatamente seguidas (n-gramas de 1 a `janela` palavras)."""
    manter = [True] * len(palavras)
    n = len(palavras)
    for k in range(janela, 0, -1):
        i = 0
        while i + 2 * k <= n:
            a = [norm(p["t"]) for p in palavras[i:i + k]]
            b = [norm(p["t"]) for p in palavras[i + k:i + 2 * k]]
            if all(manter[i:i + 2 * k]) and a == b and any(a) and (k > 1 or len(a[0]) > 2):
                for j in range(i, i + k):  # mantém a última tomada
                    manter[j] = False
                i += k
            else:
                i += 1
    return [p for p, m in zip(palavras, manter) if m]


def trechos(palavras, silencio, folga):
    out = []
    for p in palavras:
        ini, fim = max(0.0, p["ini"] - folga), p["fim"] + folga
        if out and ini - out[-1][1] <= silencio:
            out[-1][1] = fim
        else:
            out.append([ini, fim])
    return out


def ass(palavras_cortadas, w, h, caminho):
    tam = int(h * 0.055)
    cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Default,Arial,{tam},&H0000FFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,6,2,2,60,60,{int(h * 0.22)},1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
    def ts(s):
        cs = int(round(s * 100))
        return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"
    linhas = []
    for i, p in enumerate(palavras_cortadas):
        fim = palavras_cortadas[i + 1]["ini"] if i + 1 < len(palavras_cortadas) else p["fim"]
        fim = max(fim, p["ini"] + 0.12)
        linhas.append(f"Dialogue: 0,{ts(p['ini'])},{ts(fim)},Default,,0,0,0,,{p['t'].upper()}")
    Path(caminho).write_text(cab + "\n".join(linhas) + "\n", encoding="utf-8")


def remapear(palavras, segs):
    """Converte tempos do original para a linha do tempo do vídeo editado."""
    out, acum = [], 0.0
    for ini, fim in segs:
        for p in palavras:
            if ini <= (p["ini"] + p["fim"]) / 2 <= fim:
                out.append({"t": p["t"], "ini": acum + max(p["ini"], ini) - ini,
                            "fim": acum + min(p["fim"], fim) - ini})
        acum += fim - ini
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida")
    ap.add_argument("--modelo", default="small")
    ap.add_argument("--idioma", default="pt")
    ap.add_argument("--silencio", type=float, default=0.35)
    ap.add_argument("--folga", type=float, default=0.08)
    ap.add_argument("--formato", choices=["9x16", "16x9", "1x1"], default="9x16")
    ap.add_argument("--so-plano", action="store_true")
    a = ap.parse_args()

    entrada, saida = Path(a.entrada), Path(a.saida)
    palavras = remover_repeticoes(transcrever(entrada, a.modelo, a.idioma))
    segs = trechos(palavras, a.silencio, a.folga)
    plano = saida.with_suffix(".plano.json")
    plano.write_text(json.dumps({"manter": segs, "palavras": palavras}, ensure_ascii=False, indent=1))
    total = sum(f - i for i, f in segs)
    print(f"{len(segs)} trechos mantidos, {total:.1f}s de fala. Plano: {plano}")
    if a.so_plano:
        return

    w, h = {"9x16": (1080, 1920), "16x9": (1920, 1080), "1x1": (1080, 1080)}[a.formato]
    legenda = saida.with_suffix(".ass")
    ass(remapear(palavras, segs), w, h, legenda)

    n = len(segs)
    partes = []
    for i, (ini, fim) in enumerate(segs):
        partes.append(f"[0:v]trim={ini:.3f}:{fim:.3f},setpts=PTS-STARTPTS[v{i}];"
                      f"[0:a]atrim={ini:.3f}:{fim:.3f},asetpts=PTS-STARTPTS[a{i}];")
    concat = "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
    esc = str(legenda).replace("\\", "/").replace(":", "\\:")
    fc = ("".join(partes) + concat +
          f";[v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps=30,"
          f"subtitles='{esc}'[vf];[a]loudnorm=I=-14:TP=-1.5:LRA=11[af]")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write(fc)
    run(["ffmpeg", "-y", "-i", str(entrada), "-filter_complex_script", f.name,
         "-map", "[vf]", "-map", "[af]", "-c:v", "libx264", "-crf", "20", "-preset", "medium",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(saida)])
    print(f"Pronto: {saida}")


if __name__ == "__main__":
    sys.exit(main())
