# Eigener Synthwave-Track für den Trailer (48 s, 100 BPM). Alles synthetisch erzeugt, keine Samples.
import numpy as np, wave
SR=44100; BPM=100; B=60/BPM; DUR=48.0; N=int(SR*DUR)
L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(7)
def t_(d): return np.arange(int(SR*d))/SR
def put(sig,start,pan=0.0,gain=1.0):
    i=int(start*SR); 
    if i>=N: return
    s=sig[:N-i]*gain; L[i:i+len(s)]+=s*np.sqrt(.5-pan/2)*1.41; R[i:i+len(s)]+=s*np.sqrt(.5+pan/2)*1.41
def env(n,a,d,s,r,total):
    t=t_(total); e=np.ones_like(t)*s
    e[t<a]=t[t<a]/a; m=(t>=a)&(t<a+d); e[m]=1-(1-s)*(t[m]-a)/d
    rel=t>total-r; e[rel]*= (total-t[rel])/r
    return e
def saw(f,t,det=0.0):
    out=np.zeros_like(t)
    for d in ([-det,0,det] if det else [0]):
        ph=(t*f*(1+d))%1; out+=2*ph-1
    return out/(3 if det else 1)
def lp(x,a):  # einfacher Tiefpass (a 0..1)
    y=np.empty_like(x); acc=0.0
    for i in range(len(x)): acc+=a*(x[i]-acc); y[i]=acc
    return y
def lp_fast(x,cut):
    # Einpol-Tiefpass über rekursive Filterung mit scipy-freier Implementierung (vektorisiert in Blöcken)
    a=1-np.exp(-2*np.pi*cut/SR)
    from numpy.lib.stride_tricks import sliding_window_view
    y=np.zeros_like(x); acc=0.0
    for i in range(0,len(x),1):
        acc+=a*(x[i]-acc); y[i]=acc
    return y
note=lambda n: 440*2**((n-69)/12)
# Akkorde Am – F – C – G (je 2 Takte), Bass-Achtel, Pad, Arpeggio
CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
bar=4*B
def kick(): t=t_(.45); f=50+120*np.exp(-t*30); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)
def snare(): t=t_(.3); return (rng.uniform(-1,1,len(t))*np.exp(-t*14)*.7+np.sin(2*np.pi*190*t)*np.exp(-t*20)*.4)
def hat(o=False): t=t_(.25 if o else .06); n=rng.uniform(-1,1,len(t)); n=np.diff(n,prepend=0); return n*np.exp(-t*(12 if o else 60))*.35
KICK,SNARE,HAT,OHAT=kick(),snare(),hat(),hat(True)
# Abschnitte: 0-9.6 Intro (Pad), 9.6-19.2 + Bass/Hats, 19.2-38.4 volle Drums+Arp+Lead, 38.4-43.2 Break, 43.2-48 Logo-Schluss
for k in range(int(DUR/bar)+1):
    t0=k*bar; c=CH[(k//2)%4]
    # Pad (breit, langsam)
    if t0<43.2:
        tt=t_(bar)
        pad=sum(saw(note(n),tt,.006) for n in c)/3
        pad=lp_fast(pad,900 if t0<19.2 else 1600)*env(len(tt),.6,.5,.8,.6,bar)
        put(pad,t0,-.3,.16); put(pad,t0+.012,.3,.16)
    # Bass in Achteln
    if 9.6<=t0<38.4 or 43.2<=t0<46:
        for i in range(8):
            tt=t_(B/2*.9); f=note(c[0]-12); b=saw(f,tt)*.6+np.sin(2*np.pi*f*tt)*.6
            put(lp_fast(b,500)*np.exp(-tt*3),t0+i*B/2,0,.32)
    # Drums
    for i in range(4):
        ts=t0+i*B
        if 19.2<=ts<38.4 or 43.2<=ts<46.4:
            put(KICK,ts,0,.9)
            if i in (1,3): put(SNARE,ts,.05,.55)
        elif 14.4<=ts<19.2 and i in (0,2): put(KICK,ts,0,.6)
        if 9.6<=ts<38.4:
            put(HAT,ts+B/2,.25,.5); 
            if 19.2<=ts: put(HAT,ts,.2,.3)
        if 19.2<=ts<38.4 and i==3: put(OHAT,ts+B/2,-.2,.4)
    # Arpeggio (Sechzehntel)
    if 19.2<=t0<38.4:
        seq=[c[0],c[1],c[2],c[1]+12,c[2],c[1],c[0]+12,c[2]]
        for i in range(16):
            tt=t_(B/4*.8); n=seq[i%8]+12; a=saw(note(n),tt,.003)
            put(lp_fast(a,2600)*np.exp(-tt*9),t0+i*B/4,.4 if i%2 else -.4,.09)
    # Lead-Melodie im zweiten Teil
    if 28.8<=t0<38.4:
        mel=[(0,76,1),(1,74,.5),(1.5,72,.5),(2,71,1),(3,72,1)]
        for (pos,n,d) in mel:
            tt=t_(B*d); f=note(n-12*0); v=np.sin(2*np.pi*f*tt+3*np.sin(2*np.pi*5.5*tt)*.02)
            ld=saw(f,tt,.004)*.6+v*.4
            put(lp_fast(ld,3000)*env(len(tt),.01,.1,.7,.1,B*d),t0+pos*B,0,.13)
# Riser vor dem Drop und vor dem Logo
for (a,b) in [(16.8,19.2),(40.8,43.2)]:
    tt=t_(b-a); n=rng.uniform(-1,1,len(tt))*(tt/(b-a))**2; s=np.sin(2*np.pi*np.cumsum(200+1800*(tt/(b-a))**2)/SR)*(tt/(b-a))**2
    put(n*.18+s*.08,a,0,1)
# Schlag auf das Logo + langer Nachhall-Akkord
for ts in (43.2,):
    put(KICK*1.4,ts,0,1); tt=t_(4.8); hit=sum(saw(note(n),tt,.008) for n in [45,57,60,64,69])/5
    put(lp_fast(hit,1800)*np.exp(-tt*.7),ts,0,.35)
# zweiter Schlag für „COMING SOON“ (45,1 s): Kick plus Becken
put(KICK*1.5,45.1,0,1);tt=t_(1.6);put(rng.uniform(-1,1,len(tt))*np.exp(-tt*3.5)*.35,45.1,.0,1)
# Hall (einfache Echos) und Master
def echo(x,d,g): y=x.copy(); k=int(d*SR); y[k:]+=x[:-k]*g; return y
L=echo(echo(L,.31,.25),.47,.15); R=echo(echo(R,.37,.25),.53,.15)
fade=np.ones(N); fi=int(1.5*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(2*SR); fade[-fo:]=np.linspace(1,0,fo)
m=np.max(np.abs(np.concatenate([L,R]))); L=np.tanh(L/m*1.3)*fade*.9; R=np.tanh(R/m*1.3)*fade*.9
with wave.open("musik.wav","wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L,R],1)*32767).astype(np.int16).tobytes())
print("ok")
