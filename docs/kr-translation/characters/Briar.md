# Briar (브라이어)

## 인물
- 마을 창관(Brothel)의 주인이자 업소의 "소유주"를 자처하는 포주. PC에게는 고용주 겸 포식자다. 직원으로 받아들이는 면접(Brothel Intro)에서 쇼 기획, 순결 쇼, 가짜 신분증, 자판기 사업까지 돈이 되는 일은 다 제안한다. 느긋하고 매끄러운 사업가이며 와인을 들고 소파에 기대앉아 있다(`Briar's Office`).
- 평소에는 여유롭고 비꼬는 웃음이 있다("I should be careful where I let you snoop around"). 돈이 걸리면 무섭게 변한다: 쇼를 펑크 내면 부하를 데리고 와서 돈을 받아낸다("Where were you?... Now."), 창관 밖에서 몸을 팔면 지하실로 끌고 가 가둔다("Until," Briar growls).
- 상황 변수: `C.npc.Briar.love`(호감)가 오르면 농담과 정보를 더 풀고, `C.npc.Briar.dom`이 높을수록 위압적이다. 쇼 대금을 내면 `npcincr Briar dom 1`. 숨은 사업 거래(자판기, 신분증)에서는 PC를 사업 파트너처럼 대한다. 에이버리의 파티(`special-avery/party.twee`)에서는 손님으로 와서 능글맞게 협상한다.
- 성별은 `<<he>>`로 가변. 대사에서 성별을 드러내지 않는다. 경찰 앞에서는 PC를 팔아넘기는 비정한 면(`Brothel Exposed`)이 있다.

## 말투 규칙
- 기본: PC에게 반말(해체). 위협 대목은 거친 해라체/반말("이제부터는 달라질 거다.", "네 싸구려 몸뚱이"), 평소 대화는 느긋한 반말("~지", "~군", "~잖아", "~거든").
- 존댓말은 관객/손님을 향한 무대 인사에만 쓴다("감사합니다, 감사합니다... 마음껏 이 창녀를 사용하세요. 공짜입니다."). 사업 이야기(가짜 신분증, 자판기)도 반말을 유지한다. 격식을 차리는 느낌은 "~군", "~지"로 낸다.
- 1인칭 "나/내", 2인칭 "너/넌/네". "당신"은 쓰지 않는다. 호칭은 이름 없이 "너"가 기본. 욕은 "창녀", "싸구려"까지만 원문 수준으로.
- 문장은 짧고 단정하다. 위협 직전에 말이 길어지고 끝은 짧게 끊는다("당장 내놔."). 웃음은 지문("웃는다", "으르렁거린다")으로 처리하고 대사에 "ㅋㅋ"를 쓰지 않는다.
- 피해야 할 것: 같은 장면에서 반말과 해요체를 오가는 것, "~요/~습니다"로 PC를 대하는 것, 소심한 말투와 더듬기, "~하오/~소" 사극투, "당신".
- 성적 상황: 반말 유지. 쇼 준비는 사무적이고 능글맞다("너 정말 더러운 애구나. 이건 분명히 이목을 끌 거야."). 감정이 아니라 돈 계산으로 말한다. 처벌 장면은 차갑고 짧다("앞으로 네 몸을 팔고 싶으면, 내 지붕 아래에서 해.").

## 기존 번역 현황
- 지배적 말투: 브라이어가 화자인 문장을 센 결과(창관 main/shows, pub fame, connudatus, 에이버리 파티) 반말 약 190, 해요체 약 25, 합쇼체 약 15(파티 구간은 에이버리/다른 화자가 섞여 제외). 에이버리 파티의 브라이어 대사는 전부 반말이다("난 다람쥐였으면 좋겠네.").
- 잘 살린 점: 면접과 쇼 제안의 능글맞은 반말, 위협 장면의 압박감("어디 있었어?... 당장 내놔."), 업소 주인의 건조한 유머.
- 어긋나는 사례 (`game/overworld-town/loc-brothel/main.twee`):
  - `:666,675` "아, 그 낡은 거 말이죠. 작동 안 해요." → "아, 그 낡은 거. 작동 안 해. 한동안은 재미있었는데, 특수한 연료가 필요해서 말이지." (원문 "That old thing. Doesn't work." 같은 장면 끝의 "다른 할 말은?"은 반말)
  - `:672` "어디서 염탐하고 다니는지 조심해야겠네요. … 맞아요." → "…조심해야겠네. … 맞아." (같은 passage 안에서 반말과 해요체가 섞임)
  - `:720` "호기심이 많으시군요. … 그 기계는 VIP 전용으로만 쓸 겁니다." → "호기심이 많군. … 그 기계는 VIP 전용으로만 쓸 거야." (바로 뒤 "다른 할 말은?"은 반말)
  - `:733` "이거 놀랍군요. £2000였나요? 여기요. 아무 데나 놔두세요." → "이거 놀랍군. £2000였나? 여기. 아무 데나 놔둬." (Briar Gel Give)
  - `:759,761` "위조 신분증을 마련해 줄 수 있습니다. … 정확히 …입니다." → "위조 신분증은 마련해 줄 수 있어. … 정확히 …야." (원문은 같은 주인의 느긋한 어조; `:750` "훌륭해요, 후회하지 않을 겁니다"도 "훌륭해, 후회하지 않을 거야.")
  - `game/overworld-town/special-avery/party.twee:5184` "당신을 조심해야겠어." → "널 조심해야겠어." (반말인데 "당신" 호칭이 새어 들어옴)
