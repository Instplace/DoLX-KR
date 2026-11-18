# Mason (메이슨)

## 인물
- 학교 수영 교사. 교사 중 가장 어려서 일부 학생과 나이 차가 몇 살뿐이다. 탄탄한 몸이 수업에서 드러나지만, 학생들의 시선을 알아채도 내색하지 않는다(원문 설명). 성별은 `<<he>>`/`<<his>>`로 처리한다.
- 성격은 성실하고 조용하며 쉽게 얼굴이 붉어지는 수줍은 사람이다. 호수에서 몰래 알몸으로 수영하는 취미(`Mason's Secret` 업적)를 들키면 말을 더듬고 몸을 가리며 "조용히 수영하게 내버려 둬"라고 한다. 단, 학생을 방치하지는 않는다. 위험한 차림이나 얼음 위 다이빙에는 "조심해, 알았지?"라며 걱정하고, 괴롭힘을 보면 단호하게 막는다("또 너희들이냐. 다른 학생들 괴롭히지 마.").
- 윈터(교사)가 PC에게 채운 정조대 열쇠를 가지고 있다(`C.npc.Mason.chastityKeyCarried`). 호감 `love` 5 이상이나 욕정 `lust` 10 이상이면 호수나 수영장에서 "열쇠를 가지고 있어. 내가 한번 해봐도 괜찮을까?"라고 먼저 제안하고, 거절당하면 한동안 다시 묻지 않는다(`masonChastityRemovalDeclined`). 윈터를 "Old Winter"라 부르며 "특이한 취미를 가졌다"고 조심스레 평한다.
- 호감도·욕정이 높을수록 옷을 입지 않은 PC 앞에서 더 허둥대고(`mason_greet_lust`: "제발 옷 좀 입어"), 높지 않을 때는 선생다운 훈계("선생 앞에서 그게 무슨 꼴이야")가 나온다. PC가 짓궂게 놀리면 얼굴이 불가능할 만큼 붉어져 화제를 돌린다. 불량 평판이 높으면 PC를 의심하고 무시한다. 호수는 방과 후/비 오는 저녁에 만난다.
- 수영장에서 알몸 수업이 벌어지면 압도되어 아무 말도 못 하고("너희들까지?"), 레이튼에게 책임을 추궁당한다.

## 말투 규칙
- 기본: PC와 학생에게 부드러운 반말(해체). "~어/~야/~지/~군/~거든/~네", 의문은 "~니?/~어?". 수업 중 공식 지시는 "수업 중이다"처럼 짧은 해라체가 가능하지만 일상 대화에서는 쓰지 않는다. 존댓말, 하오체, 하게체, "~하마/~냐" 같은 옛말투와 거친 어미는 쓰지 않는다.
- 레이튼에게는 존댓말(교장), 윈터는 "윈터"(PC에게는 "윈터 영감" 대신 성별 중립으로 "윈터"/"나이 든 윈터").
- 1인칭 "나"(수줍을 땐 "나-나는"), 2인칭 "너". "당신"은 쓰지 않는다. 학생이 여럿이면 "너희". 호칭은 이름 없이 "너".
- 말더듬은 수줍거나 당황할 때만, 하이픈형으로 쓴다: "여-여기서", "이-이해해줘서", "만-만족했으면", "네-네 선생님한테". 한 대사에 한두 번까지. 쉼표형("제, 제발")과 자모 단독("ㅁ, 못")은 쓰지 않는다. 말줄임은 "..."로 머뭇거릴 때만.
- 문장은 짧고 조심스럽다. 입버릇: "조심해, 알았지?", "그, 그게", "음...", 변명하는 "~거든". 웃음은 지문("미소 짓는다"), 얼굴 붉힘은 지문으로 처리하고 대사에 "ㅋㅋ"는 쓰지 않는다.
- 피해야 할 것: 거칠거나 무례한 반말("~냐", "~하마", "~이다"의 선고), 반말+존댓말 혼용, 한 대사 안의 하이픈형과 쉼표형 혼용, "당신".
- 성적 상황: 메이슨은 먼저 선을 넘지 않는다. PC가 손을 잡아 끌면 주저하고, 스스로 "우린 이러면 안 돼" 하며 자제한다. 어휘는 담담하고 조심스럽게, 말더듬과 시선 회피가 많다. 노골적인 단어는 원문 수준을 넘지 않는다.

