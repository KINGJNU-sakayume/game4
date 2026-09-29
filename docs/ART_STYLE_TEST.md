# 탱고 레테 — 화풍 고르기: 타이틀 그림으로 하는 시험

`ART_PROMPTS.md`의 프롬프트로 그리면 그림이 반들반들하고, 젖어서 비치고, 사실적으로 나온다. 그 문서를 고치기 전에 **어떤 화풍으로 갈지부터 정한다.** 같은 타이틀 그림(지금의 `assets/scenes/title.webp` 구도)을 화풍만 바꿔 여러 장 만들고, 나란히 놓고 비교한다.

전체 순서

1. **화풍 고르기 — 이 문서.** 1라운드: 후보 10장 → 2라운드: 상위 2~3개를 변주하고 낮 장면·초상에도 써 본다 → 3라운드: 한 장을 확정한다. 확정한 그림이 새 키 아트, 곧 모든 그림의 화풍 기준이 된다.
2. `ART_PROMPTS.md` 비판적 검토: 레퍼런스 사슬, 프로젝트 지침과 파일, 프롬프트, 첨부.
3. `ART_PROMPTS.md`를 고른 화풍으로 고쳐 쓰고, 검토에 따라 더하고 고치고 뺀다.

`ART_PROMPTS.md`는 3단계까지 그대로 둔다. 프롬프트 본문은 영어로, 설명은 한국어로 적었다.

---

## 0. 옛 프롬프트와 무엇이 다른가

반들반들·젖음·사실감의 원인으로 보이는 것과, 이 시험에서 바꾼 것이다. 자세한 검토는 2단계에서 한다.

| 옛 프롬프트 | 왜 그렇게 나오나 | 이 시험에서는 |
|---|---|---|
| `2D digital illustration`, `soft airbrushed gradients`, `painterly-flat` | 매체가 "디지털"이고, 에어브러시는 매끈한 그라데이션 그 자체다. 붓·물감·종이가 한 번도 나오지 않으니 모델은 자기 기본값인 매끈한 디지털 일러스트로 간다. | 화풍마다 물리적 매체(유화·과슈·목탄·판화…), 붓 크기, 바탕 재질을 적고 **무광**을 못박았다. |
| `wet floors`, `long reflections`, `wet cobblestones`, `puddles`, `mirror-polished`, `mirrors the sky`, `glints`, `sparkle`, `drizzle streaks` | 젖은 반사와 반짝임을 직접 주문한다. 게다가 타이틀에는 게임이 비를 애니메이션으로 덧그린다. | 젖음·물웅덩이·거울 반사·빗줄기를 모두 뺐다. 빛은 "물감(재료)으로 칠한 더 밝은 자국"으로만 적었다. |
| `volumetric shafts`, `rim light`, `soft cones`, `bokeh`, `soft-focus`, `Same lens`, `paper-and-film grain` | 3D 렌더와 사진·영화 촬영 용어다. 쓸수록 사진처럼 된다. 게다가 광원 자리의 깜빡이는 빛 번짐과 필름 그레인은 게임이 그림 위에 따로 얹는다(`src/js/art.js`, `style.css`의 `.grain`). | 조명·렌즈 용어를 쓰지 않았다. |
| 모든 장면의 `much richer detail`, 녹 조각·물 얼룩·벗겨진 칠 목록 | 세밀하게 그릴수록 사실적으로 보인다. | "큰 형태 먼저, 세부는 암시만"과 크기 단서(60×40cm 캔버스, 큰 붓)를 넣었다. |
| `NOT photorealistic, NOT a 3D render`, `Avoid: photorealism, glossy CGI` | 무엇이 아닌지는 있는데 무엇인지가 약하다. | 매체와 붓질을 앞에 길게, 금지는 끝에 짧게 두었다. |
| 지금 그림(코드로 그린 벡터 그림)을 구도 기준으로 첨부 | 매끈한 면, 빛 번짐, 가는 테두리 빛이 그대로 옮는다. 그렇게 나온 키 아트가 다시 모든 그림의 화풍 기준이 되니 광택이 사슬 전체로 퍼진다. | "구도만 쓰고 그리는 법은 버려라"를 구체적으로 적었다. 그래도 옮으면 첨부 없이 해 본다(1장의 7). |
| 좌표는 게임 규격(16:9) 기준인데 ChatGPT는 3:2로 그린다 | 세로 좌표가 어긋난다. 붉은 등의 세로 14%는 3:2 그림에서 20%다. | 3:2로 늘린 구도 기준 그림과 3:2 좌표를 쓴다. |
| 키 아트 프롬프트의 `at the top of its tower`, `a distant lighthouse`, 가로등 `under` | 지금 그림과 다르다. 붉은 등은 탑 꼭대기가 아니라 지브 끝에 있고, 남자는 가로등 아래가 아니라 오른쪽에 서 있고, 등대는 없다. | 지금 그림에 맞게 고쳤다. |

