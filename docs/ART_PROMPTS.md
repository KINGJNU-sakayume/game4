# 탱고 레테 — ChatGPT 그림 프롬프트 모음

지금 그림의 분위기는 그대로 두고, ChatGPT(이미지 생성)로 더 많은 것을 담은 그림을 새로 만들기 위한 프롬프트 모음이다. 지금 분위기란 무대 조명을 받은 평면 세트, 얼굴 없는 실루엣, 안개와 젖은 바닥의 반사, 절제된 색을 말한다. 더 담을 것은 게임 본문에 적힌 소품, 질감, 사람 사는 흔적, 깊이감이다.

- 장면 34장: 장소 15곳의 낮과 밤(썰물·시신 변형 포함), 물속(꿈·죽음), 타이틀
- 초상 32장
- 통일성을 위한 기준 그림 3장: 키 아트, 스타일 시트, 초상 기준
- 선택: 소품·증거물 카드

프롬프트 본문은 영어로 두었다. 이미지 모델은 화풍과 조명 용어를 영어에서 더 정확히 따른다. 복사해서 그대로 붙여 넣으면 된다.

---

## 0. 먼저 읽기 — 그림들이 한 게임처럼 보이게 하는 방법

### 0-1. 레퍼런스 사슬

그림을 아무 순서로나 만들면 한 장 한 장은 좋아도 서로 다른 게임처럼 보인다. 아래 순서로 만들면서 앞에서 만든 그림을 다음 그림의 첨부로 넘긴다.

```
① 스타일 바이블(글) ─────────────────────────────── 모든 프롬프트의 앞머리(또는 프로젝트 지침)
② 키 아트: 타이틀          ← 구도: 지금의 title.webp
③ 스타일 시트              ← 화풍: ②
④ 장소마다 낮 그림          ← 화풍: ②(+③) · 구도: 지금의 그 장면 그림
⑤ 같은 장소의 밤·썰물·시신   ← ④를 같은 대화에서 편집
⑥ 초상 기준: 형사(you)      ← 화풍: ② · 구도: 지금의 you.webp
⑦ (선택) 초상 라인업 시트   ← 틀: ⑥, 네 명씩
⑧ 초상 한 장씩             ← 틀: ⑥ · 구도: 지금의 그 인물 초상
```

- **화풍 기준**(첨부 ①)은 ② 키 아트다. ③ 스타일 시트는 색·재질·인물 실루엣의 견본이다. 화풍이 흔들리기 시작하면 둘 다 붙인다.
- 키 아트는 밤 그림이다. 그래서 낮 장면의 기준도 하나 있으면 좋다. 장면 중에서는 **부두 거리 낮(`quay_d`, 3-4)을 가장 먼저** 만든다. 마음에 들면 낮 장면을 만들 때 키 아트와 함께 첨부한다.
- **구도 기준**(첨부 ②)은 지금 게임에 들어 있는 그 장면의 그림이다. 저장소의 `assets/scenes/<열쇠>.webp`, `assets/portraits/<이름>.webp`를 GitHub에서 열어 Download 하면 된다. WebP가 올라가지 않으면 PNG로 바꿔서 올린다. 구도를 지키는 이유는 0-5에 있다.
- 첨부 순서는 늘 **그림 1 = 화풍, 그림 2 = 구도**다. 프롬프트도 그렇게 적혀 있다.

### 0-2. ChatGPT 준비

1. **프로젝트를 만든다.** 이름은 예컨대 "탱고 레테 그림". 프로젝트 지침(Instructions)에 1장의 스타일 바이블을 통째로 붙여 넣는다. 그러면 이 프로젝트 안의 모든 대화가 같은 규칙으로 시작한다.
2. **기준 그림(②③⑥)은 만들 때마다 프로젝트 파일에도 올려 둔다.** 다만 그림을 만들 때는 대화에 직접 첨부하는 편이 확실하다.
3. **장소 하나 = 대화 하나.** 낮 그림을 만든 대화에서 밤과 변형까지 만든다. 같은 대화 안에서는 앞의 그림을 기억하므로, "같은 그림에서 이것만 바꿔"가 가장 잘 통한다.
4. **고칠 때는 새로 만들지 말고 편집을 요청한다.** 예: "Keep everything exactly the same, but make the sky darker and remove the second bicycle." 새로 만들 때보다 통일성이 훨씬 잘 지켜진다.
5. 마음에 드는 그림은 바로 내려받는다. 파일 이름은 게임 열쇠로 붙인다. 예: `quay_n.png`

### 0-3. 크기와 자르기

| | ChatGPT에서 만드는 크기 | 게임 규격 | 잘리는 곳 |
|---|---|---|---|
| 장면 | 가로 3:2 (1536×1024) | 16:9 (1920×1080) | 위아래 약 8%씩 |
| 초상 | 세로 2:3 (1024×1536) | 4:5 (512×640) | 위아래 약 8%씩 |

프롬프트에 "위아래 8%에는 중요한 것을 두지 말 것"이 들어 있다. 자르고 줄이고 WebP로 바꾸는 일은 `tools/art/import.mjs`가 한다(0-8).

### 0-4. 화면 배치 — 그림이 게임에서 어떻게 보이나

- **넓은 화면:** 오른쪽 약 36%는 글 칸이 덮는다. 주인공 피사체와 주요 광원은 **왼쪽 60% 안에** 둔다. 오른쪽 3분의 1은 차분하고 어둡게 한다.
- **휴대폰:** 장면은 화면 위쪽 42%에만 보인다. 가로로는 초점(focus) 둘레의 약 62%만 보인다. 장면마다 "휴대폰에서 보이는 범위"를 적어 두었다. 타이틀은 휴대폰에서 화면 전체를 쓰므로 가운데 좁은 세로 띠(가로 52–78%)만 보인다.
- **초상:** 게임에서는 작게 보인다. 대화 칸은 108×135px, 휴대폰은 72×90px다. 실루엣과 포인트 색 한두 개가 그 크기에서도 읽혀야 한다. 세부 묘사는 인물 창(112×140px)에서나 조금 보이는 덤이다.

### 0-5. 깜빡이는 광원 — 구도를 지켜야 하는 이유

게임은 `assets/art.json`에 적힌 자리에 네온·등대·불꽃·촛불·가로등의 **깜빡임을 덧그린다**. 새 그림의 광원이 그 자리에 없으면 허공에서 빛이 깜빡인다.

- **방법 A (권장):** 지금 그림을 구도 기준으로 첨부하고 광원 자리를 지키라고 요청한다. 장면마다 **깜빡이는 광원 자리**를 (가로%, 세로%)로 적어 두었고, 프롬프트에도 같은 좌표가 들어 있다.
- **방법 B:** 구도를 바꾸고 싶으면 그렇게 만든 뒤 `art.json`의 `lights` 좌표를 새 그림에 맞게 고친다. 좌표는 0~1이다. Claude에게 새 그림을 주고 맞춰 달라고 해도 된다.
- **확인:** `node tools/art/import.mjs preview <열쇠> <새 그림>`을 실행하고 노란 원 안에 새 그림의 광원이 있는지 본다.

### 0-6. 글자

이미지 모델은 한글을 자주 틀린다. 그래서 프롬프트에는 **영문 간판만** 넣었다(`LETHE`, `PB-7`, `…MEMORIA`, `RADIO LETHE 97.3`). 한글 간판(잊지 마, 파업 중, 튀김)은 **빈 간판**으로 두게 했다. 한글이 꼭 필요하면 나중에 그림 편집기로 넣거나, 프롬프트에 정확한 글자를 따옴표로 넣고 몇 번 시도한다.

### 0-7. 안전 필터

크레인에 매달린 시신(`crane_db`, `crane_nb`, `title`)은 거절될 수 있다. 그럴 때는 두 단계로 만든다.

1. 매달린 것 없이 먼저 만든다.
2. 편집에서 "add a small dark silhouette hanging from the hook at the end of the cable, far away, not graphic"를 요청한다.

### 0-8. 게임에 넣기

```bash
node tools/art/import.mjs scene quay_n ~/Downloads/quay_n.png      # 16:9로 잘라 1920×1080 WebP → assets/scenes/quay_n.webp
node tools/art/import.mjs portrait yun ~/Downloads/yun.png         # 4:5로 잘라 512×640 WebP → assets/portraits/yun.webp
node tools/art/import.mjs preview quay_n                           # 광원 자리·글 칸·휴대폰 범위를 그림 위에 표시 → tools/art/out/
npm run build                                                      # 게임에 반영
```

