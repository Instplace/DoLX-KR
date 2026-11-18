# Harper (하퍼)

## 인물
- 병원의 젊은 의사(`Doctor Harper`, 호칭은 "하퍼 의사"(용어집 표준. "하퍼 박사"·"닥터 하퍼"는 쓰지 않는다)). 외모는 25세 이하로 보이는 금발이다. 에이버리의 파티와 농장 실험에서도 만난 사이다. 정중하고 침착하고 인자한 의사의 가면을 쓰고 최면(펜, 목소리), 검진, 촬영, 동물을 이용한 "치료"를 이어 가는 포식자다. 성별은 `<<he>>`로만 처리한다.
- 숲속 요양원(asylum)에서는 정신과 의사로 환자를 "치료"한다. 가스라이팅이 핵심이다("그건 강간이 아니었어요, 당신이 원했던 거죠"). 환자 사이에는 "하퍼는 의사가 아니라 환자였다"는 소문이 돈다(`socialise_warning_harper_doctor`). 늘 다정하고 합리적이지만 말 끝에 감시와 통제가 묻어난다.
- 변수: `C.npc.Harper.dom`(최면에 "This feels nice"를 고를 때마다 +5, 높을수록 명령형이 늘고 목소리가 떨린다. 말씨는 그대로 존대다), `$harper_appointments.hypnosis/exam/dog`(진료 단계), `$harperSeen`(병원/파티/농장 중 어디서 봤는지로 첫 인사가 달라진다), 요양원의 `$suspicion`(PC가 수상한 행동을 할수록 오르고, 하퍼가 경계하며 훈계한다).
- 상황별 태도: 정상 진료에서는 부드럽고 설명적("걱정 마세요, 당황하는 건 정상이에요"). 최면 중에는 낮고 느린 지시. 성적·촬영 장면에서도 같은 톤을 유지해 섬뜩함을 만든다. 마스크가 벗겨지는 때는 학생 조수나 간호인을 꾸짖을 때, 기계가 망가질 때, PC가 손찌검이나 반항으로 흐트러뜨릴 때뿐이다. 그때도 짧게 하대가 튀는 정도다.

## 말투 규칙
- 기본 화계: PC에게 존댓말. 설명·고지·진단은 합쇼체("~습니다/~군요/~십시오"), 안내·권유·지시는 해요체("~세요/~어요/~죠"). 두 가지를 장면 안에서 섞어도 되지만 한 문장 안에서 섞지 않는다. 최면 중의 지시도 해요체("펜에 집중하세요", "아주 좋아요").
- 1인칭 "저/제", 병원·요양원 공동의 일은 "저희". 2인칭 "당신"(이름을 부르지 않는다). 환자를 가리킬 때 "환자", 학생·간호인(아랫사람)에게는 반말이 허용된다("비커 좀 가져와").
- 다른 인물: 에이버리는 이름만, 조수 학생은 "학생", 환자는 "환자"로 부른다. PC가 부를 때는 "하퍼 의사 선생님" 또는 "선생님"(용어집 표준. 기존 번역의 "박사님"·"닥터 하퍼"는 통일 대상)(병원·요양원 번역에서 "박사님" 9회, "닥터 하퍼" 7회, 3인칭은 "하퍼 박사/하퍼 의사").
- 문장 길이는 중간, 완결형이고 차분하다. 입버릇은 "자,", "아주 좋습니다/좋아요", "걱정 마세요", "기록해 두겠습니다", "몸조리 잘하세요", "다음 주 같은 시간에 뵙겠습니다". 말줄임은 최면 유도 때만 "..."로 쓴다. 감탄사·욕설·더듬기 없음(마스크가 벗겨질 때 한 번 "ㅇ-여긴 괜찮습니다" 정도).
- 피해야 할 것: 한 장면 안에서 존댓말→하게체/반말로 갈아타기("보세", "보지", "가게"), "~나/~네/~게나" 같은 훈계체, 하라체 명령("입어라"), "너/네" 호칭, 거칠거나 속어적인 성 용어(의학 용어로 완곡하게 말한다), PC의 `$speech_attitude`에 따라 말투를 바꾸는 것.
- 성적 상황: 의학·치료·상담 용어로 포장한다("괜찮아요, 당신이 그들을 유혹했어도요. 자연스러운 일입니다"). 낮은 수치에서는 설명조, 높은 수치(`dom`)에서는 지시가 짧고 확신에 차지만 존대를 유지한다.