---

## 1. 준비

1. **깨끗한 곳에서 한다.** 옛 스타일 바이블을 지침에 넣은 "탱고 레테 그림" 프로젝트 안에서 하면 모든 시험이 옛 화풍으로 끌려간다. 프로젝트 밖의 새 대화에서 한다. 메모리나 이전 대화 참조가 켜져 있으면 옛 대화의 화풍이 끼어들 수 있으니 끄거나 임시 대화를 쓴다.
2. **화풍 하나 = 새 대화 하나.** 한 대화에서 이어 만들면 앞 그림의 화풍이 다음 그림에 섞인다.
3. **첨부는 한 장:** [`docs/art-ref/title_layout.png`](art-ref/title_layout.png). 지금의 타이틀을 ChatGPT의 가로 크기(3:2, 1536×1024)로 늘린 구도 기준 그림이다. 가운데 16:9는 `title.webp` 그대로이고 위아래 8% 띠만 이어 칠했다. 그래서 결과를 게임 규격으로 자르면 광원 자리가 `assets/art.json`과 맞는다.
4. 2장의 프롬프트 하나를 통째로 복사해 붙이고, 그림을 첨부해 보낸다.
5. **1라운드에서는 고치지 않는다.** 첫 결과를 그대로 평가한다. 화풍이 아예 안 나왔을 때만(예: 또 매끈한 디지털 그림) 한 번 다시 만들고, 몇 번째 것인지 적어 둔다.
6. 내려받아 `title_A1.png`처럼 후보 번호로 이름을 붙인다.
7. 구도는 맞는데 옛 그림의 벡터 느낌(매끈한 면, 빛 번짐, 가는 테두리 빛)이 따라오면 같은 대화에서 이어서 보낸다.
   ```text
   This still looks like the flat vector mock-up. Make it again from scratch in the medium described, with its brushwork and texture clearly visible. Keep only the positions of things.
   ```
   그래도 안 되면 새 대화에서 **첨부 없이** 보낸다. 이때는 프롬프트의 `LAYOUT:` 문단을 지운다. 구도는 덜 맞지만 옛 그림의 느낌은 따라오지 않는다.
8. 매달린 사람 때문에 거절되면 `SCENE:`의 둘째 줄(`From the jib tip…`)을 지우고 보낸 뒤, 같은 대화에서 이렇게 더한다.
   ```text
   Keep everything exactly the same. Add a small dark silhouette of a man hanging from the cable at the jib tip, far away, not graphic.
   ```

---

## 2. 1라운드 — 후보 10장

장면·구도·마무리 규칙은 열 장이 모두 같고 `STYLE:` 문단만 다르다. 그래서 결과의 차이는 곧 화풍의 차이다. `LAYOUT` `SCENE` `TREATMENT`를 고칠 일이 생기면 열 개를 모두 같이 고친다.