- 자르는 위치는 `--y 0.45`처럼 옮긴다(0 = 위, 1 = 아래). `--x`는 가로, `--zoom 1.1`은 조금 더 확대해서 자른다.
- playwright가 필요하다(`npm run art`와 같다).
- **주의:** `npm run art`는 모든 그림을 `tools/art`의 코드로 다시 그려 덮어쓴다. 바깥 그림을 넣은 뒤에는 쓰지 않는다. 쓰더라도 `--only`로 필요한 것만 다시 그린다.

---

## 1. 스타일 바이블

프로젝트 지침에 넣거나 모든 프롬프트 앞에 붙인다.

```text
TANGO LETHE — STYLE BIBLE

Medium: 2D digital illustration that looks like a theater stage set under stage lights. Flat geometric shapes with clean edges, soft airbrushed gradients, no ink outlines, a subtle paper-and-film grain. Painterly-flat, like a mid-century travel poster crossed with a modern narrative indie game. NOT photorealistic, NOT a 3D render, NOT anime, NOT comic-inked.

Space and composition: frontal one-point perspective at eye level, strong horizontals and verticals, clear depth layers (dark foreground props, lit midground set pieces, hazy background). Wide 3:2 landscape unless told otherwise. The main subject sits in the left 60% of the frame; the right third is calmer and darker because a text panel will cover it. Keep nothing important in the top and bottom 8% (they will be cropped to 16:9).

Light: stage lighting from a few motivated sources only (sodium street lamps, neon, candles, fire barrels, lit windows, moonlight). They throw soft cones and volumetric shafts through haze and long reflections on wet floors; everything else falls into cool shadow. Colored light, not colored objects.

Palette: muted and desaturated: sea-fog grey, verdigris teal, tar black, bruised plum, faded brick red, bone white. Warm accents come only from light: sodium amber (#FFB45A), candle gold (#FFD9A0), neon crimson (#FF2F5A). Night: deep indigo and teal-black with warm pools of light. Day: overcast, pale, misty.

People: small faceless silhouettes or near-silhouettes with a thin rim of light; readable clothing shapes (flat caps, long coats, headscarves); no facial detail in scenes.

World: Sarga, a decaying 1950s–60s Southern European port city on an estuary: Spanish/Portuguese/Italian harbor architecture, faded Art Deco, rusted red dock cranes, cobblestones, laundry lines, fishing gear. Three weeks into a dockworkers' strike. Melancholic, quiet, humane, a little surreal: the city of forgetting.

Detail: richer than a minimalist poster. Add environmental storytelling props, textures (peeling paint, rust flakes, wet cobbles, water stains), small life (gulls, pigeons, a cat, crabs) and weather (mist, drizzle), but keep the shapes simple and the image readable at a glance.

Avoid: photorealism, glossy CGI, heavy outlines, lens flares, any text or lettering unless specified, watermarks, borders, UI, visible faces in scenes, gore.
```

---

## 2. 기준 그림 — 가장 먼저 만든다

### 2-1. 키 아트 — 타이틀 `title`

- 초점 0.7 · 휴대폰에서는 가로 52–78%만 보인다(타이틀은 전체 화면)
- 깜빡이는 광원: 크레인 꼭대기 붉은 등 (51%, 14%) · 가로등 (60%, 69%) · 왼쪽 밖 네온의 붉은 번짐 (1%, 46%)
- 이 그림이 모든 그림의 화풍 기준이 된다. 여러 번 다시 만들고 편집해서 **가장 마음에 드는 한 장**을 고른다.

첨부: ① 지금의 `assets/scenes/title.webp` (구도 기준)

```text
Key art for "Tango Lethe", a melancholic detective game. Wide 3:2 landscape. Follow the Tango Lethe style bible.
Use the attached image only as the LAYOUT reference: keep its camera, horizon and the positions of the crane, the moon, the man and the lights, but repaint everything with much richer detail.

Night, light rain, the harbor of Sarga. The left 45% of the frame stays dark and nearly empty (a title menu will sit there).
Right of center: the tall black silhouette of Crane No. 7, a lattice-steel dock crane, against an enormous pale full moon veiled by thin cloud; a small red warning light at the top of its tower (x≈51%, y≈14%). From the end of its long jib a steel cable hangs down; at its end, a tiny dark figure of a hanging man, small and not graphic.
Other cranes stand fainter in the mist; the estuary water, a distant lighthouse, drizzle streaks, a line of harbor lights on the far shore.
Foreground: wet cobblestones; a lone man in a long coat and flared trousers stands under a single old iron street lamp (x≈60%, y≈69%) whose warm cone of light catches the rain and lays a long amber reflection on the stones.
From beyond the left edge, a crimson neon glow (the LETHE sign, x≈0–2%, y≈46%) bleeds into the scene and tints the puddles.
Palette: deep indigo, blue-black, pale moon white, one warm amber lamp, one crimson neon. No text.
```

### 2-2. 스타일 시트

첨부: ① 2-1에서 고른 키 아트

```text
Using the attached key art as the only style reference, create a one-page visual style sheet for the game "Tango Lethe" on a dark charcoal background, arranged in a clean grid, same flat stage-lit illustration style:
1) a palette strip of 10 swatches: sea-fog grey, verdigris teal, tar black, bruised plum, faded brick red, bone white, sodium amber, candle gold, neon crimson, moonlight blue;
2) three small vignettes of the same cobbled street corner: under overcast day fog, under sodium lamps at night, under red neon;
3) a row of five faceless rim-lit silhouette figures: a dockworker in a flat cap, a woman in a headscarf, an old man with a bandoneon, a policewoman in a leather jacket, a small boy in a cap;
4) material swatches: wet cobblestone, peeling painted plaster, rusted crane steel with flaking red paint, black-and-white checkerboard marble, blistered tar roof, a mudflat that mirrors the sky;
5) a row of props: an oil-drum fire, a brass-horn gramophone, a bandoneon, a paper crown, an old police revolver, a portable typewriter, a wooden pigeon loft.
Small English labels under each item are fine; no other text.
```

### 2-3. 초상 기준 — 형사 `you`, 그리고 초상 틀

아래 **초상 틀**은 모든 초상 프롬프트의 앞머리다. 프로젝트 지침에 스타일 바이블과 함께 넣어 두면 편하다.

```text
PORTRAIT TEMPLATE
Vertical 2:3 image (it will be cropped to 4:5). One character, head and shoulders, in strict side profile facing RIGHT, placed slightly left of center: top of the head about 12% from the top, chin about 48% down, shoulders running off the bottom edge.
The figure is a near-black silhouette with only faint low-key modeling inside (you can just make out the eye, the lips, the folds of clothing), outlined by a thin bright rim light: warm on the face side (right), cool on the back of the head and shoulders (left).
One or two saturated accent details identify the character. Behind them, a soft-focus background motif specific to the character in 2–3 colors, darker toward the bottom.
Same lens, lighting, scale and finish for every character. It must read clearly as a tiny 108×135 px thumbnail. Flat stage-lit 2D illustration with subtle grain, like the Tango Lethe key art. No text (unless specified), no border, no frame.
```

첨부: ① 키 아트 ② 지금의 `assets/portraits/you.webp`

```text
Follow the PORTRAIT TEMPLATE and the Tango Lethe style. Image 1 is the style reference; image 2 is the current game portrait: keep its framing, pose and background idea, with much richer detail.
The detective, Lázaro Montero, 44, who woke up with no memory: unruly wild dark hair sticking out in all directions, three-day stubble, a fresh bruise on the cheekbone, a heavy tired jaw. He wears a loud green parrot-print silk shirt with a wide 1970s collar (the green collar is the accent) under a damp dark-green velvet jacket.
Background: tall vertical red neon letters "LETHE" glowing on the right in soft focus, a crimson-magenta haze fading to maroon-black. Warm pink rim light on the face, cool cyan rim light on the back of the head.
```

이 그림이 마음에 들면 초상 32장의 **틀 기준**이 된다. 프로젝트 파일에 올려 둔다.

### 2-4. (선택) 초상 라인업 시트 — 네 명씩

같은 대화에서 네 명을 한 장에 나란히 그리게 하면, 한 명씩 따로 만들 때보다 얼굴 크기·빛·마감이 잘 맞는다.

첨부: ① 형사 초상(2-3)

```text
Using the attached detective portrait as the exact template (same scale, framing, right-facing profile, rim lighting and finish), make a lineup sheet of four portrait cards side by side, each 4:5 with a thin gap between them, for these characters: [1] … [2] … [3] … [4] … (use the descriptions below). No text.
```

그다음 "Now make card [2] alone as a full-size portrait, identical in design"처럼 한 장씩 뽑는다. 인물 설명은 4장에서 복사한다.

---

## 3. 장면

모든 장면 프롬프트의 첨부는 **① 키 아트(필요하면 + 스타일 시트) ② 지금의 그 장면 그림**이다. 낮을 먼저 만들고, 같은 대화에서 밤과 변형을 편집으로 만든다.

