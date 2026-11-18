# Landry (랜드리)

## 인물
- 술집(Pub)을 거점으로 하는 장물아비이자 브로커(fixer). 평범하고 눈에 띄지 않는 외모의 사람으로, 처음엔 PC에게 먼저 합석을 제안하며 "돈이 필요하다는 걸 안다"고 접근한다. 성별은 `<<he>>`/`$pronoun`으로 가변.
- 느긋하고 영리하며 말 속에 뼈가 있다("Not all old dogs need new tricks I guess"). 거래는 현실적이지만 PC에게 호의적이고 보호하려 한다("You're a good kid"). 위험한 일을 시킬 때는 솔직하게 사정을 설명하고, 숨긴 게 있으면 사과한다("Sorry, I left out some details").
- 베일리·에이버리와의 "전쟁"에서 반에이버리 저항 쪽이다. 에이버리의 스카이스크래퍼 폭탄, 가짜 돌 교환, 갈색 여우(Brown Fox) 첩자 등 정보전의 중심에 있다. 윤리적으로 회색지대지만 PC의 안전은 챙긴다.
- 상황 변수: `$avery_fate`(에이버리의 운명), `$avery_mansion.landry_told`, `$police_hack`. PC가 화내면(`Pub Avery Stones Angry`) 당황해서 변명하고("It wasn't my decision"), 침묵하면 어색하게 달랜다("Cheer up."). PC가 협박하면 놀라 웃으며 순순히 받아들인다("I am at your mercy"). 호감도는 큰 변화 없이 후하게 보상한다.
- 미키(Mickey)는 랜드리가 소개해 주는 고아원 출신 해커의 별칭('Mickey')이지 랜드리의 다른 이름이 아니다. 번역에서 혼동하지 않는다.

## 말투 규칙
- 기본: PC에게 허물없는 반말(해체). 연장자의 여유 있는 반말: "~지", "~군", "~네", "~거든", "~어", "~잖아". 설명이 길어질 때도 반말을 유지한다("솔직하게 말할게. 네가 돈이 필요하다는 걸 알아."). 존댓말은 쓰지 않는다. PC가 존댓말을 써도 랜드리는 반말로 받는다.
- 1인칭 "나/내", 2인칭 "너/넌/네가". "당신"은 쓰지 않는다. 호칭은 이름 없이 "너", 가끔 "착한 아이", "꼬마"를 쓸 수 있다("넌 착한 아이야"). 다른 인물: "베일리", "에이버리", "미키", "갈색 여우"(여우 가면).
- 문장은 중간 길이로 매끄럽고 설명적이다. 반어와 비유가 있다("늙은 개에게 새로운 재주가 필요 없는 경우도 있는 법이지."). 입버릇: "자,", "글쎄,", "그래.", "어쨌든,", "그래서?". 말을 끊고 소리를 낮추는 지문과 함께 쓴다("<<He>> 주위를 살핀다.").
- 웃음/감탄은 지문("미소 짓는다", "웃는다")으로 처리하고 "ㅋㅋ"를 쓰지 않는다. 더듬거나 말을 흐리지 않는다.
- 피해야 할 것: 하오체("~하겠소", "~하오"), "당신" 호칭, 합쇼체(PC에게), 해요체, 과한 욕설, 감정적인 외침. 원문의 장난스러운 격식("I am at your mercy")도 하오체로 옮기지 말고 반말로 비튼다.
- 성적 상황: 랜드리의 성적 장면은 거의 없다. 있다면 같은 반말로 짧고 담담하게, 상대를 놀리듯 말한다. 원문 수준을 넘지 않는다.

