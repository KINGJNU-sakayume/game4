# 탱고 레테 스크립트(.tl) 문법

`content/*.tl` 파일은 파일 이름 순서대로 읽혀 하나의 이야기 그래프가 된다. 한 줄이 한 문장이다. 들여쓰기는 **선택지 본문**에서만 의미가 있다(공백 2칸 권장).

```
// 주석
=== node_id @location name="장소 이름" art=scene travel=4
서술 문장.
YUN: 대사.
LOGIC[10]: 패시브 판정 — 논리 + 6 ≥ 10일 때만 보인다.
{조건} 조건이 참일 때만 실행되는 아무 줄
~ 효과; 효과
* 한 번만 고를 수 있는 선택지 -> 다른_노드
+ 여러 번 고를 수 있는 선택지 => 장소 3
```

## 노드

```
=== id [속성...]
```

| 속성 | 뜻 |
|---|---|
| `@location` | 장소 노드. 대화가 끝나면(`-> END`) 이 노드의 **첫 선택지 묶음**으로 돌아온다. 첫 선택지 묶음 앞의 문장들은 도착할 때만 실행된다. 최상위 선택지는 메뉴처럼 동작한다(고른 문구를 기록에 남기지 않고 시간도 쓰지 않는다). |
| `name="…"` | 장소 이름 (HUD, 저장 목록) |
| `art=…` | 장면 그림 이름 (`assets/art.json`의 장면 열쇠에서 `_d`/`_n` 등 접미사를 뗀 것. 예: `quay`, `crane`, `void`) |
| `travel=N` | 기본 이동 시간(분) |
| `@noecho` | 장소가 아닌 노드의 최상위 선택지도 메뉴처럼 동작하게 한다 (검시처럼 여러 항목을 둘러보는 장면) |
| `@event` | 이벤트 노드 (아래) |

### 이벤트

```
=== ev_x @event when="조건" at=crane,quay notat=hall on=arrive priority=90 repeat
```

- 장소에 **도착했을 때**(`on=arrive`)나 **대화가 끝났을 때**(`on=end`) 검사한다. `on`이 없으면 둘 다.
- `at` / `notat`: 그 장소에서만 / 그 장소가 아닐 때만.
- `priority`: 높은 것부터 검사해 처음 조건이 맞는 하나만 실행.
- `repeat`: 여러 번 실행 가능 (기본은 한 번).

## 문장

| 형태 | 뜻 |
|---|---|
| `서술` | 내레이션 |
| `ID: 대사` | 화자 대사. ID는 `src/js/data/speakers.js` 또는 기술 ID |
| `SKILL[N]: 대사` | 패시브 판정. 기술 레벨 + 6 ≥ N일 때만 보인다 (기술 화자만) |
| `{조건} …` | 조건부. 여러 개를 겹칠 수 있다: `{a} {b} 줄` |
| `~ 효과; 효과` | 효과 (아래) |
| `-> node` | 이동. `-> END`는 대화 종료(현재 장소의 허브로) |
| `=> 장소 [분]` | 장소 이동 (시간 경과) |
| `->> node` / `<<-` | 터널 호출 / 복귀 |
| `---` | "계속" 버튼으로 끊기 |

텍스트 안의 `{{식}}`은 값으로 바뀐다: `{{day}}일째`, `{{met_yun ? "윤 경위가" : "누군가"}}`. 줄 맨 앞의 `**굵게**`는 강조로 표시된다.

## 선택지

```
* 한 번만 고르는 선택지
+ 계속 남는 선택지
* {조건} 조건부 선택지 -> 대상
* [LOGIC 10] 흰색 판정 -> 성공_노드 | 실패_노드
* [!EMPATHY 12] 빨간색 판정 (단 한 번)
* [AUTHORITY 11 +2 has.badge "배지" -1 drunk "숙취"] 보정이 붙은 판정
* [SAVOIR 9 %day] 날마다 다시 시도할 수 있는 판정
* <ENCYCLOPEDIA 10> 기술이 충분할 때만 보이는 선택지
```