- 광원 좌표는 (가로%, 세로%)다. 0%가 왼쪽 위다. 음수나 100%를 넘는 값은 틀 밖에서 번져 들어오는 빛이다.
- "휴대폰 범위"는 휴대폰에서 가로로 보이는 부분이다. 그 장소의 핵심은 이 안에 둔다.

### 3-1. 7호실 — `room_d` `room_n`

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원: 낮 없음 / 밤 창밖 네온 (36%, 44%)
- 게임 속 모습: 금 간 거울, 욕조(젖은 초록 벨벳 재킷이 빠져 있다), 벽의 립스틱 글씨 "잊지 마", 샹들리에에 걸린 구두 한 짝, 축음기, 창밖 크레인들, 어젯밤 형사가 부순 방

**낮** — 첨부: ① 키 아트 ② `assets/scenes/room_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep image 2's camera, room layout and the positions of the window, bed, bathtub and chandelier, but repaint it in the Tango Lethe style with much richer detail.
Room 7 upstairs in the Lethe dance hall, late morning after a night of wreckage. A narrow high-ceilinged room with faded sage-green striped wallpaper peeling at the seams.
Left: a claw-foot bathtub with a soaked dark-green velvet jacket slumped over its rim; above it a cracked oval mirror.
Center-left: a tall window with red velvet curtains half torn from the rail; through the dusty glass, the long necks of idle red harbor cranes over a grey estuary.
Hanging from the brass chandelier in the middle of the ceiling: a single two-tone spectator shoe (white leather, brown toe cap) dangling by its laces.
On the wallpaper right of the window, a big scrawl of red lipstick (abstract strokes, no readable letters).
Right: an unmade bed with a crimson bedspread; a bedside table with a brass-horn gramophone and scattered records; an overturned chair, empty rum bottles, a broken lampshade, scattered playing cards, a phone off the hook.
A pale rectangle of daylight falls on the worn floorboards; a small puddle of spilled water glints in it.
Sage green, faded brick red, warm honey wood, soft overcast window light with floating dust.
```

**밤** — 같은 대화에서

```text
Same room, same camera, same objects, at night. The window now glows deep crimson from the huge "LETHE" neon sign outside; keep that glow centered on the window (x≈36%, y≈44%). The red light spills across the ceiling and stains the walls; the rest of the room sinks into indigo-black. The shoe on the chandelier and the gramophone horn catch thin red rim lights; the lipstick scrawl reads darker. No other light sources.
```

### 3-2. 레테 무도장 — `hall_d` `hall_n`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 낮 분수 물빛 (47%, 69%) / 밤 + 샹들리에 (41%, 14%), 그 위 틀 밖 촛불 빛(34–50%, 위쪽 밖), 담뱃불 (11%, 63%)
- 게임 속 모습: 낮은 무대 화장을 지운 늙은 배우 같다. 먼지 섞인 빛기둥이 뒤집힌 의자를 비추고, 가운데 대리석 분수(물 항아리를 기울인 여인상)가 졸졸거린다. 밤에는 연기 구름 아래 반도네온이 울리고 남녀가 분수 둘레를 돈다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/hall_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep image 2's camera, the checkerboard floor perspective and the positions of the fountain, stage, bar and windows, but repaint it with much richer detail.
The ground-floor ballroom of the Lethe dance hall in the late morning, like an old actress without her stage makeup.
One-point perspective down a black-and-white checkerboard marble floor to a small stage with a heavy crimson velvet curtain and a gilded proscenium; an unlit crystal chandelier above it.
In the center, a marble fountain: a statue of a woman tilting a water jar, water trickling into a round basin (keep the water sparkle at x≈47%, y≈69%).
Tall arched windows on the right throw dusty diagonal shafts of pale daylight across chairs stacked upside down on small café tables.
Left: a long mahogany bar with rows of bottles and a brass rail, a wooden telephone booth with a glass door, a coat rack with one forgotten hat.
Details: confetti and cigarette butts on the floor, a mop and bucket, a lone high-heeled shoe, a bandoneon case at the edge of the stage, faded tango posters (no readable text), water stains on the ceiling.
Dusty rose, oxblood, cream marble, tarnished gold, cool daylight.
```

**밤** — 같은 대화에서

```text
Same ballroom, same camera, at night and alive. The crystal chandelier above the stage is lit (x≈41%, y≈14%) and more candle-glow spills down from above the top edge; a golden haze of cigarette smoke floats under it like a cloud.
Silhouetted tango couples turn around the fountain in close embrace; on the stage an old man in a fedora plays a bandoneon in a single spotlight; silhouettes lean on the bar; the glow of a cigarette at the left edge (x≈11%, y≈63%).
Red and gold light, deep shadows, long reflections on the checkerboard. The windows are now dark blue. Keep the fountain sparkle (x≈47%, y≈69%).
```

### 3-3. 레테 뒷마당 — `backyard_d` `backyard_n`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 낮 없음 / 밤 뒷문 위 전구 (45%, 59%), 비상계단 꼭대기 등 (28%, 1%), 고양이 눈 (55%, 53%)
- 게임 속 모습: 무도장 뒷벽과 공동주택 옆벽 사이의 좁고 축축한 틈. 하늘은 긴 띠다. 빨랫줄 수십 가닥, 쓰레기통 셋, 빈 병 상자가 있다. 지그재그 비상계단의 맨 아래 사다리는 3m 위에 걷어 올려져 있다. 쓰레기통 위에 고양이가 앉아 있다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/backyard_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the narrow slot of the alley and the positions of the fire escape, laundry and cat, with much richer detail.
The narrow, damp back yard of the Lethe dance hall: a slot of space between the dance hall's back wall (left, weathered wood and brick) and the blank side wall of a tenement (right, stained plaster). The sky is only a long pale strip high above.
Dozens of laundry lines cross overhead, hung with shirts, petticoats, aprons and diapers flapping like signal flags.
A rusty iron fire escape zigzags up the left wall toward the roof; its lowest ladder is pulled up and hangs about three meters above the ground.
On the ground: three dented trash cans, wooden crates of empty wine bottles, fish bones and potato peels, a cracked mop bucket, puddles reflecting the laundry, moss in the cracks, a drainpipe, a back door with a small wired-glass window. A skinny black cat sits on a trash-can lid.
Cold grey-green shade with a faint warm bounce light from above.
```

**밤** — 같은 대화에서

```text
Same yard, same camera, at night. A single bare bulb over the back door (x≈45%, y≈59%) makes a warm cone of light; a faint lamp high on the fire escape at the top edge (x≈28%, y≈1%). The laundry above turns into pale ghostly shapes; the black cat's eyes glow green-gold on the trash can (x≈55%, y≈53%); everything else is blue-black and wet.
```

### 3-4. 솔레아 부두 거리 — `quay_d` `quay_n`

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원
  - 낮: 드럼통 불 (61%, 81%), 담뱃불 (64%, 69%)
  - 밤: 낮의 것에 더해 레테 세로 네온 (15%, 41%), 선술집 열린 문 (9%, 77%), 가로등 두 개 (33%·73%, 52%), 길을 가로지르는 전구줄 (26–95%, 14–68%), 크레인 꼭대기 붉은 등 다섯 (40–100%, 23–31%), 먼 등불 (96%, 41%)