| 번호 | 화풍 | 거칠기 | 한 줄 |
|---|---|---|---|
| A1 | 표현주의 유화 스케치 | ●●●○ | 큰 돼지털 붓, 캔버스 결, 밑칠이 비친다. 디스코 엘리시움의 그림과 가장 가까운 쪽 |
| A2 | 두꺼운 물감·나이프 | ●●●● | 나이프로 바른 두꺼운 물감 판. 가까이서는 추상, 멀리서는 풍경 |
| A3 | 무거운 산업 도시 유화 | ●●●○ | 굵은 윤곽, 긁고 문질러 상처 난 표면, 흙빛. 파업 중인 항구에 맞는다 |
| A4 | 과슈 | ●●○○ | 무광 불투명 물감, 마른 붓 가장자리. 지금의 평면 느낌을 손그림으로 |
| A5 | 격한 표현주의 | ●●●● | 소용돌이 붓질, 휘는 형태, 자연을 넘어선 색. 거칠기의 끝을 본다 |
| B1 | 목탄·파스텔 | ●●●○ | 회색 종이 위의 목탄 덩어리와 분필. 완전히 마른 무광 |
| B2 | 3색 리놀륨 판화 | ●●●○ | 검정·진홍·황토, 조각칼 자국, 손으로 찍은 얼룩 |
| C1 | 토널리즘 녹턴 | ●○○○ | 얇은 물감, 안개 같은 한 가지 색. "부드러운 회화"와 견주어 본다 |
| C2 | 무광 실크스크린 포스터 | ●○○○ | 그라데이션 없는 평면 잉크. 옛 방향에서 광택만 뺀 것 |
| C3 | 잉크 선과 수채 | ●●○○ | 빠른 펜 선과 번지는 물. 선이 있는 그림을 좋아하는지 본다 |

A는 거친 회화, B는 마른 재료와 판화, C는 대조군이다. 대조군은 무엇이 싫은지 확인하는 데 쓴다. 하루 생성 한도가 걸리면 A1–A5, B1, C2부터 한다.

각 화풍 아래의 **볼 것**은 그 화풍이 제대로 나왔는지 보는 기준이고, **게임 전체로**는 이 화풍으로 장면 34장과 초상 32장을 그릴 때의 걱정거리, **찾아볼 것**은 그 화풍의 실제 그림을 찾아볼 검색어다. 프롬프트에 든 화가 이름은 방향을 잡는 손잡이일 뿐이다(모두 세상을 떠난 화가다). 결과가 그 화가의 특정 그림을 베낀 것 같으면 이름을 지우고 다시 한다.

### A1. 표현주의 유화 스케치

- **볼 것:** 붓자국이 보이는가, 캔버스 결과 밑칠이 비치는가. 그런데도 크레인·달·매달린 사람·서 있는 사람이 한눈에 읽히는가.
- **게임 전체로:** 낮·밤·실내·초상 모두 무리가 없다. 초상이 작아지면 뭉개질 수 있어 실루엣을 또렷하게 지켜야 한다.
- **찾아볼 것:** 디스코 엘리시움의 배경 그림, `nocturne oil sketch`

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — expressive oil sketch: a quick, confident oil painting on coarse linen canvas, about 60 × 40 cm, painted with large hog-bristle brushes. Every form is built from visible, directional brushstrokes. Thin, scumbled passages let the canvas weave and a warm reddish-brown underpainting show through; the paint is thicker only in the lights. Edges are loose and melt into the dark. Muted, slightly dirty colors (slate teal, ink blue, grey-violet, rust, bone white), with warm notes only in the lamp and the neon. The feeling of a painter's oil study made on the spot at night: rough, human-made, melancholic.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### A2. 두꺼운 물감·나이프

- **볼 것:** 물감 판이 두껍게 보이는가(번들거림 없이), 달이 물감 덩어리로 보이는가, 멀리서 보면 장면이 읽히는가.
- **게임 전체로:** 풍경과 타이틀에는 강하다. 물건이 가득한 실내(전당포·통조림 공장)와 단서가 되는 작은 소품은 뭉개진다. 초상은 색면 조각이 되어 108×135px에서 누구인지 가리기 어려울 수 있다.
- **찾아볼 것:** Nicolas de Staël `Le Lavandou`, Kyffin Williams

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — heavy impasto, palette knife: an oil painting laid on thickly with a palette knife. The scene is broken into chunky, flat planes of paint with ridged edges: the sky is built from broad scraped slabs of deep blue, violet and grey; the moon is one thick disc of creamy off-white; the cranes are a few hard dark knife edges; the quay is short horizontal knife strokes of warm grey and umber. Almost abstract up close, clearly readable from a distance. Show it as a flat, evenly lit scan of the canvas, so the texture reads through color and broken edges, with no shine on the ridges. In the tradition of mid-century knife painters such as Nicolas de Staël.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### A3. 무거운 산업 도시 유화

