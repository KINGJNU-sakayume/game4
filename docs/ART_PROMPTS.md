# 탱고 레테 — ChatGPT 그림 프롬프트 모음

게임의 장면 그림 34장과 초상 32장을 ChatGPT(이미지 생성)로 새로 그리기 위한 프롬프트 모음이다. 화풍은 [`ART_STYLE_TEST.md`](ART_STYLE_TEST.md)의 시험으로 고른 **네오 누아르 일러스트**다. 그래픽 노블 표지나 옛 영화 포스터처럼, 실루엣과 가는 테두리 빛, 안개, 마른 인쇄 질감으로 그린다. 기교를 부리지 않아 게임 내내 보아도 편하다.

기준 그림(저장소의 `docs/art-ref/`)

| 파일 | 무엇 | 쓰는 곳 |
|---|---|---|
| [`key_art.png`](art-ref/key_art.png) | 확정한 키 아트(타이틀). 모든 장면의 화풍 기준 | 장면 첨부 ① |
| [`style_you.png`](art-ref/style_you.png) | 형사 초상. 초상의 화풍과 틀 기준 | 초상 첨부 ① |
| `day_ref.png` (만들 것) | 부두 거리 낮. 낮 장면의 화풍 기준 | 낮 편집 때 첨부 |
| [`layout/<열쇠>.jpg`](art-ref/layout/) | 지금 게임 그림을 ChatGPT의 3:2 크기로 늘린 구도 기준 | 장면 첨부 ② |

- 장면 34장: 장소 15곳의 밤과 낮(썰물·시신 변형 포함), 물속(꿈·죽음), 타이틀
- (선택) 시신 변형 4장: 부두 거리와 옥상에서 7번 크레인의 시신이 보이는 그림. 넣으면 게임이 바로 쓴다.
- 초상 32장
- (선택) 소품·증거물 카드

프롬프트 본문은 영어로 두었다. 이미지 모델은 화풍과 빛의 용어를 영어에서 더 정확히 따른다. 이번 판에서 무엇을 왜 바꿨는지는 7장에 모았다.

---

## 0. 먼저 읽기

### 0-1. 레퍼런스 사슬

앞에서 만든 그림을 다음 그림의 화풍 기준으로 넘기면, 복사의 복사가 되면서 화풍이 조금씩 흘러내린다(매끈해지고 색이 바랜다). 그래서 화풍 기준은 **늘 확정한 기준 그림 한 장**으로 하고, 사슬은 별 모양으로 둔다.

```
style_you.png (형사 초상, 확정) ─────────────────▶ 초상 32장        첨부 ① style_you
      │ 화풍
      ▼
key_art.png (타이틀, 확정) ──▶ 장소마다 밤 그림 (새로)              첨부 ① key_art  ② layout/<열쇠>_n.jpg
                                   │ 같은 대화에서 편집
                                   ├─▶ 같은 장소의 낮                 첨부 ① 방금 그림(필요할 때) ② day_ref
                                   └─▶ 썰물 · 시신 변형
부두 거리 낮 (quay_d, 가장 먼저) ──▶ day_ref.png (낮 기준, 확정)
```

- **밤을 먼저 그린다.** 화풍 기준인 키 아트가 밤 그림이고, 깜빡이는 광원도 대부분 밤에 있다. 낮과 변형은 같은 대화에서 편집으로 만든다. 그래야 게임이 시간이 바뀔 때 낮과 밤 그림을 겹쳐 바꿀 때 물건이 튀지 않는다.
- **새로 그릴 때 첨부 ①은 화풍, ②는 구도.** 프롬프트도 그렇게 적혀 있다.
- **편집은 한 그림에서 두 번까지.** 편집을 거듭할수록 화면이 매끈해진다. 세 번째가 필요하면 프롬프트를 고쳐 새로 만든다.
- **편집할 그림이 대화의 마지막 그림이 아니면 그 파일을 다시 첨부한다.** 예: 크레인 밤(`crane_n`)에 시신을 더한 뒤 낮을 만들 때는 빈 갈고리의 밤 그림을 다시 첨부한다.
- **가장 먼저 부두 거리(3-4)** 를 만든다. 그 낮 그림(`quay_d`)이 마음에 들면 `docs/art-ref/day_ref.png`로 저장소에 넣는다. 그다음부터 낮 편집에는 그것을 첨부한다. 아직 없으면 낮 프롬프트의 `The attached image is the day style reference…` 문장을 지운다.

### 0-2. ChatGPT 준비 — 프로젝트 지침과 파일

1. **프로젝트를 새로 만든다.** 이름은 예컨대 "탱고 레테 그림 v2". 지침(Instructions)에 1장의 **스타일 바이블**과 2-3의 **초상 틀**을 붙여 넣는다. 옛 프로젝트를 다시 쓴다면 옛 지침을 **모두 지우고** 바꾼다. 옛 스타일 바이블의 낱말(`airbrushed`, `wet floors`, `reflections`…)이 한 줄이라도 남으면 그림이 다시 번들거린다.
2. **프로젝트 파일**에 `key_art.png`, `style_you.png`(나중에 `day_ref.png`)를 올려 둔다. 다만 그림을 만들 때는 대화에 **직접 첨부**한다. 그쪽이 확실하다.
3. **메모리**나 이전 대화 참조가 켜져 있으면 옛 대화의 화풍이 끼어들 수 있다. 끄거나, 옛 그림 이야기를 한 기억을 지운다.
4. **장소 하나 = 대화 하나.** 밤을 새로 그리고, 같은 대화에서 낮과 변형을 편집으로 만든다. 초상은 한 명 = 대화 하나(또는 2-4의 네 명 라인업).
5. **고칠 때는 한 번에 하나만.** 예: `Keep everything exactly the same, but remove the second bicycle.`
6. 마음에 드는 그림은 바로 내려받고 게임 열쇠로 이름을 붙인다. 예: `quay_n.png`
7. 프로젝트를 쓰지 않으면 1장의 스타일 바이블을 프롬프트 앞에 붙인다.

### 0-3. 크기, 자르기, 좌표

| | ChatGPT에서 만드는 크기 | 게임 규격 | 잘리는 곳 |
|---|---|---|---|
| 장면 | 가로 3:2 (1536×1024) | 16:9 (1920×1080) | 위아래 약 8%씩 |
| 초상 | 세로 2:3 (1024×1536) | 4:5 (512×640) | 위아래 약 8%씩 (넣을 때 `--y 0.45`로 위를 덜 자른다) |

- 이 문서의 좌표 (가로%, 세로%)는 모두 **ChatGPT가 그리는 3:2 그림 안의 자리**다. 0%가 왼쪽 위다. 음수나 100%를 넘는 값은 틀 밖에서 번져 들어오는 빛이다. (게임의 `art.json`은 자른 16:9 기준이라 세로값이 다르다. 3:2 세로 = 7.8 + 0.844 × 16:9 세로.)
- 구도 기준 `docs/art-ref/layout/<열쇠>.jpg`는 지금 게임 그림을 3:2로 늘린 것이다. 가운데 16:9는 게임 그림 그대로이고 위아래 띠만 이어 칠했다. 이것을 첨부하면 결과를 잘랐을 때 구도가 제자리에 온다. 도구로 다시 만들 수도 있다: `node tools/art/import.mjs guide <열쇠>`.

### 0-4. 화면 배치 — 그림이 게임에서 어떻게 보이나

- **넓은 화면:** 오른쪽 약 36%는 글 칸이 덮는다. 주인공 피사체와 주요 광원은 **왼쪽 60% 안에** 둔다. 오른쪽 3분의 1은 차분하고 어둡게 한다.
- **휴대폰:** 장면은 화면 위쪽 42%에만 보인다. 가로로는 초점 둘레의 약 62%만 보인다. 장면마다 "휴대폰 범위"를 적어 두었다.
- **타이틀:** 넓은 화면에서는 왼쪽에 제목과 메뉴가 놓이고 게임이 왼쪽을 어둡게 덮는다. 휴대폰에서는 화면 전체를 쓰지만 가로 52–78%의 좁은 세로 띠만 보인다. 타이틀 그림은 에필로그 슬라이드의 배경으로도 쓰인다(그때는 오른쪽에 글 칸).
- **초상:** 게임에서는 작게 보인다. 대화 칸 108×135px, 휴대폰 72×90px, 형사는 HUD 얼굴로 52×65px까지 줄어든다. 실루엣과 포인트 색 한두 개가 그 크기에서도 읽혀야 한다.
- 게임은 그림 위에 **비(타이틀), 떠도는 먼지, 필름 그레인, 광원의 깜빡임, 해 질 녘·새벽의 색**을 따로 얹는다. 그림에는 빗줄기를 그리지 않고, 낮 그림은 흐린 중간색으로 둔다.

### 0-5. 깜빡이는 광원 — 넣은 뒤 맞춘다

게임은 `assets/art.json`에 적힌 자리에 네온·등대·불꽃·촛불·가로등의 **깜빡임을 덧그린다.** 구도 기준을 줘도 ChatGPT는 광원을 몇 %씩 옮겨 그린다. 키 아트도 붉은 등이 세로로 4%, 가로등이 가로로 2% 옮겨졌다. 그래서 **그림을 넣은 뒤 광원을 새 그림에 맞춘다.**

```bash
node tools/art/import.mjs scene quay_n ~/Downloads/quay_n.png   # 넣기
node tools/art/import.mjs snap quay_n                           # 광원마다 새 자리를 찾아 보여 준다
node tools/art/import.mjs snap quay_n --write                   # art.json 에 적는다
node tools/art/import.mjs preview quay_n                        # 노란 원 안에 광원이 있는지 확인 → tools/art/out/
```

`snap`은 광원마다 예전 자리 둘레에서 그 광원 색의 가장 밝은 불빛을 찾는다. 그림 전체가 밀렸으면 그만큼을 먼저 어림한다. 못 찾은 광원(그림에 그 불빛이 없을 때)은 그대로 두고 알려 준다. 그럴 때는 편집으로 그 불빛을 그려 넣거나, `art.json`의 좌표를 직접 고치거나, Claude에게 그림을 주고 맞춰 달라고 한다. 프롬프트에 좌표를 적어 둔 것은 광원이 그 근처에 그려지게 하려는 것이다.

### 0-6. 글자

이미지 모델은 한글을 자주 틀린다. 그래서 프롬프트에는 **영문 간판만** 넣었다(`LETHE`, `PB-7`, `…MEMORIA`, `RADIO LETHE 97.3`, `COMPASS ROSE`). 한글 글씨(7호실 벽의 립스틱 글씨, 파업 피켓, 튀김 간판, 비둘기장 팻말)는 **읽히지 않는 붓자국이나 빈 판**으로 두게 했다. 한글이 꼭 필요하면 나중에 그림 편집기로 넣는다.

### 0-7. 안전 필터

크레인에 매달린 시신(`title`, `crane_db`, `crane_nb`, 선택 변형)은 거절될 수 있다. 키 아트는 `small dark silhouette … far away … Quiet, not graphic.`으로 통과했다. 거절되면 두 단계로 만든다.

1. 매달린 것 없이 먼저 만든다.
2. 편집에서 `Add a small dark silhouette of a man hanging from the hook at the end of the cable, far away, not graphic.`

### 0-8. 게임에 넣기

```bash
node tools/art/import.mjs scene quay_n ~/Downloads/quay_n.png           # 16:9로 잘라 1920×1080 WebP → assets/scenes/quay_n.webp
node tools/art/import.mjs snap quay_n --write                           # 광원 맞추기 (0-5)
node tools/art/import.mjs portrait yun ~/Downloads/yun.png --y 0.45     # 4:5로 잘라 512×640 WebP → assets/portraits/yun.webp
node tools/art/import.mjs preview quay_n                                # 광원 자리·글 칸·휴대폰 범위 표시 → tools/art/out/
npm run build                                                           # 게임에 반영
```

