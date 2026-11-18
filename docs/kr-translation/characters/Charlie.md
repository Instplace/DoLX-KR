# Charlie (찰리)

## 인물
- 댄스 스튜디오(Dance Studio)의 강사. 수업에서 PC를 가르치고, 실력이 오르면 접수원을 통해 댄서 일(부두, 파티, 다뉴브 가 클럽)을 소개해 주는 멘토다. 성별은 `<<he>>`로 가변. 요가 수업도 맡는다.
- 따뜻하고 장난기 있는 선생님. 수줍은 학생에게는 "I don't bite", 의욕이 넘치는 학생에게는 "Whoa there"로 받아 주고, 자만하면 가볍게 경고한다("Pride comes before a fall"). 일을 소개할 때는 돈이 되는 일과 위험한 일을 구별하고 PC의 안전을 먼저 걱정한다("So long as you're careful").
- PC가 몸을 비벼 와도 당황해서 얼굴만 붉히고 물러나며 선을 지킨다("Y-yes. I mean, no, I mean… I need to go check on someone else."). 접촉을 거부하면 배려한다("I forgot you were shy about that… without contact."). 학생을 보호하는 직업윤리가 강하다.
- 호감도 `C.npc.Charlie.love`: 높을수록(>=20) 머리를 긁적이며 쑥스러워하고, 0 이상이면 허리에 손을 얹고, 음수면 팔짱을 끼고 거리를 둔다. `danceskill`이 오르면 "star pupil"이라 여긴다(`named-npcs.twee`). PC가 거만하게 굴면(`Dancing Job Intro Haughty`, love -5) 차분히 경고한다.
- 첫 만남에서 PC가 추파를 던지면(`$phase 3`) 짜증을 내며 사무적으로 변한다. 이때만 거리를 두는 어조가 나온다.

## 말투 규칙
- 기본: PC(학생)에게 편한 반말(해체). 가르치는 사람의 따뜻하고 가벼운 반말("~야", "~어", "~지", "~거든", "~자,"). 일 소개와 수업 지시도 반말("부두 일 할 준비됐어?", "계속 연습해").
- 존댓말(해요체)은 두 곳에만 허용한다. (1) 첫 만남에서 PC가 선을 넘어 짜증이 났을 때("이쪽으로 자리 좀 잡아줄래요? 제 이름은 찰리입니다."), (2) 접수원/다른 직원 등 윗사람이 아닌 외부인을 상대할 때. 일상 수업·일 소개·요가에서는 쓰지 않는다. 한 장면 안에서 오가지 않는다.
- 1인칭 "나/난/내가"(해요체 구간에서만 "저/제"). 2인칭 "너/넌/네가". "당신"은 쓰지 않는다. 호칭은 이름 없이 "너". 접수원은 "접수원", 학생들은 "여러분"/"다들".
- 문장은 짧고 활기차다. 어미 "~야/~지/~어/~네", 끝맺는 "자, 어디까지 했더라?", "자, 이제 집중해.". 감탄 "워, 워,"(말릴 때), "음,", "어머". 웃음은 지문("웃는다", "미소 짓는다").
- 당황할 때는 "으, 응. 아니, 내 말은..."처럼 짧게 더듬는다. 더듬기는 쉼표형 음절 반복("으, 응")이고 한 대사 한 번까지.
- 피해야 할 것: 지시와 칭찬에서 갑작스러운 합쇼체("~입니다/~십시오"), 사극투("~하오"), 욕설, 지나친 다정함("자기야"), "당신" 호칭, 반말과 존댓말을 한 문장에서 섞는 것.
- 성적 상황: 강사는 성적으로 먼저 나서지 않는다. 접촉이 과해지면 얼굴을 붉히며 선을 그으며("아니, 내 말은...") 반말을 유지한다. 호감도가 높은 연애 분위기는 없고 칭찬과 격려가 중심이다("그렇게 될 거야, 생각보다 더 빨리.").

