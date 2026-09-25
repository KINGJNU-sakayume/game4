/* 탱고 레테 — 화자 목록
 * name은 문자열이거나 ($) => 문자열. $.v('플래그')로 상태를 읽을 수 있다.
 * kind: 'npc'(기본), 'voice'(내면의 특수 목소리), 'object'(말하는 사물), 'you'
 */
(function (TL) {
  'use strict';
  const v = ($, f) => !!$.v(f);

  TL.data.speakers = {
    YOU: { name: '당신', kind: 'you' },

    /* 내면의 원초적 목소리 */
    REPTILE: { name: '태고의 파충류 뇌', kind: 'voice', color: '#8f9b6c' },
    LIMBIC: { name: '변연계', kind: 'voice', color: '#b77d8e' },

    /* 파트너 */
    YUN: { name: $ => v($, 'yun_named') ? '윤 세하 경위' : '가죽 재킷의 여자', color: '#7fb7a8' },

    /* 레테 무도장 */
    ORLA: { name: $ => v($, 'orla_named') ? '마담 오를라' : '화장이 짙은 여자' },
    EMILE: { name: $ => v($, 'emile_named') ? '에밀' : '바텐더' },
    PACO: { name: $ => v($, 'paco_named') ? '파코 영감' : '반도네온을 든 노인' },

    /* 부두 거리 */
    BOBO: { name: $ => v($, 'bobo_named') ? '보보' : '꼬마' },
    MARGA: { name: $ => v($, 'marga_named') ? '마르가리타' : '생선 튀김 장수' },
    IGNACIO: { name: $ => v($, 'ignacio_named') ? '이그나시오' : '헌책 장수' },
    AURELIO: { name: $ => v($, 'aurelio_named') ? '아우렐리오' : '종이 왕관을 쓴 남자' },
    GREGOR: { name: $ => v($, 'gregor_named') ? '그레고르 벨라스코' : '벤치의 노인' },

    /* 붉은 닻 */
    ROSA: { name: $ => v($, 'rosa_named') ? '로사 이바라' : '휠체어의 노부인' },
    MATEO: { name: $ => v($, 'mateo_named') ? '"황소" 마테오' : '덩치 큰 하역부' },
    ALONSO: { name: $ => v($, 'dogs_named') ? '알론소 "시인"' : '콧수염 하역부' },
    PEPE: { name: $ => v($, 'dogs_named') ? '페페 "아홉 손가락"' : '손가락이 모자란 하역부' },
    LAURO: { name: $ => v($, 'dogs_named') ? '라우로 "졸음"' : '졸린 눈의 하역부' },
    DOGS: { name: '일곱 번째 부두의 개들' },
    SIMON: { name: $ => v($, 'simon_named') ? '시몬 "갈매기"' : '초소 안의 늙은이' },
    WORKER: { name: '통조림 공장 여공' },
    PICKET: { name: '피켓을 든 하역부' },

    /* 호텔 */
    KRUYF: { name: $ => v($, 'kruyf_named') ? '아마데오 크루이프' : '창백한 청년' },
    PILON: { name: $ => v($, 'pilon_named') ? '무슈 필롱' : '컨시어지' },
    RASMUS: { name: $ => v($, 'rasmus_named') ? '라스무센 대위' : '회색 코트의 남자' },
    CROW: { name: '회색 까마귀 용병' },
    CANARY: { name: '카나리아 "배당금"', kind: 'object' },

    /* 기타 주민 */
    CESAR: { name: $ => v($, 'cesar_named') ? '체사르 드 코스타' : '전당포 주인' },
    LINA: { name: $ => v($, 'lina_named') ? '리나 "주파수"' : '헤드폰을 쓴 소녀' },
    PERPETUA: { name: $ => v($, 'perpetua_named') ? '도냐 페르페투아' : '비늘을 든 노파' },
    LORENZO: { name: $ => v($, 'velosos_named') ? '로렌초 벨로소' : '쌍안경을 든 노인' },
    MARIA: { name: $ => v($, 'velosos_named') ? '마리아 벨로소' : '뜨개질하는 노부인' },
    VOLK: { name: $ => v($, 'volk_named') ? '볼크 하사' : '협약 순찰대원' },
    INES: { name: $ => v($, 'ines_named') ? '이네스' : '그림자 속의 여자' },
    FISHER: { name: '늙은 어부' },
    KID: { name: '동네 아이들' },
    NEIGHBOR: { name: '창문의 여자' },

    /* 경비대 */
    VALDES: { name: $ => v($, 'valdes_named') ? '발데스 경감' : '수화기 속의 목소리' },
    JUDIT: { name: '주디트 경사' },
    ORIOL: { name: '오리올 순경' },
    DISPATCHER: { name: '경비대 교환원', kind: 'object' },
    DISPATCH: { name: '경비대 교환원' },

    /* 사물과 환영 */
    PHONE: { name: '수화기 속의 목소리', kind: 'object' },
    RADIO: { name: '라디오', kind: 'object' },
    RECORD: { name: '축음기', kind: 'object' },
    CORPSE: { name: '죽은 남자', kind: 'object' },
    SHOE: { name: '구두 한 짝', kind: 'object' },
    FOUNTAIN: { name: '레테의 분수', kind: 'object' },
    CRANE: { name: '7번 크레인', kind: 'object' },
    BELL: { name: '가라앉은 종', kind: 'object' },
    HERON: { name: '재빛 왜가리', kind: 'object', color: '#b9c2c4' },
    MARISOL: { name: '마리솔', kind: 'voice', color: '#d3a1a0' },
    KING: { name: '익사한 왕', kind: 'voice', color: '#9fb6c9' },
    GUN: { name: '라븐 리볼버', kind: 'object' },
    MIRROR: { name: '거울 속의 남자', kind: 'object' },
  };
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