- 게임 속 모습: 물가를 따라 휘어지는 자갈길. 한쪽에는 창고·선술집·통조림 공장 벽돌 벽, 다른 쪽에는 검은 물·계류 기둥·멈춘 크레인 여덟 대가 있다. 생선 튀김 노점, 드럼통 불가의 파업 하역부들, 문 닫은 옛 경비대 초소의 녹슨 파란 문. 밤에는 나트륨등이 호박색 웅덩이를 만든다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/quay_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep image 2's camera, the curve of the street, the waterline and the positions of the neon sign, the fish stall, the fire barrel and the cranes, with much richer detail.
Soléa quay street, overcast morning, three weeks into a dockworkers' strike. A cobblestone waterfront street curving away along black water.
Left: a row of narrow four-story buildings (taverns, warehouses, a brick cannery wall) with laundry on the balconies and shuttered windows; on the dance hall's corner, a tall vertical sign of red glass letters "LETHE" (unlit by day). A small tavern doorway at the bottom left; the rusted blue door of an abandoned police post with a faded crest.
Center: a fried-fish stall with a red-and-white striped awning, a steaming fryer and a vendor woman in a headscarf; a blank signboard.
Right: dockworkers in flat caps and coats picket around a burning oil drum (x≈61%, y≈81%) holding blank placards; one of them smokes (x≈64%, y≈69%).
Beyond the bollards, the estuary with eight tall red dock cranes, all motionless, jibs pointing out to sea. Strings of unlit bulbs sag across the street.
Gulls on the bollards, fishing nets, crates, puddles, a bicycle, a newspaper kiosk.
Pale fog-grey sky, oxidized teal water, faded brick and ochre facades.
```

**밤** — 같은 대화에서

```text
Same street, same camera, at night. Sodium street lamps make amber pools on the wet cobbles (lamps at x≈33% and x≈73%, y≈52%). The "LETHE" neon blazes crimson (x≈15%, y≈41%) and reflects in the puddles; the tavern doorway at the bottom left spills warm yellow light (x≈9%, y≈77%); the string of bulbs across the street is lit; red warning lights blink on the crane tops along the skyline (x 40–100%, y 23–31%); a harbor light glows far right (x≈96%, y≈41%). The picketers around the fire barrel are rim-lit orange. Deep indigo sky, a few lit windows.
```

### 3-5. 7번 크레인 아래 — `crane_d` `crane_db` `crane_n` `crane_nb`

- 초점 0.3 · 휴대폰 범위 가로 11–73%
- 깜빡이는 광원
  - 낮: 추모 촛불 다섯 (13–18%, 96%), 드럼통 불 (33%, 85%), 담뱃불 (41%, 79%)
  - 밤: 낮의 것에 더해 지브 끝 붉은 등 (18%, 10%)
- 열쇠의 `b` = 시신이 매달려 있는 때(`crane_db`, `crane_nb`). `b`가 없으면 갈고리가 빈 뒤다.
- 게임 속 모습: 교회만 한 철골 탑이 네 다리로 레일 위에 서 있고, 운전실과 지브가 바다로 뻗는다. 붉은 방청 페인트가 벗겨져 녹이 비늘처럼 일었다. 계선 기둥, 녹슨 레일, 버려진 화물 운반대, 드럼통 불가의 하역부들.

**낮, 빈 갈고리 (`crane_d`)** — 첨부: ① 키 아트 ② `assets/scenes/crane_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep image 2's camera and the exact position of the crane, its jib tip, the fire barrel, the candles and the hut, with much richer detail.
The foot of Crane No. 7 at the end of the Soléa docks, overcast day. A wide concrete pier with rusted rails, iron bollards and abandoned cargo pallets.
Crane No. 7 towers over everything: a church-sized lattice-steel gantry crane on four legs straddling the rails, a boxy operator's cab with a painted "7", and a long jib reaching out over the estuary to the upper left. Its red anti-rust paint is peeling; rust lifts in flakes like fish scales.
From the jib tip (upper left, x≈18%, y≈10%) a steel cable hangs straight down to an empty hook.
At the base, striking dockworkers in caps warm their hands around a burning oil drum (x≈33%, y≈85%), one smoking (x≈41%, y≈79%); a row of small memorial candles and wilted carnations on the concrete at the bottom left (x 13–18%, y≈96%).
Right: a corrugated-iron guard hut with a small window. Also: stacked pallets, a coil of rope, a union banner (blank), gulls on the rail.
Behind: a flat grey estuary, the distant breakwater, fog.
```

**낮, 시신 (`crane_db`)** — 같은 대화에서

```text
Same image, same camera. Now a small dark figure of a man in a coat hangs motionless from the hook at the end of the cable, high above the pier, seen only as a silhouette against the pale sky. Not graphic. Everything else stays exactly the same.
```

**밤, 빈 갈고리 (`crane_n`)** — 빈 갈고리 낮 그림에서 이어서

```text
Same crane, same camera, at night. The crane becomes a black lattice silhouette against a deep blue sky with a pale moon; a red warning light blinks at the jib tip (x≈18%, y≈10%); the operator's cab window glows faint yellow. The fire in the oil drum (x≈33%, y≈85%) lights the dockworkers' faces from below and throws their long shadows up the crane legs; the memorial candles glow (bottom left); the guard hut window glows warm.
```

**밤, 시신 (`crane_nb`)** — 밤 그림에서 이어서

```text
Same night image. Add the small dark silhouette of a man hanging from the hook at the end of the cable, high above the pier, barely lit by the moon. Not graphic. Nothing else changes.
```

### 3-6. 솔레아 제1통조림 공장 · 붉은 닻 본부 — `cannery`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 천장에 매단 등 다섯 (31–75%, 18–32%)
- 게임 속 모습: 높은 천장의 녹슨 트러스와 기름때 낀 천창. 컨베이어 세 줄 위에 빈 깡통이 얼어붙은 병사처럼 서 있다. 뜨개질하고 피켓을 칠하는 여공들, 끓는 수프 솥과 늘어선 줄, 칠판, 붉은 깃발, 목탄 초상화. 철계단 위 유리 사무실의 스탠드 불빛 속에 로사가 있다.

첨부: ① 키 아트 ② `assets/scenes/cannery.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the three converging conveyor belts, the glass office and the hanging lamps in place, with much richer detail.
Inside Soléa Cannery No. 1, now the strike headquarters of the Red Anchor union, afternoon. A vast hall under rusted steel roof trusses and grimy skylights.
Three long conveyor belts run toward the back in one-point perspective, lined with thousands of empty tin cans standing in rows like frozen soldiers. Along them, women workers in headscarves sit on long benches painting picket signs, knitting, rocking babies.
Left wall: a large red banner with a white anchor, a charcoal portrait of a young man pinned beside it, a chalkboard covered in duty rosters (no readable text).
At the back, a huge soup cauldron steams over a fire, with a queue of dockworkers and children holding tin bowls.
Upper right: a glass-walled foreman's office on steel stilts, reached by a steel staircase and lit from inside by a desk lamp; a small seated figure watches over the floor.
Enamel pendant lamps hang from the trusses (x 31–75%, y 18–32%).
Also: stacked crates, a bicycle, laundry drying between machines, a sleeping dog.
Warm amber lamplight in cool grey-blue industrial haze.
```

### 3-7. 그랜드 메리디안 호텔 로비 — `hotel_d` `hotel_n`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 샹들리에와 그 촛불들 (33–55%, 20–35%), 프런트 스탠드 (75%, 50%)
- 게임 속 모습: 흰 대리석 정면, 금박 글씨, 회전문, 거울처럼 빛나는 바닥, 기둥 사이의 야자수, 거대한 샹들리에, 백합. 프런트에는 대머리에 연필 콧수염, 연미복 차림의 컨시어지가 있다. 겨울 정원(유리 온실)과 호텔 바 "나침반 장미"가 이어진다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/hotel_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its symmetrical camera, the grand staircase, the columns, the chandelier and the reception desk in place, with much richer detail.
The lobby of the Grand Meridian Hotel on the hill, the last glory of the drowned monarchy, now home to Accord bankers and shipping agents.
Symmetrical frontal view: white marble columns, a mirror-polished marble floor reflecting everything, a grand staircase with a red carpet rising at the back to a landing with a tall arched window.
A huge crystal chandelier hangs in the center with dozens of candle bulbs (x 33–55%, y 20–35%).
Right: a polished mahogany reception desk with a brass bell, pigeonholes with room keys, a green banker's lamp (x≈75%, y≈50%), and a bald concierge in a black tailcoat standing perfectly straight.
Left: a velvet sofa with an old lady in furs and a tiny dog, potted palms, a tall vase of white lilies.
A revolving brass door glimpsed at the far left; through a side arch, the green glass conservatory (winter garden); a small bar sign "COMPASS ROSE".
Cream, gold, oxblood; cool daylight from the high window.
```

**밤** — 같은 대화에서

```text
Same lobby, same camera, at night. The chandelier (x 33–55%, y 20–35%) and the desk lamp (x≈75%, y≈50%) are the main light; wall sconces glow; the arched window is dark blue; long warm golden reflections on the marble floor. The old lady and her dog are gone; the concierge remains, a black silhouette behind the desk.
```