- **볼 것:** 굵은 윤곽, 긁힌 표면, 무거운 덩어리감. 너무 어두워서 형체가 사라지지는 않는가.
- **게임 전체로:** 부두·크레인·통조림 공장·요새에 잘 맞는다. 무도장·호텔처럼 화려하거나 따뜻해야 하는 곳과 낮 장면이 모두 우중충해질 수 있다.
- **찾아볼 것:** Mario Sironi `Paesaggio urbano`

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — somber industrial city painting: a heavy oil painting like the Italian urban landscapes of the 1920s–40s (Mario Sironi): massive, simplified, almost architectural forms; thick dark contours drawn with the brush; paint scraped back, rubbed and repainted until the surface is scarred and uneven. An earthy, muddy palette of umber, soot black, lead grey, dull ochre and rust; the night sky is a heavy blue-grey rather than pure black. Silent, weighty, grave.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### A4. 과슈

- **볼 것:** 무광이고 분필 같은가, 붓자국과 마른 가장자리가 보이는가, 다시 매끈한 디지털 그림으로 돌아가지 않았는가.
- **게임 전체로:** 가장 두루 쓰기 쉽다. 물건이 많은 장면, 작은 초상, 낮과 밤이 모두 된다. 대신 거친 회화보다는 얌전하다.
- **찾아볼 것:** Mary Blair gouache, `1950s gouache illustration`

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — gouache: an opaque gouache painting on rough watercolor paper. Matte, chalky, flat areas of color, each laid in with a visible brush; dry-brush edges where the paper texture breaks up the paint; small streaks, overlaps and corrections left in. Changes of tone are made with brushwork and layers of paint, not smooth gradients. Simplified mid-century shapes, like a hand-painted animation background or a 1950s book illustration. A limited palette: ink blue, dusty teal, charcoal, off-white, one warm amber, one crimson.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### A5. 격한 표현주의

- **볼 것:** 형태가 감정으로 휘는 정도가 견딜 만한가, 색이 너무 시끄럽지 않은가. "이만큼은 싫다"는 선을 긋는 데에도 쓴다.
- **게임 전체로:** 타이틀·꿈·죽음 장면에는 강렬하다. 34장이 모두 이러면 지치고, 단서가 읽히지 않고, 초상이 괴기스러워질 수 있다.
- **찾아볼 것:** Chaim Soutine landscapes, Ernst Ludwig Kirchner street scenes

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — raw expressionism: an urgent expressionist oil painting. Swirling, jabbing brushstrokes; forms lean and warp with emotion: the crane bends a little, the sky churns in rings around the moon, the quay tilts. Thick dark outlines in places; paint laid on thick and fast, dragged and smeared. Colors pushed beyond nature: deep cobalt and acid green in the night sky, a sickly yellow-white moon, blood red where the neon falls, a hot orange lamp. In the tradition of Chaim Soutine and the German Expressionists.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### B1. 목탄·파스텔

- **볼 것:** 종이 결과 번진 목탄, 지우개로 들어낸 흰 자리. 완전히 마른 느낌인가.
- **게임 전체로:** 밤·안개·개펄에 아주 잘 맞는다. 색이 거의 없으니 낮 장면과, 색이 곧 이름표인 것들(앵무새 셔츠, 초록 벨벳, 붉은 네온)이 약해진다.
- **찾아볼 것:** Käthe Kollwitz charcoal drawings, Degas pastel

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — charcoal and pastel: a drawing in compressed charcoal and soft pastel on mid-grey paper with a coarse tooth. The night is built from big smudged masses of black charcoal rubbed in with the fingers; the paper grain shows through everywhere; the moon and the highlights are laid in with white and cream chalk and partly lifted out with an eraser. Only a few touches of color: red pastel for the warning light and the neon, amber for the lamp. Rough hatching, smudges and dust; completely dry and matte. In the tradition of Käthe Kollwitz's charcoal drawings.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### B2. 3색 리놀륨 판화

