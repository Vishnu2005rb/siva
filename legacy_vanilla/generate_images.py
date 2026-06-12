"""
NK Ghee – Premium Glass Jar with NK Label
Crystal clear glass, golden ghee visible, blue NK label, gold metal lid.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math, os

os.makedirs("images", exist_ok=True)

def clamp(v, lo=0, hi=255):
    return int(max(lo, min(hi, v)))

def lc(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(len(c1)))


def make_glass_jar(size_label, out_path, scale=1.0):
    W, H = 700, 900
    img  = Image.new("RGBA", (W, H), (0,0,0,0))
    cx   = W // 2

    # ── Dimensions ──────────────────────────────────────────
    r        = int(118 * scale)
    jar_h    = int(330 * scale)
    bot_y    = H - 100
    top_y    = bot_y - jar_h
    lid_h    = int(55  * scale)
    lid_r    = int(r   * 0.90)
    neck_h   = int(25  * scale)
    lid_top  = top_y - lid_h - neck_h + int(4*scale)

    # ── Soft background ─────────────────────────────────────
    bg  = Image.new("RGBA", (W, H), (255,255,255,255))
    bgd = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        c = lc((245,248,255),(225,232,248),t)
        bgd.rectangle([0, y, W, y+1], fill=c+(255,))
    img = Image.alpha_composite(bg, img)
    draw = ImageDraw.Draw(img)

    # ── Floor shadow ─────────────────────────────────────────
    sh = Image.new("RGBA", (W, H), (0,0,0,0))
    sd = ImageDraw.Draw(sh)
    sd.ellipse([cx-r-10, bot_y+2, cx+r+10, bot_y+44], fill=(0,0,0,55))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img, sh)
    draw = ImageDraw.Draw(img)

    # ── GLASS JAR BODY ───────────────────────────────────────
    # Layer 1: Golden ghee fill (base)
    for px in range(cx-r+2, cx+r-2):
        nx    = (px - cx) / r
        cos_a = math.sqrt(max(0, 1-nx*nx))
        rim   = max(0.0, cos_a - 0.05)
        r_g   = clamp(200 + 30*rim)
        g_g   = clamp(140 + 25*rim)
        b_g   = clamp(40  + 15*rim)
        a_g   = clamp(230 + 20*cos_a)
        draw.rectangle([px, top_y, px, bot_y], fill=(r_g, g_g, b_g, a_g))

    # Layer 2: Glass transparency overlay (dark at edges = thick glass)
    for px in range(cx-r, cx+r+1):
        nx    = (px - cx) / r
        cos_a = math.sqrt(max(0, 1-nx*nx))
        edge  = 1 - cos_a          # bright at edges
        # Glass tint — slightly blue-green like real glass
        rv = clamp(200 + 55*cos_a)
        gv = clamp(220 + 35*cos_a)
        bv = clamp(230 + 25*cos_a)
        av = clamp(160 * edge * edge)    # transparent center, opaque at edge
        draw.rectangle([px, top_y, px, bot_y], fill=(rv, gv, bv, av))

    # Layer 3: Left specular highlight (primary)
    spec_cx = cx - int(r * 0.42)
    spec_w  = int(r * 0.22)
    for px in range(spec_cx - spec_w, spec_cx + spec_w):
        d = abs(px - spec_cx) / (spec_w+1)
        a = clamp(200 * (1-d*d*d))
        draw.rectangle([px, top_y + int(r*0.2), px, top_y + int(jar_h*0.65)],
                       fill=(255, 255, 255, a))

    # Layer 4: Narrow right specular (catch-light)
    for px in range(cx + int(r*0.72), cx + r - 2):
        d = (px - (cx+int(r*0.72))) / (r - int(r*0.72))
        a = clamp(90 * (1-d))
        draw.rectangle([px, top_y + int(jar_h*0.15), px, top_y + int(jar_h*0.55)],
                       fill=(255, 255, 255, a))

    # Bottom glass ellipse cap
    draw.ellipse([cx-r, bot_y-int(r*0.28), cx+r, bot_y+int(r*0.28)],
                 fill=(180, 130, 40, 210))
    # Bottom caustic light ring
    draw.arc([cx-r+6, bot_y-int(r*0.24), cx+r-6, bot_y+int(r*0.24)],
             start=180, end=360, fill=(255,220,120,120), width=int(4*scale))

    # Top glass rim ellipse
    draw.ellipse([cx-r, top_y-int(r*0.20), cx+r, top_y+int(r*0.20)],
                 fill=(200, 155, 50, 180))
    draw.ellipse([cx-r+4, top_y-int(r*0.18), cx+r-4, top_y+int(r*0.18)],
                 fill=(240, 200, 90, 100))

    # Jar outline (glass edge)
    for side in [-1, 1]:
        xpos = cx + side * r
        draw.line([xpos, top_y, xpos, bot_y], fill=(200,215,230,180), width=int(3*scale))

    # ── NECK ─────────────────────────────────────────────────
    nw = int(lid_r * 1.02)
    nx2 = cx - nw//2
    for py in range(top_y - neck_h, top_y + 6):
        t = (py - (top_y-neck_h)) / (neck_h + 6)
        rv = clamp(200 + 30*(1-t))
        gv = clamp(215 + 20*(1-t))
        bv = clamp(225 + 15*(1-t))
        av = clamp(180 + 40*t)
        draw.rectangle([nx2, py, nx2+nw, py+1], fill=(rv,gv,bv,av))
    # Neck outline
    draw.rectangle([nx2, top_y-neck_h, nx2+nw, top_y+6],
                   outline=(180,200,220,160), width=2)

    # ── NK BLUE LABEL ────────────────────────────────────────
    lbl_top  = top_y + int(jar_h * 0.09)
    lbl_bot  = top_y + int(jar_h * 0.91)
    lbl_h    = lbl_bot - lbl_top
    grass_h  = int(lbl_h * 0.28)
    grass_top= lbl_bot - grass_h
    sky_h    = lbl_h - grass_h

    try:
        fn_logo  = ImageFont.truetype("arialbd.ttf", int(24*scale))
        fn_ghee  = ImageFont.truetype("arialbd.ttf", int(22*scale))
        fn_sub   = ImageFont.truetype("arial.ttf",   int(13*scale))
        fn_tag   = ImageFont.truetype("arialbd.ttf", int(17*scale))
    except:
        fn_logo = ImageFont.load_default()
        fn_ghee = fn_logo
        fn_sub  = fn_logo
        fn_tag  = fn_logo

    # Draw label column-by-column with cylinder curvature fade
    lbl_layer = Image.new("RGBA", (W, H), (0,0,0,0))
    ld = ImageDraw.Draw(lbl_layer)

    for px in range(cx-r+5, cx+r-5):
        nx    = (px - cx) / r
        cos_a = math.sqrt(max(0, 1-nx*nx))
        fade  = max(0, cos_a - 0.18) / 0.82

        for py in range(lbl_top, lbl_bot):
            if py < grass_top:
                t  = (py - lbl_top) / sky_h
                bc = lc((22,108,230),(8,55,175),t)
            else:
                t  = (py - grass_top) / grass_h
                bc = lc((42,168,52),(18,98,22),t)
            a = clamp(255 * fade)
            ld.point((px, py), fill=(bc[0],bc[1],bc[2],a))

    # Mountains
    mtn_pts = []
    for mx in range(cx-r+8, cx+r-8, 3):
        nx    = (mx-cx)/r
        cos_a = math.sqrt(max(0,1-nx*nx))
        rel   = (mx-(cx-r))/(2*r)
        wave  = math.sin(rel*math.pi*2.8)*0.5 + math.sin(rel*math.pi*6)*0.25
        my    = grass_top - int(sky_h * 0.28 * (0.5+0.5*wave) * cos_a)
        mtn_pts.append((mx, my))
    mtn_pts += [(cx+r-8, grass_top), (cx-r+8, grass_top)]
    if len(mtn_pts)>=3:
        ld.polygon(mtn_pts, fill=(50,125,65,210))
    # Snow peaks
    for i in range(0, len(mtn_pts)-2, 5):
        px2,py2 = mtn_pts[i]
        nx2=(px2-cx)/r
        cos_a2=math.sqrt(max(0,1-nx2*nx2))
        if py2 < grass_top - int(sky_h*0.12*cos_a2) and cos_a2>0.4:
            ld.polygon([(px2,py2),(px2-int(6*scale),py2+int(10*scale)),
                         (px2+int(6*scale),py2+int(10*scale))], fill=(240,248,255,200))

    # Grass
    for py in range(grass_top, lbl_bot):
        t = (py-grass_top)/grass_h
        c = lc((42,168,52),(18,98,22),t)
        for px in range(cx-r+5, cx+r-5):
            nx=(px-cx)/r
            cos_a=math.sqrt(max(0,1-nx*nx))
            fade=max(0,cos_a-0.18)/0.82
            a=clamp(255*fade)
            ld.point((px,py),fill=(c[0],c[1],c[2],a))

    # Cows
    def draw_cow_on(ldraw, dcx, dcy, sc2=1.0, flip=False):
        nx3=(dcx-cx)/r
        fade3=max(0,math.sqrt(max(0,1-nx3*nx3))-0.18)/0.82
        if fade3<0.12: return
        bw=int(36*sc2*fade3); bh=int(20*sc2*fade3)
        hw=int(15*sc2*fade3); hh=int(11*sc2*fade3)
        dx=-1 if flip else 1
        ldraw.ellipse([dcx-bw//2,dcy-bh//2,dcx+bw//2,dcy+bh//2],
                      fill=(232,232,232,220),outline=(70,70,70,170),width=1)
        hcx=dcx+dx*(bw//2+hw//2-max(1,int(2*sc2*fade3)))
        ldraw.ellipse([hcx-hw//2,dcy-hh//2,hcx+hw//2,dcy+hh//2],
                      fill=(232,232,232,220),outline=(70,70,70,170),width=1)
        ldraw.ellipse([hcx+dx*max(1,int(3*sc2*fade3))-max(1,int(2*sc2*fade3)),
                       dcy-max(1,int(3*sc2*fade3)),
                       hcx+dx*max(1,int(3*sc2*fade3))+max(1,int(2*sc2*fade3)),
                       dcy],fill=(25,25,25,200))
        for lo in [-int(11*sc2*fade3),-int(4*sc2*fade3),int(5*sc2*fade3),int(12*sc2*fade3)]:
            lw2=max(1,int(2*sc2*fade3))
            ldraw.rectangle([dcx+lo-lw2,dcy+bh//2,dcx+lo+lw2,
                              dcy+bh//2+max(1,int(9*sc2*fade3))],fill=(190,190,190,200))
        ldraw.ellipse([dcx-int(6*sc2*fade3),dcy-int(6*sc2*fade3),
                       dcx+int(3*sc2*fade3),dcy+int(2*sc2*fade3)],fill=(35,35,35,175))
        ldraw.ellipse([dcx+int(5*sc2*fade3),dcy-int(2*sc2*fade3),
                       dcx+int(13*sc2*fade3),dcy+int(6*sc2*fade3)],fill=(35,35,35,175))

    cs = 0.62*scale
    cow_y = grass_top + int(grass_h*0.50)
    draw_cow_on(ld, cx-int(r*0.36), cow_y, sc2=cs*0.82)
    draw_cow_on(ld, cx+int(r*0.32), cow_y+int(4*scale), sc2=cs, flip=True)

    # Label borders
    for bpy in [lbl_top, lbl_bot]:
        for bpx in range(cx-r+5, cx+r-5):
            nx4=(bpx-cx)/r
            cos_a4=math.sqrt(max(0,1-nx4*nx4))
            a4=clamp(200*cos_a4)
            ld.point((bpx,bpy),fill=(255,255,255,a4))

    img = Image.alpha_composite(img, lbl_layer)
    draw = ImageDraw.Draw(img)

    # ── NK LOGO CIRCLE ───────────────────────────────────────
    logo_cy = lbl_top + int(sky_h * 0.30)
    logo_r  = int(32 * scale)
    # Glow
    for gi in range(6,0,-1):
        draw.ellipse([cx-logo_r-gi, logo_cy-logo_r-gi,
                      cx+logo_r+gi, logo_cy+logo_r+gi],
                     outline=(200,220,255,int(25*(7-gi))), width=1)
    # White fill
    draw.ellipse([cx-logo_r, logo_cy-logo_r, cx+logo_r, logo_cy+logo_r],
                 fill=(255,255,255,248), outline=(170,200,255,255), width=2)
    # Blue gradient inside circle
    for gi in range(logo_r-3, 0, -2):
        t = 1 - gi/logo_r
        c = lc((220,235,255),(240,248,255),t)
        draw.ellipse([cx-gi, logo_cy-gi, cx+gi, logo_cy+gi],
                     fill=c+(30,))
    # Crescent arc
    draw.arc([cx-logo_r+5, logo_cy-logo_r+5, cx+logo_r-5, logo_cy+logo_r-5],
             start=185, end=355, fill=(0,70,200,200), width=int(4*scale))
    # NK text
    draw.text((cx, logo_cy), "NK", fill=(0,50,175,255), font=fn_logo, anchor="mm")

    # ── LABEL TEXT ───────────────────────────────────────────
    ty = logo_cy + logo_r + int(10*scale)
    # Subtle text shadow
    draw.text((cx+1, ty+1), "100% PURE COW'S", fill=(0,30,120,120), font=fn_sub, anchor="mm")
    draw.text((cx,   ty  ), "100% PURE COW'S", fill=(255,222,30,255), font=fn_sub, anchor="mm")
    ty += int(22*scale)
    draw.text((cx+2, ty+2), "GHEE", fill=(0,0,0,120), font=fn_ghee, anchor="mm")
    draw.text((cx,   ty  ), "GHEE", fill=(255,255,255,255), font=fn_ghee, anchor="mm")

    # ── GLASS OVER LABEL (refraction layer) ──────────────────
    glass_layer = Image.new("RGBA", (W, H), (0,0,0,0))
    gld = ImageDraw.Draw(glass_layer)
    # Left specular over label
    for px in range(cx-r, cx-r+int(r*0.30)):
        nx5=(px-cx)/r
        cos_a5=math.sqrt(max(0,1-nx5*nx5))
        edge5=1-cos_a5
        a5=clamp(70*edge5*edge5)
        gld.rectangle([px,lbl_top,px,lbl_bot],fill=(255,255,255,a5))
    # Right edge darkening
    for px in range(cx+int(r*0.70), cx+r):
        nx6=(px-cx)/r
        cos_a6=math.sqrt(max(0,1-nx6*nx6))
        edge6=1-cos_a6
        a6=clamp(80*edge6*edge6)
        gld.rectangle([px,lbl_top,px,lbl_bot],fill=(0,0,30,a6))
    img = Image.alpha_composite(img, glass_layer)
    draw = ImageDraw.Draw(img)

    # ── GOLD METAL LID ───────────────────────────────────────
    # Lid cylinder
    for px in range(cx-lid_r, cx+lid_r+1):
        nx7=(px-cx)/lid_r
        cos_a7=math.sqrt(max(0,1-nx7*nx7))
        t = cos_a7
        # Gold metal gradient
        if t > 0.85:
            c=lc((255,240,180),(230,190,60),1-(t-0.85)/0.15)
        elif t > 0.3:
            c=lc((210,165,30),(245,210,70),(t-0.3)/0.55)
        else:
            c=lc((130,100,10),(210,165,30),t/0.3)
        draw.rectangle([px, lid_top, px, lid_top+lid_h], fill=c+(255,))

    # Lid horizontal bands (metal knurling)
    for bi in range(6):
        by2 = lid_top + int(lid_h*(bi+1)/7)
        for px in range(cx-lid_r+2, cx+lid_r-2):
            nx8=(px-cx)/lid_r
            cos_a8=math.sqrt(max(0,1-nx8*nx8))
            a8=clamp(50*cos_a8)
            draw.point((px,by2),fill=(255,220,60,a8))

    # Left specular on lid
    for px in range(cx-lid_r, cx-int(lid_r*0.50)):
        nx9=(px-cx)/lid_r
        cos_a9=math.sqrt(max(0,1-nx9*nx9))
        a9=clamp(120*(1-cos_a9)**0.5) if cos_a9<0.7 else 0
        draw.rectangle([px,lid_top+int(lid_h*0.1),px,lid_top+int(lid_h*0.5)],
                       fill=(255,250,200,a9))

    # Lid top ellipse (golden cap)
    draw.ellipse([cx-lid_r, lid_top-int(lid_r*0.20),
                  cx+lid_r, lid_top+int(lid_r*0.20)],
                 fill=(240,195,40,255), outline=(180,135,10,255), width=2)
    # Cap shine
    draw.ellipse([cx-lid_r+int(8*scale), lid_top-int(lid_r*0.15),
                  cx+int(lid_r*0.30),   lid_top-int(lid_r*0.02)],
                 fill=(255,250,180,170))

    # Lid bottom rim
    draw.ellipse([cx-lid_r, lid_top+lid_h-int(lid_r*0.18),
                  cx+lid_r, lid_top+lid_h+int(lid_r*0.18)],
                 fill=(200,155,20,220), outline=(160,120,5,255), width=2)

    # Lid outline
    draw.line([cx-lid_r, lid_top, cx-lid_r, lid_top+lid_h], fill=(160,120,5,200), width=2)
    draw.line([cx+lid_r, lid_top, cx+lid_r, lid_top+lid_h], fill=(100,75,3,200),  width=2)

    # ── SIZE BADGE ───────────────────────────────────────────
    badge_y = bot_y + 30
    bbox = draw.textbbox((0,0), size_label, font=fn_tag)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    pad = int(14*scale)
    bx1,by1 = cx-tw//2-pad, badge_y-4
    bx2,by2 = cx+tw//2+pad, badge_y+th+8
    for py in range(by1,by2):
        t2=(py-by1)/(by2-by1)
        c2=lc((255,165,0),(220,100,0),t2)
        draw.rectangle([bx1+4,py,bx2-4,py+1],fill=c2+(255,))
    draw.rounded_rectangle([bx1,by1,bx2,by2],radius=int(10*scale),
                            outline=(255,190,30,255),width=2)
    draw.text((cx,badge_y+th//2+3),size_label,fill=(255,255,255,255),
              font=fn_tag,anchor="mm")

    # ── Final output ─────────────────────────────────────────
    out = Image.new("RGB",(W,H),(245,248,255))
    flat = img.convert("RGBA")
    out.paste(flat, mask=flat.split()[3])
    out = ImageEnhance.Color(out).enhance(1.18)
    out = ImageEnhance.Contrast(out).enhance(1.06)
    out = ImageEnhance.Sharpness(out).enhance(1.25)
    out.save(out_path,"PNG",quality=97)
    print(f"  Saved: {out_path}")


sizes = [
    ("50ml",  "images/ghee_50ml.png",  0.62),
    ("100ml", "images/ghee_100ml.png", 0.78),
    ("200ml", "images/ghee_200ml.png", 0.94),
    ("500ml", "images/ghee_500ml.png", 1.10),
    ("1L",    "images/ghee_1l.png",    1.22),
    ("2L",    "images/ghee_2l.png",    1.36),
]

print("Generating NK Ghee premium glass jar images...\n")
for label, fname, sc in sizes:
    make_glass_jar(label, fname, scale=sc)
print("\nAll images generated!")
