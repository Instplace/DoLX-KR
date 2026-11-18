# Wren (렌)

## 인물
- 밀수와 절도에 능한 젊은 도적이자 밀수꾼. 술집 지하(Smuggler Pub), 교도소 마당과 배, 저택 카드 도박판(Estate Cards), 사보타주 작전에서 만난다. 목소리가 PC보다 별로 나이 들어 보이지 않는데도 주변이 따른다. 보호해 주는 무리("후드를 쓴 인물", 칼날이 번뜩이는 일행)가 있다.
- 겉은 느긋하고 세련되고 말솜씨가 좋은 한량이다. 조롱과 익살로 분위기를 가볍게 만들지만 속은 계산이 빠르고, 위험할 땐 돌변해 단호하다. 마술 카드 트릭과 허세 있는 인사로 스스로를 연출한다. 친구에게는 의리가 있다.
- 호감도 `C.npc.Wren.love`: 20 미만이면 계산적이고 짧다("수익은 칠삼으로 나누자."). 20 이상이면 "반반/육사"로 더 후하게 나누고, 40 이상이면 먼저 술을 권하고 농담하며 "여기 단골 자리"를 알려준다("주말 해질녘에 자주 와, 부끄러워하지 마."). 호감이 높아도 선을 넘는 다정함은 없고 장난으로 얼버무린다.
- 교도소 안에서는 상인이다. 상어 이빨(shark's teeth)을 받고 물건과 정보를 판다("이빨을 가져왔다면 바깥세상에서 온 좋은 물건들이 좀 있지"). 경비원 이름과 흉터 있는 죄수의 이름을 모으는 거래에서는 냉정하게 흥정한다.
- 도박과 성적 상황(카드 게임 `estate.cards`): 승자일 때 짓궂고 여유롭게 놀린다("귀여운 봉오리네", "자제력 엄청 필요한 거 알아?"). 속임수가 들통나면 차갑게 눌러놓고 "교훈"을 준다("자, 이제 저항하지 마. 넌 좋은 손에 들어갈 거야"). 취중에도 말투는 크게 흐트러지지 않는다.

## 말투 규칙
- 기본: 느긋하고 건들거리는 반말(해체). 호감도와 상관없이 PC에게 존댓말을 쓰지 않는다. 낯선 사람이나 적에게도 존댓말이 아니라 비꼬는 반말이다.
- 어미: "~야/~어/~네/~지/~거든/~잖아/~군(감탄, 비꼼)". 짧은 단문에 재치 있는 한마디를 덧붙인다. 문어체 느낌의 한자어, "~하오/~합니다"는 쓰지 않는다. 한 가지 예외: 과장된 허세 연기(박수에 절하며 하는 "고마워, 정말 고마워. 과찬이야.")도 반말로 처리한다.
- 1인칭 "나/내". PC는 "너". 호칭은 `<<girl>>`(소년/소녀, "너 같은 멋진 <<girl>>"), "친구", "자기"는 쓰지 않는다. "당신"은 쓰지 않는다. 다른 인물은 "랜드리", "윈터", "브라이어", "레미"처럼 이름만 부른다.
- 입버릇: "이게 누구야"(Look who it is), "한잔할래?"(Fancy a drink?), "다음에 봐", "아쉽지만 가봐야겠네. 일이 생겨서 말이야"(Business calls), "마음대로 해"(Suit yourself), "농담이야"(Just kidding), "감탄했어"(Colour me impressed). 짓궂은 비유와 한 줄 격언("악당한테 휴식은 없는 법이지"). 웃음은 지문("웃는다", "비죽 웃는다")으로, "ㅋㅋ"는 쓰지 않는다. 말줄임은 "...", 더듬기는 쓰지 않는다.
- 문장은 짧고 리듬 있다. 설명을 길게 하지 않고 빈정거림으로 끝맺는다. 존대 비슷한 말("~지요", "~군요")을 쓰지 않는다.
- 피해야 할 것: 해요체, 합쇼체, 하오체("고맙소", "~하겠소"), 사극투, 지나치게 다정한 "~란다/~렴", 애교, 욕설 남발. 남자 말투인지 여자 말투인지 드러나는 어미(예: "~다오", "~란 말이야")도 피한다(성별 `<<He>>` 처리).
- 성적 상황: 반말 유지, 짓궂은 칭찬과 놀림("얼굴 붉히네", "작은 엉덩이라고 부끄러워하지 마. 난 귀엽다고 생각해."). 이기고 있을 때는 여유롭고 지고 있을 땐 투덜대지만 쿨하다. 원문 수위를 넘기지 않는다.

## 기존 번역 현황
- 지배적 말투: 반말(해체) 99%. 렌이 직접 말하는 약 150문장(special-wren, loc-cave/pub, loc-prison/wren·beach)과 estate cards, sabotage의 약 340문장 중 존댓말은 PC의 말이거나 연기용 단 한 곳이다. 1인칭 "나", 2인칭 "너", 호칭 `<<girl>>`이 일관된다.
- 잘 살린 점: "이게 누구야", "한잔할래?", "악당한테 휴식은 없는 법이지"처럼 능청스러운 말버릇이 살아 있다. 이기고 있을 때의 놀림("귀여운 봉오리네")과 들켰을 때의 차가움("자, 이제 저항하지 마.")이 구분된다. 수익 배분을 "반반/육대사/칠대삼"으로 옮긴 숫자 표기도 자연스럽다.
- 어긋나는 사례:
  - `game/overworld-underground/loc-cave/pub.twee:1154` `"고맙고, 또 고맙소," ... "과찬이십니다."` → `"고마워, 정말 고마워," ... "과찬이야."` (하오체와 합쇼체가 한 대사에 섞이고 반말 기조와 어긋남. 원문 "Thank you, thank you. You're too kind.")
  - `game/overworld-underground/loc-cave/pub.twee:399` "어이, 이게 누구신가." → "어이, 이게 누구야." (Wren의 첫인사 "Look who it is"는 cards.twee 등에서 "이게 누구야" 20회 이상. 이 한 곳만 하게체 존칭 "누구신가". 같은 파일 556행 "이게 누구야"는 제퍼의 대사)
  - `game/overworld-plains/loc-estate/cards.twee:1267` "나보다 못한 <<personsimple>> 벌써 널 덮쳤을 거야." → "나보다 못한 <<personsimple>>【이가】 벌써 널 덮쳤을 거야." (조사 마커 빠짐. 같은 문장의 1235행 변형은 "<<girl>>【이가】"처럼 마커가 있다)
  - 말투 자체의 어긋남은 이 외에 거의 없다. 이 인물은 가장 일관된 편이다. (교도소 파일의 금빛 안내문 "~가지고 있습니다"는 기존 번역의 시스템 문구 관례이므로 건드리지 않는다.)
- 통일 방향: Wren은 전부 느긋한 반말(나/너, `<<girl>>`/친구). 연기조 과장이나 계약 장면에서도 존댓말·하오체를 쓰지 않는다.

## 예시 (영어 원문 → 한국어)
1. (평상시) "Look who it is. Fancy a drink?" → "이게 누구야. 한잔할래?"
2. (평상시) "Charming. I come here to relax. But there's no rest for the wicked." → "매력적이네. 난 여기 쉬러 왔거든. 하지만 악당한테 휴식은 없는 법이지."
3. (평상시) "I fear I must be off. Business calls. See you around." → "아쉽지만 가봐야겠네. 일이 생겨서 말이야. 다음에 봐."
4. (평상시, 교도소) "If you've got teeth, I have some goodies from the outside." → "이빨을 가져왔다면, 바깥세상에서 온 좋은 물건들이 좀 있지."
5. (평상시) "Suit yourself." → "마음대로 해."
6. (호의) "I'll even sweeten the pot for you. We split the profits fifty-fifty. Sound good?" → "덤도 얹어 줄게. 수익은 반반으로 나누자. 어때?"
7. (호의) "I knew you'd follow me. But I didn't think you'd keep up. Colour me impressed." → "따라올 줄 알았어. 근데 끝까지 따라붙을 줄은 몰랐네. 감탄했어."
8. (호의) "Always happy to entertain a fine <<girl>> like you. Have a seat. What's on your mind?" → "너 같은 멋진 <<girl>>【을를】 맞는 건 언제나 기분 좋은 일이지. 앉아. 무슨 고민이라도 있어?"
9. (적대) "Look who it is. You were a very bad <<girl>> last time, cheating and booking it like that. Ready to be taught a lesson?" → "이게 누구야. 지난번엔 아주 나쁜 <<girl>>【이었였】지, 그렇게 속임수를 쓰고 도망치다니. 교훈을 배울 준비는 됐어?"
10. (적대) "Got you. Now, stop resisting. You're gonna be in good hands." → "잡았다. 자, 이제 저항하지 마. 넌 좋은 손에 들어갈 거야."
11. (성적) "You're enjoying this. I can see it on your face." → "즐기고 있네. 얼굴에 다 보여."
12. (성적) "This is taking a lot of self-control, you know." → "이거 자제력 엄청 필요한 거 알아?"
13. (성적) "You're blushing. Don't be embarrassed by your small ass. I think it's cute." → "얼굴 붉히네. 작은 엉덩이라고 부끄러워하지 마. 난 귀엽다고 생각해."
14. (직접 번역, 일행 앞에서) "No <<if $player.gender_appearance is "f">>panties<<else>>underwear<</if>>!" Wren announces. → "속옷이 없네!" 렌이 소리친다.
15. (직접 번역, 일행에게) "Calm down guys. I think that's a good enough show. Besides, we don't know who <<pshe>> is. Someone might come looking." → "다들 진정해. 이 정도면 충분한 구경거리였어. 게다가 저 사람이 누군지도 모르잖아. 누가 찾으러 올지도 몰라."
