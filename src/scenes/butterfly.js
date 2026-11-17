// butterfly.js: "Clawd and the butterfly", 15 s. See STORYBOARD.md for the shots and their reads.
//   A (0–4.7):   a butterfly lands on a daisy; Clawd pounces and faceplants into the flower. Whip pan right.
//   B (4.7–10):  the chase: three tries, each bigger, each dodged; a crash into tall grass. Brush wipe.
//   C (10–15):   golden light. Clawd gives up, and the butterfly lands on Clawd's head. Iris out.
(() => {
  const A0 = 0, B0 = 4.7, C0 = 10;
  const SKY_AM = '#A9D4EC', SKY_PM = '#F3CB8E', GRASS = '#93BF68', GRASS_DK = '#5C8D47', HILL = '#9BC6A6';
  const WING = '#8A64C2', WING2 = PAL.rose, BODY = '#3E2F52';
  const GREENS = [GRASS_DK, '#7FAE5A'];
  const skyCol = t => t < C0 ? mixCol(SKY_AM, '#C2DEE0', seg(t, 2, C0)) : mixCol('#F6D9A6', SKY_PM, seg(t, C0, C0 + 3));   // fresh blue, then golden after the wipe
  // emotion keys written in shot time, played in video time (so every idle stays on the film's beat)
  const acts = (t, t0, keys, o) => emotions(t, keys.map(([a, ...r]) => [a + t0, ...r]), o);

  // ---------- the butterfly ----------
  // (x, y) = the body's centre; s = size (the wingspan is about 3.5 s). open 0..1: wings spread (1) or folded edge-on.
  function butterfly(x, y, s, o = {}) {
    boilSeed('bfly' + (o.key || ''));
    const sw = clamp(s / 34, .3, 1), op = clamp(o.open ?? 1, .12, 1), P = pts => pts.map(([a, b]) => [a * s, b * s]);
    push(); translate(x, y); rotate(o.rot || 0);
    for (const side of [-1, 1]) {
      push(); scale(side * op, 1);
      paint(P([[.05, .05], [.55, .2], [1.15, .6], [1.05, 1.1], [.5, 1.05], [.12, .55]]), { wash: WING2, fill: WING, fillOp: 70, tex: .5, ink: PAL.ink, sw, curv: .5 });
      paint(P([[.05, -.05], [.45, -.95], [1.25, -1.35], [1.8, -.95], [1.55, -.2], [.4, .1]]), { wash: WING, fill: WING2, fillOp: 60, tex: .5, ink: PAL.ink, sw, curv: .5 });
      paint(ellPts(1.2 * s, -.8 * s, .26 * s, .2 * s, 10), { wash: PAL.cream, ink: null });
      paint(ellPts(.75 * s, .7 * s, .14 * s, .14 * s, 8), { wash: PAL.cream, ink: null });
      pop();
    }
    paint(ellPts(0, .2 * s, .17 * s, .78 * s, 12), { wash: BODY, ink: null });
    paint(ellPts(0, -.68 * s, .24 * s, .22 * s, 10), { wash: BODY, ink: null });
    for (const side of [-1, 1]) {
      inkLine(P([[side * .08, -.82], [side * .3, -1.3], [side * .5, -1.5]]), sw * .7, PAL.ink, 'inkfine', .5);
      paint(ellPts(side * .5 * s, -1.52 * s, .09 * s, .09 * s, 6), { wash: PAL.ink, ink: null });
    }
    pop();
  }
  // Catmull-Rom through timed keys [[t, x, y], ...]: a smooth flight that passes through every key at its time.
  function flight(keys, t) {
    const n = keys.length;
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2]];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const p0 = keys[Math.max(0, i - 1)], p1 = keys[i], p2 = keys[i + 1], p3 = keys[Math.min(n - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]);
    const cr = d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u * u + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u * u * u);
    return [cr(1), cr(2)];
  }
  // A flying butterfly at time t on a flight path: flutter bob, fast flapping, and a tilt into the direction of travel.
  function flyer(keys, t, s, flut = 1, key = '') {
    const [x, y] = flight(keys, t), a = flight(keys, t - .04), b = flight(keys, t + .04);
    const bx = flut * 6 * Math.sin(t * TAU * 1.3), by = flut * 11 * Math.sin(t * TAU * 2.6);
    butterfly(x + bx, y + by, s, { open: .64 + .36 * Math.cos(t * TAU * 6.5), rot: clamp((b[0] - a[0]) * .006, -.35, .35), key });
    return [x + bx, y + by];
  }
  const resting = (t, ph = 0) => .72 + .28 * Math.sin(t * TAU * .7 + ph);   // slow open and close while perched

  // ---------- the meadow (shots A and B) ----------
  function meadow(t, cx, G) {
    boilSeed('sky');
    paint(rectPts(cx - 1500, -700, 3000, 2400), { wash: skyCol(t), ink: null });
    for (let i = 0; i < 3; i++) {   // clouds, far away: they follow the camera at 85%
      boilSeed('cloud' + i);
      const x = 300 + i * 760 + (cx - 960) * .85 + 30 * Math.sin(t * .2 + i), y = 170 + 90 * hash(i + 4);
      paint(ellPts(x, y, 210 + 60 * hash(i), 52, 20, 4), { fill: PAL.cream, fillOp: 150, bleed: .25, tex: .4, border: .3, ink: null });
    }
    for (let i = 0; i < 3; i++) {   // far hills at 60%
      boilSeed('hill' + i);
      const x = -200 + i * 1100 + (cx - 960) * .6;
      paint(ellPts(x, G + 60, 900, 300, 30, 3), { wash: mixCol(HILL, skyCol(t), .25), fill: mixCol(HILL, PAL.teal, .3), fillOp: 60, bleed: .1, tex: .5, ink: null });
    }
    boilSeed('ground');
    paint(rectPts(cx - 1400, G - 40, 2800, 900), { wash: GRASS, fill: GRASS_DK, fillOp: 60, bleed: .05, tex: .6, ink: null });
    inkLine([[cx - 1100, G - 38], [cx, G - 44], [cx + 1100, G - 36]], .9, mixCol(GRASS_DK, PAL.ink, .4), 'ink', .5);
    const i0 = Math.floor((cx - 1100) / 110), i1 = Math.ceil((cx + 1100) / 110);
    for (let i = i0; i <= i1; i++) {   // tufts and little daisies, fixed in the world by hash(i)
      boilSeed('tuft' + i);
      const x = i * 110 + 70 * hash(i), y = G - 20 + 60 * hash(i + 50), sway = 6 * wob(t, .45, hash(i) * 3);
      for (const k of [-1, 0, 1]) inkLine([[x + k * 6, y], [x + k * 10 + sway, y - 22 - 10 * hash(i + k + 9)]], .7, GRASS_DK, 'inkfine', .4);
      if (hash(i + 77) > .72) {
        const fx = x + 30, fy = y + 18 + sway * .3;
        paint(starPts(fx, fy, 11, .45, 5, hash(i)), { wash: PAL.cream, ink: PAL.ink, sw: .35 });
        paint(ellPts(fx, fy, 4, 4, 8), { wash: PAL.ochre, ink: null });
      }
    }
  }

  // The big daisy in shot A. flat 0..1: Clawd lands on it and it's bent flat (mostly hidden under Clawd).
  function daisy(x, G, t, flat) {
    boilSeed('daisy');
    const sway = 8 * wob(t, .4) * (1 - flat), hx = lerp(x - 10 + sway, x + 60, flat), hy = lerp(G - 238, G - 40, flat);
    inkLine([[x, G - 30], [lerp(x - 14, x + 30, flat), lerp(G - 130, G - 36, flat)], [hx, hy + 20]], 2.2, GRASS_DK, 'ink', .6);
    paint(ellPts(x - 26, G - 92 + 40 * flat, 30, 11, 12, 0, -.5), { wash: '#7FAE5A', ink: PAL.ink, sw: .6 });
    push(); translate(hx, hy); scale(1, 1 - .45 * flat); rotate(.5 * flat);
    for (let i = 0; i < 9; i++) {
      if (flat > .5 && i % 3 === 0) continue;   // the petals that came off
      const a = i / 9 * TAU + .2;
      paint(ellPts(Math.cos(a) * 40, Math.sin(a) * 40, 32, 13, 12, 0, a), { wash: PAL.cream, ink: PAL.ink, sw: .55 });
    }
    paint(ellPts(0, 0, 21, 21, 14), { wash: PAL.ochre, fill: '#D98F2B', fillOp: 90, tex: .6, ink: PAL.ink, sw: .6 });
    pop();
    return [hx, hy];
  }
  const petal = (x, y, a, k) => paint(ellPts(x, y, 26 * (1 - .3 * k), 11 * (1 - .3 * k), 10, 0, a), { wash: PAL.cream, washOp: 255 * (1 - k * k), ink: PAL.ink, sw: .5 });
  const leaf = (x, y, a, k) => paint(ellPts(x, y, 20, 8, 10, 0, a), { wash: k > .5 ? GRASS : '#7FAE5A', washOp: 255 * (1 - k * k), ink: PAL.ink, sw: .45 });

  // A whip pan: the frame smears into horizontal paint streaks (k 0 → 1), fully covered at k = 1, where the cut goes.
  function whip(k, t, G) {
    if (k <= .01) return;
    boilSeed('whip');
    const top = skyCol(t), split = G - 30;
    paint(rectPts(-80, -80, W + 160, split + 80), { wash: top, washOp: 255 * k * k, ink: null });
    paint(rectPts(-80, split, W + 160, H - split + 80), { wash: GRASS, washOp: 255 * k * k, ink: null });
    for (let i = 0; i < 26; i++) {
      const y = hash(i * 3.1) * H, low = y > split, col = low ? (i % 2 ? GRASS_DK : '#B6D88A') : (i % 2 ? PAL.cream : mixCol(top, PAL.indigo, .15));
      const x0 = -100 + hash(i + 40) * 600 * (1 - k), x1 = W + 100 - hash(i + 60) * 600 * (1 - k);
      inkLine([[x0, y], [(x0 + x1) / 2, y + jit(4)], [x1, y + jit(3)]], (3 + 7 * hash(i + 9)) * k, col, 'dry', .2);
    }
  }

  // ---------- shot A: the daisy ----------
  function shotA(t, lt, dur) {
    const G = 880, u = 24, X0 = 720, X1 = 950, FLX = 1050, tP = 3.3, tL = 3.7;
    if (easeIn(lt / .6) * 1500 < 4) return iris(0, 0, 0);   // the iris is still shut: nothing to paint behind it
    const sh = lt > tL ? shakeXY(t, 9 * Math.exp(-(lt - tL) * 8)) : [0, 0];
    const whipX = 1700 * easeIn(seg(lt, 4.5, dur));
    const cx = 910 + 22 * Math.sin(lt * .5) + whipX + sh[0];
    camBegin(cx, 610 + sh[1], kf(lt, [[0, 1.14], [3.25, 1.2], [3.75, 1.17], [4.5, 1.18]]));
    meadow(t, cx, G);
    const flat = ease(seg(lt, tL - .04, tL + .08));
    daisy(FLX, G, t, flat);

    // Clawd: bored → notices → sly wiggle → pounce → flat in the flower, dizzy → glares → turns to give chase
    const mood = acts(t, A0, [[0, 'bored'], [2.35, 'surprised', { lookX: .9, lookY: -.3 }], [2.85, 'mischief', { lookX: .9, lookY: -.2 }],
                              [tL + .05, 'dizzy'], [4.2, 'determined', { lookX: 1, lookY: -.5 }]]);
    const hop = jump(lt, tP, tL, 3.2), fly = seg(lt, tP, tL);
    let x = lerp(X0, X1, fly) + 260 * easeIn(seg(lt, 4.5, dur)), view = {};
    if (lt > 3.05 && lt < tL + .05) view = turn(lt, 3.05, 3.17, 0, .125);
    else if (lt >= tL + .05 && lt < 4.2) view = turn(lt, tL + .05, tL + .15, .125, 0);
    else if (lt >= 4.2) view = turn(lt, 4.38, 4.5, 0, .25);
    const wiggle = .14 * Math.sin(lt * TAU * 7) * seg(lt, 2.95, 3.05) * (lt < tP - .12 ? 1 : 0);
    const flop = lt > tL ? .3 * Math.exp(-(lt - tL) * 5) : 0;   // lands flat in the flower, then springs back up
    const reach = lt > tP - .05 && lt < tL + .1 ? 1.2 * Math.sin(Math.PI * seg(lt, tP - .05, tL + .1)) : 0;
    clawd(x, G, u, {
      ...mood, ...view,
      dx: (mood.dx || 0) + wiggle, dy: (mood.dy || 0) + hop.dy, sq: (mood.sq || 0) + hop.sq + flop + .12 * ease(seg(lt, 2.95, 3.15)) * (lt < tP - .12 ? 1 : 0),
      rot: (mood.rot || 0) + .22 * Math.sin(Math.PI * fly), aL: (mood.aL ?? .2) + reach, aR: (mood.aR ?? .2) + reach,
      walk: lt > 4.45 ? (lt - 4.45) * 4 : null,
    });
    const at = toScreen(X0, G - 4 * u);

    // petals burst out when Clawd lands
    boilSeed('petals');
    if (lt > tL) for (let i = 0; i < 6; i++) {
      const k = seg(lt, tL, tL + .9 + .2 * hash(i)), a = -Math.PI / 2 + (i - 2.5) * .5;
      if (k < 1) { const p = arcPt([FLX + 40, G - 70], [FLX + 40 + Math.cos(a) * 260, G - 20 + 60 * hash(i)], 150 + 80 * hash(i + 3), k); petal(p[0], p[1], a + k * 6, k); }
    }

    // the butterfly: flies in, perches on the daisy, escapes the pounce, teases Clawd, leaves to the right
    const perch = [FLX - 10 + 8 * wob(t, .4), G - 238 - 46];
    if (lt < 2.15) flyer([[.2, -140, 300], [.8, 230, 410], [1.3, 560, 330], [1.75, 880, 470], [2.0, 1020, 520], [2.15, perch[0], perch[1]]], lt, 36, seg(lt, .2, 1.6) * (1 - seg(lt, 1.8, 2.15)), 'a');
    else if (lt < 3.38) butterfly(perch[0], perch[1], 36, { open: resting(lt), rot: .04 * wob(t, .4), key: 'a' });
    else flyer([[3.38, perch[0], perch[1]], [3.6, 1090, 480], [3.85, 1020, 575], [4.05, 880, 600], [4.25, 1020, 545], [4.7, 1950, 330]], lt, 36, seg(lt, 3.4, 3.7), 'a');
    camEnd();
    whip(seg(lt, 4.48, dur), t, G);
    if (lt < .6) iris(...at, lerp(0, 1500, easeIn(lt / .6)));
  }

  // ---------- shot B: the chase ----------
  const RX0 = 300, RV = 650;
  function runX(lt) {
    let x = RX0 + RV * Math.min(lt, 2.55);
    const d = clamp(lt - 2.55, 0, .4); x += RV * (d - d * d / .8);   // skids to a stop
    x += 640 * seg(lt, 3.4, 4.1) + 40 * easeOut(seg(lt, 4.1, 4.3));   // the big leap, and the slide into the grass
    return x;
  }
  // a clump of tall grass that Clawd crashes into; hit = time since the crash
  function clump(x, G, t, hit) {
    const n = 11;
    for (let i = 0; i < n; i++) {
      boilSeed('clump' + i);
      const s = (i - (n - 1) / 2) / ((n - 1) / 2), h = 150 - 70 * (1 - Math.abs(s)) + 30 * hash(i), bx = x + s * 150;
      const push = hit > 0 ? 70 * Math.sign(s || 1) * Math.exp(-hit * 4) * Math.cos(hit * 11) : 0, sway = 7 * wob(t, .5, hash(i) * 2);
      const tip = [bx + s * 40 + sway + push, G - h], mid = [bx + s * 14 + push * .4, G - h * .5];
      paint(ribbon([[bx, G + 30], mid, tip], 30, 3), { wash: i % 2 ? GRASS_DK : '#6E9F50', fill: GRASS, fillOp: 40, ink: PAL.ink, sw: .6 });
    }
  }
  function shotB(t, lt, dur) {
    const G = 880, u = 22, tC = 4.1, x = runX(lt);
    const sh = lt > tC ? shakeXY(t, 10 * Math.exp(-(lt - tC) * 7)) : [0, 0];
    const lead = lerp(240, 0, ease(seg(lt, 3.0, 4.4))), whipIn = 1700 * Math.pow(1 - seg(lt, 0, .38), 2);
    const cx = x + lead - whipIn + sh[0];
    camBegin(cx, 650 + sh[1], kf(lt, [[0, 1.25], [2.95, 1.25], [3.38, 1.33], [3.6, 1.24], [dur, 1.28]]));
    meadow(t, cx, G);

    const j1 = jump(lt, 1.0, 1.45, 2.6), j2 = jump(lt, 1.95, 2.55, 4.2), j3 = jump(lt, 3.4, tC, 7), pop = jump(lt, 4.5, 4.8, 1.3);
    const mood = acts(t, B0, [[0, 'determined'], [2.55, 'angry', { lookX: .6, lookY: -.8 }], [2.95, 'determined', { lookX: .6, lookY: -.6 }], [tC + .05, 'dizzy']]);
    const running = lt < 2.95, walk = (Math.min(x, runX(2.95)) - RX0) / (3 * u);
    const ground = !(lt > 1 && lt < 1.45) && !(lt > 1.95 && lt < 2.55);
    let dy = (mood.dy || 0) * .3 + j1.dy + j2.dy + j3.dy + pop.dy, sq = (mood.sq || 0) + j1.sq + j2.sq + j3.sq + pop.sq, aL = mood.aL ?? .2, dx = mood.dx || 0;
    if (running && ground) { dy -= .6 * Math.abs(Math.sin(walk * TAU)); aL = .2 + .7 * Math.sin(walk * TAU); }
    // the swipes: the arm goes up as Clawd rises, then chops down through where the butterfly was
    const swipe = (a, b, c) => lt > a && lt < c ? (lt < b ? lerp(.3, 1.7, easeOut(seg(lt, a, b))) : lerp(1.7, -.5, ease(seg(lt, b, c)))) : null;
    const sw1 = swipe(1.0, 1.14, 1.32), sw2 = swipe(1.95, 2.24, 2.42); if (sw1 != null) aL = sw1; if (sw2 != null) aL = sw2;
    if (lt > 2.55 && lt < 2.95) aL = lerp(aL, -.4, seg(lt, 2.55, 2.7));                       // skid: arm back
    if (lt > 2.95 && lt < 3.4) { sq = Math.max(sq, .3 * ease(seg(lt, 2.95, 3.12))); dx += .16 * Math.sin(lt * TAU * 7) * seg(lt, 3.0, 3.1); aL = -.5; }   // crouch and wiggle
    if (lt > 3.4 && lt < tC) aL = lt < 3.72 ? lerp(-.5, 1.6, easeOut(seg(lt, 3.4, 3.6))) : lerp(1.6, .3, easeOut(seg(lt, 3.72, 3.8)));   // reach, then clap on nothing
    let view = { view: 'side' }, gy = G;
    if (lt > tC) {   // the crash: sunk into the grass, then pops up dizzy, facing us
      view = turn(lt, tC, tC + .1, .25, 0);
      gy = G + 50 * (1 - ease(seg(lt, 4.45, 4.8)));
      dy = (mood.dy || 0) + pop.dy; sq = (mood.sq || 0) + j3.sq + pop.sq + .25 * Math.exp(-(lt - tC) * 6); aL = mood.aL ?? .2;
    }
    const smear = lt > 3.4 && lt < 3.75 ? .55 * Math.sin(Math.PI * seg(lt, 3.4, 3.75)) : 0;
    clawd(x, gy, u, {
      ...mood, ...view, dx, dy, sq, aL, walk: running ? walk : lt > tC ? null : walk + (lt - 2.95) * 2, smear, smearDir: 1,
      rot: (mood.rot || 0) + (running && ground ? -.06 : 0) + (lt > 3.4 && lt < tC ? -.12 + .3 * seg(lt, 3.4, tC) : 0) + (lt > tC ? .2 * Math.exp(-(lt - tC) * 4) : 0),
    });
    clump(2795, G, t, lt - tC);
    boilSeed('leaves');
    if (lt > tC) for (let i = 0; i < 8; i++) {   // leaves burst out of the grass
      const k = seg(lt, tC, tC + .8 + .3 * hash(i + 20)), a = -Math.PI / 2 + (i - 3.5) * .4;
      if (k < 1) { const p = arcPt([2790, G - 90], [2790 + Math.cos(a) * 330, G - 30 + 40 * hash(i)], 160 + 90 * hash(i + 2), k); leaf(p[0], p[1], a + k * 8, k); }
    }

    // the butterfly, always just ahead; it dodges each try at the last moment
    flyer([[0, 600, 520], [.5, 880, 560], [.95, 1080, 600], [1.12, 1118, 612], [1.27, 1175, 790], [1.55, 1420, 660], [1.85, 1640, 600],
           [2.15, 1745, 590], [2.3, 1800, 400], [2.6, 1980, 370], [2.95, 2200, 460], [3.3, 2370, 515], [3.7, 2405, 520], [3.86, 2330, 790],
           [4.15, 2440, 710], [4.5, 2620, 560], [4.9, 2860, 420], [5.3, 3400, 150]], lt, 32, lt > 3.3 && lt < 3.72 ? .5 : 1, 'b');
    camEnd();
    whip(1 - seg(lt, 0, .3), t, G);
    boilSeed('transition');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, GREENS);
  }

  // ---------- shot C: the landing ----------
  function shotC(t, lt, dur) {
    const G = 1000, u = 42, X = 960;
    camBegin(960 + 12 * Math.sin(lt * .5), kf(lt, [[0, 600], [dur, 580]]), kf(lt, [[0, 1], [dur, 1.08]]));
    boilSeed('skyC');
    paint(rectPts(-300, -300, W + 600, H + 600), { wash: skyCol(t), ink: null });
    paint(ellPts(500, 820, 1200, 360, 28, 6), { fill: PAL.rose, fillOp: 60, bleed: .3, tex: .5, ink: null });
    glow(330, 330, 380, '#FFC766', .9);   // the low afternoon sun
    boilSeed('hillC');
    paint(ellPts(1300, 1080, 1500, 330, 30, 3), { wash: mixCol(HILL, SKY_PM, .3), fill: mixCol(HILL, PAL.ochre, .3), fillOp: 60, bleed: .1, tex: .5, ink: null });
    boilSeed('groundC');
    paint(rectPts(-300, G - 60, W + 600, 500), { wash: mixCol(GRASS, PAL.ochre, .25), fill: GRASS_DK, fillOp: 60, bleed: .05, tex: .6, ink: null });

    // Clawd: sad → a long sigh → eyes roll up at the butterfly → love
    const mood = acts(t, C0, [[0, 'sad', { emote: null, lookY: .7, lookX: -.2 }], [3.35, 'love']], { take: .5 });
    const sigh = -.08 * Math.sin(Math.PI * seg(lt, .5, 1.0)) + .12 * Math.sin(Math.PI * seg(lt, 1.0, 1.7));
    const look = ease(seg(lt, 2.75, 3.0));
    const lookX = lt < 3.35 ? lerp(-.2, -.45, look) : mood.lookX, lookY = lt < 3.35 ? lerp(.7, -1, look) : mood.lookY;
    // the butterfly, in Clawd's body space so it rides every wiggle once it has landed (sizes in u)
    const land = 2.35, perch = [-1.9, -9.25];
    const keys = [[.7, 15, -24], [1.2, 9, -18], [1.6, 2, -15.5], [1.95, -4.5, -13], [2.2, -2.6, -10.2], [land, ...perch]];
    clawd(X, G, u, {
      ...mood, lookX, lookY, sq: (mood.sq || 0) + sigh, aL: mood.aL, aR: mood.aR,
      draw: (uu, sw) => {
        if (lt < .7) return;
        if (lt < land) {
          const [bx, by] = flight(keys, lt), f = 1 - seg(lt, 1.8, land);
          butterfly((bx + .15 * f * Math.sin(lt * TAU * 1.3)) * uu, (by + .25 * f * Math.sin(lt * TAU * 2.6)) * uu, 1.15 * uu,
            { open: lerp(resting(lt), .56 + .44 * Math.cos(lt * TAU * 6), f), rot: -.25 * f, key: 'c' });
        } else {
          const jig = lt > 3.35 ? .12 * Math.exp(-(lt - 3.35) * 4) * Math.sin((lt - 3.35) * 20) : 0;   // the take jostles it
          butterfly(perch[0] * uu, perch[1] * uu, 1.15 * uu, { open: lt > 3.35 && lt < 3.7 ? .5 + .5 * Math.cos((lt - 3.35) * 30) : resting(lt, 1), rot: jig, key: 'c' });
        }
      },
    });
    boilSeed('blades');
    for (let i = 0; i < 9; i++) {   // close grass in front
      const bx = -80 + i * 260 + 90 * hash(i + 5), h = 120 + 80 * hash(i + 6), sw = 10 * wob(t, .4, hash(i) * 2);
      paint(ribbon([[bx, G + 140], [bx + 10 + sw * .5, G + 140 - h * .55], [bx + 30 + sw, G + 140 - h]], 34, 3), { wash: i % 2 ? GRASS_DK : '#6E9F50', ink: PAL.ink, sw: .7 });
    }
    const at = toScreen(X - 1 * u, G - 7.6 * u);
    camEnd();
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, GREENS);
    if (lt > 4.1) {
      const r = lt < 4.45 ? lerp(1500, 380, ease(seg(lt, 4.1, 4.45))) : lt < dur - .28 ? lerp(380, 355, seg(lt, 4.45, dur - .28)) : lerp(355, 0, easeIn(seg(lt, dur - .28, dur - .04)));
      iris(...at, r);
    }
  }

  shots([[A0, shotA], [B0, shotB], [C0, shotC]]);
})();
