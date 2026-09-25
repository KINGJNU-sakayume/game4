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
    { group: 'truth', title: '그날 밤', cond: 'recon_done && !truth_known',
      text: '재구성: 자정 무렵 두 사람이 옥상 테라스에 올라왔다. 춤을 추었다. 01:17, 남자가 코르테 자세로 여자를 안고 몸을 숙였을 때, 6.8미터 떨어진 비둘기장의 구멍에서 한 발. 남은 것은 방아쇠를 당긴 손.' },
    { group: 'truth', title: '그날 밤', cond: 'truth_known && !gun_memory',
      text: '얀과 이네스는 옥상에서 탱고를 추었다. 비둘기장에서 자다 깬 보보는 누나의 웃음소리를 비명으로 들었고, 코르테를 폭력으로 보았다. 그는 경비대 총으로 쐈다. 열한 살 아이가 어떻게 경비대 총을? 로사는 모든 것을 덮기 위해 시신을 크레인에 매달게 했다.' },
    { group: 'truth', title: '그날 밤', cond: 'truth_known && gun_memory',
      text: '얀과 이네스는 옥상에서 탱고를 추었다. 비둘기장에서 자다 깬 보보는 누나의 웃음소리를 비명으로 들었고, 코르테를 폭력으로 보았다. 그는 당신이 아흐레 전 부두에서 목에 걸어 준 총으로 쐈다. 로사는 모든 것을 덮기 위해 시신을 크레인에 매달게 했다.' },

    /* 총 */
    { group: 'gun', title: '라븐 리볼버', cond: 'found_bullet && !gun_found',
      text: '경비대 지급 라븐 7.65mm. 당신의 권총집은 비어 있다. 그 총은 지금 누군가의 손에 있다.' },
    { group: 'gun', title: '라븐 리볼버', cond: 'holster_found && !gun_found',
      text: '비둘기장 담요 밑의 빈 권총집, 안쪽에 "SCW 9-0417". 총은 아이에게 있다. 아이는 그것을 들고 다닌다.' },
    { group: 'gun', title: '라븐 리볼버', cond: 'bobo_fled && !gun_found',
      text: '보보가 장전된 총을 들고 밤 속으로 달아났다. 회색 까마귀가 부두에 오는 날에. 그는 누나에게 갈 것이다.' },
    { group: 'gun', title: '라븐 리볼버', cond: 'gun_found',
      text: '총을 되찾았다. 약실 여섯 개 중 두 개에 탄, 빈 탄피 하나. 당신은 남은 탄을 빼냈다. 이제 그것은 증거물이자, 당신의 지급품이다. 둘 다 당신 책임이다.' },

    /* 4번 크레인 */
    { group: 'crane4', title: '4번 크레인', cond: 'crane4_known',
      text: '6주 전 붕괴. 사망 6명. 회사 측 주장: 운전자 과실. 노조 측 주장: 정비 불량.' },
    { group: 'crane4', title: '4번 크레인', cond: 'report_exists_known && !has.ev_report && !report_fate',
      text: '얀 트로스트는 결론을 내렸다. "증거 확보. 청구 기각 권고." 그러나 보고서는 목요일 배에 실리지 않았다. 보고서는 어디 있는가?' },
    { group: 'crane4', title: '4번 크레인', cond: 'has.ev_report',
      text: '얀 트로스트의 보고서: 할바르-마리스는 정비 일지를 14개월간 조작했다. 권양 케이블의 피로 파단. 운전자 과실의 증거 없음. 이것을 어디로 보낼 것인가? 노조, 보험사, 라디오, 경비대. 혹은 회사.' },
    { group: 'crane4', title: '4번 크레인', cond: 'report_fate == 1',
      text: '보고서를 로사 이바라에게 넘겼다. 그녀는 그것으로 협상할 것이다. 여섯 가족에게 빵을, 토마스에게 이름을. 대가는 비밀.' },
    { group: 'crane4', title: '4번 크레인', cond: 'report_fate == 2',
      text: '보고서는 협약 공문 행낭에 봉인되었다. 토요일 새벽 우편선으로 반데르메르의 보렐 & 파르 본사에. 얀이 원하던 곳으로. 닷새 늦게.' },
    { group: 'crane4', title: '4번 크레인', cond: 'report_fate == 4',
      text: '보고서는 그랜드 메리디안의 은 쟁반 위에서 재가 되었다. 700솔도.' },

    /* 이바라 가족 */
    { group: 'bobo', title: '보보', cond: 'bobo_confessed',
      text: '보보가 털어놓았다. 비둘기장, 구멍, 누나의 "비명", 두 손으로 쥔 총. "나쁜 놈이었죠?" 그 질문에 당신이 대답했다.' },
    { group: 'bobo', title: '보보', cond: 'bobo_crisis_seen',
      text: '보보는 7번 크레인의 사다리에 올라가 총을 들고 외쳤다. "내가 쐈어!" 온 부두가, 라디오로 온 사르가가 들었다.' },
    { group: 'rosa', title: '로사 이바라', cond: 'rosa_final_done && rosa_stance == 1',
      text: '로사 이바라는 자수하기로 했다. 시신을 옮기고 매달게 한 것, 하역부들에게 대본을 준 것, 손녀를 숨긴 것. 전부.' },
    { group: 'rosa', title: '로사 이바라', cond: 'rosa_final_done && rosa_stance != 1',
      text: '로사 이바라는 끝까지 경찰서에 가지 않겠다고 했다. "나는 손주들을 지켰소."' },

    /* 최후통첩 */
    { group: 'standoff', title: '7번 크레인의 대치', cond: 'ultimatum && !standoff_done',
      text: '회색 까마귀의 라스무센 대위: 트로스트를 매단 자들을 해 질 녘까지 7번 크레인 아래로 넘겨라. 그러지 않으면 직접 데려가겠다. 하역부들이 막으면 치우겠다.' },
    { group: 'standoff', title: '7번 크레인의 대치', cond: 'standoff_result == 1',
      text: '해 질 녘의 대치는 피 없이 끝났다. 까마귀들이 한 줄로 물러갔다.' },
    { group: 'standoff', title: '7번 크레인의 대치', cond: 'standoff_result == 2',
      text: '해 질 녘의 대치에서 총성이 울렸다. 부상자 여럿. 사망자는 없었다.' },
    { group: 'standoff', title: '7번 크레인의 대치', cond: 'standoff_result == 3',
      text: '해 질 녘의 대치에서 두 사람이 죽었다. 하역부 라우로 벨트란, 스물둘. 회색 까마귀 대원 요한, 스물.' },

    /* 재빛 왜가리 */
    { group: 'heron', title: '재빛 왜가리', cond: 'lorenzo_heron && !heron_proven',
      text: '로렌초 벨로소는 40년째 레테 하구의 전설적인 새를 찾는다. 깃털, 발자국, 목격. 방파제 끝의 말뚝은 지도에는 16개다.' },
    { group: 'heron', title: '재빛 왜가리', cond: 'heron_proven && !heron_seen',
      text: '깃털, 발자국, 노란 눈. 17번째 말뚝은 말뚝이 아니다.' },
    { group: 'heron', title: '재빛 왜가리', cond: 'heron_seen',
      text: '넷째 날 새벽, 17번째 말뚝이 날개를 폈다. 그것은 바다가 아니라 도시로 날아갔다.' },
  ];
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