- **볼 것:** 조각칼 자국이 살아 있는가, 세 가지 색만 썼는가, 손으로 찍은 얼룩과 어긋남이 있는가.
- **게임 전체로:** 타이틀과 소품 카드에는 멋지다. 세 가지 색으로는 낮·밤·해질녘과 여러 광원 색을 가르기 어렵고, 물건이 많으면 복잡해진다.
- **찾아볼 것:** Frans Masereel `The City` (`La Ville`)

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — three-color linocut: a hand-printed relief print in three inks (black, deep crimson and muted ochre) on cream paper, printed full-bleed; the moon is the bare cream paper. Everything is made of carved gouge marks: long parallel cuts for the sky and the water, curved cuts ringing the moon, rough chiseled edges on the cranes and the figures. Flat ink with the uneven coverage of hand printing (speckles where the paper shows through) and slightly misregistered colors. Bold, graphic, rough. In the tradition of Frans Masereel's woodcut novels.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### C1. 토널리즘 녹턴

- **볼 것:** 안개 속에 녹아드는 부드러운 형태. 이것이 가장 좋다면 "거친 것"보다 "조용한 것"을 좋아하는 것이다.
- **게임 전체로:** 밤바다·개펄·방파제에는 아름답다. 단서가 많은 실내는 그릴 수 없고, 모든 장면이 비슷해진다.
- **찾아볼 것:** Whistler `Nocturne: Blue and Gold – Old Battersea Bridge`

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — tonalist nocturne: a quiet night painting in thin oil washes, in the manner of Whistler's harbor nocturnes. Almost the whole picture is one misty blue-grey-green tone; the paint is so thin it looks close to watercolor; forms dissolve into the night air with soft edges and almost no detail; the moon is a pale smudge; the lights are small dabs of dull gold and a whisper of red. Still, minimal, matte, hushed.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### C2. 무광 실크스크린 포스터

- **볼 것:** 옛 결과에서 광택과 그라데이션만 빠지면 괜찮은가. 괜찮다면 문제는 평면이 아니라 광택이었다.
- **게임 전체로:** 가장 일관되게 뽑힌다. 지금 게임의 코드 그림과도 이어진다. 다만 거친 회화와는 거리가 멀다.
- **찾아볼 것:** `1950s screenprint travel poster`

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — flat screenprint poster: a mid-century screenprint in five flat inks (navy, slate teal, charcoal, cream and crimson, plus one small touch of amber) on off-white paper, printed full-bleed, without any lettering. Crisp flat shapes with no gradients at all; tone comes only from overlapping inks and a coarse halftone dot; slight misregistration, uneven ink and visible paper grain. Graphic and simple, like a 1950s travel or theater poster.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

### C3. 잉크 선과 수채

- **볼 것:** 선이 있으면 좋은가 싫은가. 옛 스타일 바이블은 윤곽선을 금지했다(`NOT comic-inked`, `no ink outlines`).
- **게임 전체로:** 물건과 단서, 인물의 특징을 가장 잘 그린다. 만화처럼 보일 수 있고, 밤 장면은 물감을 여러 번 겹쳐야 어두워진다.
- **찾아볼 것:** Hugo Pratt watercolors