### 3-8. 그랜드 메리디안 305호 — `room305_d` `room305_n`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 낮 없음 / 밤 책상 스탠드 (52%, 48%)
- 게임 속 모습: 닷새 동안 닫혀 있던 죽은 손해사정인의 방. 지나치게 정돈되어 있다. 호텔식으로 접은 침대, 휴대용 타자기, 서류철, 가지런한 연필 세 자루, 금박 액자 속 익사한 왕 아우렐리오 4세의 초상이 있다. 카펫을 걷어 낸 참나무 바닥에는 번호가 매겨진 분필 발자국이 가득하다. 오른발은 흰색, 왼발은 노란색이고, 원을 그리거나 X자로 교차한다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/room305_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera and the positions of the bed, portrait, window, desk and lamp, with much richer detail.
Room 305 of the Grand Meridian Hotel, the room of a dead insurance adjuster, sealed for five days, afternoon. Unnervingly tidy.
Left: a bed made with crisp hospital corners, a leather suitcase at its foot.
On the back wall, a gilded frame with a dark portrait of the drowned king Aurelio IV (a regal figure in a naval coat, face in shadow).
Right of it, a tall window with sheer curtains and a view of the grey harbor far below. Under the window, a writing desk with a portable typewriter, a neat stack of folders, three sharpened pencils laid parallel, a desk lamp (x≈52%, y≈48%, unlit by day), a small bottle of bergamot cologne.
The carpet has been rolled up against the wall; on the bare oak floor, dozens of chalk footprints (white for the right foot, yellow for the left), numbered, circling and crossing in figure-eights: someone practiced tango steps here alone.
Cream striped walls, honey oak, soft grey daylight.
```

**밤** — 같은 대화에서

```text
Same room, same camera, at night. Only the desk lamp is on (x≈52%, y≈48%): a warm cone over the typewriter. Moonlight through the window lays a pale blue rectangle on the floor where the chalk footprints glow faintly; the portrait is almost lost in shadow except its gilded frame.
```

### 3-9. 코스타 전당포 — `pawn`

- 초점 0.5 · 휴대폰 범위 가로 19–81%
- 깜빡이는 광원: 카운터의 초록 갓 등 (50%, 30%)
- 게임 속 모습: 부두 거리 14번지. 금색 공 세 개, 문 위의 종. 천장까지 닿는 선반에 아코디언, 괘종시계, 웨딩드레스, 목발, 망원경, 박제 갈매기, 은수저, 틀니, 결혼반지 수백 개가 있고, 모두에 숫자 꼬리표가 달려 있다. 가장 안쪽 쇠창살 카운터에 체사르가 앉아 있다.

첨부: ① 키 아트 ② `assets/scenes/pawn.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its symmetrical camera, the barred counter at the back and the lamp position, with much richer detail.
Inside the Costa pawnshop at No. 14 Quay Street: dark, narrow and crammed to the ceiling.
A symmetrical view down the aisle to a counter behind iron bars at the back, where a heavy, sweating pawnbroker sits under a green-shaded lamp (x≈50%, y≈30%) counting coins.
Shelves on both walls overflow with pawned lives: accordions, a grandfather clock, a wedding dress on a dress form, crutches, a brass sailor's telescope, a stuffed seagull with glass eyes, silver spoons, a set of dentures in a glass, trays of hundreds of wedding rings, birdcages, a violin, an old diving helmet. Every object has a small numbered paper tag on a string.
A brass bell above the door, a threadbare rug, dust motes in the lamplight; three gold balls hang from a bracket near the ceiling.
Dark umber, tarnished brass, oxblood, with one warm pool of light at the counter.
```

### 3-10. 익사한 종의 교회 — `church_d` `church_n`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 제단 촛불 (43–49%, 55–57%), 종탑 꼭대기 붉은 등 둘 (72–78%, 위쪽 끝)
- 게임 속 모습: 지붕 절반이 포격에 날아가 신랑이 하늘로 열려 있다. 부서진 신도석 사이로 잡초가 자라고, 빗물이 웅덩이를 만들었다. 제단 위에 녹아 붙은 촛불 수십 개가 있다. 종 없는 종탑에는 철사와 안테나가 거미줄처럼 얽혀 있고 붉은 등이 깜빡인다. 종루 창에 "라디오 레테 — 97.3" 천이 걸려 있다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/church_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera down the nave, the rose window and altar in the center and the bell tower on the right, with much richer detail.
The Church of the Drowned Bell, half-ruined, overcast day after rain.
Frontal view down the nave: half the roof is gone (shelled forty-six years ago), so the nave opens to a pale sky; broken rafters and wires cross the gap.
Rows of broken wooden pews with weeds and wildflowers growing between them; rainwater puddles on the cracked marble floor mirror the sky.
At the far end, an altar crusted with dozens of melted candles, a few still burning (x 43–49%, y≈56%), under a shattered rose window with a few colored panes left.
To the right, the narrow stone bell tower still stands; its belfry has no bell. Instead, a tangle of antennas and wires like a spider web, with small red lights at the very top edge (x 72–78%); a hand-painted cloth banner hangs from the belfry window reading "RADIO LETHE 97.3".
Pigeons, ivy, a rusted bicycle leaning on a pew, folded votive notes tucked into cracks.
Cool stone grey, moss green, faded fresco ochre.
```

**밤** — 같은 대화에서

```text
Same church, same camera, at night. Moonlight through the missing roof; the altar candles (x 43–49%, y≈56%) make a warm island; the belfry window glows warm violet from the radio booth inside; the red antenna lights blink at the top edge (x 72–78%). The puddles reflect candles and moon.
```

### 3-11. 벌집 공동주택 안뜰 — `honeycomb_d` `honeycomb_n`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 낮 없음 / 밤 문간 등 (39%, 62%)
- 게임 속 모습: 5층 건물이 네모나게 둘러싼 안뜰. 층마다 좁은 발코니가 벌집 칸처럼 이어지고, 빨랫줄 수십 가닥 사이로 하늘이 조각조각 보인다. 가운데 녹슨 수동 펌프 둘레에서 아이들이 뛰어논다. 문간마다 할머니들이 앉아 콩을 까거나 뜨개질을 한다. 밤에는 창문마다 불빛 하나씩이 켜지고, 빨래가 유령처럼 흔들린다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/honeycomb_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the enclosing facades, the laundry lines and the pump in place, with much richer detail.
The Honeycomb, a five-story tenement courtyard in Soléa, midday. A square courtyard enclosed on all sides by ochre and pink plaster walls with rows of narrow balconies like honeycomb cells.
Dozens of laundry lines crisscross from balcony to balcony (shirts, slips, diapers, work overalls), so the sky is only seen in fragments.
In the center, a rusty cast-iron hand pump; small children play around it with a hoop and chalk drawings.
In the doorways, old women sit on low stools shelling beans and knitting, watching everything.
Flower pots, birdcages, a radio on a windowsill, drying red peppers, washing tubs, a tricycle, a cat; an archway on one side leads out to the alley.
Warm ochre, rose, sun-bleached blue, patchy light falling through the laundry.
```

**밤** — 같은 대화에서

```text
Same courtyard, same camera, at night. Windows glow one by one as warm yellow squares; a single lamp above a doorway (x≈39%, y≈62%). The laundry hangs like pale ghosts against the dark; the pump stands alone; silhouettes move behind curtains.
```

### 3-12. 레테 무도장 옥상 — `roof_d` `roof_n`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 낮 없음 / 밤 거꾸로 선 네온 (48%, 36%), 크레인 꼭대기 붉은 등 넷 (33–67%, 26–44%), 먼 등대 불 (14%, 46%)
- 게임 속 모습: 물집처럼 부푼 검은 타르 바닥, 네 다리 위의 나무 물탱크, 받침대 위의 판자 비둘기장("출입 금지 — 해적만!"). 바다 쪽 테라스에는 난간, 화분, 부서진 등나무 의자가 있다. 네온사인의 뒷면이 거대한 철골로 서 있어 LETHE가 거꾸로 보인다. 7번 크레인이 손에 닿을 듯 가깝다.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/roof_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera and the positions of the water tank, pigeon loft, neon frame and cranes, with much richer detail.
The flat tar roof of the Lethe dance hall, windy afternoon. The black tar surface is blistered and sticky, with puddles.
Left: a large wooden water tank on four tall legs; beside it, a plank pigeon loft on stilts: a little shack with round openings, pigeons coming and going, a crooked hand-painted sign on its door (childish white brush strokes, or the words "PIRATES ONLY").
Center: the back of the enormous "LETHE" neon sign, a steel scaffold holding five huge letters seen from behind (so they read reversed), with cables and junction boxes.
Foreground: a small terrace with an iron railing, terracotta flower pots, a broken rattan armchair, a single black patent tango shoe, a toppled wine glass.
Beyond the railing, the harbor spreads out below with the idle red cranes; Crane No. 7 looms very close on the right. A wide pale sky with gulls.
Tar black, pigeon grey, rust red, sea-fog white.
```

**밤** — 같은 대화에서

```text
Same roof, same camera, at night. The LETHE letters (x≈48%, y≈36%) blaze red from the other side; seen from behind, the light bleeds around the steel frame and paints the tar floor blood red. Red warning lights blink on the crane tops (x 33–67%, y 26–44%); a lighthouse glows far left (x≈14%, y≈46%). The pigeon loft is silent and dark, too silent.
```