## 기존 번역 현황
- 지배적 말투: 존댓말. 병원·요양원 대사 약 290문장 표본에서 존대(합쇼+해요) 약 71%, 하대 약 29%. 병원 첫 만남·검진·퇴원 안내와 요양원 상담은 대부분 존대다. 하대는 병원 최면·촬영 장면(`appointments.twee`의 `Camera*`, `Dog Molestation Finish`, `Trance Dog Resist`)과 요양원 `Asylum Sit Kiss Further`, 일부 마스크 벗겨지는 곳에 몰려 있다. speech-harper는 합쇼체로 통일돼 있다.
- 잘 살린 점: 진료와 상담에서 "걱정 마세요", "진찰할 테니 편히 계세요", "솔직하게 말해줘서 고맙습니다", "몸조리 잘하세요"의 정중한 포식자 톤이 살아 있다. "~군요"의 관찰자 말투도 좋다.
- 어긋나는 사례:
  - `game/overworld-town/loc-hospital/appointments.twee:768` "펜에 집중해. 우주에는 이 펜과 내 목소리, 그리고 네 숨소리 외에는 아무것도 없어." → "펜에 집중하세요. … 이 펜과 제 목소리, 그리고 당신의 숨소리 외에는 아무것도 없습니다." (같은 문장이 `:102` `:113` `:252`에서는 "펜에 집중하세요")
  - `game/overworld-town/loc-hospital/appointments.twee:501` "오늘은 이만하면 됐어. … 다음 주 같은 시간에 보자. 잘 지내." / `:945` "…이만하면 됐어. … 보지. 잘 가게." / `:952` "…고맙네. … 하지. … 보세." → "오늘은 이만하면 됐습니다. … 다음 주 같은 시간에 뵙겠습니다. 몸조리 잘하세요." (같은 원문 "Same time next week. Be well."이 합쇼 4가지로 갈린다)
  - `game/overworld-town/loc-hospital/appointments.twee:997` "아주 좋아. 다음은, 제자리에서 한 바퀴 돌아보게..." → "아주 좋습니다. 다음은 제자리에서 한 바퀴 돌아보세요..." (바로 위 `:651` "아주 좋아요. … 벌리세요."와 어긋난다)
  - `game/overworld-forest/loc-asylum/events.twee:97` "실망이군. 가도 좋다." → "실망스럽군요. 가보셔도 좋습니다." (같은 원문 "I'm disappointed. You can go."가 `:257`에서는 "실망스럽군요. 가보세요.")
  - `game/overworld-forest/loc-asylum/events.twee:478,487,501,511` "몸조리 잘하게." / `:511` "치료에 저항하는 건 네 손해일 뿐이야." → "몸조리 잘하세요." / "치료에 저항해서 손해 보는 건 당신뿐입니다." (같은 원문이 `:1269`에서는 "몸조리 잘하세요.")
  - `game/overworld-forest/loc-asylum/events.twee:1920` "옷을 다시 입어라. 가도 좋다." → "옷을 다시 입으세요. 가셔도 좋습니다."
  - `game/overworld-forest/loc-asylum/main.twee:1735` "하퍼 박사를 힐끗 쳐다보지만, 그는 지금 …" → "하퍼 의사를 힐끗 쳐다보지만, <<he>>【은는】 …" (성별 하드코딩)
- 참고: 하퍼 전용 대사(speech-harper, 병원, 요양원)는 EN-old와 EN-new가 같고 코드만 달라졌다. 새로 번역하거나 손볼 때 위 규칙을 기준으로 한다.
- 통일 방향: PC를 향한 모든 대사를 존댓말(합쇼·해요)로 모은다. 하대는 간호인·학생 같은 아랫사람에게, 또는 마스크가 벗겨지는 한두 마디에 한해 남긴다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 진료) "Please strip down to your underwear and lie down on the bed." → "속옷만 남기고 벗은 뒤 침대에 누우세요."
2. (평상시) "Don't worry, it's normal to be embarrassed, but there's no reason to be." → "걱정 마세요, 당황하는 건 정상이지만 그럴 필요 없어요."
3. (평상시, 첫 인사) "Hello, I'm Doctor Harper." → "안녕하세요, 하퍼 의사입니다."
4. (호의적) "Aha. Avery's partner. I hope <<nnpc_he Avery>>'s well." → "아하. 에이버리의 파트너시군요. <<nnpc_he Avery>>【은는】 잘 지내고 있길 바랍니다."
5. (최면) "Focus on the pen. There's nothing in the universe except this pen, my voice, and your own breath." → "펜에 집중하세요. 이 우주에는 이 펜과 제 목소리, 그리고 당신의 숨소리밖에 없습니다."
6. (호의적, 칭찬) "Today was a success. Well done." / "Same time next week. Be well." → "오늘은 성공적이었습니다. 잘했어요." / "다음 주 같은 시간에 뵙겠습니다. 몸조리 잘하세요."
7. (호의적, 상담) "I appreciate your honesty. What this tells me is that you are very imaginative." → "솔직하게 말해줘서 고맙습니다. 이걸로 당신이 매우 상상력이 풍부하다는 걸 알 수 있겠군요."
8. (적대적, 냉담) "I'm disappointed. You can go." → "실망스럽군요. 가보셔도 좋습니다."
9. (적대적, 훈계) "The only person you're hurting by resisting treatment is yourself. You may go now. Be well." → "치료에 저항해서 다치는 건 당신 자신뿐입니다. 이제 가셔도 좋습니다. 몸조리 잘하세요."
10. (적대적, 가면이 벗겨짐) "You lack self-control. You will be a risk to innocent people around you until you can control your urges." → "당신은 자제력이 부족합니다. 충동을 통제할 수 있을 때까지 주변의 무고한 사람들에게 위협이 될 겁니다."
11. (성적, 촬영) "Very good. Next, I want you to twirl on the spot..." → "아주 좋습니다. 다음은 제자리에서 한 바퀴 돌아보세요..."
12. (성적, 가스라이팅) "You like this. You wanted them inside you. It wasn't rape, you wanted it." → "당신은 이걸 좋아해요. 당신은 그들이 당신 안에 들어오길 원했어요. 그건 강간이 아니었어요, 당신이 원했던 거죠."
13. (speech) "Hold still. I need to check your blood pressure." → "가만히 계십시오. 혈압을 확인해야 합니다."
14. (speech) "Interesting. You've a very healthy imagination, to give your hallucination such a name." → "흥미롭군요. 환각에 그런 이름까지 붙여주다니 상상력이 아주 풍부하십니다."
15. (speech) "Prior attachments. Noted." → "선행 애착 관계. 기록해 두겠습니다."