- 자르는 위치는 `--y 0.45`처럼 옮긴다(0 = 위, 1 = 아래). `--x`는 가로, `--zoom 1.1`은 조금 더 확대해서 자른다. 초상은 머리 위가 잘리지 않게 `--y 0.45`를 쓴다.
- 새 변형 열쇠(`quay_db`, `roof_nb` 같은 시신 변형)는 `scene`으로 넣으면 같은 장소·같은 때의 기본 그림에서 광원과 초점을 물려받아 `art.json`에 더해진다.
- playwright가 필요하다(`npm run art`와 같다). 로컬에서 돌리기 어려우면 그림을 Claude에게 보내 넣기·광원 맞추기·빌드를 맡겨도 된다.
- **주의:** `npm run art`는 모든 그림을 `tools/art`의 코드로 다시 그려 덮어쓴다. 바깥 그림을 넣은 뒤에는 쓰지 않는다. 쓰더라도 `--only`로 필요한 것만 다시 그린다.

---

## 1. 스타일 바이블

프로젝트 지침에 넣거나 모든 장면 프롬프트 앞에 붙인다.

```text
TANGO LETHE — STYLE BIBLE

Look: a moody neo-noir illustration, like a graphic-novel cover or an old film poster, matching the attached key art. Restrained rather than showy: no display of painting technique for its own sake, so it stays easy on the eye for a whole game.

Shapes: simplified planes and clear silhouettes. Things read first as dark shapes against lighter haze or light. Inside the shadows only faint painted modeling (soft brushy edges, a few strands, folds, bricks or ropes); details are suggested, not rendered one by one.

Light: a few motivated sources only (moon, sodium lamps, neon, candles, fire barrels, lit windows, the overcast sky). Each light spreads generously: a wide, soft falloff of its color over the walls, ground and figures around it, and thin, hot rim lights along the edges it touches (warm on one side, cool on the other). Shadows are deep but never crushed to black: shapes stay readable in them, and the middle tones around every light are clearly visible. Dark but legible, never murky. Soft halos in the haze are fine; no lens flares.

Air and surface: atmospheric haze separates near, middle and far; mottled, cloudy textures in skies and walls; a dry, speckled, print-like grain with faint scratches over the whole image. Matte and dry everywhere: no glossy highlights, no wet sheen, no puddle reflections, no rain streaks. Where something must reflect (polished marble, a mudflat), show it as a soft, blurred echo of tone, never a sharp mirror.

Palette: limited, with one or two small saturated accents. Night: deep indigo and blue-black, haze tinted by the nearest light (crimson neon, amber lamps, cold blue moonlight). Day: overcast and pale: sea-fog grey, faded teal, rust and ochre, silhouettes in grey-brown against bright fog; no hard sunlight, no blue sky (the game adds its own dusk and dawn tints).

People: small, faceless silhouettes or near-silhouettes with a thin rim of light; readable clothing shapes (flat caps, long coats, headscarves). No facial detail in scenes.

World: Sarga, a decaying 1950s–60s Southern European harbor city on an estuary: Spanish, Portuguese and Italian port architecture, faded Art Deco, rusted red dock cranes, cobblestones, laundry lines, fishing gear. Three weeks into a dockworkers' strike. Melancholic, quiet, humane, a little surreal: the city of forgetting.

Frame: wide 3:2 unless told otherwise. The main subject and the main lights in the left 60%; the right third calmer and darker (a text panel covers it in the game). Nothing important in the top and bottom 8% (cropped to 16:9).

Avoid: photorealism, 3D-render look, glossy or wet surfaces, smooth airbrushed gradients, heavy ink outlines, anime, lens flares, any text or letters unless specified, watermarks, borders, UI.
```

---

## 2. 기준 그림

### 2-1. 키 아트 — 타이틀 `title` (확정)

`docs/art-ref/key_art.png`. 이미 게임에 들어가 있다(`assets/scenes/title.webp`, 광원 맞춤 끝).

- 초점 0.7 · 휴대폰에서는 가로 52–78%만 보인다
- 깜빡이는 광원: 지브 끝 붉은 등 (51%, 16%) · 가로등 (61%, 65%) · 왼쪽 밖 네온의 붉은 번짐 (1%, 47%)

**더 밝게 다듬기** — 빛이 닿는 범위가 좁아 조금 어둡다. 키 아트를 만든 대화에서(또는 `key_art.png`를 첨부해서) 보낸다.

```text
Keep this picture exactly as it is: same composition, figures, style, palette and grain. Only let the light reach further: the moon's cold light and the street lamp's amber light spread wider and softer over the sky, the water, the quay and the man; lift the deepest shadows a little so the shapes in them read; let the crimson neon haze on the left glow a little more. It stays a dark night scene, and the left side stays dark enough for a title.
```

마음에 들면 `docs/art-ref/key_art.png`를 이것으로 바꾸고(모든 장면의 화풍 기준이 밝아진다), 게임에도 다시 넣는다: `scene title` → `snap title --write` → `preview title` → `npm run build`.

**다시 만들 때** — 새 대화. 첨부: ① `docs/art-ref/style_you.png` ② `docs/art-ref/layout/title.jpg`. 프롬프트는 [`ART_STYLE_TEST.md` 6-2](ART_STYLE_TEST.md)에 있다.

알려진 구도 문제: 휴대폰 타이틀 화면(가로 52–78%)에는 매달린 사람(가로 약 51%)이 들어오지 않는다. 휴대폰에서도 보이게 하려면 편집으로 지브를 조금 짧게 해 지브 끝과 매달린 사람을 가로 55–57%로 옮긴 뒤 다시 넣고 `snap`한다.

```text
Keep everything else exactly the same, but make the crane's jib a little shorter, so that its tip, the red light and the hanging figure sit at about 56% across.
```

### 2-2. 낮 기준 — 부두 거리 낮 `quay_d`

3-4에서 부두 거리의 밤과 낮을 **가장 먼저** 만든다. 낮 그림이 마음에 들면 `docs/art-ref/day_ref.png`로 넣는다. 다른 장소의 낮 편집에 이것을 첨부한다.

### 2-3. 초상 기준 — 형사 `you`, 그리고 초상 틀

아래 **초상 틀**은 모든 초상 프롬프트의 앞머리다. 프로젝트 지침에 스타일 바이블과 함께 넣어 두면 편하다.

```text
PORTRAIT TEMPLATE — Tango Lethe
Vertical 2:3 (1024×1536); it will be cropped to 4:5. Match the attached detective portrait exactly in framing, scale, lighting and finish.
One character, head and shoulders, in strict side profile facing RIGHT. The head is large: the top of the hair about 10% from the top, the chin a little below the middle, the face in the middle-right, the back of the head toward the left; the shoulders and collar fill the bottom and run off the edge.
The figure is mostly in deep shadow with faint painted modeling (the eye, the mouth, hair strands, folds of clothing), outlined by thin, hot rim lights: warm on the face side (right), cool on the back of the head and shoulders (left). The face side catches a soft wash of the warm light, so the profile reads clearly.
Behind: a hazy background in one or two colors specific to the character, its motif in soft blurred shapes on the right, darker toward the bottom.
One or two saturated accent details identify the character; they must read in a 108×135 px thumbnail.
Moody neo-noir illustration like a graphic-novel cover: simplified planes, soft brushy edges, dry speckled print grain, matte. No photographic skin, no glossy highlights, no 3D look. No text unless specified, no border, no frame.
```

형사 초상 `docs/art-ref/style_you.png`가 틀 기준이다. 다만 본문의 형사는 **두껍고 검은, 회색이 섞인 말굽 콧수염**이 있다(`content/01_room7.tl`의 거울 장면, 여러 인물이 "앵무새 셔츠, 나팔바지, 콧수염"을 본다). 게임에 넣기 전에 그 그림을 첨부하고 편집한다.

```text
Keep this portrait exactly as it is: framing, pose, light, colors, background, grain. Only change the face: give him a thick black mustache streaked with grey whose ends droop past the corners of his mouth like a horseshoe, make the face a little broader and heavier with a softer jaw, and give the nose the slight crook of an old break.
```

마음에 들면 `docs/art-ref/style_you.png`를 이것으로 바꾸고 게임에 넣는다: `node tools/art/import.mjs portrait you <그림> --y 0.45`.

### 2-4. (선택) 초상 라인업 시트 — 네 명씩

네 명을 한 장에 나란히 그리게 하면 한 명씩 만들 때보다 머리 크기·빛·마감이 잘 맞는다. 첨부: ① `style_you.png`

```text
Using the attached detective portrait as the exact template (same scale, framing, right-facing profile, rim lighting, grain and finish), make a lineup sheet of four portrait cards side by side, each 4:5 with a thin gap between them, for these characters: [1] … [2] … [3] … [4] … (descriptions below). No text.
```

그다음 `Now make card [2] alone as a full-size 2:3 portrait, identical in design`처럼 한 장씩 뽑는다. 인물 설명은 4장에서 복사한다.

---

## 3. 장면

- 장소마다 **밤을 새 대화에서 먼저**, 같은 대화에서 낮과 변형을 편집으로 만든다(0-1).
- 밤 첨부: **① `docs/art-ref/key_art.png` ② `docs/art-ref/layout/<열쇠>.jpg`**
- 낮 편집 때 첨부: **`docs/art-ref/day_ref.png`** (아직 없으면 그 문장을 지운다)
- 광원 좌표는 3:2 그림 기준이다(0-3). 넣은 뒤 `snap`으로 맞춘다(0-5).
- "휴대폰 범위"는 휴대폰에서 가로로 보이는 부분이다. 그 장소의 핵심은 이 안에 둔다.
- "게임 속 모습"은 본문(`content/*.tl`)에서 가져왔다. 그림이 본문과 어긋나지 않게 한다.

### 3-1. 7호실 — `room_n` `room_d`

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원: 밤 창밖 네온 (36%, 45%) / 낮 없음
- 게임 속 모습: 포도주색 벽지 위에 어른 키만 한 립스틱 글씨("아침을 폐지한다 — 밤의 대통령")와 주먹만 한 구멍. 금 간 거울, 욕조 물 위에 뜬 초록 벨벳 재킷(소매 하나가 가장자리에 걸림), 샹들리에 유리 가지에 끈이 두 번 감긴 콤비 구두 한 짝, 창가 탁자의 마호가니 축음기, 두껍고 붉은 커튼, 창밖 크레인들. 침대는 무거운 오크 머리판, 흘러내린 매트리스. 침대 기둥에 에메랄드색 무늬 셔츠, 스탠드 갓에 올가미처럼 걸린 빨간 넥타이.

**밤 `room_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/room_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly (silhouettes, thin rim lights, wide soft light falloff, haze, grain, palette handling). Image 2 is only a layout guide made of flat vector shapes: keep its camera and the positions of the window, bathtub, chandelier, gramophone and bed, but ignore how it is drawn.
Room 7 upstairs in the Lethe dance hall at night: a narrow, high-ceilinged room with faded wine-red wallpaper, wrecked the night before.
The only light: the tall window at center-left glows deep crimson from the huge "LETHE" neon sign outside (keep the glow centered on the window, x≈36%, y≈45%). The red light spreads across the ceiling and stains the walls and floor around the window; farther away the room sinks into indigo shadow where every object still reads as a shape.
Left: a claw-foot bathtub; a dark-green velvet jacket floats in its water with one sleeve hanging over the rim; above it a cracked oval mirror.
The window has heavy red curtains; through it, the long necks of idle harbor cranes against the night.
From the brass chandelier in the middle of the ceiling hangs a single two-tone spectator shoe, its laces wound twice around a glass arm.
On the wallpaper right of the window, adult-height scrawls of red lipstick (abstract strokes, no readable letters) and beside them a fist-sized hole in the plaster showing the wooden lath.
Right: a heavy oak bed, the mattress sliding off, crumpled sheets; a silk shirt with an emerald pattern hanging on a bedpost; a bedside lamp with a red tie hanging from its shade like a noose. On a small table by the window, a mahogany gramophone with a brass horn catching a thin red rim. Empty rum bottles, an overturned chair.
```

**낮 `room_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same room, same camera, same objects, now late morning. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The neon is off. Pale overcast daylight comes through the dusty window; outside, the long necks of idle red harbor cranes over a grey estuary. A soft rectangle of daylight lies on the worn floorboards with a few specks of floating dust. Faded wine-red wallpaper, brick red, honey-brown wood, cool grey light; every object reads clearly, the corners stay dim.
```