## 기존 번역 현황
- 지배적 말투: 랜드리가 화자인 따옴표 문장 약 155개(pub main/fame/seduction, 에이버리 구간) 중 반말 약 150, 존댓말 1~2. 사실상 전부 반말이고 1인칭 "나", 2인칭 "너"가 일관된다. 오탐이던 "~니까"로 끝나는 문장을 제외하면 어긋나는 곳은 거의 없다.
- 잘 살린 점: 첫 만남의 "솔직하게 말할게… 돈은 두둑하게 쳐줄게." 의 거래꾼 어조, "늙은 개에게 새로운 재주가 필요 없는 경우도 있는 법이지." 같은 반어, 에이버리 구간의 미안해하는 반말("미안해. … 내 결정이 아니었어.").
- 어긋나는 사례:
  - `game/overworld-town/loc-pub/main.twee:2045` "당신 처분에 맡기겠소." → "네 처분에 맡기겠어." (원문 "I am at your mercy."는 재미있어하며 격식을 장난으로 쓴 것이다. 하오체와 "당신"은 이 인물에게 이 한 곳뿐)
  - 용어 주의: `propernouns-clean.tsv`의 Landry 행에 미키(13)가 붙어 있지만, 해당 문장은 해커 미키에 대한 것이다. 랜드리를 "미키"로 옮기지 않는다.
- 통일 방향: 랜드리는 PC에게 끝까지 반말(나/너). 격식을 차리는 원문도 반말의 반어로 처리하고 하오체/당신을 없앤다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 첫 만남) "I'll be frank. I know you need money. Don't ask me how I know, word gets around." → "솔직하게 말할게. 네가 돈이 필요하다는 걸 알아. 어떻게 아는지는 묻지 마, 소문은 퍼지기 마련이니까." (기존 번역 그대로)
2. (평상시) "Awfully useful, that one. No one ever pays the little fox any mind, or ever seems to remember they've been somewhere. Not all old dogs need new tricks I guess." → "아주 쓸모 있는 녀석이지. 아무도 그 작은 여우에게 신경 쓰지 않고, 어디에 있었는지도 기억하지 못하는 것 같더군. 늙은 개에게 새로운 재주가 필요 없는 경우도 있는 법이지." (기존 번역 그대로)
3. (평상시) "Good to see you're already acquainted." → "이미 안면이 있는 사이라니 다행이군." (기존 번역 그대로)
4. (평상시, 일 의뢰) "Sure. Give me 10 minutes." → "물론이지. 10분만 줘." (기존 번역 그대로)
5. (호의적) "Hacking a police computer? I like your style." → "경찰 컴퓨터를 해킹한다고? 네 스타일 마음에 드는군." (기존 번역 그대로)
6. (호의적) "You're a good kid. I don't think anyone else would have put their life on the line for someone like Avery. Not willingly, at least." → "넌 착한 아이야. 에이버리 같은 사람을 위해 목숨을 걸 사람은 아무도 없을 거라고 생각해. 적어도 자발적으로는 말이지." (기존 번역 그대로)
7. (호의적) "So I heard. You've done a good thing. Sorry, I left out some details. The less you knew, the safer you were." → "그렇게 들었어. 넌 좋은 일을 한 거야. 몇 가지 세부 사항을 빼놓아서 미안해. 네가 덜 알수록 더 안전했으니까." (기존 번역 그대로)
8. (호의적, 위로) "Cheer up. It's not all gloom and doom just yet." → "기운 내. 아직 절망적인 상황은 아니니까." (기존 번역 그대로)
9. (적대적/당황, PC가 화냄) "I'm sorry. It wasn't my decision. Still, you were safer this way. Imagine if you knew the fake stones were a bomb." → "미안해. 내 결정이 아니었어. 그래도, 이 편이 더 안전했어. 가짜 돌이 폭탄이라는 걸 알았다면 어땠을지 상상해 봐." (기존 번역 그대로)
10. (적대적, PC가 협박) "I am at your mercy." → "네 처분에 맡기겠어." (기존 "당신 처분에 맡기겠소."를 수정)
11. (적대적, 경계) "It's okay. <<pShes>> here to see me." → "괜찮아. <<pShe>>【은는】 날 보러 온 거야." (기존 번역 그대로)
12. (평상시, 설명) "Did I say that? Your good work got my lips flapping. I'll say you've made some powerful people happy, and leave it at that." → "내가 그랬나? 네가 일을 잘해서 입이 가벼워졌군. 힘 있는 사람들 몇을 기쁘게 했다는 말만 하고 넘어가지." (직접 번역)
13. (평상시, 대화 마무리) "Now, is there anything else you have for me?" → "자, 나한테 줄 다른 게 더 있나?" (직접 번역)