- `*`/`+` 뒤에는 반드시 공백이 있어야 한다 (`**굵게**`와 구별).
- 선택지 문구 뒤의 `-> 대상`, `=> 장소 분`은 본문 없이 바로 이동한다.
- 대상이 없으면 **들여쓴 줄들이 본문**이다. 판정 선택지의 본문은 `?+`(성공)와 `?-`(실패)로 나눈다.

```
* [PERCEPTION 9] 신발을 본다.
  ?+
    밑창에 별 모양 무늬.
    ~ bobo_shoes_seen = 1
  ?-
    낡은 운동화. 그뿐이다.
```

- 선택지 묶음 뒤의 `-` 한 줄은 **합류점**이다. 본문이 끝나면 합류점 다음 줄로 흐른다. 합류점이 없으면 본문이 끝난 뒤 **같은 선택지 묶음으로 돌아온다** (허브처럼 동작).
- 판정 보정은 `+N 조건 "이유"` 꼴. 조건에 공백이 들어가면 괄호로 감싼다: `+1 (yun_trust >= 4) "신뢰"`.
- 조건부 선택지의 본문 줄에는 다시 `{조건}`을 붙이지 않는다. 조건이 다른 본문이 필요하면 노드를 나눈다.

## 효과

| 효과 | 예 |
|---|---|
| 플래그 | `set x`, `x = 1`, `x += 1`, `x -= 2`, `unset x` |
| 돈 | `money +2`, `money -0.5`, `money += 식`, `money -= 식` (money에 직접 대입하지 않는다) |
| 체력/사기 | `health -1`, `morale +2`, `morale -1 soft` (soft: 1에서 멈춘다 — 이야기의 감정적 타격용) |
| 경험치 | `xp 20` |
| 시간 | `time +30`, `sleep 8:00`(다음 날 아침), `wait 18:00`, `waittide`(다음 썰물까지) |
| 아이템 | `item add id`, `item remove id`, `item give id`(조용히), `item take id`(조용히), `item takeall id`, `equip id`, `unequip id` |
| 사고 | `thought id` (캐비닛에 떠오르게 한다) |
| 과제 | `task add id`, `task done id`, `task fail id` |
| 일시 효과 | `buff COMPOSURE +1 60` (분) |
| 알림 | `notify "문구"` |
| 회복 | `heal` |
| 장면 | `loc 장소`, `art 그림`, `ambient "문구"` |
| 결말 | `ending id` (`src/js/data/endings.js`) |

## 조건식

JavaScript와 비슷한 작은 언어: `&& || ! == != < <= > >= + - * / % ?:`와 괄호, `and`/`or`/`not`, 문자열 `"…"`, 시각 `18:30`(= 1110분).

| 값 | 뜻 |
|---|---|
| 아무 이름 | 플래그/변수 (없으면 0) |
| 기술 ID | 기술 레벨 (`LOGIC >= 4`) |
| `money day hour min clock abstime` | 돈, 일차, 시, 분, 자정 이후 분(자정을 넘겨도 계속 증가), 1일차부터의 절대 분 |
| `health morale healthMax moraleMax level xp points` | 상태 |
| `night lowtide tideleft tidewait` | 밤(20–6시), 썰물 여부, 썰물 남은 분, 다음 썰물까지 분 |
| `first loc archetype signature` | 이 노드 첫 방문, 현재 장소, 원형, 대표 기술 |
| `has.id count.id wear.id` | 소지, 개수, 착용 |
| `thought.id known.id researching.id` | 사고 완성 / 떠오름 / 연구 중 |
| `task.id active.id done.id` | 과제 상태 |
| `visits.node seen.node event.node used.choice` | 방문 횟수 등 |
| `check.id failed.id tried.id` | 판정 기록 |
| `pass(SKILL, N)` `chance(SKILL, N)` `min` `max` `abs` | 함수 |

## 검증

`npm run validate`는 없는 노드·화자·아이템·사고·과제·결말 참조, 잘못된 조건식, 읽기만 하고 설정하지 않는 변수, 도달할 수 없는 노드, 출구 없는 장소를 찾는다. `npm run simulate`는 무작위 플레이를 수백 판 돌려 예외와 막다른 길을 찾는다.