## 기존 번역 현황
- 지배적 말투: 메이슨이 언급된 줄(수영 수업·이벤트, 호수 mason.twee)의 따옴표 문장 약 92개 중 해체 85(92%), 해라체 2, 존댓말 5(PC나 학생 말). 1인칭 "나", 2인칭 "너"가 일관된다. 말더듬은 하이픈형이 압도적이다(mason.twee와 swimming 계열에서 하이픈형 약 22, 쉼표형 2).
- 잘 살린 점: 호수 장면의 수줍은 반말과 "여-여기서 학생을 볼 줄은 몰랐는데"의 하이픈 더듬기, "조심만 해, 알았지?" 같은 선생다운 걱정, "너희들까지?"의 당황이 원문 인물상(수줍고 성실한 젊은 교사)을 잘 담았다.
- 어긋나는 사례:
  - `game/overworld-town/loc-school/classes/swimming.twee:643` "ㅁ, 못 들은 걸로 하마." → "못-못 들은 걸로 할게." (원문 "I-I'll pretend I didn't hear that." 자모 단독 더듬기와 "~하마"는 이 인물답지 않다. 하이픈형 + 부드러운 반말)
  - `game/overworld-town/loc-school/classes/swimming-late.twee:49` "이제야 왔냐." → "이제야 왔구나." (원문 "There you are,". "~냐"는 거칠다)
  - `game/overworld-forest/loc-lake/mason.twee:564` "제, 제발 옷 좀 입어," → "제-제발 옷 좀 입어," (같은 파일 대부분이 하이픈형)
  - `game/overworld-town/loc-school/classes/swimming.twee:215` "수업 중이다. …" → "수업 중이야. …" (원문 "I've got a class to teach."는 PC 한 사람에게 하는 말이라 선고조 "~이다"보다 부드러운 해체)
- 통일 방향: 메이슨은 PC에게 늘 부드러운 반말(나/너), 더듬기는 하이픈형으로만, 레이튼에게만 존댓말. "~하마/~냐"는 쓰지 않는다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 호수) "It's nice to see you out here. If it's okay though, I'd like to continue my laps." → "여기서 보니 반갑네. 괜찮다면, 계속 수영하고 싶은데." (기존 번역 그대로, mason.twee:8)
2. (평상시, 수영장) "Are you lost? Or is there something you need to tell me?" → "길 잃었니? 아니면 나한테 할 말이라도 있어?" (기존 번역 그대로)
3. (평상시, 수영장, 지각) "There you are. You've been excused, but you're a bit too late to join in." → "이제야 왔구나. 결석 처리 안 되긴 했지만, 지금 참여하기엔 너무 늦었어." (가이드에 맞춰 손봄. 기존은 "이제야 왔냐.")
4. (호의, 호수) "I'm glad you found me. You can get in if you like." → "찾아와줘서 기뻐. 좋으면 들어와도 돼." (기존 번역 그대로, mason.twee:318)
5. (호의, 격려) "Thank you for understanding. I need to get back to my laps. Keep practising, you've shown promising skill." → "이-이해해줘서 고마워. 난 다시 수영하러 가봐야겠어. 계속 연습해, 넌 유망한 실력을 보여줬어." (기존 번역 그대로, mason.twee:94)
6. (호의, 걱정) "At least you're dressed for it. Just be careful, alright?" → "적어도 옷은 제대로 입었네. 조심만 해, 알았지?" (기존 번역 그대로)
7. (호의, 정조대) Mason pulls out a small key. "You've had a run in with Old Winter. I think this might fit. W-would you mind if I tried?" → 메이슨이 작은 열쇠를 꺼낸다. "윈터랑 한바탕했구나. 이게 맞을 것 같아. 내-내가 한번 해봐도 괜찮을까?" (기존 번역에서 "윈터 영감"만 성별 중립으로 손봄)
8. (호의, 정조대) "Well, it does fit, so you're welcome. It's not the first time I've had a run in with one of these." → "음, 맞네. 도움이 됐다니 다행이야. 나도 이런 것과 얽힌 적이 처음이 아니거든." (EN-new 대사를 가이드에 맞춰 직접 번역)
9. (적대) "I knew it would have something to do with you. Stop harassing the other students." → "너랑 관련 있을 줄 알았어. 다른 학생들 괴롭히지 마." (기존 번역 그대로)
10. (호의, 걱정) "If you're sure. I don't think there's a rule forbidding bound arms while swimming. Just be careful, okay?" → "정 그렇다면. 수영하는 동안 팔을 묶으면 안 된다는 규칙은 없는 것 같은데. 조심해, 알았지?" (EN-new 신규 대사, 직접 번역)
11. (적대, 당황) "I-I hope you're satisfied. Now leave me to finish my laps in peace." → "만-만족했으면 좋겠네. 이제 조용히 수영이나 마저 하게 내버려 둬." (기존 번역 그대로, mason.twee:238)
12. (성적 상황, 알몸을 들킴) "You should put some clothes on." → "옷을 좀 입지 그래." (기존 번역 그대로. 욕정이 높을 때의 "P-please put some clothes on"은 "제-제발 옷 좀 입어,")
13. (성적 상황, 손길) "We shouldn't have done that." → "우리... 이러면 안 되는데." (가이드에 맞춰 직접 번역. 수줍게 시선을 피하며)
14. (성적 상황, 놀림에 반응) "Th-that's no request to make of your teacher! Now please, let me get back to my laps." → "네-네 선생님한테 할 부탁이 아니잖아! 이제 제발, 다시 수영하게 해 줘." (앞 문장은 기존 번역 그대로, mason.twee:245)