```text
Create an image for the title screen of a melancholic detective game, made in the medium described below. Landscape 3:2 (1536×1024).

STYLE — ink and watercolor: a loose pen-and-brush ink drawing with watercolor washes on cold-press paper, like the watercolors of 1970s European adventure comics (Hugo Pratt): quick, confident black ink lines and solid black shadows; watery washes of indigo, grey and sepia that bloom and bleed into each other; the moon is bare white paper; a touch of red and amber. Sketchy, atmospheric, hand-made. One single picture: no comic panels, no speech balloons.

LAYOUT: The attached image is a rough layout mock-up made of flat vector shapes. Use it ONLY for the composition: keep the same camera and horizon height, and the same positions and sizes of the big crane, the moon, the hanging figure, the street lamp and the standing man. Do not copy the way it is drawn (no clean vector edges, no smooth gradients, no glowing outlines); make everything again from scratch in the medium above.

SCENE: Night in a decaying 1950s Southern European harbor, seen at eye level from an old stone quay.
- The big crane is a tall lattice-steel dock crane with its tower on the right (about 81% across). Its long jib slants up to the LEFT, passes in front of the moon, and ends at about 51% across and 20% down, with one small red warning light at the tip.
- From the jib tip a single cable drops straight down; on it hangs the small dark figure of a man, far away, only a silhouette (about 30–40% down). Quiet, not graphic.
- A large pale full moon behind the jib, centered about 69% across and 31% down.
- Two smaller, fainter cranes: one far out near the center, one cut off by the right edge.
- The far shore is a low dark line a little below the middle (about 58% down) with a sprinkle of tiny lights. Dark water lies between it and the quay, with a few broken marks of moonlight on it.
- Foreground: an old cobbled quay. One old iron street lamp, its lamp at about 60% across and 66% down, makes a small warm pool of light on the ground.
- Just right of the lamp, a lone man stands with his back to us, looking up at the hanging figure: broad and slightly stooped, in a rumpled jacket and wide flared trousers, hands in his pockets, hair unruly (about 64% across, from 66% to 87% down).
- A faint crimson light from a neon sign beyond the left edge (about 47% down) tints the left side.
- The left 40% of the picture stays dark, calm and empty: the game's title and menu will sit there.
- Keep everything important out of the top and bottom 8%; they will be cropped to 16:9.

TREATMENT: A hand-made picture in the medium above — not a photograph, not a 3D render, not a smooth digital illustration. Everything is matte: no wet sheen, no puddles, no mirror reflections, no glossy highlights, no falling rain. Light is shown only with the medium itself, as lighter marks of color, never as digital glow, bloom, lens flare or light beams. Simplify: big shapes first, details only suggested; no individually drawn cobblestones, no craters on the moon, no rivets, no precise lattice drawing. The people are simple dark shapes without faces. No text, letters, signature, frame or border; the picture fills the frame edge to edge.
```

---

## 3. 비교하기

1. 열 장을 한 폴더에 모아 같은 크기로 나란히 본다. 10초 안에 끌리는 세 장을 먼저 고른다. 첫인상이다.
2. 한 장씩 크게 보고, 가로 300px쯤으로 줄여서도 본다. 줄여도 크레인·달·매달린 사람·서 있는 사람이 읽혀야 한다. 게임의 초상은 108×135px로 보인다는 것도 떠올린다.
3. (선택) 게임 규격으로 잘라 본다.
   ```bash
   node tools/art/import.mjs preview title ~/Downloads/title_A1.png
   ```
   `tools/art/out/preview_title_A1.png`에 16:9로 자른 그림과 함께 깜빡이는 광원 자리(노란 원), 제목과 메뉴가 놓이는 왼쪽 어둠, 휴대폰 타이틀 화면에서 보이는 세로 띠(파란 점선)가 그려진다. 후보마다 다른 파일로 저장된다.
4. (선택) 게임 안에서 본다. 비·그레인·깜빡임·제목 글자까지 얹힌 진짜 타이틀 화면이다.
   ```bash
   node tools/art/import.mjs scene title ~/Downloads/title_A1.png    # assets/scenes/title.webp 를 덮어쓴다
   npm run build                                                    # 그다음 index.html 을 브라우저로 연다
   git checkout assets/scenes/title.webp dist/tango-lethe.html      # 다 본 뒤 되돌린다
   ```
5. 아래 표에 적는다. 점수보다 **이유 한 줄**이 중요하다. 3단계에서 새 스타일 바이블을 쓸 때 그 말이 재료가 된다.

- **거친 붓맛:** 손으로 만든 자국(붓·나이프·목탄·조각칼)이 보이는 정도. 좋아하는 정도가 아니라 보이는 정도.
- **무광:** 번들거림·젖은 반사가 없으면 ○.
- **분위기:** 우울하고 조용하고 사람 냄새가 나는, 조금 초현실적인 망각의 도시인가.
- **왼쪽 어둠:** 왼쪽 40%에 제목과 메뉴를 얹을 수 있으면 ○.
- **게임 전체로:** 이 화풍으로 낮 거리, 물건이 가득한 실내, 108×135px 초상까지 그릴 수 있겠는가. 상위 후보는 2라운드에서 직접 확인한다.