### 3-13. 방파제와 등대 — `breakwater_d` `breakwater_dl` `breakwater_n` `breakwater_nl`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 요새 3초 등표 (24%, 38%) / 밤 + 순찰정 붉은 등 (36%, 53%)
- 열쇠의 `l` = 썰물. 방파제 뿌리에서 요새까지 개펄이 드러난 때다.
- 게임 속 모습: 바다로 1km 넘게 뻗은 화강암 팔, 이끼와 따개비, 게. 붉은 줄과 흰 줄이 바래 분홍과 회색이 된 등대가 서 있고, 등롱은 꺼졌지만 아래 작은 집 굴뚝에서 연기가 오른다. 회색 순찰정 "PB-7"의 고물에 협약 깃발(푸른 바탕에 원을 이룬 다섯 별)이 달려 있다. 만 한가운데에는 별 모양의 검은 요새가 있다.

**낮, 밀물 (`breakwater_d`)** — 첨부: ① 키 아트 ② `assets/scenes/breakwater_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the diagonal line of the breakwater, the lighthouse on the right, the patrol boat and the fort on the left, with much richer detail.
The granite breakwater and the lighthouse, grey foggy day, high tide.
A long arm of huge granite blocks, covered in green moss and barnacles, runs from the foreground out into the fog toward the right. At its end, a cylindrical lighthouse with faded red-and-white stripes (now pink and grey), its lantern dark; at its foot a small keeper's house with a thin line of chimney smoke.
Inside the breakwater, on calm water, a grey patrol boat with "PB-7" on the bow and a limp blue flag with a circle of five stars at the stern.
Far out in the bay (left), the Tide Fort: a black star-shaped island fortress with angled bastions and a half-ruined tower; a small automatic beacon on top (x≈24%, y≈38%).
Gulls, crab pots, a moored rowboat, old lamp posts along the breakwater, an iron mooring ladder.
Seamless fog, pearl grey, verdigris water.
```

**낮, 썰물 (`breakwater_dl`)** — 같은 대화에서

```text
Same image, same camera, at low tide. The sea has withdrawn: from the foot of the breakwater all the way to the fort stretches a wet grey-brown mudflat that mirrors the sky, cut by silver tidal channels like veins. The patrol boat now sits tilted on the mud; stranded seaweed, tiny crabs. Keep the fort beacon (x≈24%, y≈38%).
```

**밤, 밀물 (`breakwater_n`)** — 밀물 낮 그림에서 이어서

```text
Same high-tide image at night. Dark indigo sea; the fort beacon flashes white (x≈24%, y≈38%); one warm yellow window in the lighthouse keeper's house; a red navigation light on the patrol boat (x≈36%, y≈53%); the moon behind fog.
```

**밤, 썰물 (`breakwater_nl`)** — 썰물 낮 그림에서 이어서

```text
Same low-tide image at night. The wet mudflat reflects the moon; the channels are silver lines; the fort beacon flashes white (x≈24%, y≈38%); a warm window in the keeper's house; a red light on the stranded patrol boat (x≈36%, y≈53%).
```

### 3-14. 레테 개펄 — `flats_d` `flats_n`

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원: 요새 3초 등표 (61%, 36%)
- 게임 속 모습: 너무 평평해서 원근이 사라지는 회갈색 평원. 젖은 표면이 하늘을 비춰 하늘 위를 걷는 것 같다. 물골이 은빛 혈관처럼 흐르고, 게 수천 마리가 딸깍거린다. 개펄에 비스듬히 박힌 포함의 뱃머리에 "……MEMORIA"가 남아 있다. 지도에 없는 말뚝처럼 서 있는 잿빛 왜가리.

**낮** — 첨부: ① 키 아트 ② `assets/scenes/flats_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the low horizon, the stranded gunboat and the far fort in place, with much richer detail.
The Lethe mudflats at low tide, overcast day. A vast, perfectly flat grey-brown plain of wet mud that mirrors the sky so completely that you seem to walk on clouds; silver tidal channels wind through it like veins toward the horizon.
In the middle ground, stuck diagonally in the mud, a rusted old gunboat: buckled iron plates, a broken funnel, a deck cannon melted and drooping, the remains of white paint on the bow reading "...MEMORIA".
Far away on the horizon (x≈61%, y≈36%), the tiny dark island of the Tide Fort with its beacon.
Thousands of small crabs, old wooden stakes poking out of the mud, a line of footprints, and a lone ash-grey heron standing perfectly still near the right, like a post that is not on any map.
Pearl grey, silt brown, silver.
```

**밤** — 같은 대화에서

```text
Same flats, same camera, at night. A full moon reflected in the wet mud; the fort beacon flashes white (x≈61%, y≈36%); the channels are silver lines; the gunboat and the heron are black silhouettes.
```

### 3-15. 조수 요새 — `fort_d` `fort_n`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 탑 꼭대기 3초 등표 (55%, 6%) / 밤 + 화약고 문틈의 노란빛 (76%, 59%)
- 게임 속 모습: 무릎까지 자란 잡초, 성벽 위 갈매기 수백 마리. 가슴 높이에 둥근 총알 구멍 수백 개가 띠를 이룬 벽이 있다. 망치로 깨진 왕관·닻·삼지창 문장 아래에 협약의 청동판이 붙어 있고, 그 위에 붉은 X가 그어져 있다. 성벽에 반쯤 묻힌 둥근 지붕의 화약고와 무거운 참나무 문. 밤에는 그 문틈으로 빛이 샌다(이네스가 숨어 있다).

**낮** — 첨부: ① 키 아트 ② `assets/scenes/fort_d.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the long rampart, the arched door on the right and the beacon on top in place, with much richer detail.
The Tide Fort, a black basalt island fortress in the bay, inside its overgrown courtyard on a windy grey day.
A long high rampart of dark stone with crenellations lined by hundreds of nesting gulls.
On the right, set into the rampart, a domed stone powder magazine with a heavy oak door under a rounded arch; above it, a smashed coat of arms (a crown, an anchor and a trident, hammered away) and a bronze plaque struck through with a red painted X.
On the left part of the wall, at chest height, a horizontal band of hundreds of small round bullet holes: the old execution wall.
Knee-high weeds and wild grass fill the courtyard; an overturned rowboat, rusted iron rings, a broken cannon wheel.
The squat tower rises at the back with a small automatic beacon on top (x≈55%, y≈6%).
Slate, moss green, bone-white gulls, a faint red of paint.
```

**밤** — 같은 대화에서

```text
Same courtyard, same camera, at night. The beacon (x≈55%, y≈6%) flashes and washes the courtyard white for an instant; between flashes it is dark. A thin line of warm yellow light leaks from the gap of the powder magazine's oak door (x≈76%, y≈59%): someone is hiding inside. Sleeping gulls are pale dots along the rampart.
```

### 3-16. 물속 — 꿈과 죽음 `void`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 수면의 물빛 (40%, 11%)
- 쓰이는 곳: 게임의 첫 장면(어둠), 꿈, 죽음의 결말

첨부: ① 키 아트 ② `assets/scenes/void.webp`

```text
Tango Lethe scene, wide 3:2. Image 1 = style reference, image 2 = layout reference: keep its camera, the bright spot of the surface and the sinking figure's position, with much richer detail.
A dream of drowning, the void between memories: deep underwater in the estuary, looking up. Deep teal and ink-blue water; shafts of pale light fall from the rippling surface far above (brightest at x≈40%, y≈11%).
A man in a long coat sinks slowly, a dark silhouette with a thin cyan rim light, arms loose.
Around him drift the fragments of his life: a single two-tone spectator shoe, a brass room key with a heavy tag, a folded letter, a gold wedding ring catching the light, a rum bottle, a police badge, a tango lesson card, a large ash-grey feather, and far below, sinking, an old revolver. Tiny bubbles rise.
At the very bottom, the faint silhouette of a huge bronze bell half buried in silt.
Calm, silent, beautiful and sad.
```

---

## 4. 초상

모든 초상 프롬프트의 첨부는 **① 형사 초상(2-3, 틀 기준) ② 지금의 그 인물 초상** `assets/portraits/<이름>.webp`이다. 앞머리에는 초상 틀이 온다. 프로젝트 지침에 넣었으면 생략해도 된다.

공통 앞문장(각 인물 프롬프트 앞에 붙인다):

```text
Follow the PORTRAIT TEMPLATE and the Tango Lethe style. Image 1 is the approved detective portrait: match its framing, scale, rim lighting and finish exactly. Image 2 is this character's current game portrait: keep its identifying accents and background idea, with richer detail.
```

아래 인물 설명의 괄호 속은 게임 안의 이름이다. 인물 설명만 바꿔 넣으면 된다.

### 4-1. 형사와 파트너, 레테 무도장

**형사** `you` — 2-3에서 만든다.

**윤 세하 경위** `yun` — 파트너, 38세, 가람 제도 출신 전직 해군 신호장교. 절제되고 정확하다.
```text
Inspector Yun Se-ha, 38, the detective's partner: an East Asian woman, a composed, precise former naval signal officer from the eastern islands. A short, sharp black bob, straight posture, a worn black leather jacket with the collar turned up, a stub of pencil tucked behind her ear (small warm accent), the corner of a small notebook in her hand. Background: pale teal venetian-blind light stripes slanting across a dark teal wall. Mint-white rim light on the face, amber rim on the back.
```

