# Спектрограмма участка озвучки для ручной разметки слов: python3 spec.py <начало> <конец> out.png (читает v_orig.wav в текущей папке)
import numpy as np, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
a,b,out=float(sys.argv[1]),float(sys.argv[2]),sys.argv[3]
raw=subprocess.run(["ffmpeg","-v","error","-i","v_orig.wav","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
x=np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768; sr=16000
N=512; hop=40  # 2.5 ms
seg=x[int(a*sr):int(b*sr)]
cols=[]
for i in range(0,len(seg)-N,hop):
    s=np.abs(np.fft.rfft(seg[i:i+N]*np.hanning(N)))[:257]  # 0..8k
    cols.append(20*np.log10(s+1e-6))
S=np.array(cols).T[::-1]  # freq high at top
lo,hi=np.percentile(S,40),np.percentile(S,99.7)
img=np.clip((S-lo)/(hi-lo),0,1)
W=img.shape[1]; H=img.shape[0]
rgb=(np.stack([img**0.8,img**1.6,img**3],-1)*255).astype(np.uint8)
im=Image.fromarray(rgb).resize((W, H*2))
# energy curve below
e=np.array([np.sqrt(np.mean(seg[i:i+N]**2)) for i in range(0,len(seg)-N,hop)]); edb=20*np.log10(e+1e-6)
pad=60; canvas=Image.new("RGB",(W+20,H*2+pad+120),(255,255,255)); canvas.paste(im,(10,0)); d=ImageDraw.Draw(canvas)
f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",14)
y0=H*2+10; emin,emax=edb.max()-50,edb.max()
pts=[(10+i, y0+100-int(100*np.clip((v-emin)/(emax-emin),0,1))) for i,v in enumerate(edb)]
d.line(pts,fill=(0,0,0),width=1)
t=np.ceil(a*10)/10
while t<b:
    xpx=10+int((t-a)*sr/hop); major=abs(t*2-round(t*2))<1e-6
    d.line([(xpx,0),(xpx,H*2+110)],fill=(255,255,255) if major else (120,120,120),width=1)
    if major: d.text((xpx+2,H*2+112),"%.1f"%t,fill=(0,0,0),font=f)
    t=round(t+0.1,3)
canvas.save(out); print(out, canvas.size)
