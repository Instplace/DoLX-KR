# Leighton (레이튼)

## 인물
- 학교의 교장(`<<nnpc_title "Leighton">>`). 겉으로는 규칙과 훈육을 앞세우는 점잖은 권위자이고, 속으로는 처벌·검진·"개인 교습"을 구실로 학생을 훔쳐보고 만지고 촬영하는 가학적 관음자다. 방과 후 벌(`detention.twee`: 줄 쓰기, 세차, 패들), 건강검진(`inspections.twee`), 과학박람회 심사, 마을 유흥 업소(Brothel)와 클럽 무대 뒤(`special-leighton`)에서 PC를 마주친다. 업소에서는 손님으로 와서 "우리 학교 학생 같은데" 하며 PC를 놀린다. 성별은 `<<he>>`로만 처리한다(코드가 "그의/그는"을 박으면 안 된다).
- 평소의 결은 차갑고 격식 있다. 문장은 완결형이고 "자", "그만하면 됐다", "~하도록 해라", "괜찮다면 말이다" 식의 교사조다. 완곡어("의학적 검사", "교훈", "개인 교습")로 가린 채 욕구를 밀어붙이다가, 흥분하거나 PC가 도발하면 가면이 벗겨지고 거칠어진다("더러운 작은 창녀", "야, 이 <<bitch>>").
- 변수: `$delinquency`(문제아일수록 냉랭하다. "우린 더 할 얘기가 없다. 나가라."), `$daily.school.headInterrupted`(같은 날 두 번째 방문이면 "또 너냐?"), `C.npc.Leighton.dom/love`(패들·사진·협박을 거치며 오른다), `$genderknown`(PC의 성을 알면 "아가씨/녀석"을 고른다), `$headblackmailed`, `$schoolfameblackmail`(약점 쥔 쪽은 PC), `$leightonAssaulted`.
- 상황별 태도: 교장실·검진에서는 훈계조의 권위. 공개 석상(무대, 마이크)에서는 "~합니다" 합쇼체로 점잔을 뺀다. 업소·클럽에서는 와인을 마시며 돈을 내고 지켜보는 손님이라 느긋하고 하게체("준비되면 언제든지 시작하게")를 쓴다. 벌 장면에서 PC가 말을 안 들으면 반말이 섞인 위협과 비속어로 바뀐다. 에이버리 일행(퀸, 베일리)과는 동료로서 "자네"를 쓴다.

## 말투 규칙
- 기본 화계: PC와 학생에게 하라체(~다/~라/~군/~나?/~지?)가 기본이다. 점잖게 구슬릴 때와 업소·클럽에서는 하게체(~게/~네/~시오 대신 "~하게", "~바라네")를 허용한다. 검진·상담처럼 교사가 어르는 장면은 "~란다/~렴/~구나/~겠나?"를 쓴다.
- 공적 자리(무대 발표, 학부모·방송)는 합쇼체. 동료 어른(에이버리, 퀸, 베일리)에게는 "자네"와 하게체/반말. 이 전환은 상대와 자리가 바뀔 때만 일어나며 같은 장면에서 문장마다 오가지 않는다.
- 1인칭 "나/내"(공적 자리는 "저/제"). 2인칭 "너"(학생), "자네"(동료). "당신" 금지. PC 호칭은 "어린 <<lady>>/<<girl>>", "착한 <<girl>>", 거칠어지면 "<<bitch>>". 자기를 "교장"으로 지칭한다("나는 교장이다").
- 문장 길이는 중간, 군더더기 없는 완결형. 입버릇은 "자,", "그만하면 됐다", "~군.", "그렇지 않나?", "알겠나?", "나가라.", "기억하도록 해라." 말줄임표·더듬기는 거의 쓰지 않는다(당황할 때만 "ㄱ-그걸로 됐다", "ㅃ-빠짐없이" 식 한 번). 감탄사 없음. 웃음은 지문("씨익/비릿하게 웃는다", "낄낄거린다")으로 처리한다.
- 피해야 할 것: 해체의 친근한 어미("~거든/~잖아/~야?", "나가.", "알겠어?") 남발, 해요체("~세요/~죠"), "~입니다" 합쇼체를 사적 장면에서 쓰는 것, "너희 둘 다 마찬가지야" 같은 또래 말투, 말투와 어긋나는 가벼운 신조어, 성별 지정("그는/그의").
- 성적 상황: 침착한 권위와 외설이 같이 간다. 낮은 수치에서는 점잖게("아주 좋구나. 아름다운 자지를 가졌네."), 높은 수치/발정 상태에서는 하라체 그대로 욕을 얹는다("넌 더러운 꼬맹이 창녀로구나"). 반말로 갑자기 내려가지 않는다(한 장면에서 하라체와 해체가 섞이는 것이 최대 약점이다).