| 후보 | 첫인상 1–5 | 거친 붓맛 1–5 | 무광 ○× | 사실감 없음 1–5 | 분위기 1–5 | 작게 봐도 읽힘 1–5 | 왼쪽 어둠 ○× | 게임 전체로 1–5 | 좋은 점 / 싫은 점 |
|---|---|---|---|---|---|---|---|---|---|
| A1 | | | | | | | | | |
| A2 | | | | | | | | | |
| A3 | | | | | | | | | |
| A4 | | | | | | | | | |
| A5 | | | | | | | | | |
| B1 | | | | | | | | | |
| B2 | | | | | | | | | |
| C1 | | | | | | | | | |
| C2 | | | | | | | | | |
| C3 | | | | | | | | | |

---

## 4. 2라운드 — 상위 2~3개로 좁히기

### 4-1. 변주 — 그 후보의 대화에서 이어서

한 번에 하나만 바꾼다. 편집을 거듭할수록 화면이 매끈해지는 경향이 있다. 두세 번 넘게 고쳐야 하면 원래 프롬프트의 `STYLE:`에 그 변화를 적어 넣고 새 대화에서 다시 만든다.

| 바꿀 것 | 이어서 보낼 말 |
|---|---|
| 더 거칠게 | `Same picture, same composition. Rougher: bigger brushes, fewer and bolder marks, less detail, more of the medium's texture.` |
| 조금 덜 거칠게 | `Same picture, same composition. A little more controlled: keep the marks visible, but make the big shapes clearer and the silhouettes easier to read.` |
| 더 어둡게 | `Same picture. Darker overall, a deeper night; the moon and the lamp stay the brightest spots.` |
| 더 밝게 | `Same picture. Lift the middle tones a little so the shapes read better; the left side stays dark.` |
| 색을 차갑게 | `Same picture, same marks. A colder palette: more blue-green and grey, less violet.` |
| 색을 따뜻하게 | `Same picture, same marks. A warmer palette: more umber and rust in the darks.` |
| 색을 줄이게 | `Same picture. Fewer colors: nearly monochrome, with only the red light, the neon and the lamp in color.` |
| 그림자에 색을 더 | `Same picture. Richer color inside the shadows: blues, violets and greens mixed into the darks.` |

### 4-2. 섞기 — 새 대화, 두 장 첨부

"A1의 붓질에 B1의 색"처럼 두 후보의 좋은 점을 합쳐 본다. 첨부: ① 붓질을 가져올 그림 ② 색과 빛을 가져올 그림

```text
Image 1 and image 2 are two pictures of the same scene. Make it once more with the medium, brushwork and surface of image 1 and the palette and light of image 2. Keep image 1's composition exactly. Landscape 3:2 (1536×1024). Matte, no glossy highlights, no wet reflections. No text.
```

### 4-3. 다시 뽑아 보기 — 재현성

같은 후보의 1라운드 프롬프트를 새 대화에서 한 번 더 보낸다. 두 장이 같은 화풍으로 보이면 ChatGPT가 그 화풍을 안정적으로 낸다는 뜻이다. 매번 다르게 나오는 화풍으로는 66장을 맞추기 어렵다.

### 4-4. 넓혀 보기 — 낮 장면과 초상

타이틀은 밤이고 물건이 적은 그림이다. 게임에는 낮 장면, 물건이 가득한 실내, 아주 작게 보이는 초상이 있다. 상위 후보마다 두 장씩 더 만들어 본다. 새 대화에서, 첨부 순서는 늘 **① 그 후보의 타이틀 그림(화풍 기준) ② 지금 게임의 그림(구도 기준)** 이다.

**낮 장면 — 부두 거리 낮** · 첨부: ① 후보 타이틀 ② `assets/scenes/quay_d.webp`

