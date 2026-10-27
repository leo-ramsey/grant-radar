# Распознаёт русскую озвучку и печатает слова с временем начала (секунды).
# python3 promo/tools/asr.py voice.wav [lp.npy]   — нужны numpy, onnxruntime, ffmpeg и модель GigaAM (см. promo/README.md)
import sys, subprocess, numpy as np, onnxruntime as ort
import os
M = os.environ.get("GIGAAM_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models", "sherpa-onnx-nemo-ctc-giga-am-russian-2024-10-24")) + "/"
wav = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
N, H, NB = 400, 160, 64
nf = 1 + (len(x) - N) // H
idx = np.arange(N)[None, :] + H * np.arange(nf)[:, None]
win = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(N) / (N - 1))
fr = x[idx] * win
P = np.abs(np.fft.rfft(fr, n=N, axis=1)) ** 2  # 201 bins
mel = lambda f: 1127.0 * np.log(1 + f / 700.0)
nfb = N // 2
fb = np.zeros((NB, nfb))
lo, hi = mel(0.0), mel(8000.0); d = (hi - lo) / (NB + 1)
binmel = mel(np.arange(nfb) * 16000.0 / N)
for b in range(NB):
    l, c, r = lo + b * d, lo + (b + 1) * d, lo + (b + 2) * d
    w = np.where((binmel > l) & (binmel <= c), (binmel - l) / (c - l), 0) + np.where((binmel > c) & (binmel < r), (r - binmel) / (r - c), 0)
    fb[b] = w
F = np.log(np.maximum(P[:, :nfb] @ fb.T, 1.1920929e-07)).astype(np.float32)
sess = ort.InferenceSession(M + "model.int8.onnx", providers=["CPUExecutionProvider"])
lp = sess.run(None, {"audio_signal": F.T[None], "length": np.array([F.shape[0]], np.int64)})[0][0]
tok = {}
for line in open(M + "tokens.txt", encoding="utf8"):
    f = line.split()
    tok[int(f[0]) if len(f) == 1 else int(f[1])] = " " if len(f) == 1 else f[0]
step = len(x) / 16000 / lp.shape[0]
np.save(sys.argv[2] if len(sys.argv) > 2 else "lp.npy", lp)
print("frames", lp.shape, "step", round(step, 4))
ids = lp.argmax(1); blank = 33; prev = -1; out = []
for i, k in enumerate(ids):
    if k != blank and k != prev: out.append((i * step, tok[k]))
    prev = k
# words with onset
words = []; cur = ""; t0 = None
for t, ch in out:
    if ch == " ":
        if cur: words.append((t0, cur)); cur = ""
    else:
        if not cur: t0 = t
        cur += ch
if cur: words.append((t0, cur))
print(" ".join(w for _, w in words))
for t, w in words: print(f"{t:6.2f} {w}")