### 3-2. 레테 무도장 — `hall_n` `hall_d`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 분수 물빛 (47%, 66%) / 밤 + 샹들리에 (41%, 19%), 그 위 틀 밖 촛불 빛(가로 34–50%, 위쪽 밖), 담뱃불 (11%, 61%)
- 게임 속 모습: 낮은 무대 화장을 지운 늙은 배우 같다. 높은 아치형 창에서 먼지 섞인 빛기둥이 테이블 위에 거꾸로 올린 의자들을 비춘다. 한가운데 대리석 분수(얇은 옷의 여인상이 어깨에 항아리를 기울이고, 얼굴은 닳아 없다). 무대의 붉은 벨벳 커튼, 반도네온 가방을 무릎에 올리고 조는 백발의 맹인 노인. 바 뒤에 둥근 안경의 젊은 바텐더, 바 끝 금전 등록기 옆에 은빛 섞인 검은 머리를 높이 틀어 올린 검은 옷의 여자와 긴 궐련 물부리. 계단 밑의 나무 전화 부스(문에 둥근 유리창). 밤에는 담배 연기 구름, 반도네온, 분수 둘레를 도는 남녀, 정문 옆에서 은색 스팽글 드레스와 검은 깃털 목도리로 손님을 맞는 마담.

**밤 `hall_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/hall_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the checkerboard floor perspective and the positions of the fountain, stage, bar and windows, but ignore how it is drawn.
The ground-floor ballroom of the Lethe dance hall at night, alive. One-point perspective down a black-and-white checkerboard marble floor to a small stage with a heavy red velvet curtain.
A crystal chandelier above the stage is lit (x≈41%, y≈19%) and more candle light spills down from above the top edge; a golden cloud of cigarette smoke floats under it, and its warm light spreads through the whole room.
In the center, a marble fountain: a statue of a woman in a thin dress tilting a water jar on her shoulder, her face worn smooth; water falls into a wide round basin, with a small spot of pale light on the water (x≈47%, y≈66%).
Tango couples in close embrace turn around the fountain as dark silhouettes rimmed in gold and red; on the stage an old white-haired man with closed eyes plays a bandoneon in a single spotlight; silhouettes lean on the long bar at the left; the glow of a cigarette at the left edge (x≈11%, y≈61%). By the entrance, a woman in a silver-sequinned dress and a black feather boa greets the guests.
Red and gold light, deep but readable shadows, soft blurred streaks of light on the polished floor. The tall windows on the right are dark blue.
```

**낮 `hall_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same ballroom, same camera, now late morning and nearly empty, like an old actress without her stage makeup. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The chandelier is unlit and the dancers are gone. Tall arched windows on the right throw dusty diagonal shafts of pale daylight across small café tables with the chairs turned upside down on them, legs in the air like dead insects. The red curtain is half drawn; at the edge of the stage an old white-haired man dozes with a bandoneon case on his knees. Behind the long mahogany bar a thin young man in round glasses polishes a glass; at the end of the bar, by the cash register, a woman in black with silver-streaked hair piled high reads a thick ledger, a thin curl of smoke rising from a long cigarette holder. The fountain still trickles (keep the small spot of pale light on the water at x≈47%, y≈66%). A wooden telephone booth with a round glass window under the stairs; confetti and cigarette butts on the floor.
Dusty rose, oxblood, cream marble, tarnished gold, cool daylight.
```

### 3-3. 레테 뒷마당 — `backyard_n` `backyard_d`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 낮 없음 / 밤 뒷문 위 전구 (45%, 58%), 비상계단 꼭대기 등 (28%, 9%), 고양이 눈 (55%, 52%)
- 게임 속 모습: 무도장 뒷벽과 벌집 공동주택 옆벽 사이의 좁고 축축한 틈. 하늘은 긴 띠. 빨랫줄 수십 가닥에 셔츠·속치마·기저귀. 쓰레기통 셋, 빈 병 상자, 생선 뼈와 감자 껍질. 지그재그 비상계단의 맨 아래 사다리는 3m 위에 걷어 올려져 있다. 쓰레기통 뚜껑 위의 커다란 회갈색 줄무늬 수고양이: 한쪽 귀가 반쯤 잘렸고 한쪽 눈은 하얗게 멀었으며, 남은 눈 하나가 노랗다.

**밤 `backyard_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/backyard_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the narrow slot of the yard and the positions of the fire escape, laundry, back door, trash cans and cat, but ignore how it is drawn.
The narrow, damp back yard of the Lethe dance hall at night: a slot of space between the dance hall's back wall (left, weathered wood and brick) and the blank side wall of a tenement (right, stained plaster). The sky is only a long dark strip high above.
A single bare bulb over the back door (x≈45%, y≈58%) makes a warm cone of light that spreads over the damp flagstones, the trash cans and the lowest laundry; a faint lamp high on the fire escape at the top edge (x≈28%, y≈9%).
Dozens of laundry lines cross overhead; the shirts, petticoats and diapers hang like pale ghosts in the dark.
A rusty iron fire escape zigzags up the left wall toward the roof; its lowest ladder is pulled up and hangs about three meters above the ground.
On a dented trash-can lid sits a big grey-brown tabby tomcat with half an ear missing; his one good eye glows yellow in the dark (x≈55%, y≈52%), the other is milky white.
Three dented trash cans, crates of empty bottles, a drainpipe, a back door with a small wired-glass window. Blue-black shadows that still show the walls, one warm pool of light.
```

**낮 `backyard_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same yard, same camera, same objects, on an overcast day. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The bulbs are off. Cold grey-green shade fills the slot; faint pale light falls from the strip of sky and catches the laundry, which now shows its colors like signal flags: shirts, petticoats, aprons, diapers. The tomcat on the trash can, fish bones and potato peels, moss in the cracks.
```

넣은 뒤: 고양이 눈 광원의 색을 노랑으로 바꾼다(`art.json`의 `backyard_n` › `eyes` › `color`: `rgba(255,214,90,1)`). 지금 코드 그림의 고양이는 초록 눈이다.

### 3-4. 솔레아 부두 거리 — `quay_n` `quay_d` (가장 먼저)

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원
  - 낮: 드럼통 불 (61%, 76%), 담뱃불 (64%, 66%)
  - 밤: 낮의 것에 더해 레테 세로 네온 (15%, 42%), 선술집 열린 문 (9%, 73%), 가로등 두 개 (33%·73%, 52%), 길을 가로지르는 전구줄 (26–95%, 19–65%), 크레인 꼭대기 붉은 등 다섯 (40–100%, 27–34%), 먼 등불 (96%, 43%)
- 게임 속 모습: 물가를 따라 휘어지는 자갈길. 한쪽에는 창고·선술집·통조림 공장 벽돌 벽, 다른 쪽에는 검은 물·계류 기둥·멈춘 크레인 여덟 대. 부두 끝에서 두 번째가 7번 크레인이고, 시신은 거리 어디서든 보인다(3-17의 선택 변형). 생선 튀김 노점(줄무늬 차양, 무쇠 솥, 붉은 두건의 덩치 큰 여자), 드럼통 불가의 파업 하역부들, 문 닫은 옛 경비대 초소의 녹슨 파란 문. 낮에는 빛바랜 파란 우산 밑 헌책 수레, 문 닫은 경매장 처마 밑 생선 상자 위의 종이 왕관 남자, 빈 화강암 받침대 옆 벤치의 노인과 비둘기. 밤에는 나트륨등이 호박색 웅덩이를 만든다.

**밤 `quay_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/quay_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the curve of the street, the waterline and the positions of the neon sign, the tavern door, the fish stall, the fire barrel, the street lamps and the cranes, but ignore how it is drawn.
Soléa quay street at night, three weeks into a dockworkers' strike: a cobblestone waterfront street curving away along black water.
Left: a row of narrow four-story buildings (taverns, warehouses, a brick cannery wall) with a few lit windows; on the dance hall's corner a tall vertical sign of red glass letters reading "LETHE" blazes crimson (x≈15%, y≈42%), its red light spreading over the facade and the cobbles below. A tavern doorway at the bottom left spills warm yellow light onto the street (x≈9%, y≈73%). The rusted blue door of an abandoned police post.
Sodium street lamps make wide amber pools on the cobbles (lamps at x≈33% and x≈73%, y≈52%). A string of lit bulbs sags across the street (from x≈26% to x≈95%, y 19–65%).
Center: a fried-fish stall with a red-and-white striped awning and a steaming iron cauldron; a big, broad-shouldered woman in a red headscarf at the fryer.
Right of center: dockworkers in flat caps stand around a burning oil drum (x≈61%, y≈76%), rim-lit orange; one of them smokes (x≈64%, y≈66%).
Beyond the bollards, eight tall dock cranes stand idle against the deep indigo sky, small red warning lights on their tops (x 40–100%, y 27–34%); a harbor beacon glows far right (x≈96%, y≈43%).
Blank placards, gulls asleep on the bollards, crates, a bicycle. Warm pools of light with readable shadows between them.
```

**낮 `quay_d`** — 같은 대화에서. 아직 낮 기준이 없으니 첨부 없이.

```text
Edit the previous picture: same street, same camera, same objects, now an overcast morning. Follow the Day palette of the style bible: a pale fog-grey sky, oxidized teal water, faded brick and ochre facades, silhouettes in grey-brown against bright fog, no sunlight.
All lamps, bulbs and the neon are off (the LETHE letters are unlit red glass). The fire in the oil drum still burns (x≈61%, y≈76%) and one picketer still smokes (x≈64%, y≈66%). The eight idle red cranes stand along the water, their jibs pointing out to sea. Laundry on the balconies, shuttered windows, gulls on the bollards, fishing nets, a newspaper kiosk. Under a faded blue umbrella, a wooden book cart and an old man reading; on three stacked fish crates under the eaves of a closed auction hall, a man wearing a paper crown; on a bench beside an empty granite plinth, an old man feeding pigeons.
```

이 낮 그림이 마음에 들면 `docs/art-ref/day_ref.png`로 저장소에 넣는다(2-2).

### 3-5. 7번 크레인 아래 — `crane_n` `crane_nb` `crane_d` `crane_db`

- 초점 0.3 · 휴대폰 범위 가로 11–73%
- 깜빡이는 광원
  - 낮: 추모 촛불 다섯 (13–18%, 89%), 드럼통 불 (33%, 80%), 담뱃불 (41%, 74%)
  - 밤: 낮의 것에 더해 지브 끝 붉은 등 (18%, 16%)
- 열쇠의 `b` = 시신이 매달려 있는 때. `b`가 없으면 갈고리가 빈 뒤다.
- 게임 속 모습: 교회만 한 철골 탑이 네 다리로 레일 위에 서 있고, 운전실과 지브가 바다로 비스듬히 뻗는다. 붉은 방청 페인트가 벗겨져 녹이 비늘처럼 일었다. 드럼통 불가의 하역부 넷, 크레인 다리에 기댄 손글씨 피켓. 시신은 회색 양복을 입었고 지상 20미터에 매달려 있다. 갈매기들이 크레인을 맴돌고 몇 마리는 지브에 앉아 있다. 부두 끝, 바다를 등진 자리에 4번 크레인의 부러진 다리 하나가 부러진 뼈처럼 비스듬히 박혀 있고, 그 밑에 흰 페인트로 이름 여섯을 적은 나무판, 녹아 붙은 촛불 수십 개, 시든 꽃과 오늘 놓인 꽃, 사진, 뚜껑 딴 럼 한 병. 크레인 옆 양철 초소 문에 페인트로 "7".

