# Whitney (휘트니)
성별 대명사는 `C.npc.Whitney.pronoun`(m/f)에 따라 달라지므로 대사에 성별 표지를 넣지 않는다. `<<He>>【이가】`, `<<his>>`로만 받는다.

## 인물
- 학교의 불량 패거리 두목이자 PC를 괴롭히는 가해자. 사물함에 가두기, 옷 벗기기, 돈 뜯기, 성적 모욕과 강제 행위까지 한다(game/overworld-town/special-whitney/main.twee 전반, loc-school/ 곳곳). 친구들(패거리)을 늘 달고 다니며 "내 걸레"라고 소유물처럼 부른다(street.twee `my slut`).
- 호칭은 거의 모욕이다: slut, whore, bitch, brat, crybaby. PC의 성별과 무관하게 같다.
- 변수에 따라 태도가 달라진다.
  - `C.npc.Whitney.dom` 10 이하: 눌려 있다. 약이 올라 이를 갈고 거칠게 받아친다(`gnashes <<his>> teeth`, `You've got jokes`). 15 이상: 여유 있게 비웃고 자기가 쥐고 있다고 믿는다(`You're one to talk, slut`). 그 사이: 웃음을 억지로 지으며 "한 방 먹었다" 하고 넘긴다.
  - `$audiencepresent` 1 이상: 구경꾼에게 말을 건다. 과시하고 선동한다(`Enjoy the show, perverts!`, `You guys hearing this shit?`).
  - `$whitneyromance`와 `C.npc.Whitney.love` 15~20 이상, `isLoveInterest("Whitney")`: 욕은 그대로이되 아끼는 마음이 새어 나온다. 못 이기는 척 부탁을 들어주고(`askRough`), 중얼거리고, 데려다주고, 불쌍히 여기는 말을 꺼낸다(`Don't hurt yourself or whatever`, `Fine, jeez`). 다정한 말도 욕에 섞어서 한다(`Thanks for the company, slut`).
  - 교사·어른·낯선 사람 앞: 일부러 정중하게, 비꼬거나 시치미를 뗀다(`Sorry, sir. Somebody kept me up all night.` / `I didn't do nothing`). 이 경우에만 존댓말이 허용된다.
- 순결·페티시 등 장면별 한 줄 대사 풀은 `speech-whitney.twee`(EN-new 약 2,270줄, 풀 이름: imminent, fondle, penetrated, touch, expose, namedrop 등)에 있고, PC의 애원·도발에 답하는 쌍은 `reaction-whitney.twee`(신규)에 있다.

## 말투 규칙
- **기본은 거친 반말(해체)이다.** 존댓말은 위의 비꼬는 경우에만 쓰고, 그때도 한 문장 안에서 화계를 섞지 않는다.
- 어미: `~야/~어/~지/~네/~거든/~잖아/~냐?/~해` 위주. 평서의 `~거야`를 쓰고 `~거다`는 쓰지 않는다. 명령은 `~해`, `~해라`는 드물게 쓴다. `~군`, `~구나`는 놀림에서만 가끔 쓴다. `~군요`, `~소`는 쓰지 않는다.
- 1인칭 `나/난/내`, PC는 `너/넌/네`. `네년`은 격할 때만 쓴다. 호칭은 문장 끝에 붙인다. 평소 `걸레야`(slut), 격하면 `걸레년아`, `걸레년`(붙여 쓴다). bitch는 `<<bitch>>【아야】`, whore는 `창녀`나 `걸레`. 대사 안에서 자기 이름을 부르지 않는다. 패거리는 `얘들아`, `이 새끼들아`. 다른 인물은 이름이나 `<<he>>`로 부른다.
- 문장은 짧고 직설적이다. 한 번에 한두 문장이며, 마지막에 모욕이나 위협을 건다. 욕은 `씨발`, `존나`, `좆같은`, `젠장`, `개소리`, `뒈져`, `닥쳐`, `꺼져`를 쓴다(fuck→씨발, shit→젠장/개소리). 기존 번역에서 `씨발` 88회, `존나` 34회.
- 입버릇: 명령형 `~해, 걸레야`, 비꼬는 `엉?`/`그래?`/`하.`, 짧은 웃음 `하!`. 말줄임(`이... 멍청한...`)은 기존처럼 마침표 세 개로 쓰고, 휘트니 본인은 더듬지 않는다(`저-저는` 같은 더듬기는 PC나 타인의 몫). 분노가 클수록 문장이 더 짧아진다. 호감이 높을 때는 말끝이 흐려지고(`뭐 그런 거지`, `알아서 하든가`) 욕이 약해진다.
- 서술 태그: `비웃는다`, `웃어제낀다`, `능글맞게 웃는다`, `으르렁거린다`, `눈썹을 찌푸린다`.
- **피해야 할 것**: 해요체/합쇼체(교사·낯선 사람 앞의 비꼼 제외), 하오체·하게체(`~소`, `~군요`, `~하게`), 반말에 `~님`, 애교 어투, 설명조의 긴 문장, 영어식 직역(`당신`을 PC에게 쓰지 않는다. 대사 속 PC는 `너`다), PC를 존중하는 낱말(`친구`, `당신`).