**마담 오를라** `orla` — 60대 전직 탱고 디바, 무도장 주인. 두꺼운 화장 밑의 다정함.
```text
Madame Orla Bey, 60s, former tango diva and owner of the Lethe dance hall: heavy stage makeup even in profile (long false eyelashes, dark lipstick), hair in a high sculpted updo with a red flower, a pearl necklace and a long drop earring, a cigarette in a long holder sending up a curl of smoke. Background: warm pink, amber and crimson bokeh of dance-hall lights. Pink rim light on the face, violet rim on the back.
```

**에밀** `emile` — 20대 후반 바텐더, 책벌레, 조용한 비관론자.
```text
Emile, late 20s, the bookish bartender: slicked-back hair, a thin mustache, a crisp white shirt with a black bow tie (the white collar and bow tie are the accents), a paperback tucked in his vest pocket. Background: blurred amber bottles and warm bokeh of the bar. Warm gold rim light on the face, cool blue rim on the back.
```

**파코 영감** `paco` — 70대 맹인 반도네온 연주자. 코뮌 시절부터 연주했다.
```text
Old Paco, 70s, the blind bandoneon player who has played since the days of the Commune: a battered fedora, a big walrus mustache, a large hooked nose, eyes closed, a scarf; the pleated bellows of a bandoneon with mother-of-pearl buttons at the bottom edge. Background: dark wine red with a soft warm stage glow behind him. Warm amber rim light on the face, violet rim on the back.
```

### 4-2. 부두 거리

**보보** `bobo` — 11세, 자칭 "혁명 해적단 선장". 아이라서 틀 안에서 머리가 조금 낮고 어깨가 좁다.
```text
Bobo, 11, self-proclaimed captain of the "Revolutionary Pirate Crew": a small boy (his head sits a little lower in the frame, narrow shoulders), curly hair under a too-big flat cap, a snub nose, a defiant chin, a patched coat, a toy spyglass sticking out of his pocket. Background: a dusky blue harbor with the silhouettes of cranes. Warm rim light on the face, pale blue rim on the back.
```

**마르가리타** `marga` — 생선 튀김 장수, 모든 소문의 중심.
```text
Margarita, the fried-fish vendor and hub of every rumor: a sturdy woman, hair in a bun, a red kerchief knotted at the neck (accent), a hoop earring, a smudge of flour on her cheek, an apron strap. Background: the orange glow of a frying fire with rising sparks. Warm orange rim light on the face, blue rim on the back.
```

**이그나시오** `ignacio` — 헌책 노점상. 펄프소설과 혁명 팸플릿.
```text
Ignacio, the secondhand-book seller: round wire glasses catching the light, a neat goatee, short hair, an olive-green knitted scarf (accent), a battered pulp paperback held up near his chin. Background: dim bookshelves with pale spines in soft focus. Warm cream rim light on the face, cool blue rim on the back.
```

**아우렐리오** `aurelio` — 자신이 익사한 왕의 손자라고 믿는 노숙인.
```text
Aurelio, a homeless man who believes he is the rightful heir of the drowned king: wild shaggy hair and a long beard, a paper crown painted gold with glued-on colored-glass "jewels" (accent), a threadbare military greatcoat with one tarnished epaulette. Background: faded gold Art Deco sunburst rays. Golden rim light on the face, violet rim on the back.
```

**그레고르 벨라스코** `gregor` — 80대 코뮌 참전 용사. 벤치에서 비둘기에게 모이를 준다.
```text
Gregor Velasco, 80s, veteran of the Commune who feeds pigeons on a bench: an old fedora over a bald head, deep wrinkles, a pale shirt with a thin dark tie, a tiny red Commune pin on the lapel (accent), a pigeon perched on his shoulder. Background: blue-grey estuary waves at dusk. Silver-white rim light on the face, warm tan rim on the back.
```

### 4-3. 붉은 닻 노조와 부두

**로사 이바라** `rosa` — 71세 위원장, "하구의 과부". 휠체어, 뜨개질바늘, 강철 같은 의지.
```text
Rosa Ibarra, 71, chairwoman of the Red Anchor union, "the widow of the estuary": grey hair in a tight bun, small round glasses, a dark shawl, knitting needles with red yarn in her hands (accent), a jaw set like steel; the spoked wheel of her wheelchair shows at the lower left. Background: deep red with a warm glow. Warm peach rim light on the face, cool blue rim on the back.
```

**'황소' 마테오** `mateo` — 로사의 조카, 노조의 주먹. 거구인데 의외로 감상적이다. 어깨가 틀을 꽉 채운다.
```text
"The Bull" Mateo, the union's muscle: huge shoulders filling the frame, a thick neck, cropped hair, heavy brow and jaw, a red kerchief knotted at the throat (accent), a surprisingly soft eye. Background: orange firelight from a burning oil drum. Hot orange rim light on the face, blue rim on the back.
```

**알론소 '시인'** `alonso` — 즉흥시를 읊는 하역부.
```text
Alonso "the Poet", a dockworker who improvises verses: a black beret, a drooping walrus mustache, a cigarette with a curl of smoke, a pencil stub behind the ear. Background: orange firelight. Warm rim light on the face, blue rim on the back.
```

**페페 '아홉 손가락'** `pepe` — 손가락 하나가 없는 음모론자.
```text
Pepe "Nine Fingers", a dockworker and conspiracy theorist: a black knit beanie, sharp features, narrowed suspicious eye, a cigarette held up near his face in a hand that is missing one finger, a folded newspaper clipping in his pocket. Background: orange firelight. Warm rim light on the face, blue rim on the back.
```

**라우로 '졸음'** `lauro` — 늘 졸리고 가장 순진하다.
```text
Lauro "Sleepy", the youngest and most naive dockworker: a flat cap tilted low over half-closed sleepy eyes, a mid-yawn, a scarf wound twice around his neck. Background: dim, low firelight. Soft warm rim light on the face, blue rim on the back.
```

**시몬 '갈매기'** `simon` — 60대 크레인 기사. 시신을 매단 죄책감에 나흘째 술을 마신다.
```text
Simon "the Gull", 60s, the crane operator haunted by guilt: a navy knit beanie, a grey beard, a large nose, a pipe with thin smoke, heavy work gloves, a tired bloodshot eye. Background: a dark night window with a warm yellow lit frame behind him (his guard hut). Warm rim light on the face, cold blue rim on the back.
```

**통조림 공장 여공** `worker`
```text
A cannery woman on strike: a headscarf tied at the nape, a blue kerchief at her neck (accent), rolled-up sleeves, a paintbrush for picket signs. Background: the warm amber glow of the cannery. Warm rim light on the face, blue rim on the back.
```

**늙은 어부** `fisher`
```text
An old fisherman: a knit beanie, a thick grey beard, a clay pipe with smoke, an oilskin coat with the collar turned up. Background: blue-grey waves. Silver rim light on the face, warm tan rim on the back.
```

### 4-4. 그랜드 메리디안 호텔과 회색 까마귀

**아마데오 크루이프** `kruyf` — 31세 해운사 협상 대표. 병약하고 극도로 공손하며 미소를 잃지 않는다. 카나리아 "배당금"을 데리고 다닌다. 출연진 가운데 배경이 밝은 유일한 인물이다.
```text
Amadeo Kruyf, 31, negotiator for the Halvar-Maris shipping company: pale and sickly, extremely polite, a faint fixed smile, a high forehead, slicked hair, thin gold-rimmed glasses, a white shirt with a blue silk tie, and a bright yellow canary named "Dividend" perched on his raised finger (accent). Background: the pale green glass conservatory of the hotel with soft leaf silhouettes (the only light background in the cast). White rim light on the face, green rim on the back.
```

**무슈 필롱** `pilon` — 호텔 컨시어지. 완벽주의자, 속물, 비밀의 수호자.
```text
Monsieur Pilon, the hotel concierge: bald, a pencil-thin mustache, a starched wing collar and a black tailcoat buttoned to the throat, chin raised in disdain, a small golden crossed-keys pin on the lapel (accent). Background: a gold Art Deco fan pattern. Pale gold rim light on the face, violet rim on the back.
```

**라스무센 대위** `rasmus` — 회색 까마귀 경비회사 지휘관, 전직 협약 해병, 원칙주의자 용병.
```text
Captain Rasmussen, commander of the Grey Crow security company, a former Accord marine: a peaked captain's cap with a brass badge (accent), cropped hair, a square jaw, a grey greatcoat with the collar raised, a cigarette. Background: cold grey venetian-blind stripes. Cool white rim light on the face, amber rim on the back.
```