**밤, 빈 갈고리 `crane_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/crane_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera and the exact positions of the crane, its jib tip, the fire barrel, the memorial and the hut, but ignore how it is drawn.
The foot of Crane No. 7 at the end of the Soléa docks, at night. A wide concrete pier with rusted rails, iron bollards and abandoned cargo pallets.
Crane No. 7 towers over everything: a church-sized lattice-steel crane on four legs straddling the rails, a boxy operator's cab with a faint yellow window, and a long jib reaching out over the estuary to the upper left. Against a deep blue sky and a pale moon it is a black lattice silhouette with a thin cold rim. A red warning light at the jib tip (x≈18%, y≈16%); from there a steel cable hangs straight down to an empty hook.
At the base, striking dockworkers in caps stand around a burning oil drum (x≈33%, y≈80%): the fire lights them from below, spreads a warm glow over the concrete and throws their long shadows up the crane legs; one of them smokes (x≈41%, y≈74%). Hand-painted picket signs (blank) lean against the crane legs.
Bottom left, the memorial for the collapse of Crane No. 4: one broken, rusted leg of that crane still stuck in the concrete, slanting at the sky like a broken bone; beneath it a wooden board with six names in white paint (unreadable), dozens of melted candles fused together and burning (x 13–18%, y≈89%), wilted flowers, a few photographs, an open bottle of rum.
Right: a corrugated-iron guard hut with a warm lit window and a "7" painted on its door.
Behind: the dark estuary and the distant breakwater.
```

**밤, 시신 `crane_nb`** — 같은 대화에서

```text
Edit the previous picture: add a small dark silhouette of a man in a grey suit hanging motionless from the hook at the end of the cable, high above the pier, barely lit by the moon; a few gulls perched on the jib. Not graphic. Nothing else changes.
```

**낮, 빈 갈고리 `crane_d`** — 같은 대화에서. 첨부: ① 빈 갈고리 밤 그림(`crane_n.png`) ② `day_ref.png`

```text
Edit image 1 (the night picture with the empty hook): same camera, same objects, but an overcast day. Image 2 is the day style reference: match its daylight palette, haze and value range, keeping image 1's composition.
Now the crane shows its red anti-rust paint, peeling, with rust lifting in flakes like fish scales; the cab window and the red light are off. The fire in the oil drum still burns (x≈33%, y≈80%), one picketer still smokes (x≈41%, y≈74%), and the memorial candles still burn (x 13–18%, y≈89%). Gulls on the rail, a coil of rope, stacked pallets, a union banner (blank). Behind: a flat grey estuary, the distant breakwater, fog. The hook hangs empty.
```

**낮, 시신 `crane_db`** — 같은 대화에서

```text
Edit the previous picture: add a small dark figure of a man in a grey suit hanging motionless from the hook at the end of the cable, high above the pier, seen only as a silhouette against the pale sky; gulls circle the jib and a few sit on it. Not graphic. Nothing else changes.
```

### 3-6. 솔레아 제1통조림 공장 · 붉은 닻 본부 — `cannery`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 천장에 매단 등 다섯 (31–75%, 23–34%), 왼쪽 틀 밖 수프 솥의 불빛
- 게임 속 모습: 높은 천장의 녹슨 트러스와 기름때 낀 천창. 컨베이어 세 줄 위에 빈 깡통이 행진하다 얼어붙은 병사처럼 서 있다. 긴 의자에서 피켓을 칠하고 뜨개질하고 아이를 달래는 여공들. 한쪽 구석의 생선 수프 솥과 늘어선 줄(하역부, 아내들, 아이들). 칠판, 붉은 깃발, 목탄으로 그린 젊은 남자의 초상(두꺼운 콧수염, 헝클어진 머리, 웃는 눈). 벽 중간 높이의 유리 상자(옛 작업반장실)에 철계단, 스탠드 불빛, 휠체어의 로사. 낮과 밤에 같은 그림을 쓴다.

첨부: ① `key_art.png` ② `layout/cannery.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the three converging conveyor belts, the glass office and the hanging lamps in place, but ignore how it is drawn.
Inside Soléa Cannery No. 1, now the strike headquarters of the Red Anchor union: a vast hall under rusted steel roof trusses and grimy skylights.
Enamel pendant lamps hang from the trusses and pour wide cones of warm light over the floor (x 31–75%, y 23–34%). In the far left corner, just at the edge of the picture, a huge soup cauldron steams over a fire whose warm glow spills in from the left; a queue of dockworkers, wives and children with tin bowls waits beside it.
Three long conveyor belts run toward the back in one-point perspective, lined with thousands of empty tin cans standing in rows like soldiers frozen mid-march. Along them, women workers sit on long benches painting picket signs, knitting, rocking babies.
Left wall: a large red banner with a white anchor, a charcoal portrait of a laughing young man with a thick mustache pinned beside it, a chalkboard covered in duty rosters (no readable text).
Upper right: a glass-walled foreman's office on steel stilts, reached by a steep steel staircase and lit from inside by a desk lamp; a small figure in a wheelchair watches over the floor.
Also: stacked crates, a bicycle, laundry drying between machines, a sleeping dog.
Warm amber lamplight in cool grey-blue industrial haze.
```

### 3-7. 그랜드 메리디안 호텔 로비 — `hotel_n` `hotel_d`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 샹들리에와 그 촛불들 (33–55%, 25–37%), 프런트 스탠드 (75%, 50%). **낮에도 켜져 있다.**
- 게임 속 모습: 언덕 위의 흰 대리석 정면, 회전문. 안은 따뜻하고 건조하고 백합과 가구 광택제 냄새. 거울처럼 빛나는 대리석 바닥, 기둥 사이의 야자수 화분, 거대한 샹들리에. 도어맨, 소파의 노부인. 프런트에는 대머리에 연필로 그은 듯한 콧수염, 목까지 채운 검은 연미복의 컨시어지. 뒤편에 유리 온실(겨울 정원)과 호텔 바 "나침반 장미".

**밤 `hotel_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/hotel_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its symmetrical camera, the grand staircase, the columns, the chandelier and the reception desk in place, but ignore how it is drawn.
The lobby of the Grand Meridian Hotel on the hill at night: the last glory of the drowned monarchy, now home to Accord bankers and shipping agents. Symmetrical frontal view: white marble columns, a grand staircase with a red carpet rising at the back to a landing with a tall arched window, dark blue now.
A huge crystal chandelier hangs in the center with its dozens of candle bulbs lit (x 33–55%, y 25–37%); its golden light spreads through the whole lobby. Right: a polished mahogany reception desk with a brass bell, pigeonholes with room keys and a green banker's lamp (x≈75%, y≈50%); behind it a bald concierge with a pencil-thin mustache, in a black tailcoat buttoned to the throat, stands perfectly straight, a black silhouette with a thin gold rim.
The polished marble floor shows only soft, blurred streaks of the lights, never a sharp mirror. Wall sconces glow; potted palms stand between the columns; a tall vase of white lilies.
Cream, gold, oxblood; deep, warm, readable shadows.
```

**낮 `hotel_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same lobby, same camera, now daytime. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
Cool daylight from the high arched window washes over the marble. The chandelier stays lit (keep its candle bulbs at x 33–55%, y 25–37%) and so does the green desk lamp (x≈75%, y≈50%). Left: a velvet sofa with an old lady in furs and a tiny dog. A doorman by a revolving brass door glimpsed at the far left; through a side arch, the green glass conservatory; a small bar sign reading "COMPASS ROSE".
```

### 3-8. 그랜드 메리디안 305호 — `room305_n` `room305_d`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 낮 없음 / 밤 책상 스탠드 (52%, 48%)
- 게임 속 모습: 닷새 동안 닫혀 있던 죽은 손해사정인의 방. 먼지, 풀 먹인 리넨, 잉크, 베르가못 냄새. 지나치게 정돈되어 있다. 호텔식으로 접은 침대, 창가 책상의 휴대용 타자기와 서류철과 가지런한 연필 세 자루, 금박 액자 속 익사한 왕 아우렐리오 4세의 초상. 카펫을 걷어 낸 참나무 바닥에 번호가 매겨진 분필 발자국이 가득하다. 오른발은 흰색, 왼발은 노란색이고, 원을 그리거나 X자로 교차한다.

**밤 `room305_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/room305_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera and the positions of the bed, portrait, window, desk and lamp, but ignore how it is drawn.
Room 305 of the Grand Meridian Hotel at night: the room of a dead insurance adjuster, sealed for five days. Unnervingly tidy.
Only the desk lamp is on (x≈52%, y≈48%): a warm cone over a portable typewriter, a neat stack of folders, three sharpened pencils laid parallel and a small bottle of bergamot cologne on the writing desk under the window; its light spreads softly over the desk, the wall and the floor.
Moonlight through the tall window with sheer curtains lays a pale blue rectangle on the bare oak floor, where dozens of chalk footprints glow faintly (white for the right foot, yellow for the left), numbered, circling and crossing in figure-eights: someone practiced tango steps here alone. The carpet is rolled up against the wall.
Left: a bed made with crisp hospital corners, a leather suitcase at its foot. On the back wall, a gilded frame with a dark portrait of the drowned king Aurelio IV (a regal figure in a naval coat, face in shadow); only the gilded frame catches the light.
```

**낮 `room305_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same room, same camera, same objects, in the afternoon. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The lamp is off. Soft grey daylight from the window, with a view of the grey harbor far below; cream striped walls, honey oak floor; the chalk footprints read clearly on the bare boards.
```

### 3-9. 코스타 전당포 — `pawn`

- 초점 0.5 · 휴대폰 범위 가로 19–81%
- 깜빡이는 광원: 카운터의 초록 갓 등 (50%, 33%)
- 게임 속 모습: 부두 거리 14번지. 문 위의 종. 천장까지 닿는 선반에 아코디언, 괘종시계, 웨딩드레스, 목발, 선원용 망원경, 박제 갈매기, 은수저, 누군가의 틀니, 결혼반지 수백 개. 모두에 숫자 꼬리표. 가장 안쪽 쇠창살 카운터에 쉰 살쯤의 뚱뚱한 남자(땀에 젖은 이마, 소매 고정 밴드, 금니 두 개, 거대한 코). 낮과 밤에 같은 그림을 쓴다.

첨부: ① `key_art.png` ② `layout/pawn.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its symmetrical camera, the barred counter at the back and the lamp position, but ignore how it is drawn.
Inside the Costa pawnshop at No. 14 Quay Street: dark, narrow and crammed to the ceiling.
A symmetrical view down the aisle to a counter behind iron bars at the back, where a heavy, sweating pawnbroker (balding, sleeve garters, two gold teeth, an enormous nose) sits under a green-shaded lamp (x≈50%, y≈33%) counting coins; the lamp's warm light spreads over the counter, the bars and the nearest shelves.
Shelves on both walls overflow with pawned lives: accordions, a grandfather clock, a wedding dress on a dress form, crutches, a brass sailor's telescope, a stuffed seagull with glass eyes, silver spoons, a set of dentures in a glass, trays of hundreds of wedding rings, birdcages, a violin. Every object has a small numbered paper tag on a string (no readable numbers).
A brass bell above the door, a threadbare rug, dust in the lamplight.
Dark umber, tarnished brass, oxblood, with one warm pool of light at the counter.
```

### 3-10. 익사한 종의 교회 — `church_n` `church_d`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 제단 촛불 (43–49%, 54–56%), 종탑 꼭대기 붉은 등 둘 (72–78%, 5–10%)
- 게임 속 모습: 아홉 날의 포격(46년 전) 때 지붕 절반이 날아가 신랑이 하늘로 열려 있다. 부서진 신도석 사이로 잡초가 자라고, 빗물이 대리석 바닥에 웅덩이를 만들었다. 제단 위에 녹아 붙은 촛불 수십 개. 종 없는 종탑(종은 80년 전 대홍수 때 운하로 떨어졌다)에 철사와 안테나가 거미줄처럼 얽혀 있고 붉은 등이 깜빡인다. 종루 창에 손으로 쓴 천 "라디오 레테 — 97.3". 밤에는 종탑에서 지직거리는 탱고가 흘러나온다.

**밤 `church_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/church_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera down the nave, the rose window and altar in the center and the bell tower on the right, but ignore how it is drawn.
The Church of the Drowned Bell at night, half-ruined: half the roof was blown away in a shelling forty-six years ago, so the nave opens to the night sky; broken rafters and wires cross the gap, and moonlight falls into the nave.
Rows of broken wooden pews with weeds growing between them; shallow rainwater pools on the cracked marble floor hold only a dim, blurred echo of the moon and the candles.
At the far end, an altar crusted with dozens of melted candles, many of them burning (x 43–49%, y 54–56%): a warm island of light that spreads over the altar steps and the nearest pews, under a shattered rose window with a few colored panes left.
To the right, the narrow stone bell tower; its belfry has no bell. Instead a tangle of antennas and wires like a spider web, with small red lights at the very top (x 72–78%, y 5–10%); the belfry window glows warm violet from the radio booth inside, and a hand-painted cloth banner hangs from it reading "RADIO LETHE 97.3".
```