## 기존 번역 현황
- 지배적 말투: 찰리가 화자인 따옴표 문장 약 60개 중 반말 약 40, 해요체 약 18, 합쇼체 약 3. 일 소개(`job.twee`의 `Dance Job Ask`/`Stage Ask` 등)와 첫 만남(`main.twee:153,157`)은 반말, 일 소개 직전의 `Dancing Job Intro*`와 수업 중 장면(`Dance Studio Instructor`)·요가 수업은 해요체다.
- 잘 살린 점: 일 소개의 신중한 반말("하나 있긴 해. 조심하기만 한다면 말이야."), 첫 만남의 "해치지 않아. 내 이름은 찰리야.", 접수원에게 "난 좀 쉬다 올게, 계속 연습해."
- 어긋나는 사례:
  - `game/overworld-town/loc-dance-studio/job.twee:18,28` "와주길 바라고 있었어요." / "당신은 춤을 잘 춰요. 사람들이 돈을 내고 당신을 보려 할 겁니다. … 제가 어떻게든 찾아볼 수 있을 거예요." → "와주길 바라고 있었어." / "넌 춤을 잘 춰. 사람들이 돈을 내고 널 보러 올 거야. … 내가 어떻게든 찾아볼 수 있을 거야." (바로 이어지는 `Dance Job Ask`에서 같은 인물이 "부두 일 할 준비됐어?")
  - `…/job.twee:52,79` "저는 이런 건 잘 판단해요. 준비됐어요. … 제가 찾아볼 수 있는 걸 알아볼게요." / "조심해요. 자만은 패망의 선봉이니까요." → "난 이런 건 잘 판단해. 준비됐어. … 내가 알아볼게." / "조심해. 자만은 패망의 선봉이니까." (같은 일 소개 이후 장면은 반말)
  - `…/main.twee:454,464,469,476,482,484` Dance Studio Instructor의 "그렇게 될 거예요, 생각보다 더 빨리요.", "그러길 바라요… 잠시 입 다물고 잘 봐요...", "잘하고 있어요, 다른 사람 좀 확인하러 가야겠네요.", "자, 이제 집중해요...", "괜찮아요. 접촉 없이 자세 교정을 계속할 수 있어요. 자, 어디까지 했죠..." → "그렇게 될 거야, 생각보다 더 빨리.", "그러길 바라, 그게 내가 일을 제대로 했다는 뜻이니까. 자, 이제 잠깐 입 다물고 잘 봐…", "잘하고 있어, 다른 사람 좀 확인하러 가야겠네.", "자, 이제 집중해…", "괜찮아. 접촉 없이 자세 교정을 계속할 수 있어. 자, 어디까지 했더라…" (같은 수업을 시작하는 `:153,157`이 반말)
  - `…/main.twee:573,587` 요가 수업의 "예상했던 일이죠. 오늘 수업은 회복 요가로 가볍게 진행할 거예요.", "요가는 마음의 정화에 좋죠, 안 그래요?" → "예상했던 일이야. 오늘 수업은 회복 요가로 가볍게 하자.", "요가는 마음의 정화에 좋지, 안 그래?"
  - `…/main.twee:161` "이쪽으로 자리 좀 잡아줄래요? 제 이름은 찰리입니다." → 원문이 짜증 섞인 거리두기이므로 그대로 둔다(예외).
- 통일 방향: 찰리가 PC에게 하는 말은 반말(나/너)로. 해요체인 job 소개 intro, 수업 중 대사, 요가 수업을 반말로 고치고, 첫 만남 phase 3의 짜증 어조만 예외로 둔다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 첫 만남) "Don't worry, I don't bite. My name's Charlie. I'll help you out of your shell." → "걱정 마, 해치지 않아. 내 이름은 찰리야. 네가 껍질을 깨고 나올 수 있도록 도와줄게." (기존 번역 그대로)
2. (평상시) "Whoa there, eagerness is all well and good, but too much will get your muscles strained." → "워, 워, 열정은 좋지만, 너무 과하면 근육이 긴장할 수 있어." (기존 번역 그대로)
3. (평상시) "I need to take five. Keep practising, I won't be long." → "난 좀 쉬다 올게. 계속 연습해, 금방 돌아올 거니까." (기존 번역 그대로)
4. (평상시) "You ready for the dock job?" → "부두 일 할 준비됐어?" (기존 번역 그대로)
5. (평상시, 일 소개) "I was hoping you'd come by. You're a good dancer. People would pay to see you. It's a competitive field, but if you need work, I should be able to find something." → "와주길 바라고 있었어. 넌 춤을 잘 춰. 사람들이 돈을 내고 널 보러 올 거야. 경쟁이 치열한 분야지만, 일이 필요하다면 내가 어떻게든 찾아볼 수 있을 거야." (수정)
6. (호의적) "I'm a good judge of this sort of thing. You're ready." → "난 이런 건 잘 판단해. 준비됐어." (수정)
7. (호의적, 요가) "That's to be expected. We'll take it easy in class today with some restorative yoga." → "예상했던 일이야. 오늘 수업은 회복 요가로 가볍게 하자." (수정)
8. (호의적, 접촉 거부 배려) "I forgot you were shy about that. That's alright. We can continue working on your form without contact. Now, where were we..." → "그런 걸 부끄러워하는 걸 잊었네. 괜찮아. 접촉 없이 자세 교정을 계속할 수 있어. 자, 어디까지 했더라..." (수정)
9. (적대적/거리두기, 첫 만남 phase 3) "Would you like to take your place over here? My name's Charlie." → "이쪽으로 자리 좀 잡아줄래요? 제 이름은 찰리입니다." (기존 번역 그대로, 짜증 어조 예외)
10. (적대적, 오만 경고) "Careful now. Pride comes before a fall." → "조심해. 자만은 패망의 선봉이니까." (수정)
11. (진지, 위험한 일) "There is something. So long as you're careful. An exclusive club on Danube Street is looking for entertainment." → "하나 있긴 해. 조심하기만 한다면 말이야. 다뉴브 가의 한 고급 클럽에서 엔터테인먼트를 찾고 있어." (기존 번역 그대로)
12. (성적, 몸을 비빌 때) "Y-yes. I mean, no, I mean... you're doing okay, I need to go check on someone else." → "으, 응. 아니, 내 말은... 잘하고 있어, 다른 사람 좀 확인하러 가야겠네." (수정)
13. (성적/수업, 손을 잡을 때) "Now, pay close attention..." → "자, 잘 봐..." (직접 번역)
14. (호의적, 접촉 거부) "What's wrong? Are you afraid of being touched? Holding your partner is an important part of dancing." → "무슨 일 있어? 접촉이 두려워? 파트너를 잡는 건 춤의 중요한 부분이야." (수정)