**회색 까마귀 용병** `crow`
```text
A Grey Crow mercenary: a dark grey beret, a hard jaw, grey-tinted round sunglasses, a grey coat with a small crow emblem patch on the shoulder. Background: charcoal venetian-blind stripes. Cool rim light on the face, rust-brown rim on the back.
```

### 4-5. 솔레아 주민

**체사르 드 코스타** `cesar` — 전당포 주인. 형사의 배지를 가지고 있다. 거대한 코.
```text
César de Costa, the pawnbroker: heavy-set, balding with a few slicked strands, an enormous bulbous nose, two gold teeth glinting in a grin (accent), beads of sweat on the forehead, sleeve garters on a cream shirt. Background: three golden pawnbroker's balls glowing in soft focus on dark umber. Warm gold rim light on the face, blue rim on the back.
```

**리나 '주파수'** `lina` — 19세, 종탑에서 해적 방송 "라디오 레테"를 한다.
```text
Lina "Frequency", 19, the pirate DJ of Radio Lethe: a short choppy bob, a black turtleneck, big red headphones (accent) with a coiled cable, a microphone near her lips. Background: violet radio waves rippling out in concentric circles. Lilac rim light on the face, teal rim on the back.
```

**도냐 페르페투아** `perpetua` — 벌집의 생선 비늘 점쟁이.
```text
Doña Perpetua, the ancient fish-scale fortune teller of the Honeycomb: a dark headscarf, a shawl, a hooked nose and deep wrinkles, one milky pale eye that glows faintly (accent), iridescent fish scales stuck to her fingertips and glittering in the air. Background: a teal pattern of overlapping fish scales. Sea-green rim light on the face, warm gold rim on the back.
```

**로렌초 벨로소** `lorenzo` — 폐쇄된 등대에 사는 노인. 전설의 잿빛 왜가리를 40년째 찾는다.
```text
Lorenzo Veloso, an old man who has searched for the legendary ash-grey heron for forty years: receding white hair, a beard, heavy binoculars raised to his eye (accent), a thick fisherman's sweater. Background: a violet dusk sky crossed by a lighthouse beam. Warm cream rim light on the face, blue-violet rim on the back.
```

**마리아 벨로소** `maria` — 로렌초의 아내. 회의적이지만 사랑한다.
```text
María Veloso, his skeptical but loving wife: grey hair in a bun, reading glasses on a chain, a knitted shawl, knitting needles with red yarn (accent). Background: a warm yellow window of the lighthouse keeper's house. Warm gold rim light on the face, blue rim on the back.
```

**이네스 이바라** `ines` — 24세 탱고 댄서. 보고서를 품고 조수 요새에 숨어 있다.
```text
Inés Ibarra, 24, a tango dancer hiding in the fort: long dark hair falling over her shoulder, a man's heavy coat pulled around her, a crimson tango scarf peeking from the collar (accent), one eye catching a warm light: alert, frightened, determined. Background: darkness split by a thin vertical line of warm golden light from a door left ajar. Warm rim light on the face, blue-grey rim on the back.
```

### 4-6. 경비대와 협약

**발데스 경감** `valdes` — 9분서 반장. 주로 수화기 속의 목소리로 나온다.
```text
Commissioner Valdés, head of the 9th precinct, usually a voice on the telephone: receding hair, a thick mustache, a trench coat over a shirt and a dark green tie, a cigarette, a black telephone receiver held to his ear (accent). Background: green-grey venetian-blind stripes of a precinct office. Pale green rim light on the face, amber rim on the back.
```

**필라르 경사** `pilar`
```text
Sergeant Pilar of the Citizen Watch: a woman in a kepi and uniform, hair in a low bun, a silver badge on her chest (accent), a stern mouth. Background: blue-grey venetian blinds. Cool white rim light on the face, warm tan rim on the back.
```

**오리올 순경** `oriol`
```text
Constable Oriol, very young: a kepi slightly too big for him, a boyish face, a high uniform collar, a silver cap badge (accent). Background: blue-grey venetian blinds. Cool white rim light on the face, warm tan rim on the back.
```

**볼크 하사** `volk` — 협약 해안 순찰정 PB-7의 하사. 권태, 냉소.
```text
Sergeant Volk of the Accord coastal patrol boat PB-7, bored and cynical: a navy kepi with a small gold emblem (accent), a high uniform collar, a metal badge on the chest, a half-lidded eye. Background: a navy-blue night sky with a few faint stars. Cool blue rim light on the face, amber rim on the back.
```

---

## 5. (선택) 소품·증거물 카드

지금 게임은 소지품을 글과 기호로만 보여 준다. 아래 그림은 **아직 게임에 들어갈 자리가 없다.** 소지품 창에 그림을 붙이려면 코드를 조금 고쳐야 한다. 같은 화풍의 소품 그림을 모아 두고 싶을 때 쓴다.

틀(모든 카드의 앞머리):

```text
OBJECT CARD — Tango Lethe style. Square 1:1. A single object centered on a dark charcoal background, lit like a stage prop by one warm spotlight from the upper left with a thin cool rim light from the right, a soft shadow beneath. Flat painterly 2D illustration with subtle grain, like the Tango Lethe key art. No text, no border.
```

| 아이템 | 설명 (틀 뒤에 붙인다) |
|---|---|
| 콤비 구두 `shoe_right` | `A single men's two-tone spectator shoe: white leather with a brown toe cap and heel, thin leather sole dusted with rosin, laces loose.` |
| 초록 벨벳 재킷 `jacket_velvet` | `A dark green velvet jacket draped over a chair back, the nap catching the light in waves; inside the collar, embroidered initials.` |
| 앵무새 셔츠 `shirt_silk` | `A loud 1970s silk shirt with a green parrot print and a wide collar, slightly crumpled.` |
| 라븐 7.65mm 리볼버 `gun_ravn` | `An old small police-issue revolver with worn bluing and a wooden grip, lying on its side.` |
| 경비대 배지 `badge` | `A tarnished Citizen Watch police badge on a leather wallet, a pawn ticket tied to it with string.` |
| 4번 크레인 보고서 `ev_report` | `A typed insurance report in a stained folder, pages clipped, official stamps, one torn corner.` |
| 탱고 강습 카드 `ev_lesson_card` | `A small printed tango lesson punch card with stamped holes and a pressed dried flower.` |
| 타르와 깃털 `ev_tar` | `A lump of black roof tar with a grey pigeon feather stuck in it, on a scrap of paper.` |
| 305호 열쇠 `hotel_key` | `A heavy brass hotel room key on a large brass tag, the room number engraved: 305.` |
| 종이 왕관 `crown_paper` | `A paper crown painted gold, with glued-on colored glass "jewels", slightly crushed.` |
| 녹음테이프 `ev_tape` | `A small reel-to-reel audio tape in a scuffed case, a hand-written label strip left blank.` |
| 거대한 잿빛 깃털 `ev_feather` | `A single enormous ash-grey heron feather, longer than a hand, perfectly still.` |

---

## 6. 잘 안 될 때

| 증상 | 이어서 보낼 말 |
|---|---|
| 너무 사실적이다, 사진이나 3D 같다 | `Flatter and more graphic: fewer textures, simple geometric shapes, soft gradients, no photographic detail, like image 1.` |
| 앞 그림들과 화풍이 다르다 | 키 아트(와 스타일 시트)를 다시 첨부하고 `Match image 1's palette, grain, lighting and level of detail exactly.` |
| 구도가 바뀌었다, 광원이 옮겨졌다 | `Match the layout of image 2 exactly: same horizon height, same vanishing point, same positions of the lights.` |
| 사람 얼굴이 자세히 나왔다 | `Make all people faceless dark silhouettes with only a thin rim light.` |
| 한글이나 영문이 깨졌다 | `Remove all lettering; leave the signboards blank.` |
| 너무 밝고 복잡하다 | `Darker overall; reduce detail and contrast in the right third of the frame; keep the main subject in the left 60%.` |
| 초상이 옆모습이 아니다, 반대쪽을 본다 | `Strict side profile, facing right, like image 1.` |
| 초상마다 크기가 다르다 | 형사 초상을 첨부하고 `Same head size and position in the frame as image 1.` |
| 밤 그림에서 광원 자리가 바뀌었다 | 낮 그림을 다시 첨부하고 `Edit this exact image to night; do not move anything.` |

게임에 넣은 뒤 `node tools/art/import.mjs preview <열쇠>`로 광원이 노란 원 안에 있는지 꼭 확인한다. 맞지 않으면 `--x --y --zoom`으로 자르는 위치를 옮겨 다시 넣거나, `assets/art.json`의 광원 좌표를 고친다.
