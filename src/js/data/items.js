/* 탱고 레테 — 아이템
 * cat: clothing | tool | evidence | consumable | junk
 * slot(의복): hat, eyes, neck, jacket, shirt, pants, shoes, gloves
 * mods: 착용 시 기술 보정. use: 사용 효과(효과 문법). price: 전당포 매입가(솔도)
 */
(function (TL) {
  'use strict';

  TL.data.slots = [
    ['hat', '모자'], ['eyes', '눈'], ['neck', '목'], ['jacket', '겉옷'],
    ['shirt', '셔츠'], ['pants', '바지'], ['shoes', '신발'], ['gloves', '장갑'],
  ];
  TL.data.itemCats = [
    ['clothing', '의복'], ['tool', '도구'], ['evidence', '증거'], ['consumable', '소모품'], ['junk', '잡동사니'],
  ];

  const I = TL.data.items = {};
  function item(id, def) { def.id = id; I[id] = def; }

  /* ───────── 의복 ───────── */
  item('shoe_left', {
    name: '콤비 구두 (왼쪽 한 짝)', cat: 'clothing', slot: 'shoes', mods: { SAVOIR: -1, COMPOSURE: -1 },
    desc: '흰 가죽에 밤색 코를 덧댄 투톤 구두. 탱고 무도장의 신사들이 신는 종류다. 한 짝뿐이라서 걸을 때마다 몸이 한쪽으로 기운다. 당신은 지금 절반만 신사다.',
  });
  item('shoe_right', {
    name: '콤비 구두 (오른쪽 한 짝)', cat: 'clothing', slot: 'shoes', mods: { SAVOIR: -1, COMPOSURE: -1 },
    desc: '샹들리에에서 구출한 오른쪽 구두. 밑창에 무도장 바닥의 송진 가루가 묻어 있다. 짝을 찾으면 온전한 한 켤레가 된다.',
  });
  item('shoes_pair', {
    name: '콤비 구두 (한 켤레)', cat: 'clothing', slot: 'shoes', mods: { SAVOIR: 1, COMPOSURE: 1 },
    desc: '마침내 한 켤레. 흰 가죽, 밤색 코, 얇은 가죽 밑창. 이 구두는 걷기 위한 것이 아니다. 미끄러지고, 멈추고, 회전하기 위한 것이다. 신는 순간 발목이 무언가를 기억해 낸다. 오초(ocho). 사카다(sacada). 그녀의 발.',
  });
  item('jacket_wet', {
    name: '젖은 초록 벨벳 재킷', cat: 'clothing', slot: 'jacket', mods: { DRAMA: 1, ENDURANCE: -1 },
    desc: '욕조에서 건진 짙은 초록색 벨벳 재킷. 한때는 근사했을 것이다. 지금은 찬물을 머금고 늪지대의 이끼처럼 축 늘어져 있다. 입으면 어깨가 시리다. 그래도 벨벳은 벨벳이다.',
  });
  item('jacket_velvet', {
    name: '초록 벨벳 재킷', cat: 'clothing', slot: 'jacket', mods: { DRAMA: 1, SUGGESTION: 1 },
    desc: '보일러 옆에서 말린 초록 벨벳 재킷. 결이 되살아나 빛을 받으면 물결처럼 색이 변한다. 옷깃 안쪽에 수놓인 글자: "L.M. — 사랑을 담아, M." 당신은 그 글자를 오래 보지 않기로 한다.',
  });
  item('shirt_silk', {
    name: '앵무새 무늬 실크 셔츠', cat: 'clothing', slot: 'shirt', mods: { ELECTRO: 1, COMPOSURE: -1 },
    desc: '에메랄드색 앵무새들이 주홍색 정글 위를 날아다니는 실크 셔츠. 겨드랑이에 땀자국, 가슴에 럼 얼룩. 단추 두 개가 없다. 이 셔츠를 고른 사람은 행복했거나, 행복해지고 싶었다.',
  });
  item('trousers_flare', {
    name: '체크무늬 나팔바지', cat: 'clothing', slot: 'pants', mods: { SAVOIR: 1, AUTHORITY: -1 },
    desc: '겨자색과 갈색의 굵은 체크. 무릎 아래로 종처럼 벌어지는 나팔바지. 춤을 출 때 아름답게 휘날릴 것이다. 범죄 현장에서는, 글쎄.',
  });
  item('tie_red', {
    name: '빨간 실크 넥타이', cat: 'clothing', slot: 'neck', mods: { DRAMA: 1, LOGIC: -1 },
    desc: '스탠드 전등갓에 걸려 있던 빨간 넥타이. 매듭이 반쯤 풀린 채 굳어 있다. 누군가 이걸로 올가미를 만들려다 그만둔 것처럼 보인다는 생각이 들지만, 당신은 그 생각을 더 따라가지 않는다.',
  });
  item('coat_watch', {
    name: '경비대 우비', cat: 'clothing', slot: 'jacket', mods: { AUTHORITY: 1, ESPRIT: 1 },
    desc: '사르가 시민 경비대 표준 지급 우비. 짙은 남색 방수포, 어깨에 빛바랜 반사띠, 가슴에 "SCW" 스텐실. 윤 경위의 사이드카 트렁크에 있던 예비품이다. 입는 순간 등 뒤에서 수백 명의 지친 경찰이 당신을 지켜보는 기분이 든다.',
  });
  item('hat_fisher', {
    name: '어부의 털모자', cat: 'clothing', slot: 'hat', mods: { SHIVERS: 1, COMPOSURE: -1 },
    desc: '짠내 나는 남색 털모자. 마르가리타의 죽은 남편 것이다. 쓰면 귀가 따뜻해지고, 바람 소리가 조금 더 잘 들린다. 바다가 무슨 말을 하는지.',
  });
  item('hat_fedora', {
    name: '낡은 중절모', cat: 'clothing', slot: 'hat', mods: { COMPOSURE: 1, PERCEPTION: -1 },
    desc: '챙이 조금 처진 회색 중절모. 전당포 선반에서 3년을 기다렸다. 눈썹 위로 그림자를 드리워 표정을 숨겨 준다. 시야도 조금 숨긴다.',
  });
  item('crown_paper', {
    name: '종이 왕관', cat: 'clothing', slot: 'hat', mods: { DRAMA: 1, AUTHORITY: 1, COMPOSURE: -2 },
    desc: '통조림 상표 종이를 오려 만든 왕관. 안쪽에 "정어리 — 기름 절임 — 할바르-마리스"라고 인쇄되어 있다. 아우렐리오가 하사했다. 쓰면 이상하게 등이 곧게 펴진다. 사람들은 웃는다.',
  });
  item('scarf_tango', {
    name: '진홍색 탱고 스카프', cat: 'clothing', slot: 'neck', mods: { SAVOIR: 1, ELECTRO: 1 },
    desc: '가장자리에 술이 달린 진홍색 실크 스카프. 무도장 분실물 상자에서 나왔다. 향수 냄새가 희미하게 남아 있다. 재스민, 담배, 그리고 오래된 여름.',
  });
  item('glasses_crow', {
    name: '회색 까마귀 선글라스', cat: 'clothing', slot: 'eyes', mods: { AUTHORITY: 1, EMPATHY: -1 },
    desc: '용병 지급품 선글라스. 렌즈가 회색 거울이다. 쓰면 세상이 조금 더 차갑고 조금 더 다루기 쉬워 보인다. 다른 사람들의 눈에 비친 당신도.',
  });
  item('gloves_crane', {
    name: '크레인 기사의 장갑', cat: 'clothing', slot: 'gloves', mods: { INTERFACING: 1, HANDEYE: -1 },
    desc: '기름에 절어 딱딱해진 두꺼운 가죽 장갑. 손바닥 부분이 레버 모양으로 닳아 있다. 시몬이 40년 동안 끼던 것이다. 끼면 손이 기계의 언어를 조금 알아듣는다.',
  });
  item('boots_rubber', {
    name: '고무 장화', cat: 'clothing', slot: 'shoes', mods: { ENDURANCE: 1, SAVOIR: -2 },
    desc: '무릎까지 오는 검은 고무 장화. 개펄의 진흙은 이 장화 앞에서 무력하다. 춤은, 음, 불가능하다.',
  });
  item('jacket_union', {
    name: '붉은 닻 작업복', cat: 'clothing', slot: 'jacket', mods: { PHYSICAL: 1, ESPRIT: -1 },
    desc: '두꺼운 캔버스 천 작업복. 등에 붉은 닻 문장. 생선 기름과 로프 타르 냄새. 입으면 부두 노동자들이 당신을 조금 덜 경계한다. 경비대 동료들은 조금 더 경계한다.',
  });

  /* ───────── 도구 ───────── */
  item('pawn_ticket', {
    name: '전당표', cat: 'tool',
    desc: '구겨진 노란 종이. "코스타 전당포 — 솔레아 부두 거리 14번지. 물품: 금속제 휘장 1점. 대부액: 30솔도. 기한: 30일." 서명란에는 알아볼 수 없는 휘갈김과 함께 "밤의 대통령"이라고 적혀 있다.',
  });
  item('key_room7', {
    name: '7호실 열쇠', cat: 'tool',
    desc: '황동 열쇠. 빨간 술 장식에 "레테 — 7"이라고 새겨진 나무 패가 달려 있다. 당신의 방. 당신이 부순 방.',
  });
  item('matches', {
    name: '무도장 성냥갑', cat: 'tool',
    desc: '"레테 무도장 — 매일 밤 아홉 시부터, 영원까지." 성냥 몇 개비가 남았다. 뒷면에 누군가 연필로 전화번호를 적어 놓았다. 지워져서 읽을 수 없다.',
  });
  item('flashlight', {
    name: '손전등', cat: 'tool',
    desc: '윤 경위의 예비 손전등. 경비대 지급품, 원통형, 배터리 반쯤. 어둠 속의 작고 성실한 원.',
  });
  item('crowbar', {
    name: '쇠지렛대', cat: 'tool',
    desc: '끝이 납작하게 벌어진 무거운 쇠지렛대. 시몬의 초소 구석에 있었다. 문, 상자, 뚜껑, 그리고 대부분의 인간관계를 열 수 있다.',
  });
  item('notebook', {
    name: '형사 수첩', cat: 'tool',
    desc: '가죽 표지가 부풀어 오른 경비대 수첩. 지난 열흘 동안 당신이 쓴 것. 절반은 알아볼 수 없고, 나머지 절반은 알아보고 싶지 않다.',
  });
  item('badge', {
    name: '경비대 배지', cat: 'tool',
    desc: '사르가 시민 경비대 배지. 닻과 등불이 교차한 문장, 그 아래 번호 "9-0417". 뒷면에 새겨진 이름: 라자로 몬테로 경위. 되찾았다. 이것으로 당신은 다시 경찰이다. 적어도 서류상으로는.',
  });
  item('gun_ravn', {
    name: '라븐 7.65mm 리볼버', cat: 'tool',
    desc: '경비대 지급 6연발 리볼버. 호두나무 손잡이에 당신의 손가락 모양으로 닳은 홈. 실린더를 열면 약실 여섯 개 중 두 개에 탄이 있다. 하나에는 쏘고 남은 빈 탄피가 끼어 있고, 셋은 비었다. 한 알은 체사르의 서랍에, 두 알은 비스킷 상자에. 그리고 빈 탄피의 짝은 얀 트로스트의 가슴에 있었다.',
  });
  item('roof_key', {
    name: '옥상 열쇠', cat: 'tool',
    desc: '녹슨 쇠 열쇠. 무도장 뒤쪽 계단 끝, 옥상으로 나가는 문의 열쇠다. 마담 오를라가 마지못해 빌려주었다.',
  });
  item('hotel_key', {
    name: '그랜드 메리디안 305호 열쇠', cat: 'tool',
    desc: '시신의 재킷 안감 속에 꿰매져 있던 무거운 황동 열쇠. 금박이 벗겨진 타원형 패에 "그랜드 메리디안 호텔 — 305"라고 새겨져 있다. 죽은 남자의 방이 당신을 기다린다.',
  });
  item('broom', {
    name: '빗자루', cat: 'tool',
    desc: '에밀이 빌려준 무도장 빗자루. 손잡이가 길고, 솔은 송진 가루와 담배꽁초와 누군가의 머리핀을 쓸어 온 역사로 뻣뻣하다.',
  });
  item('record_olvido', {
    name: '레코드 「올비도」', cat: 'tool',
    desc: '78회전 셸락 음반. 검은 라벨에 은색 글씨: "올비도(망각) — 오르케스타 레테. 반도네온 독주: 파코 에스피노사. 사르가 음반." 가장자리에 작은 흠집. 바늘이 늘 같은 자리에서 멈추는 이유.',
  });
  item('wall_note', {
    name: '벽 구멍 속의 쪽지', cat: 'evidence',
    desc: '수첩에서 뜯어낸 종이 한 장. 술에 취한 사람의 커다란 글씨: "잊지 마: 크레인 4. 로사. 보험 — 누가 거짓말을 하는가? 전부 다." 그 밑에 왜가리처럼 보이는 그림. 당신의 필체다.',
  });
  item('hairpin', {
    name: '검은 머리핀', cat: 'tool',
    desc: '7호실 침대 밑에서 나온 가느다란 검은 머리핀. 누구의 것인지는 모른다. 끝을 구부리면 싸구려 자물쇠 정도는 달랠 수 있다.',
  });
  item('score_commune', {
    name: '「우리는 잊지 않으리」 친필 악보', cat: 'tool',
    desc: '생선 포장지 뒷면에 연필로 그은 오선과 음표. 52년 전 에르난 소토가 코뮌 선포의 밤에 쓴 찬가의 원본. 모서리에 기름 얼룩, 그리고 희미한 비린내. 가사 첫 줄: "강물이 모든 것을 가져가도 / 우리는 서로의 이름을 부르리."',
  });
  item('tide_table', {
    name: '조수표', cat: 'tool',
    desc: '방파제 게시판에서 떼어 온 등사판 조수표. "솔레아 만 — 썰물: 새벽 5시경, 저녁 5시경. 매일 약 한 시간씩 늦어짐. 개펄 통행 시 익사에 유의." 누군가 여백에 왜가리를 그려 놓았다.',
  });
  item('binoculars', {
    name: '로렌초의 쌍안경', cat: 'tool',
    desc: '해군 잉여품 쌍안경. 왼쪽 렌즈에 금이 가 있다. 로렌초 벨로소가 40년 동안 재빛 왜가리를 찾던 눈이다.',
  });
  item('sealed_letter', {
    name: '로사의 봉투', cat: 'tool',
    desc: '붉은 밀랍으로 봉한 두툼한 봉투. 받는 사람: "할바르-마리스 해운 협상 대표 A. 크루이프 귀하." 로사 이바라가 직접 전해 달라고 했다. 밀랍에는 닻 문양이 찍혀 있다.',
  });
  item('opened_letter', {
    name: '뜯어본 로사의 봉투', cat: 'tool',
    desc: '김을 쐬어 밀랍을 녹이고 다시 붙인 봉투. 자세히 보면 티가 난다. 안에는 로사의 제안이 들어 있다.',
  });
  item('radio_tube', {
    name: '진공관 6L6', cat: 'tool',
    desc: '유리 속의 작은 도시. 음극, 격자, 양극. 해적 방송 송신기에 필요한 출력관이다. 전당포에서 샀다.',
  });
  item('rowboat_pass', {
    name: '로렌초의 쪽지', cat: 'tool',
    desc: '"이 사람에게 내 보트 \'마리아\'를 빌려주시오. — L. 벨로소." 방파제 아래 매어 둔 작은 나룻배의 사용 허가증.',
  });

  /* ───────── 증거 ───────── */
  item('ev_bullet', {
    name: '7.65mm 탄두', cat: 'evidence',
    desc: '시신의 가슴에서 꺼낸 찌그러진 납 탄두. 강선 자국이 선명하다. 오른쪽으로 여섯 줄. 7.65mm, 경비대 지급 라븐 리볼버의 탄. 사르가에서 이 총을 가진 사람은 경찰뿐이다. 그리고 경찰에게서 총을 빼앗은 사람들.',
  });
  item('ev_lesson_card', {
    name: '탱고 강습 카드', cat: 'evidence',
    desc: '시신의 셔츠 주머니에 있던 작은 카드. "레테 무도장 — 개인 강습. 제7강: 포옹(el abrazo). 가슴으로 이끌고, 가슴으로 따른다." 뒷면에 여자의 필체로: "자정, 위에서. — I."',
  });
  item('ev_tar', {
    name: '타르와 깃털', cat: 'evidence',
    desc: '시신의 탱고 구두 밑창에서 긁어낸 검은 방수 타르. 그 속에 박힌 잿빛 솜털 몇 가닥. 비둘기 깃털이다. 크레인에도, 부두에도 타르칠한 바닥은 없다. 이 남자는 죽기 전에 어떤 지붕 위에 있었다.',
  });
  item('ev_rope', {
    name: '밧줄 조각', cat: 'evidence',
    desc: '시신의 목에서 잘라낸 밧줄. 마닐라삼, 3가닥 꼬임, 타르칠. 부두에서 쓰는 계선줄이다. 매듭은 교수형 매듭이 아니라 선원들이 쓰는 "쌍고리 보울라인"이었다. 이 사람을 매단 사람은 교수형 집행인이 아니라 뱃사람이었다.',
  });
  item('ev_paper_corner', {
    name: '찢어진 종이 귀퉁이', cat: 'evidence',
    desc: '피해자의 오른 주먹 속에 있던 손바닥만 한 삼각형 종이. 타자기 글씨: "……정비 일지 대조 결과, 최소 14개월간……", "……권양 케이블 교체 기록 부재……", "……청구 기각을……". 끝에 서명 일부 "J. Tr". 누군가 나머지를 그의 손에서 빼앗아 갔다.',
  });
  item('photo_marisol', {
    name: '마리솔의 사진', cat: 'junk',
    desc: '모서리가 닳은 흑백 사진. 사르가 중앙 무도장. 초록 벨벳 재킷을 입고 눈을 감은 채 크게 웃는 젊은 당신, 그리고 당신 팔 안에서 몸을 뒤로 젖힌 채 카메라를 똑바로 보는 여자. 뒷면: "네 서른여덟 번째 생일. 이 노래는 춤추지 않으면 너무 슬퍼. — M."',
  });
  item('ev_tape', {
    name: '라디오 레테 녹음테이프', cat: 'evidence',
    desc: '리나의 릴 테이프. 라벨: "5일 전 밤 — 심야 방송 — 잡음 많음." 01:17에 총성 한 발. 비둘기 떼. 그리고 아이의 목소리. "누나!"',
  });
  item('ev_jan_notebook', {
    name: '얀 트로스트의 수첩', cat: 'evidence',
    desc: '305호 금고에서 나온 작은 검은 수첩. 꼼꼼한 손해사정인의 글씨. 4번 크레인 정비 기록 대조표, 날짜, 서명 비교. 마지막 몇 장은 뜯겨 나갔다. 남은 마지막 줄: "증거 확보. I.에게 먼저 보여줄 것. 그녀에게는 알 권리가 있다."',
  });
  item('ev_letter_draft', {
    name: '쓰다 만 편지', cat: 'evidence',
    desc: '305호 책상 위에 있던 편지. "사랑하는 어머니께. 여기 솔레아는 생각보다 춥고, 생각보다 따뜻합니다. 저는 춤을 배우고 있어요. 믿기지 않으시겠지만—" 거기서 끝난다.',
  });
  item('ev_photo', {
    name: '사진 한 장', cat: 'evidence',
    desc: '이네스의 방 거울 틀에 끼워져 있던 사진. 부두 사진관의 싸구려 배경 앞에서 뻣뻣하게 선 안경 쓴 남자, 그리고 그의 넥타이를 잡아당기며 웃는 여자. 뒷면: "7강 끝난 날. 그는 내 발을 네 번 밟았다."',
  });
  item('ev_drawing', {
    name: '보보의 그림', cat: 'evidence',
    desc: '크레용 그림. 검은 옷의 큰 남자가 머리가 긴 여자를 붙잡고 있다. 작은 남자아이가 총을 들고 있다. 아이 머리 위에 "영웅"이라고 쓰여 있다. 하늘에는 새들이 날고 있다. 누군가 남자의 얼굴을 연필로 새까맣게 칠해 버렸다.',
  });
  item('ev_report', {
    name: '4번 크레인 보고서', cat: 'evidence',
    desc: '보렐 & 파르 해상보험 손해사정 보고서 사본. 수신: 본사 청구심사부. 결론: "할바르-마리스 해운은 4번 크레인의 정비 일지를 최소 14개월간 조작하였음. 붕괴 원인은 권양 케이블의 피로 파단이며, 이는 정비 불이행의 직접적 결과임. 운전자 과실의 증거 없음. 청구 기각을 권고함." 서명: 얀 트로스트. 모서리에 갈색 얼룩이 있다. 피다.',
  });
  item('ev_glasses', {
    name: '금 간 철테 안경', cat: 'evidence',
    desc: '레테 옥상 테라스, 화분과 난간 사이의 틈에서 찾은 둥근 철테 안경. 왼쪽 렌즈에 거미줄 같은 금. 다리 하나가 휘었다. 코받침에 아주 작은 갈색 얼룩. 도수가 꽤 높다. 이 안경 없이는 세상이 뿌옇게 보였을 것이다. 춤추는 상대의 얼굴까지도.',
  });
  item('jan_shoe', {
    name: '검은 에나멜 탱고 구두', cat: 'evidence',
    desc: '옥상 빗물받이에 끼어 있던 오른쪽 구두. 가느다란 가죽 밑창, 발등을 X자로 감는 끈. 새것이다. 밑창의 앞부분만 조금 닳았다. 춤을 배운 지 몇 주밖에 안 된 발. 크레인에 매달린 남자의 왼발에 신겨 있던 것과 짝이다.',
  });
  item('ev_holster', {
    name: '빈 권총집', cat: 'evidence',
    desc: '닳은 갈색 가죽 권총집. 아이 허리에 맞추려고 송곳으로 구멍을 여럿 새로 뚫은 벨트. 안쪽 가죽에 불로 지진 글씨 "SCW 9-0417". 당신의 번호다. 비어 있다. 비둘기장의 담요 밑에 있었다.',
  });
  item('ev_feather', {
    name: '거대한 잿빛 깃털', cat: 'evidence',
    desc: '당신 팔 길이만 한 회색 깃털. 깃대는 손가락만큼 굵고, 깃은 연기처럼 부드럽다. 이 세상의 어떤 새도 이런 깃털을 갖고 있지 않다. 적어도 백과사전은 모른다.',
  });
  item('ev_heron_log', {
    name: '왜가리 관찰 일지', cat: 'evidence',
    desc: '로렌초가 40년 동안 쓴 관찰 일지 중 한 권. 날짜, 날씨, 조수, 그리고 "보지 못함"이 수천 번. 가끔 "그림자?", "소리?". 마지막 장: "말뚝 17번이 어제보다 2센티미터 높아졌다. 기분 탓일까."',
  });

  /* ───────── 소모품 ───────── */
  item('cig_astra', {
    name: '아스트라 담배', cat: 'consumable', stack: true, price: 1,
    use: 'morale +1', useLine: ['ELECTRO', '연기가 폐를 채운다. 아, 이거다. 세상이 반 톤 부드러워진다.'],
    desc: '가장 싸고 가장 독한 사르가 담배. 파란 갑에 금색 별. "별을 피우세요." 한 대에 사기 +1.',
  });
  item('pills_pancio', {
    name: '판치오 진통제', cat: 'consumable', stack: true, price: 2,
    use: 'health +1', useLine: ['ENDURANCE', '쓴 알약이 목을 넘어간다. 배 속 깊은 곳에서 무언가가 조금 조용해진다.'],
    desc: '흰 알약 여섯 알이 든 양철 케이스. "두통, 치통, 신경통, 실연(失戀)에 — 판치오." 체력 +1.',
  });
  item('rum_lethe', {
    name: '레테 럼 (작은 병)', cat: 'consumable', stack: true, price: 2,
    use: 'morale +2; buff ELECTRO +1 120; buff LOGIC -1 120; drinks += 1',
    useLine: ['ELECTRO', '황금빛 불이 목구멍을 타고 내려간다. 모든 게 괜찮다. 모든 게 늘 괜찮았다. 왜 그걸 잊고 있었지?'],
    desc: '레테 무도장 이름을 딴 싸구려 사탕수수 럼. 라벨에는 강물에 손을 담그는 여자가 그려져 있다. "잊으세요." 사기 +2, 두 시간 동안 전기화학 +1, 논리 −1.',
  });
  item('coffee', {
    name: '보온병 커피', cat: 'consumable', price: 0,
    use: 'health +1; buff REACTION +1 90', useLine: ['REACTION', '쓰고 뜨거운 커피. 세계가 반 박자 빨라진다.'],
    desc: '윤 경위가 준 양철 보온병. 가람식으로 진하게 우린 보리 커피다. 체력 +1, 90분 동안 반응 속도 +1.',
  });
  item('fish_fried', {
    name: '생선 튀김', cat: 'consumable', stack: true, price: 0,
    use: 'health +1; morale +1', useLine: ['ENDURANCE', '기름, 소금, 뜨거운 흰 살. 몸이 고맙다고 말한다. 몸이 마지막으로 고맙다고 말한 게 언제였더라.'],
    desc: '신문지에 싼 대구 튀김. 마르가리타의 솜씨. 체력 +1, 사기 +1.',
  });
  item('stardust', {
    name: '"별가루" 한 봉', cat: 'consumable', price: 4,
    use: 'health +2; morale +1; buff ELECTRO +2 180; buff VOLITION -1 240; drugs += 1',
    useLine: ['ELECTRO', '콧속이 얼어붙고, 그다음 불이 붙는다. 심장이 탱고를 춘다. 빠르게, 더 빠르게. 당신은 신이다. 적어도 앞으로 세 시간 동안은.'],
    desc: '작은 기름종이 봉투에 든 은색 가루. 부두의 밤 노동자들이 버티려고 쓰는 각성제. 체력 +2, 사기 +1, 세 시간 동안 전기화학 +2, 네 시간 동안 의지 −1.',
  });
  item('candy_mint', {
    name: '박하사탕', cat: 'consumable', stack: true, price: 0,
    use: 'buff COMPOSURE +1 60', useLine: ['COMPOSURE', '박하의 차가움이 혀를 정리한다. 입 냄새도, 표정도.'],
    desc: '종이에 싼 박하사탕. 한 시간 동안 평정 +1. 입 냄새가 경찰의 권위를 얼마나 깎아 먹는지 아는 사람만이 이것의 가치를 안다.',
  });

  /* ───────── 잡동사니 (팔 수 있는 것들) ───────── */
  item('bottle_empty', {
    name: '빈 병', cat: 'junk', stack: true, price: 0.1,
    desc: '초록 유리병. 바텐더 에밀이 한 병에 10센티모씩 쳐준다. 이 도시의 가장 확실한 경제.',
  });
  item('royal_coin', {
    name: '왕관 시대의 은화', cat: 'junk', price: 6,
    desc: '분수 바닥에서 건진 은화. 한 면에는 익사한 왕 아우렐리오 4세의 옆얼굴, 다른 면에는 "바다가 우리를 지키리라". 바다는 지키지 않았다.',
  });
  item('pulp_mallow', {
    name: '「말로우 경감의 모험」 제9권', cat: 'junk', price: 1,
    desc: '표지에 트렌치코트를 입은 남자와 쓰러지는 금발 여자. 제목: 「죽음은 탱고를 추지 않는다」. 이그나시오의 노점에서 샀다. 윤 경위가 이 시리즈를 좋아한다는 소문이 있다.',
  });
  item('commune_pin', {
    name: '코뮌 배지', cat: 'junk', price: 3,
    desc: '붉은 에나멜이 반쯤 벗겨진 작은 배지. 파도 위의 등불. "우리는 잊지 않는다." 52년 전 수만 명이 가슴에 달았던 것.',
  });
  item('wedding_ring', {
    name: '금반지', cat: 'junk', price: 25,
    desc: '셔츠 주머니 깊은 곳에 있던 가느다란 금반지. 안쪽에 새겨진 글자: "M에게, 영원히 — L." 한 번도 누군가의 손가락에 끼워진 적이 없는 것 같다. 너무 새것이다.',
  });
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