**낮 `church_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same church, same camera, on an overcast day after rain. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
A pale sky shows through the missing roof. A few altar candles still burn (x 43–49%, y≈55%) and the red antenna lights still glow at the top (x 72–78%, y 5–10%). Pigeons on the rafters, ivy on the walls, wildflowers between the pews, a rusted bicycle leaning on a pew, folded votive notes tucked into cracks. Cool stone grey, moss green, faded fresco ochre.
```

### 3-11. 벌집 공동주택 안뜰 — `honeycomb_n` `honeycomb_d`

- 초점 0.45 · 휴대폰 범위 가로 17–79%
- 깜빡이는 광원: 낮 없음 / 밤 문간 등 (39%, 60%)
- 게임 속 모습: 5층 건물이 네모나게 둘러싼 안뜰. 층마다 좁은 발코니가 벌집 칸처럼 이어지고, 빨랫줄 수십 가닥 사이로 하늘이 조각조각 보인다. 가운데 녹슨 수동 펌프 둘레에서 아이들이 뛰어논다. 문간마다 늙은 여자들이 등받이 없는 의자에 앉아 콩을 까거나 뜨개질을 한다. 가장 어두운 문간에 숄을 겹겹이 두른 아흔 넘은 점쟁이. 밤에는 창문마다 불빛이 하나씩, 라디오 소리, 빨래가 유령처럼 흔들린다.

**밤 `honeycomb_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/honeycomb_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the enclosing facades, the laundry lines and the pump in place, but ignore how it is drawn.
The Honeycomb, a five-story tenement courtyard in Soléa, at night: a square courtyard enclosed on all sides by walls with rows of narrow balconies like honeycomb cells.
Windows glow one by one as warm yellow squares, each spilling a little light onto its balcony; a single lamp above a doorway (x≈39%, y≈60%) makes a warm pool on the courtyard stones. Dozens of laundry lines crisscross overhead; the laundry hangs like pale ghosts against the dark. The rusty hand pump stands alone in the middle; silhouettes move behind curtains; a radio glows on a windowsill.
Indigo shadows, warm yellow windows, walls that still read in the dark.
```

**낮 `honeycomb_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same courtyard, same camera, at midday. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The window lights and the lamp are off. Soft daylight filters down through the laundry (shirts, slips, diapers, work overalls), so the sky shows only in fragments. Small children play around the rusty cast-iron pump with a hoop and chalk drawings. In the doorways, old women sit on low stools shelling beans and knitting, watching everything; in the darkest doorway sits an ancient woman wrapped in layered shawls. Flower pots, birdcages, drying red peppers, washing tubs, a tricycle, a cat; an archway on one side leads out to the alley. Warm ochre, rose, sun-bleached blue.
```

### 3-12. 레테 무도장 옥상 — `roof_n` `roof_d`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 낮 없음 / 밤 거꾸로 선 네온 (48%, 38%), 크레인 꼭대기 붉은 등 넷 (33–67%, 30–45%), 먼 요새 등표 (14%, 47%)
- 게임 속 모습: 물집처럼 부풀고 조금 끈적한 검은 타르 바닥. 네 다리 위의 나무 물탱크, 사람 키만 한 받침대 위의 판자 비둘기장(둥근 출입구, 문에 삐뚤빼뚤한 페인트 글씨 "출입 금지 — 해적만!"). 바다 쪽 테라스의 난간, 화분 몇 개, 부서진 등나무 의자 하나. 네온사인의 뒷면이 거대한 철골로 서 있어 LETHE가 거꾸로 보인다. 7번 크레인이 손을 뻗으면 닿을 듯 가깝다. 밤에는 네온의 붉은빛이 타르 바닥을 핏빛으로 물들이고, 비둘기장은 너무 조용하다.

**밤 `roof_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/roof_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera and the positions of the water tank, pigeon loft, neon frame and cranes, but ignore how it is drawn.
The flat tar roof of the Lethe dance hall at night. The black tar is blistered and a little sticky underfoot.
Center: the back of the enormous "LETHE" neon sign, a steel scaffold holding five huge letters seen from behind, so they read reversed. They blaze red from the other side (x≈48%, y≈38%); the light bleeds around the steel frame and paints the tar floor blood red.
Left: a large wooden water tank on four tall legs; beside it, a plank pigeon loft on a man-high stand, like a little shack with round openings: silent and dark, too silent.
Foreground: a small terrace with an iron railing, a few terracotta flower pots and a broken rattan chair.
Beyond the railing the harbor spreads out below with idle cranes, red warning lights on their tops (x 33–67%, y 30–45%); Crane No. 7 looms very close on the right. Far out in the bay on the left, the tiny automatic beacon of the Tide Fort (x≈14%, y≈47%).
```

**낮 `roof_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same roof, same camera, on a windy overcast afternoon. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The neon is off: the reversed letters are dull red glass in a rusty frame with cables and junction boxes. A wide pale sky with gulls; pigeons come and go from the loft; on its door, a crooked hand-painted sign in childish white brush strokes (no readable letters). The harbor below with the idle red cranes, Crane No. 7 very close on the right. Tar black, pigeon grey, rust red, sea-fog white.
```

### 3-13. 방파제와 등대 — `breakwater_n` `breakwater_nl` `breakwater_d` `breakwater_dl`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 요새 3초 등표 (24%, 40%) / 밤 + 순찰정 붉은 등 (36%, 52%)
- 열쇠의 `l` = 썰물. 방파제 뿌리에서 요새까지 개펄이 드러난 때다. 새벽(결말 직전)에는 `breakwater_d`에 게임이 새벽 색을 얹는다.
- 게임 속 모습: 바다로 1km 넘게 뻗은 화강암 팔, 이끼와 따개비, 게. 붉은 줄과 흰 줄이 바래 분홍과 회색이 된 등대. 등롱은 꺼져 있고, 아래 작은 집(흰 회벽, 푸른 창틀, 창턱의 제라늄, 문 옆의 그물과 부표, 벤치) 굴뚝에서 연기가 가늘게 오른다. 벤치에서 노부인이 몇 미터나 되는 회색 목도리를 뜬다. 방파제 안쪽에 회색 순찰정 "PB-7", 고물에 협약 깃발(푸른 바탕에 원을 이룬 다섯 별)이 축축하게 늘어져 있고, 조타실 지붕에서 모자를 얼굴에 덮은 하사가 낚시를 한다. 만 한가운데 별 모양의 검은 요새와 반쯤 무너진 탑, 그 꼭대기의 등표. 밤에는 등대 집 창에 노란 불빛 하나.

**밤, 밀물 `breakwater_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/breakwater_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the diagonal line of the breakwater, the lighthouse on the right, the patrol boat and the fort on the left, but ignore how it is drawn.
The granite breakwater and the lighthouse at night, high tide. A long arm of huge granite blocks, covered in moss and barnacles, runs from the foreground out into the dark toward the right.
At its end, a cylindrical lighthouse with faded red-and-white stripes, now pink and grey; its lantern is dark. At its foot a small keeper's house with white walls and blue window frames: one warm yellow window glows (x≈80%, y≈47%) and lights a bench, fishing nets and buoys by the door; a thin line of chimney smoke.
Inside the breakwater, on calm dark water, a small grey patrol boat with "PB-7" on the bow and a limp blue flag with a circle of five stars at the stern; a red navigation light on it (x≈36%, y≈52%).
Far out in the bay on the left, the Tide Fort: a black star-shaped island fortress with angled bastions and a half-ruined tower; its automatic beacon flashes white (x≈24%, y≈40%).
Dark indigo sea, the moon behind fog; every light spreads a soft halo in the haze.
```

**밤, 썰물 `breakwater_nl`** — 같은 대화에서

```text
Edit the previous picture: same camera, now at low tide at night. The sea has withdrawn: from the foot of the breakwater all the way to the fort stretches a grey-brown mudflat that holds a soft, blurred echo of the moon, cut by silver tidal channels like veins. The patrol boat now sits tilted on the mud, its red light still on (x≈36%, y≈52%). Keep the fort beacon (x≈24%, y≈40%) and the keeper's window (x≈80%, y≈47%).
```

**낮, 밀물 `breakwater_d`** — 같은 대화에서. 첨부: ① 밀물 밤 그림(`breakwater_n.png`) ② `day_ref.png`

```text
Edit image 1 (the high-tide night picture): same camera, same objects, but a grey foggy day at high tide. Image 2 is the day style reference: match its daylight palette, haze and value range, keeping image 1's composition.
Seamless fog, pearl grey, verdigris water. The fort's automatic beacon still flashes (x≈24%, y≈40%); the keeper's window and the boat's red light are off. On the roof of the patrol boat's wheelhouse a sailor in blue work clothes lies fishing, his cap over his face. On the bench by the keeper's house an old woman knits an endlessly long grey scarf that spills onto the stones. Gulls, crab pots, a moored rowboat, old lamp posts along the breakwater, an iron mooring ladder.
```

**낮, 썰물 `breakwater_dl`** — 같은 대화에서

```text
Edit the previous picture: same camera, now at low tide. The sea has withdrawn: from the foot of the breakwater to the fort stretches a grey-brown mudflat that echoes the pale sky in soft bands, cut by silver tidal channels like veins. The patrol boat sits tilted on the mud; stranded seaweed, tiny crabs. Keep the fort beacon (x≈24%, y≈40%).
```

### 3-14. 레테 개펄 — `flats_n` `flats_d`

- 초점 0.35 · 휴대폰 범위 가로 13–75%
- 깜빡이는 광원: 요새 3초 등표 (61%, 38%)
- 게임 속 모습: 발목까지 빠지는 회갈색 평원. 너무 평평해서 원근이 사라지고, 젖은 표면이 하늘을 비춰 하늘 위를 걷는 것 같다. 물골이 은빛 혈관처럼 흐르고, 게 수천 마리가 딸깍거린다. 개펄 한가운데 비스듬히 박힌 포함(녹슨 철판, 부러진 굴뚝, 녹아내린 대포, 뱃머리에 "……MEMORIA"). 지도에 없는 말뚝처럼 서 있는 잿빛 왜가리.

**밤 `flats_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/flats_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the low horizon, the stranded gunboat and the far fort in place, but ignore how it is drawn.
The Lethe mudflats at low tide, at night: a vast, perfectly flat plain of wet mud to the horizon, so flat that distance disappears. The mud holds a soft, blurred echo of the full moon and the sky, so you seem to walk on the night sky; silver tidal channels wind through it like veins.
In the middle ground, stuck diagonally in the mud, a rusted old gunboat: buckled iron plates, a broken funnel, a deck cannon melted and drooping, the remains of white paint on the bow reading "...MEMORIA"; a black silhouette with a thin cold rim.
Far away on the horizon, the tiny dark island of the Tide Fort; its beacon flashes white (x≈61%, y≈38%).
Old wooden stakes poke out of the mud; near the right, a lone ash-grey heron stands perfectly still, like a post that is not on any map.
```

**낮 `flats_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same flats, same camera, on an overcast day. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
The wet mud echoes the pale sky so completely, in soft painted bands, that you seem to walk on clouds; silver channels; thousands of small crabs; a line of footprints; the gunboat's rust red; the fort beacon still flashes (x≈61%, y≈38%). Pearl grey, silt brown, silver.
```

### 3-15. 조수 요새 — `fort_n` `fort_d`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 탑 꼭대기 3초 등표 (55%, 12%) / 밤 + 화약고 문틈의 노란빛 (76%, 58%)
- 게임 속 모습: 검은 현무암 아치 문. 아치 꼭대기의 왕관·닻·삼지창 문장은 망치로 깨졌고, 그 아래 협약의 청동판에 누군가 붉은 페인트로 X를 그었다. 안뜰에는 무릎까지 자란 잡초, 성벽 위 둥지의 갈매기 수백 마리. 한쪽 벽 가슴 높이에 둥근 총알 구멍 수백 개가 띠를 이룬다. 반대편에 성벽에 반쯤 묻힌 둥근 돌집(화약고): 흙 덮인 지붕에 풀이 자라고, 돌계단 세 칸 아래 철띠 두른 참나무 문. 밤에는 등표가 3초마다 안뜰을 하얗게 비추고, 그 사이 화약고 문틈으로 촛불 빛이 샌다(이네스가 숨어 있다).