## 기존 번역 현황
- 지배적 말투는 거친 반말이다. special-whitney/와 speech-whitney.twee의 따옴표 대사 약 1,550개 중 `~요/~습니다` 꼴 56개는 거의 전부 PC·타인·비꼼 대사이고, 반말 어미가 약 650개로 압도한다. `걸레야` 150, `걸레년아` 25, `걸레년` 38, `걸레 년`(띄어쓰기) 2, `암캐` 28, `<<bitch>>` 45, `씨발` 88, `존나` 34. `~거야/~지/~네` 계열이 약 143, `~거다` 3, `~해라` 약 12, `~군` 약 20.
- 잘 살린 점: slut→걸레, bitch→`<<bitch>>`로 일관되고, 욕이 입에 붙어 상스러운 학교 일진의 느낌이 난다. 교사 앞의 비꼬는 존댓말(loc-school/widgets.twee:1630 `죄송합니다, 선생님. 누가 절 밤새도록 안 재워줬거든요.`)도 의도대로 구분했다.
- 어긋나는 사례
  - `home.twee:991` "혼날 거다" → "혼날 거야" (`~거다`는 어른 말투다)
  - `speech-whitney.twee:9` "푹 빠져들 거다!" → "푹 빠져들 거야!" (같은 이유)
  - `home.twee:4013` "이기는 거다" → "이기는 거야"
  - `home.twee:1558` "조심해라, 걸레야." → "조심해, 걸레야." (`~해라`보다 `~해`가 다수)
  - `main.twee:3094`, `main.twee:3122` "걸레 년" → "걸레년" (띄어쓰기 통일)
  - `main.twee:3599` "결정을 못 하는군." → "결정을 못 하네." (`~군`은 학생이 비웃는 말투로 딱딱하다. 비슷하게 `street.twee:2701` "잘 따르는군" → "잘 따르네")
  - `park.twee:445` "내가 왜 네게 줘야 하는데" → "내가 왜 너한테 줘야 하는데" (`너한테`가 다수, 같은 줄의 `네가`와 맞춘다)
  - `street.twee:3462` "함께 왔소 … 반갑군요" → 한 화계로. Whitney가 베일리 앞에서 하는 가식이므로 "함께 왔어요 … 반가워요"(해요체)로 맞추고 비꼼은 뒤 문장이 맡는다.
- 통일 방향: 따옴표 안 휘트니의 말은 거친 반말(해체)로, `~거다/~군/~소`는 `~거야/~네`로, 호칭은 `걸레야/걸레년아/걸레년`(붙여서)으로 고친다. 존댓말은 교사·어른·낯선 사람 앞의 가식에만 둔다.

## 예시 (영어 원문 → 한국어)
- 평상시 (친구들과)
  - "Fucking school," <<he>> says. "You coming?" → "씨발 학교." <<he>>【이가】 말한다. "너 올 거야?" (신규, 직접 번역)
  - "Good slut," <<he>> says, grabbing a crisp. "I should make you wear an apron, and nothing else." → "착한 걸레." 휘트니가 감자칩 하나로 딥을 퍼 올리며 말한다. "앞치마만 입히고, 다른 건 아무것도 안 입히는 것도 괜찮겠네." (home.twee:3263, 기존)
  - "Guess we're walking," Whitney says. "I prefer it anyway." → "걸어가야겠네." 휘트니가 말한다. "난 어차피 그게 더 좋아." (신규, 직접 번역)
- 호의적일 때
  - "Thanks for the company." → "같이 있어줘서 고마워." (widgets.twee:101, 기존)
  - "Thanks for this, slut." → "이건 고마워, 걸레야." (park.twee:634, 기존)
  - "Don't hurt yourself or whatever." (love 20 이상, 입속으로 중얼거림) → "다치지 않게 알아서 해. 뭐, 그런 거지." (신규)
  - "Yeah? You want me to be rougher? How could I say no to you, slut?" (`isLoveInterest`, love 20 이상) → "그래? 더 거칠게 해달라고? 네 부탁인데 어떻게 거절하겠어, 걸레야?" (신규)
- 적대적일 때
  - "Crybaby. We'll get you next time." → "울보 새끼. 다음엔 잡아줄게." (Bully Fight Finish, 기존)
  - "You've got jokes. The slut's got fucking jokes!" (dom 10 이하, 이를 갊) → "농담이 나와? 이 걸레년이 씨발 농담을 하네!" (신규)
  - "You're one to talk right now, slut. You guys hearing this shit?" (dom 15 이상, 관중 있음) → "네가 할 소린 아니지, 걸레야. 얘들아, 이 개소리 들었냐?" (신규)
  - "Stop making up shit!" (관중 앞에서 혀를 참) → "개소리 지어내지 마!" (신규)
- 교사 앞 가식
  - "Sorry, sir. Somebody kept me up all night." → "죄송합니다, 선생님. 누가 절 밤새도록 안 재워줬거든요." (widgets.twee:1630, 기존)
- 성적인 상황
  - "No one can call you a virgin after this. You're my dirty slut now." → "이제 처녀란 소리는 못 듣겠네. 넌 이제 내 천박한 걸레년이야." (speech-whitney.twee:5, 기존)
  - "Was this off limits? I want to hear you squeal, <<bitch>>!" → "여긴 안 된다 이거냐? 네가 뒈질 듯이 꽥꽥거리는 소릴 듣고 싶다고, <<bitch>>【아야】!" (기존)
  - "Relax, <<bitch>>. You can take it." → "긴장 풀어, <<bitch>>【아야】. 넌 받아낼 수 있어." (신규)
  - "Fuck, you're pregnant? I knew you were a dirty slut." → "씨발, 임신했어? 더러운 걸레년인 줄은 알았지만." (신규)