```text
Create an image. Image 1 is the style reference: use exactly its medium, brushwork, surface, color handling and level of detail. Image 2 is only a layout guide, a flat vector mock-up: keep its composition, but do not copy the way it is drawn. Landscape 3:2 (1536×1024).
A harbor quay street on an overcast morning, three weeks into a dockworkers' strike. A cobbled waterfront street curves away along dark water. Left: a row of narrow four-story buildings with shuttered windows and laundry on the balconies; on the corner building, a tall vertical sign of red glass letters reading "LETHE", unlit. Center: a fried-fish stall with a red-and-white striped awning and a vendor woman in a headscarf. Right of center: dockworkers in flat caps picketing around a burning oil drum, holding blank placards. Beyond the bollards, a row of tall idle red dock cranes over the estuary. Gulls, crates, a bicycle.
Pale, foggy daylight. The same treatment as image 1: matte and hand-made, not photographic, no wet sheen or reflections, details only suggested, people as simple shapes without faces. No text except the LETHE sign.
```

**초상 — 형사** · 첨부: ① 후보 타이틀 ② `assets/portraits/you.webp`

```text
Create an image. Image 1 is the style reference: use exactly its medium, brushwork and surface. Image 2 is only a framing guide, a flat vector mock-up: keep its framing, but do not copy the way it is drawn. Portrait 2:3 (1024×1536).
Head and shoulders of the detective, a man of 44, in strict side profile facing right, placed a little left of center, the top of his head about 12% from the top, his shoulders running off the bottom edge. A broad, worn face with a sagging jaw, a nose broken more than once, a thick black horseshoe mustache streaked with grey, unruly dark hair. A loud emerald parrot-print silk shirt with a wide collar under a dark-green velvet jacket.
Behind him on the right, tall red neon letters reading "LETHE" from top to bottom, on a crimson background that darkens to near black at the bottom. His face is lit from that side; the rest of him falls into shadow.
It must still read as a tiny 108 × 135 px thumbnail: one clear silhouette and one or two strong color accents (the green collar, the red neon). Matte and hand-made, no glossy highlights, no photographic skin. No other text.
```

형사의 생김새는 본문(`content/01_room7.tl`의 거울 장면)을 따랐다. 옛 초상 프롬프트에는 콧수염이 빠져 있다.

세 장(타이틀·낮 거리·초상)을 나란히 놓고 본다. 한 게임처럼 보이는가. 낮에도 그 화풍인가. 초상을 108×135px로 줄여도 형사로 읽히는가(콧수염, 초록 깃).

---

## 5. 3라운드 — 확정

1. 한 장을 고른다. 변주나 섞기의 결과여도 된다.
2. 눈에 띄는 흠만 그 대화에서 편집으로 고친다. 한 번에 하나씩.
   ```text
   Keep the picture exactly as it is (same medium, same colors, same marks). Only fix this: the small red warning light must sit exactly at the tip of the jib, directly above the hanging figure.
   ```
   ```text
   Keep the picture exactly as it is. Only fix this: the left 40% must be darker and emptier, so a title can sit there.
   ```
3. 자르지 않은 3:2 원본을 `docs/art-ref/key_art.png`로 저장소에 넣는다. 2·3단계에서 모든 그림의 화풍 기준(첨부 ①)이 된다.
4. (선택) 바로 게임에 넣어도 된다: `node tools/art/import.mjs preview title <그림>`으로 노란 원 안에 붉은 등과 가로등이 있는지 보고, `node tools/art/import.mjs scene title <그림>` → `npm run build`.

구도 문제는 2단계에서 다룬다. 이미 보이는 것 하나: 휴대폰 타이틀 화면에서는 그림의 가로 52–78%만 보여서, 지금 구도의 매달린 사람(가로 약 51%)은 그 띠 바로 바깥에 있다. 새 그림에서도 같다.

2단계로 넘길 것

- 고른 후보 번호와, 2라운드에서 효과가 있었던 변주 문장
- 점수표, 특히 "좋은 점 / 싫은 점" 줄 (떨어뜨린 후보를 왜 싫어했는지도)
- `docs/art-ref/key_art.png`, 되도록 2·3등 후보와 4-4의 낮 장면·초상도

그림은 Claude와의 대화에 첨부하거나 `docs/art-ref/`에 넣어 push하면 된다.