**밤 `fort_n`** — 새 대화. 첨부: ① `key_art.png` ② `layout/fort_n.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the long rampart, the door on the right and the beacon on top, but ignore how it is drawn.
The Tide Fort at night: the overgrown courtyard of a black basalt island fortress in the bay.
A long high rampart of dark stone with crenellations, lined with sleeping gulls like pale dots. Knee-high weeds and wild grass fill the courtyard; an overturned rowboat, rusted iron rings, a broken cannon wheel.
The squat tower rises at the back with an automatic beacon on top (x≈55%, y≈12%): every few seconds it flashes and washes the courtyard in cold white; between flashes, a readable dark.
On the left part of the wall, at chest height, a horizontal band of hundreds of small round bullet holes: the old execution wall.
On the right, the powder magazine: a domed stone house half-buried in the rampart, grass growing on its earth-covered roof, three stone steps down to a heavy oak door banded with iron. A thin line of warm candlelight leaks from the gap of that door (x≈76%, y≈58%): someone is hiding inside. Nearby, over the inner side of the gate arch, the fort's old coat of arms (a crown, an anchor and a trident) hammered away, and a bronze plaque struck through with a red painted X (no readable text).
```

**낮 `fort_d`** — 같은 대화에서. 첨부: `day_ref.png`

```text
Edit the previous picture: same courtyard, same camera, on a windy grey day. The attached image is the day style reference: match its daylight palette, haze and value range, keeping this picture's composition.
Hundreds of nesting gulls along the crenellations, some wheeling in the air. The beacon still flashes on the tower (x≈55%, y≈12%). The magazine door is shut and dark. Slate, moss green, bone-white gulls, a faint red of paint.
```

### 3-16. 물속 — 꿈과 죽음 `void`

- 초점 0.4 · 휴대폰 범위 가로 15–77%
- 깜빡이는 광원: 수면의 물빛 (40%, 17%)
- 쓰이는 곳: 게임의 첫 장면(어둠), 꿈, 죽음의 결말

첨부: ① `key_art.png` ② `layout/void.jpg`

```text
Tango Lethe scene, wide 3:2 (1536×1024). Follow the Tango Lethe style bible. Image 1 is the style reference: match its look exactly. Image 2 is only a layout guide made of flat vector shapes: keep its camera, the bright spot of the surface and the sinking figure's position, but ignore how it is drawn.
A dream of drowning, the void between memories: deep underwater in the estuary, looking up. Deep teal and ink-blue water; far above, the rippling surface lets down soft shafts of pale light (brightest at x≈40%, y≈17%) that spread and fade into the dark.
A man in a long coat sinks slowly, a dark silhouette with a thin cyan rim, arms loose.
Around him drift the fragments of his life: a single two-tone spectator shoe, a brass hotel key with a heavy tag, a folded letter, a ring catching the light, a rum bottle, a police badge, a tango lesson card, a large ash-grey feather, and far below, sinking, an old revolver. Tiny bubbles rise.
At the very bottom, the faint silhouette of a huge bronze bell half buried in silt.
Calm, silent, beautiful and sad.
```

### 3-17. (선택) 시신이 보이는 부두 거리와 옥상 — `quay_nb` `quay_db` `roof_nb` `roof_db`

본문은 시신이 부두 거리 "어디서든 보인다"고 하고, 옥상에서는 7번 크레인이 손에 닿을 듯 가깝다. 옥상 문은 머리핀이나 어깨로도 열 수 있어 시신을 내리기 전에 올라갈 수 있다. 이 그림들이 있으면 게임은 시신을 내리기 전까지 이것을 쓰고, 없으면 기본 그림을 쓴다(코드는 이미 되어 있다). 넣을 때는 `node tools/art/import.mjs scene quay_nb <그림>`처럼 넣으면 광원이 기본 그림에서 물려받아진다. 그다음 `snap`.

각 장소의 대화에서, 시신 없는 그림에 이어서(다른 그림 뒤라면 그 파일을 다시 첨부해서):

```text
Edit the previous picture: add, far away at the end of the quay, on the second crane from the far end (Crane No. 7), a tiny dark figure of a man in a grey suit hanging from the cable at its jib tip, doll-sized at this distance, a few gulls circling it. Not graphic. Nothing else changes.
```

```text
Edit the previous picture: add, on Crane No. 7 close on the right, the small dark figure of a man in a grey suit hanging motionless from the cable at its jib tip, a few gulls perched on the jib. Not graphic. Nothing else changes.
```

---

## 4. 초상

첨부는 **① `docs/art-ref/style_you.png`(틀 기준) 한 장**이다. 앞머리에는 초상 틀(2-3)이 온다. 프로젝트 지침에 넣었으면 생략해도 된다. 지금 게임의 코드 초상은 첨부하지 않는다. 틀(머리 크기·자리)이 달라 헷갈리게 하고, 매끈한 느낌이 옮는다. 인물의 배경 색과 포인트는 설명에 들어 있다.

공통 앞문장(각 인물 설명 앞에 붙인다):

```text
Follow the PORTRAIT TEMPLATE. Image 1 is the approved detective portrait: match its framing, head size, rim lighting, grain and finish exactly, but paint the person described below.
```

인물 설명은 본문(`content/*.tl`)의 첫 등장 묘사를 따랐다. 넣을 때는 `node tools/art/import.mjs portrait <이름> <그림> --y 0.45`.

### 4-1. 형사와 파트너, 레테 무도장

**형사** `you` — 2-3에서 만든다.

**윤 세하 경위** `yun` — 파트너, 38세, 가람 제도 출신 전직 해군 신호장교. 작고 단단한 체구, 턱선에서 일자로 자른 짧은 검은 머리, 이마 위로 밀어 올린 오토바이 고글, 턱을 따라 난 가는 흰 흉터, 낡은 갈색 가죽 비행 재킷, 귀에 꽂은 몽당연필.
```text
Inspector Yun Se-ha, 38, the detective's partner: an East Asian woman from the eastern Garam islands, a former naval signal officer, composed and exact. A small, solid build; short black hair cut straight at the jawline; motorcycle goggles pushed up on her forehead, their brass rims catching the light (accent); a thin white scar along her jaw; a worn brown leather flight jacket over a Watch-issue shirt; a stub of pencil tucked behind her ear. Background: pale teal venetian-blind light stripes across a dark teal wall. Warm rim light on the face, mint-white rim on the back.
```

**마담 오를라** `orla` — 60대 전직 탱고 디바, 무도장 주인. 은빛이 섞인 검은 머리를 높이 틀어 올렸다. 밤에는 은색 스팽글 드레스, 검은 깃털 목도리, 피처럼 붉은 입술. 긴 궐련 물부리.
```text
Madame Orla Bey, 60s, former tango diva and owner of the Lethe dance hall: silver-streaked black hair piled high, heavy stage makeup even in profile (long false eyelashes), blood-red lips (accent), a black feather boa over a silver-sequinned dress whose sequins read as a scatter of small pale dots, a long cigarette holder sending up a thin curl of smoke. Background: warm crimson and amber haze with soft blurred dance-hall lights. Pink rim light on the face, violet rim on the back.
```

**에밀** `emile` — 20대 후반 바텐더, 책벌레, 조용한 비관론자. 가늘고 창백하다. 둥근 철테 안경, 소매를 걷은 흰 셔츠, 검은 조끼.
```text
Emile, late 20s, the bookish bartender and quiet pessimist: thin and pale, round wire-rimmed glasses catching a small warm light (accent), a white shirt with rolled-up sleeves under a black waistcoat, a paperback in his hand. Background: blurred amber bottles and the soft warm lights of the bar. Warm gold rim light on the face, cool blue rim on the back.
```

**파코 영감** `paco` — 70대 맹인 반도네온 연주자. 코뮌 시절부터 연주했다. 백발.
```text
Old Paco, 70s, the blind bandoneon player who has played since the days of the Commune: white hair, eyes closed, a deeply lined face turned slightly up as if listening, a scarf; the pleated bellows of a bandoneon with mother-of-pearl buttons at the bottom edge (accent). Background: dark wine red with a soft warm stage glow. Warm amber rim light on the face, violet rim on the back.
```

### 4-2. 부두 거리

**보보** `bobo` — 11세, 자칭 "혁명 해적단 선장". 비쩍 말랐다. 눈썹까지 눌러쓴 너무 큰 선원 모자, 허리의 나무칼, 팔의 붉은 헝겊 완장. 아이라서 틀 안에서 머리가 조금 낮고 어깨가 좁다.
```text
Bobo, 11, self-proclaimed captain of the Revolutionary Pirate Crew: a skinny small boy (his head sits a little lower in the frame, narrow shoulders), a too-big sailor's cap pulled down to his eyebrows, a snub nose, a defiant chin, a red cloth armband on his sleeve with clumsy painted marks (accent, no readable letters), the hilt of a wooden sword at his belt. Background: a dusky blue harbor with the silhouettes of cranes. Warm rim light on the face, pale blue rim on the back.
```

**마르가리타** `marga` — 생선 튀김 장수, 모든 소문의 중심. 키도 크고 어깨도 넓고 목소리도 크다. 붉은 두건, 걷어 올린 팔뚝에 기름 튄 자국.
```text
Margarita, the fried-fish vendor and hub of every rumor: a big, tall, broad-shouldered woman with a loud laugh, a red headscarf (accent), sleeves rolled up over strong forearms speckled with little oil burns. Background: the orange glow of a frying cauldron with rising sparks. Warm orange rim light on the face, blue rim on the back.
```

**이그나시오** `ignacio` — 헌책 노점상 노인. 빛바랜 파란 우산 밑의 책 수레, 코끝에 걸친 반달 안경.
```text
Ignacio, the old secondhand-book seller: a lean old face bent over a book, half-moon reading glasses perched on the tip of his nose, catching a little warm light (accent), a cardigan. Background: the shade of a faded blue umbrella over blurred stacks of books. Warm cream rim light on the face, cool blue rim on the back.
```

**아우렐리오** `aurelio` — 쉰 살쯤, 자신이 익사한 왕의 손자라고 믿는 노숙인. 사자 갈기 같은 회색 수염, 어깨에 두른 좀먹은 자주색 벨벳 커튼, 정어리 통조림 상표를 오려 붙인 종이 왕관, 끝에 놋쇠 문손잡이를 박은 빗자루 자루.
```text
Aurelio, about 50, a homeless man who believes he is the drowned king's rightful heir: a grey lion's-mane beard and hair, a paper crown made of cut-and-pasted sardine-tin labels (accent: gold and red printed paper, no readable text), a moth-eaten purple velvet curtain worn as a royal mantle over his shoulders, a broom handle topped with a brass doorknob held like a scepter. Background: faded gold sunburst rays. Golden rim light on the face, violet rim on the back.
```

**그레고르 벨라스코** `gregor` — 여든 넘은 코뮌 참전 용사. 벤치에서 비둘기에게 모이를 준다. 해진 남색 피코트, 붉은 목도리, 가슴의 양철 훈장 하나.
```text
Gregor Velasco, 80s, veteran of the Commune who feeds pigeons on a bench: a deeply wrinkled face, a worn navy pea coat, a red scarf around his neck (accent), a single tin medal on his chest, a pigeon perched on his shoulder. Background: blue-grey estuary at dusk. Silver-white rim light on the face, warm tan rim on the back.
```

### 4-3. 붉은 닻 노조와 부두

**로사 이바라** `rosa` — 71세 위원장, "하구의 과부". 휠체어, 붉은 실의 뜨개질바늘, 강철 같은 의지.
```text
Rosa Ibarra, 71, chairwoman of the Red Anchor union, "the widow of the estuary": grey hair in a tight bun, small round glasses, a dark shawl, knitting needles with red yarn in her hands (accent), a jaw set like steel; the spoked wheel of her wheelchair shows at the lower left. Background: deep red with a warm glow. Warm peach rim light on the face, cool blue rim on the back.
```