## 기존 번역 현황
- 지배적 말투: 하대지만 갈래가 갈린다. 레이튼이 화자인 문장 약 410개 표본(detention, inspections, special-leighton, science-project, school main, avery cards)에서 하라체·하게체 약 51%, 해체 약 37%, 존댓말 약 12%(무대 발표와 에이버리 일행 장면). 검진은 "~란다/~렴/~구나"로 비교적 통일돼 있다.
- 잘 살린 점: speech-leighton의 "~군" 하라체가 일관되고, 검진의 어르는 교사조, 업소·클럽의 하게체("마음대로 하게", "학교에서 보지")가 인물의 품위와 위선을 잘 담았다. "어린 <<lady>>", "착한 <<girl>>" 호칭도 일관된다.
- 어긋나는 사례:
  - `game/overworld-town/loc-school/detention.twee:4` "잊은 거 없어?" → "잊은 거 없나?" (같은 파일 다른 곳은 "준비됐나?", "알겠나?"처럼 하라체)
  - `game/overworld-town/loc-school/detention.twee:455` "그 정도면 됐어." / `:473` "넌 볼일 끝났으니, 나가봐." → "그 정도면 됐다." / "넌 볼일 끝났으니 나가라." (같은 파일 `:393` "그만하면 됐다.", `:676` "기억하도록 해라"와 어긋난다)
  - `game/overworld-town/loc-school/detention.twee:974` "그의 눈은 욕정으로 번들거린다." → "<<His>> 눈은 욕정으로 번들거린다." (성별 하드코딩. 같은 줄 "너는 말이지,"는 "넌 말이지,"도 무방)
  - `game/overworld-town/loc-school/detention.twee:2090` "그는 비틀거리다 넘어진다." → "<<he>>【은는】 비틀거리다 넘어진다." (성별 하드코딩)
  - `game/overworld-town/special-avery/cards.twee:2109` "무슨 말을 한 겁니까? … 상관없습니다. 갑시다. 방을 잡아뒀습니다." → "무슨 말을 한 거지? … 상관없다. 가자. 방을 잡아뒀다. 더는 시간 낭비하지 않겠다." (같은 장면 `:2144` "물어본 게 아니야. … 올라가."의 하대와 어긋나고, 원문은 "Come on. I've booked a room." 하대)
  - `game/overworld-town/special-avery/cards.twee:1955` "마음에 드는 건 뭐든 주문하세요" → "마음에 드는 건 뭐든 시켜라" (PC에게 해요체. 원문 "Order whatever you like"는 호의를 가장한 지시)
  - `game/overworld-town/loc-brothel/main.twee:59` "우리 학교 학생 같은데." → "우리 학교 학생 같군." (업소에서도 하게/하라 결을 유지한다. 해체 "같은데/말이야"로 떨어진다)
  - `game/overworld-town/loc-school/detention.twee:1077` "너는 더러운 작은 창녀야, 이거 좋아하지, 안 그래?" → "넌 더러운 꼬맹이 창녀로구나. 이거 좋아하지 않나?" (반말로 떨어져 교장의 결이 깨진다)
- 참고: 이 인물의 전용 대사(speech-leighton, special-leighton, 교장실)는 EN-old와 EN-new가 같고 코드만 달라졌다. 새로 번역할 때도 아래 규칙으로 쓴다.
- 통일 방향: 하라체(와 하게체)로 모은다. 해체는 비속어가 나오는 극단적 장면(1077 이하)에서도 어미만큼은 하라체로 올리고, 존댓말은 공적 자리(무대, 마이크)에만 남긴다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 교장실) Leighton looks up from <<his>> desk as you enter. "How can I help you?" → 당신이 들어가자 레이튼이 책상에서 고개를 든다. "무슨 일이지?"
2. (평상시, 방과 후) "Isn't there something you're forgetting?" → "잊은 거 없나?"
3. (평상시) "Write 'I will obey the rules,' repeatedly. Don't stop until I say stop." → "'나는 규칙을 준수하겠습니다'라고 반복해서 써라. 내가 멈추라고 할 때까지 멈추지 마라."
4. (호의적, 검진) "There we go. You have a beautiful penis. I don't know why you are so ashamed." → "아주 좋구나. 아름다운 자지를 가졌네. 왜 그렇게 부끄러워하는지 모르겠구나."
5. (호의적, 칭찬) "Good girl. I think <<hes>> learnt <<his>> lesson now." → "착한 <<girl>>【이】구나. 이제 <<he>>【은는】 교훈을 얻었을 거라 생각한다."
6. (적대적, 문제아) "You again? It's rude to keep bothering me without purpose. I'll have to flag you for punishment if this isn't important." → "또 너냐? 목적도 없이 계속 귀찮게 구는 건 무례한 짓이다. 중요한 일이 아니라면 벌점을 줘야겠군."
7. (적대적) "We have nothing to discuss. Get out." → "우린 더 할 얘기가 없다. 나가라."
8. (공적 자리) "We've made a decision," <<he>> says. → "결정을 내렸습니다." <<he>>【이가】 말한다.
9. (업소, 호의) "Right. Whenever you're ready." → "좋아. 준비되면 언제든지 시작하게."
10. (업소, 호의) "I hope that was an illuminating lesson." → "깨우침을 주는 수업이었길 바라네."
11. (업소, 만족) "You're a natural. See you at school." → "타고났군. 학교에서 보지."
12. (speech, 성적) "Far from satisfactory. Come see me again for further improvement." → "만족스럽지 못하군. 훈련이 더 필요하면 언제든 내게로 와라." (기존 번역을 그대로)
13. (성적, 억누른 흥분. 개선 번역) "You've got me all worked up now. I think you owe me a little release." → "네 덕에 잔뜩 달아올랐군. 그 값은 네가 치러야겠다."
14. (적대적+성적. 개선 번역) "We both know you're getting off on this, naughty girl." → "너도 이걸 즐기고 있다는 걸 우리 둘 다 알지 않나, 못된 <<girl>>."
15. (동료와의 카드 모임) "I thought about bringing a companion myself. But I need to be discreet." → "나도 동반자를 데려올까 생각했었지. 하지만 난 신중해야 하네."