- 통일 방향: 브라이어가 PC에게 하는 말은 전부 반말(나/너), 존댓말은 관객 무대 인사에만. 자판기/신분증/가짜 ID 구간의 해요체·합쇼체를 반말로 고친다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 면접) "My name is Briar. Welcome to my establishment." → "내 이름은 브라이어야. 내 업소에 온 걸 환영해." (기존 번역 그대로)
2. (평상시) "Anything else I can do for you?" → "내가 더 해줄 일이라도 있나?" (기존 번역 그대로)
3. (평상시, 사업) "I can supply you with a fake ID. But I believe I mentioned it would be expensive, yes?" → "위조 신분증은 마련해 줄 수 있어. 하지만 비쌀 거라고 말했던 것 같은데, 그렇지?" (가이드에 맞춰 수정)
4. (평상시, 사업) "Don't baulk at the cost, these things fool government scanners and border checks." → "가격 듣고 꽁무니 빼지 마. 이 물건은 정부 스캐너와 국경 검문소까지 속여 넘기니까." (수정)
5. (호의적) "I should be careful where I let you snoop around. You're right." → "어디서 염탐하고 다니는지 조심해야겠네. 맞아." (수정)
6. (호의적, 쇼) "Well, that depends on if the rumours are true or not first. Supposedly, you're still a virgin. I find that hard to believe." → "글쎄, 그건 먼저 소문이 사실인지 아닌지에 달려있지. 듣자 하니, 네가 아직 처녀라던데. 믿기 힘든걸." (기존 번역 그대로)
7. (호의적, 사업) "A shame. It would be a very good money maker." → "아쉽군, 좋은 돈벌이가 됐을 텐데." (기존 번역 취지)
8. (적대적, 돈) "Where were you? The crowd were expecting a show. It cost me, but you'll pay for it." → "어디 있었어? 관객들은 쇼를 기대하고 있었다고. 나한테 손해가 막심했지만, 네가 그 대가를 치르게 될 거야." (기존 번역 그대로)
9. (적대적, EN-new 수수료 표기) `_printmoney. Now.` → `_printmoney. 당장.` (금액은 변수 출력이라 그대로 둔다)
10. (적대적) "Until," Briar growls. "I heard you've been stealing from my customers. Hurting the reputation of my establishment. Driving away my customers." → "그때까지는." 브라이어가 으르렁거린다. "네가 내 손님들한테서 훔치고 다닌다고 들었다. 내 업소의 평판을 깎아먹고, 손님들을 쫓아내고 있다고." (직접 번역)
11. (적대적, 협박) "A driver will pick you up... You better show up on time. And remember, I expect you to be on your best behaviour." → "운전기사가 … 업소 앞으로 데리러 갈 거야. 제때 나오는 게 좋을 거야. 그리고 얌전히 굴 거라고 기대하겠어." (직접 번역)
12. (성적, 처벌) "If you want to sell that body of yours in the future, you do so under my roof." → "앞으로 네 몸을 팔고 싶으면, 내 지붕 아래에서 해." (기존 번역 그대로)
13. (성적, 처벌) "Maybe now you'll think twice before crossing me." → "이제 나한테 덤비기 전에 두 번 생각하게 될 거야." (기존 번역 그대로)
14. (성적, 쇼 제안) "You're a dirty one. This is certainly going to draw attention." → "너 정말 더러운 애구나. 이건 분명히 이목을 끌 거야." (기존 번역 그대로, 돼지 쇼 제안)
15. (관객 앞) "Thank you, thank you. And now my friends, feel free to use this whore. On the house." → "감사합니다, 감사합니다. … 이제 친구들, 마음껏 이 창녀를 사용하세요. 공짜입니다." (기존 번역 그대로, 이 한 곳만 존댓말)