**'황소' 마테오** `mateo` — 로사의 조카, 노조의 주먹. 대머리에 굵은 목, 어깨에서 터질 듯한 찢어진 노조 작업복, 이상하게 순한 눈. 어깨가 틀을 꽉 채운다.
```text
"The Bull" Mateo, the union's muscle: huge shoulders filling the frame, a bald head, a thick neck, a torn union work overall straining at the shoulders, a small red anchor badge on the strap (accent), and surprisingly gentle, moist eyes. Background: orange firelight from a burning oil drum. Hot orange rim light on the face, blue rim on the back.
```

**알론소 '시인'** `alonso` — 즉흥시를 읊는 마른 하역부. 콧수염, 귀에 꽂은 연필.
```text
Alonso "the Poet", a thin dockworker who improvises verses: a drooping mustache, a pencil tucked behind his ear (accent), a cigarette with a curl of smoke. Background: orange firelight. Warm rim light on the face, blue rim on the back.
```

**페페 '아홉 손가락'** `pepe` — 손가락 하나가 없는 음모론자. 불안한 눈.
```text
Pepe "Nine Fingers", a dockworker and conspiracy theorist: a black knit cap, sharp features, restless suspicious eyes, a cigarette held up near his face in a hand that is missing one finger (accent: the hand lit by the fire), a folded newspaper clipping in his pocket. Background: orange firelight. Warm rim light on the face, blue rim on the back.
```

**라우로 '졸음'** `lauro` — 가장 어리고 순진한 하역부. 곱슬머리, 졸린 눈.
```text
Lauro "Sleepy", the youngest and most naive dockworker: curly hair, half-closed sleepy eyes, mid-yawn, a scarf wound twice around his neck (accent). Background: dim, low firelight. Soft warm rim light on the face, blue rim on the back.
```

**시몬 '갈매기'** `simon` — 60대 크레인 기사. 시신을 매단 죄책감에 나흘째 술을 마신다. 마르고, 갈매기 부리 같은 매부리코, 흰 수염, 털실 모자, 기름에 전 작업복.
```text
Simon "the Gull", 60s, the crane operator haunted by guilt: thin, a sharp hooked nose like a gull's beak, a white beard, a navy wool knit cap (accent), grease-stained work clothes, tired red-rimmed eyes. Background: a dark window with the warm yellow frame of his tin guard hut. Warm rim light on the face, cold blue rim on the back.
```

**통조림 공장 여공** `worker`
```text
A cannery woman on strike: a headscarf tied at the nape, a blue kerchief at her neck (accent), rolled-up sleeves, a paintbrush for picket signs. Background: the warm amber glow of the cannery. Warm rim light on the face, blue rim on the back.
```

**늙은 어부** `fisher`
```text
An old fisherman: a knit cap, a thick grey beard, a clay pipe with smoke, an oilskin coat with the collar turned up (accent: its dull yellow). Background: blue-grey waves. Silver rim light on the face, warm tan rim on the back.
```

### 4-4. 그랜드 메리디안 호텔과 회색 까마귀

**아마데오 크루이프** `kruyf` — 31세 해운사 협상 대표. 병약하고 극도로 공손하며 미소를 잃지 않는다. 크림색 양복, 자로 잰 듯한 가르마의 금발, 무릎의 담요, 황동 새장 속 카나리아 "배당금". 출연진 가운데 배경이 밝은 유일한 인물이다.
```text
Amadeo Kruyf, 31, negotiator for the Halvar-Maris shipping company: pale and sickly, extremely polite, a faint fixed smile, blond hair with a ruler-straight side parting, a cream suit, a blanket over his knees; beside him a small brass birdcage with a bright yellow canary named "Dividend" (accent). Background: the pale green glass conservatory of the hotel with soft leaf silhouettes (the only light background in the cast). White rim light on the face, green rim on the back.
```

**무슈 필롱** `pilon` — 호텔 컨시어지. 완벽주의자, 속물, 비밀의 수호자. 대머리, 연필로 그은 듯한 콧수염, 목까지 채운 검은 연미복.
```text
Monsieur Pilon, the hotel concierge: bald, a pencil-thin mustache, a starched wing collar and a black tailcoat buttoned to the throat, chin raised in disdain, a small golden crossed-keys pin on the lapel (accent). Background: a gold Art Deco fan pattern. Pale gold rim light on the face, violet rim on the back.
```

**라스무센 대위** `rasmus` — 회색 까마귀 경비회사 지휘관, 전직 협약 해병, 원칙주의자 용병. 쉰 살쯤, 회색 코트, 회색 짧은 수염, 윗입술을 가로지르는 흰 흉터. 홍차에 레몬.
```text
Captain Rasmussen, about 50, commander of the Grey Crow security company, a former Accord marine and a man of principle: close-cropped grey hair, a short grey beard, a thin white scar across his upper lip, a grey coat with the collar raised, a small black crow emblem on the collar (accent). Background: cold grey venetian-blind stripes. Cool white rim light on the face, amber rim on the back.
```

**회색 까마귀 용병** `crow` — 짧게 깎은 머리, 넓은 어깨, 크고 흉터투성이인 손, 회색 코트.
```text
A Grey Crow mercenary: close-cropped hair, broad shoulders, a hard jaw, a grey coat with a small black crow emblem patch on the shoulder (accent), a big scarred hand at the collar. Background: charcoal venetian-blind stripes. Cool rim light on the face, rust-brown rim on the back.
```

### 4-5. 솔레아 주민

**체사르 드 코스타** `cesar` — 쉰 살쯤의 전당포 주인. 형사의 배지를 가지고 있다. 땀에 젖은 이마, 소매 고정 밴드, 금니 두 개, 거대한 코.
```text
César de Costa, about 50, the pawnbroker: heavy-set, balding with a few slicked strands, an enormous bulbous nose, two gold teeth catching the light in a grin (accent), beads of sweat on the forehead, sleeve garters on a cream shirt. Background: three golden pawnbroker's balls glowing softly on dark umber. Warm gold rim light on the face, blue rim on the back.
```

**리나 '주파수'** `lina` — 19세, 종탑에서 해적 방송 "라디오 레테"를 한다. 짧게 자른 검은 머리, 목에 건 커다란 헤드폰, 패치가 덕지덕지 붙은 군용 재킷, 손가락이 잘린 장갑, 입에 문 드라이버.
```text
Lina "Frequency", 19, the pirate DJ of Radio Lethe: short-cropped black hair, big headphones with red ear cups hanging around her neck (accent), a military jacket covered in patches, fingerless gloves, a screwdriver held between her teeth. Background: violet radio waves rippling out in concentric circles. Lilac rim light on the face, teal rim on the back.
```

**도냐 페르페투아** `perpetua` — 벌집의 생선 비늘 점쟁이. 아흔이 넘었다. 겹겹이 두른 숄, 우윳빛으로 먼 한쪽 눈.
```text
Doña Perpetua, the ancient fish-scale fortune teller of the Honeycomb, over ninety: layered shawls, a hooked nose and deep wrinkles, one milky blind eye that seems to glow faintly (accent), flakes of silver fish scale stuck to her fingertips, painted as small pale dabs. Background: a teal pattern of overlapping fish scales. Sea-green rim light on the face, warm gold rim on the back.
```

**로렌초 벨로소** `lorenzo` — 폐쇄된 등대에 사는 노인. 전설의 잿빛 왜가리를 40년째 찾는다. 키가 크고 말랐고 코가 크다. 해군 잉여품 외투, 아주 긴 회색 목도리, 눈에서 떼지 않는 쌍안경.
```text
Lorenzo Veloso, an old man who has searched for the legendary ash-grey heron for forty years: tall and thin, a big nose, a navy-surplus coat, a very long grey knitted scarf wound around his neck, heavy binoculars raised to his eyes (accent). Background: a violet dusk sky over the grey sea with the dark lantern of the lighthouse. Warm cream rim light on the face, blue-violet rim on the back.
```

**마리아 벨로소** `maria` — 로렌초의 아내. 회의적이지만 사랑한다. 둥근 안경, 짧게 자른 흰머리, 햇볕에 그을린 얼굴, 굵은 손가락 마디. 끝없이 긴 회색 목도리를 뜬다.
```text
María Veloso, Lorenzo's skeptical but loving wife: short-cropped white hair, round glasses, a sun-browned face, thick-knuckled hands of a woman who mended nets all her life, knitting needles with grey wool from an endlessly long grey scarf. Background: the warm yellow window of the lighthouse keeper's house with a blue frame and a red geranium (accent). Warm gold rim light on the face, blue rim on the back.
```

**이네스 이바라** `ines` — 24세 탱고 댄서. 보고서를 품고 조수 요새의 화약고에 숨어 있다. 키가 크고 말랐다. 원래 길었을 머리를 턱 아래에서 삐뚤빼뚤하게 잘랐다. 눈 밑이 검고 입술이 텄지만 서 있는 자세는 댄서다.
```text
Inés Ibarra, 24, a tango dancer hiding in the fort: tall and thin, dark hair hacked off unevenly just below the jaw, dark shadows under the eyes, chapped lips, a dancer's long straight neck; alert, frightened, determined. Background: darkness split by a thin vertical line of warm candlelight from a door left ajar (accent). Warm rim light on the face, blue-grey rim on the back.
```

### 4-6. 경비대와 협약

**발데스 경감** `valdes` — 9분서 반장. 주로 수화기 속의 목소리로 나오고, 결말에 얼굴을 보인다. 예순쯤, 크고 무겁고 피곤하다. 구겨진 트렌치코트, 입가의 꺼진 시가릴로, 계단 같은 눈 밑 주름.
```text
Commissioner Valdés, about 60, head of the 9th precinct, usually a voice on the telephone: big, heavy and tired, eye bags like stairs, a rumpled trench coat, an unlit cigarillo at the corner of his mouth, a black telephone receiver held to his ear (accent). Background: green-grey venetian-blind stripes of a precinct office. Pale green rim light on the face, amber rim on the back.
```

**필라르 경사** `pilar` — 쉰쯤의 여자, 분서 기록계. 짧은 회색 머리, 경사 계급장, 팔짱, 모든 것을 한 번에 보는 경찰의 눈.
```text
Sergeant Pilar, about 50, the precinct's record keeper: short grey hair, sergeant's stripes, arms crossed, a police officer's quick, all-seeing eyes, a pencil and a notebook in hand, a silver badge on her chest (accent). Background: blue-grey venetian blinds. Cool white rim light on the face, warm tan rim on the back.
```

**오리올 순경** `oriol` — 스물둘쯤의 신입. 너무 새 제복, 모자를 두 손으로 들고 있다.
```text
Constable Oriol, about 22, the new recruit: a boyish face, a brand-new uniform with a high collar, his cap held in both hands at his chest, its silver badge catching the light (accent). Background: blue-grey venetian blinds. Cool white rim light on the face, warm tan rim on the back.
```

**볼크 하사** `volk` — 협약 해안 순찰정 PB-7의 하사. 권태, 냉소. 단추 두 개를 푼 푸른 작업복, 얼굴에 덮었다가 조금 들어 올린 모자 밑의 지루한 회색 눈 하나.
```text
Sergeant Volk of the Accord coastal patrol boat PB-7, bored and cynical: a blue Accord work uniform with two buttons undone, a navy cap tipped low over his face and lifted just enough to show one bored grey eye, a small gold emblem on the cap (accent). Background: grey sea and dusk. Cool blue rim light on the face, amber rim on the back.
```

---

## 5. (선택) 소품·증거물 카드

지금 게임은 소지품을 글과 기호로만 보여 준다. 아래 그림은 **아직 게임에 들어갈 자리가 없다.** 소지품 창에 그림을 붙이려면 코드를 조금 고쳐야 한다. 같은 화풍의 소품 그림을 모아 두고 싶을 때 쓴다. 첨부: ① `key_art.png`

틀(모든 카드의 앞머리):

```text
OBJECT CARD — Tango Lethe style. Square 1:1. A single object on a dark charcoal background with soft haze, lit like evidence under one warm lamp from the upper left, with a thin cool rim light from the right and a soft shadow beneath. Moody neo-noir illustration like the attached key art: simplified planes, soft brushy edges, dry speckled print grain, matte. No text, no border.
```

