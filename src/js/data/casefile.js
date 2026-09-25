/* 탱고 레테 — 사건 파일 (일지의 "사건 기록" 탭)
 * cond가 참이 되면 항목이 나타난다. 같은 group에서는 마지막으로 참인 항목만 보인다.
 */
(function (TL) {
  'use strict';
  TL.data.casefile = [
    /* 피해자 */
    { group: 'victim', title: '피해자', cond: 'body_seen',
      text: '신원 불명의 남자. 7번 크레인 지브 끝 갈고리에 목이 매달린 채 발견. 지상 약 20미터. 나흘째 방치.' },
    { group: 'victim', title: '피해자', cond: 'autopsy_done',
      text: '30대 중반 남성. 회색 맞춤 양복(협약 도시 반데르메르의 재단사 상표), 탱고 구두 한 짝. 신분증 없음. 손끝에 먹지 자국 — 서류를 많이 다루던 사람.' },
    { group: 'victim', title: '피해자', cond: 'victim_named',
      text: '얀 트로스트, 34세. 협약 해상보험사 보렐 & 파르의 손해사정인. 4번 크레인 붕괴 사고의 보험금 청구를 심사하러 3주 전 솔레아에 왔다. 그랜드 메리디안 호텔 305호 투숙.' },

    /* 사인 */
    { group: 'cause', title: '사인', cond: 'autopsy_done',
      text: '목의 밧줄 자국. 그러나 검시 결과가 전부 나오지는 않았다.' },
    { group: 'cause', title: '사인', cond: 'postmortem_rope',
      text: '목의 밧줄 자국에 피하출혈이 없다. 매달릴 때 이미 죽어 있었다. 교수형은 연출이다.' },
    { group: 'cause', title: '사인', cond: 'found_bullet',
      text: '총상. 쇄골 위 목 아래로 들어간 총알이 가슴에 박혀 있었다. 위에서 아래로 향한 궤적. 탄두는 7.65mm, 경비대 지급 라븐 리볼버의 탄. 매달리기 전에 죽었다. 밧줄은 연출이다.' },

    /* 시각 */
    { group: 'time', title: '사망 시각', cond: 'autopsy_done',
      text: '부패 정도로 보아 발견 하루 전 밤. 즉 닷새 전 밤.' },
    { group: 'time', title: '사망 시각', cond: 'tape_heard',
      text: '닷새 전 밤 01:17. 리나의 녹음테이프에 총성 한 발이 기록되어 있다.' },

    /* 장소 */
    { group: 'place', title: '사망 장소', cond: 'postmortem_rope',
      text: '크레인이 아닌 다른 곳. 시신은 옮겨졌다.' },
    { group: 'place', title: '사망 장소', cond: 'found_tar',
      text: '구두 밑창의 방수 타르와 비둘기 깃털. 타르칠한 지붕 위, 비둘기가 있는 곳. 솔레아의 어느 옥상.' },
    { group: 'place', title: '사망 장소', cond: 'roof_searched',
      text: '레테 무도장 옥상 테라스. 화분 밑에 씻어낸 핏자국. 비둘기장 앞의 타르 바닥.' },

    /* 시신을 매단 자들 */
    { group: 'hangers', title: '시신을 매단 자들', cond: 'rope_known',
      text: '선원식 매듭(쌍고리 보울라인), 부두의 계선줄. 뱃사람이나 하역부의 솜씨.' },
    { group: 'hangers', title: '시신을 매단 자들', cond: 'dogs_confessed',
      text: '"일곱 번째 부두의 개들"(마테오, 알론소, 페페, 라우로)이 자백했다: 회사 첩자를 붙잡아 산 채로 매달았다고. 하지만 그는 매달리기 전에 이미 죽어 있었다. 그들은 누군가를 감싸고 있다.' },
    { group: 'hangers', title: '시신을 매단 자들', cond: 'simon_confessed',
      text: '크레인 기사 시몬이 털어놓았다. 그날 새벽 로사의 명령으로 7번 크레인을 움직였다고. 시신은 이미 식어 있었다.' },

    /* 용의자 */
    { group: 'suspect_self', title: '용의자: 당신', cond: 'found_bullet && !has.gun_ravn && !truth_known',
      text: '경비대 지급 7.65mm. 당신의 총은 사라졌다. 당신은 지난 열흘을 기억하지 못한다.' },
    { group: 'suspect_self', title: '용의자: 당신', cond: 'gun_memory',
      text: '당신은 방아쇠를 당기지 않았다. 9일 전 밤, 부두에서 총을 한 아이에게 주었다. 그것이 당신의 몫이다.' },
    { group: 'suspect_company', title: '용의자: 할바르-마리스', cond: 'victim_named',
      text: '얀 트로스트의 보고서가 나가면 회사는 보험금을 잃고 배상 책임을 진다. 동기는 충분하다.' },
    { group: 'suspect_crows', title: '용의자: 회색 까마귀', cond: 'crows_met',
      text: '회사가 고용한 용병대. 무장했고, 협약의 비호를 받는다. 그러나 대위는 트로스트의 죽음에 진심으로 분노하는 것처럼 보인다.' },
    { group: 'suspect_union', title: '용의자: 붉은 닻', cond: 'rosa_met',
      text: '로사 이바라의 노조. 파업 3주째. 크레인을 쥐고 있다. 무언가를 숨기고 있다.' },

    /* 이네스 */
    { group: 'ines', title: '이네스', cond: 'ines_known',
      text: '레테 무도장의 댄서. 로사 이바라의 손녀, 4번 크레인 사고로 죽은 토마스 이바라의 딸. 피해자에게 탱고를 가르쳤다. 사건 이후 사라졌다.' },
    { group: 'ines', title: '이네스', cond: 'ines_where',
      text: '여러 사람이 가리키는 곳: 조수 요새. 코뮌 전사들이 총살당한 섬. 썰물 때 걸어서 갈 수 있다.' },
    { group: 'ines', title: '이네스', cond: 'ines_met',
      text: '이네스를 찾았다. 그녀는 모든 것을 보았다.' },

    /* 진실 */
    { group: 'truth', title: '그날 밤', cond: 'bobo_suspect && !truth_known',
      text: '녹음테이프 속 아이의 목소리: "누나!" 옥상 비둘기장의 아이 기지. 누군가의 남동생.' },
    { group: 'truth', title: '그날 밤', cond: 'truth_known',
      text: '얀과 이네스는 옥상에서 탱고를 추었다. 비둘기장에서 자다 깬 보보는 누나가 공격당한다고 생각했다. 그는 당신이 준 총으로 쐈다. 로사는 모든 것을 덮기 위해 시신을 크레인에 매달게 했다.' },

    /* 4번 크레인 */
    { group: 'crane4', title: '4번 크레인', cond: 'crane4_known',
      text: '6주 전 붕괴. 사망 6명. 회사 측 주장: 운전자 과실. 노조 측 주장: 정비 불량.' },
    { group: 'crane4', title: '4번 크레인', cond: 'has.ev_report',
      text: '얀 트로스트의 보고서: 할바르-마리스는 정비 일지를 14개월간 조작했다. 권양 케이블의 피로 파단. 운전자 과실의 증거 없음.' },
  ];
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