| 아이템 | 설명 (틀 뒤에 붙인다) |
|---|---|
| 콤비 구두 `shoe_right` | `A single men's two-tone spectator shoe: white leather with a brown toe cap and heel, a thin leather sole dusted with rosin, laces loose.` |
| 초록 벨벳 재킷 `jacket_velvet` | `A dark green velvet jacket draped over a chair back, the nap catching the light in waves.` |
| 앵무새 셔츠 `shirt_silk` | `A loud silk shirt with emerald parrots flying over a vermilion jungle print and a wide collar, slightly crumpled, two buttons missing.` |
| 라븐 7.65mm 리볼버 `gun_ravn` | `An old small police-issue revolver with worn bluing and a wooden grip, lying on its side.` |
| 경비대 배지 `badge` | `A tarnished Citizen Watch police badge on a leather wallet, a pawn ticket tied to it with string.` |
| 4번 크레인 보고서 `ev_report` | `A typed insurance report in a stained folder wrapped in oiled cloth, pages clipped, official stamps, one torn corner.` |
| 탱고 강습 카드 `ev_lesson_card` | `A small printed tango lesson punch card with stamped holes and a pressed dried flower.` |
| 타르와 깃털 `ev_tar` | `A lump of black roof tar with a grey pigeon feather stuck in it, on a scrap of paper.` |
| 305호 열쇠 `hotel_key` | `A heavy brass hotel room key on a large brass tag engraved with the number 305.` |
| 종이 왕관 `crown_paper` | `A paper crown cut from sardine-tin labels (little printed fish, no readable text), slightly crushed.` |
| 녹음테이프 `ev_tape` | `A small reel-to-reel audio tape in a scuffed case, a blank label strip.` |
| 거대한 잿빛 깃털 `ev_feather` | `A single enormous ash-grey heron feather, longer than a hand, perfectly still.` |

---

## 6. 잘 안 될 때

| 증상 | 이어서 보낼 말 |
|---|---|
| 번들거린다, 사실적이다, 사진이나 3D 같다 | `Less rendered, more like image 1: flatter shapes, more of the forms in near-black silhouette, fewer details, keep the dry grain. Matte, no glossy or wet surfaces.` |
| 너무 어둡다, 빛이 닿는 범위가 좁다 | `Keep it a night scene, but let every light spread wider and softer over its surroundings, and lift the deepest shadows a little so the shapes in them read.` |
| 밤인데 너무 밝다 | `Darker overall: keep only the named lights and let everything else fall into readable indigo shadow.` |
| 옛 코드 그림처럼 매끈하다 | `Repaint image 2's shapes in image 1's look: faint painted modeling in the shadows, haze, speckled grain. Keep only the positions.` |
| 키 아트와 화풍이 다르다 | 키 아트를 다시 첨부하고 `Match image 1's palette handling, rim lights, haze, grain and level of detail exactly.` |
| 구도가 바뀌었다 | `Match the layout of image 2: same horizon height, same vanishing point, same positions of the lights.` 광원이 조금 옮겨진 것은 `snap`이 맞추니 괜찮다. |
| 광원이 아예 없다(촛불·등이 빠졌다) | `Keep everything the same, but add the <lamp/candles> at about x≈…%, y≈…%.` 없으면 `snap`이 찾지 못한다. |
| 사람 얼굴이 자세히 나왔다 | `Make all people faceless silhouettes with only a thin rim light.` |
| 한글이나 영문이 깨졌다 | `Remove all lettering; leave the signboards blank.` |
| 오른쪽 3분의 1이 복잡하다 | `Keep the right third calmer and darker; the main subject stays in the left 60%.` |
| 낮 그림에 해가 쨍하다 | `Make it overcast: no sunlight or hard shadows, a pale fog-grey sky.` |
| 초상이 옆모습이 아니다, 반대쪽을 본다 | `Strict side profile, facing right, like image 1.` |
| 초상마다 머리 크기가 다르다 | 형사 초상을 첨부하고 `Same head size and position in the frame as image 1.` |
| 편집을 거듭할수록 매끈해진다 | 원래 프롬프트에 바꿀 점을 넣어 새 대화에서 다시 만든다(0-1). |

게임에 넣은 뒤에는 늘 `snap`과 `preview`로 광원이 노란 원 안에 있는지 확인한다(0-5).

---

## 7. 이번 판에서 바뀐 것 (검토 요약)

옛 판(평면 무대 조명 양식)의 프롬프트로 그리면 반들반들하고, 젖어 비치고, 사실적으로 나왔다. 검토에서 찾은 것과 고친 것이다.

**화풍과 낱말**
- 매체가 `2D digital illustration`, `soft airbrushed gradients`여서 모델의 기본값인 매끈한 디지털 그림이 나왔다. → 확정한 키 아트의 화풍(네오 누아르, 실루엣, 가는 테두리 빛, 마른 인쇄 질감, 무광)으로 바꿨다.
- `wet floors`, `long reflections`, `puddles`, `mirror-polished`, `mirrors the sky`, `glints`, `sparkle`처럼 젖음과 반사를 직접 주문했다. → 모두 뺐다. 본문에 반사가 꼭 있는 곳(호텔 바닥, 개펄, 교회 빗물)은 "흐린 메아리"로만 그린다.
- `volumetric shafts`, `bokeh`, `soft-focus`, `Same lens`, `paper-and-film grain` 같은 사진·3D 용어와 모든 장면의 `much richer detail`이 사실감을 불렀다. → 뺐다. 그레인과 깜빡임은 게임이 따로 얹는다.
- 키 아트가 "조금 어둡다"는 의견을 반영해, 스타일 바이블에 광원마다 빛이 넓고 부드럽게 퍼지고 그림자 속 형체가 읽히도록 적었다. 키 아트를 밝게 다듬는 편집도 넣었다(2-1).

**레퍼런스 사슬, 프로젝트 지침, 첨부**
- 화풍 기준을 코드로 그린 벡터 그림에서 가져오는 사슬이었다. 그 매끈함이 키 아트로, 키 아트에서 모든 그림으로 옮았다. → 첨부 ①은 늘 확정한 기준 그림(`key_art`, `day_ref`, `style_you`)이고, 방금 만든 그림을 화풍 기준으로 넘기지 않는다.
- 스타일 시트(옛 2-2)는 격자와 이름표가 결과에 새어 들어올 수 있고 키 아트와 겹쳐 뺐다.
- 밤을 먼저 새로 그리고, 낮과 변형은 편집으로 만든다. 편집은 두 번까지, 편집할 그림이 마지막 그림이 아니면 다시 첨부한다.
- 프로젝트 지침의 옛 스타일 바이블이 모든 대화를 옛 화풍으로 끌고 갔다. → 지침을 통째로 바꾸고, 메모리를 확인한다(0-2).
- 초상에 지금의 코드 초상을 첨부하지 않는다. 틀이 달라 헷갈리게 하고 매끈함이 옮는다.

**좌표와 광원**
- 프롬프트 좌표가 게임 규격(16:9)인데 ChatGPT는 3:2로 그려 세로가 어긋났다. → 모든 좌표를 3:2로 바꾸고, 3:2 구도 기준 그림(`docs/art-ref/layout/`)을 만들었다.
- "구도를 지키면 광원이 맞는다"는 전제가 틀렸다. 키 아트도 구도 기준을 줬는데 광원이 몇 % 옮겨졌다. → `import.mjs snap`으로 넣은 뒤 광원을 맞춘다. 이 방식으로 타이틀을 넣었다.
- 미리보기가 타이틀에도 오른쪽 글 칸을 그렸다(타이틀은 왼쪽이 제목·메뉴). → 고쳤다.

**본문과 어긋난 것 (장면)**
- 타이틀: 붉은 등이 "탑 꼭대기"라고 적혀 있었다(실제는 지브 끝). 없는 "먼 등대"와 빗줄기도 빠졌다.
- 7호실: 벽지는 포도주색이고, 립스틱 글씨는 "아침을 폐지한다 — 밤의 대통령"이다("잊지 마"는 수첩의 글이다). 벽의 주먹 구멍, 욕조 물에 뜬 재킷, 스탠드 갓의 빨간 넥타이를 넣었다. 본문에 없는 내려놓은 수화기를 뺐다(형사는 아래층 전화 부스에서 걸었다).
- 뒷마당: 고양이는 마른 검은 고양이가 아니라 귀 반쪽과 한쪽 눈을 잃은 커다란 회갈색 줄무늬 수고양이다.
- 크레인: 시신은 회색 양복이다. 추모비는 4번 크레인의 부러진 다리와 이름 여섯의 나무판이다. "7"은 운전실이 아니라 초소 문에 있다.
- 옥상: 조사해야 나오는 단서(탱고 구두)와 본문에 없는 와인 잔을 뺐다. 왼쪽의 먼 불빛은 꺼진 등대가 아니라 요새의 등표다.
- 요새: 깨진 문장과 X 그은 청동판은 정문 아치에 있고, 화약고는 흙 덮인 반지하 돌집이다.
- 방파제: 등대 집(흰 벽, 푸른 창틀, 제라늄, 그물과 부표)과 낮의 사람들(뜨개질하는 노부인, 낚시하는 하사)을 넣었다.

**본문과 어긋난 것 (초상)**
- 형사: 본문의 두꺼운 말굽 콧수염이 빠져 있었다.
- 윤 경위: 검은 가죽 재킷 → 갈색 가죽 비행 재킷, 이마 위의 오토바이 고글, 턱의 흉터.
- 에밀: 콧수염·나비넥타이 → 둥근 철테 안경, 걷은 소매, 검은 조끼.
- 마르가리타: 목의 스카프 → 붉은 두건, 덩치 큰 체구. 이그나시오: 둥근 안경의 중년 → 반달 안경의 노인.
- 아우렐리오: 금칠에 유리 보석 왕관과 군용 외투 → 정어리 통조림 상표 왕관, 자주색 벨벳 커튼, 문손잡이 지팡이, 사자 갈기 수염.
- 그레고르: 중절모와 넥타이 → 남색 피코트, 붉은 목도리, 양철 훈장.
- 마테오: 짧은 머리 → 대머리. 라우로: 헌팅캡 → 곱슬머리. 시몬: 흰 수염, 갈매기 부리 같은 코. 파코: 중절모 → 백발.
- 보보: 헌팅캡과 장난감 망원경 → 너무 큰 선원 모자, 붉은 완장, 나무칼.
- 크루이프: 손가락 위 카나리아와 금테 안경 → 크림색 양복, 자로 잰 가르마의 금발, 황동 새장.
- 라스무센: 챙 모자와 담배 → 회색 짧은 수염, 윗입술의 흰 흉터. 용병: 베레모와 선글라스를 뺐다.
- 리나: 검은 터틀넥과 마이크 → 패치 붙은 군용 재킷, 목에 건 헤드폰, 손가락 없는 장갑, 입에 문 드라이버.
- 로렌초: 흰 수염과 어부 스웨터 → 키 크고 마른 체구, 큰 코, 해군 잉여품 외투, 아주 긴 회색 목도리. 배경의 "등대 불빛"을 뺐다(등롱은 꺼져 있다).
- 마리아: 틀어 올린 머리와 붉은 실 → 짧은 흰머리, 둥근 안경, 회색 털실(남편의 긴 목도리).
- 이네스: 긴 머리와 진홍 스카프 → 턱 아래에서 삐뚤빼뚤 자른 머리(스카프는 무도장 분실물이다).
- 발데스: 콧수염과 담배 → 크고 피곤한 체구, 꺼진 시가릴로. 필라르: 쪽 찐 머리 → 짧은 회색 머리, 기록계. 오리올: 모자를 두 손으로 든다. 볼크: 높은 깃 제복 → 단추 푼 푸른 작업복.

**더한 것**
- 부두 거리와 옥상의 시신 변형(3-17, 선택). 본문은 시신이 거리 어디서든 보인다고 하고, 옥상은 시신을 내리기 전에도 올라갈 수 있다. 게임 코드는 이미 그 그림을 찾아 쓰게 되어 있다.
- `import.mjs`의 `snap`(광원 맞추기), `guide`(3:2 구도 기준 만들기), 새 변형 열쇠 자동 추가.
