# Black Wolf (검은 늑대)

## 인물
- 숲 늑대 무리의 알파. 성별은 `C.npc["Black Wolf"].gender`(m/f)로 갈리므로 `<<bhe>>`/`<<bHe>>` 계열 매크로만 쓴다. 호칭은 설정에 따라 "검은 늑대"(본인도 3인칭으로 자기를 이렇게 부른다).
- 말이 되는 것은 수인 모드(`$monster is 1`)뿐이다. 일반 모드(짐승)에서는 같은 장면이 대사 없이 으르렁, 킁킁, 낑낑, 꼬리 흔들기 같은 지문으로 처리된다(예: `<<if $monster is 1>>"..."<<else>><<bHe>> lets out a satisfied chuff<</if>>`). 번역도 대사만 번역하고 짐승 모드 지문은 소리·몸짓으로 쓴다.
- 성격: 과묵하고 실리적인 지도자. 무리의 안전, 사냥, 새끼가 우선이다. 서툰 말로 직설한다. 호감이 쌓이면 PC에게 특별한 애착을 드러내고(꼬리, 핥기, 안아 올리기), 질투와 소유욕("Mate is mine")이 있다.
- PC 호칭은 `<<ppackbrother>>`가 결정한다(`$description is "alpha"`이고 `statusCheck("Black Wolf").love gte 100`이면 "짝", `$wolfpackleader`면 "무리 우두머리", 아니면 "무리의 형제/자매"). 대사 첫머리에 호칭을 붙이는 것이 버릇이다("<<pPackbrother>>. 괜찮나?").
- 태도 변수: 호감 `love` 낮음~중간 = 무심하고 평가하는 말투, 높음 = 걱정·애정이 섞임("<<pPackbrother>>【이가】 졌다! 이제 복종한다!"는 지배 장면, 임신·출산 장면은 가장 부드럽다). `$wolfpackleader`(PC가 우두머리)일 때는 PC를 존중하고 "무리 우두머리"라 부르며 질문조("사냥하나?"). PC가 약하면 도전·조롱·"네가 있어야 할 곳, 무리를 따라라".
- 지배 장면(`wolf.twee` 도전·`events.twee` 처벌): "도전은 없다. 복종해!", "내가 알파다. 널 벌해주겠다.". 발정/러트 장면: 도와주겠다며 거리낌 없이 제안한다("기꺼이 도와주지."). 선물은 육식 위주로 반응하고 채소가 들었으면 속았다고 화낸다.
- 다른 무리 늑대(`<<beasttype>>`)도 같은 서툰 말투를 쓴다.

## 말투 규칙
- 기본 화계: 하라체(~다/~군/~라/~지/~나?)를 쓰되 조사와 주어를 자주 생략하는 짧은 전보체다. 존댓말, 하오체, 합쇼체를 쓰지 않는다. 문장 하나는 짧게(3~8어절), 한 대사는 2~3문장을 넘기지 않는다.
- 1인칭 "나", 자기 이름을 부를 때 "검은 늑대"(비교·자기 비하에 쓰임: "검은 늑대보다 강하다"). 2인칭은 "너/네"이고 호칭은 `<<pPackbrother>>`/`<<ppackbrother>>`. "당신"은 쓰지 않는다. 무리는 "무리", 새끼는 "새끼들", PC가 우두머리일 때 "우두머리". 알파는 "알파"(본인), PC에게는 "우두머리".
- 전보체 요령: 서술어를 문장 끝에 두고 "을/를, 이/가" 같은 조사를 생략해 짧게 만든다. "남아라! 어린 것들 지켜라.", "휴식. 힘 아껴라.", "<<wife>> 위해 사냥한다" 식. 단, 감정이 풀리는 순간(안심, 애정, 임신)에는 조사를 되살려 약간 길어져도 된다("지금은 혼자 있고 싶다. 괜찮을 거다.").
- 어미 배분: 명령 "~라/~어라/~해", 평서 "~다/~군/~지", 의문 "~나?/~가?/~지?" 순. "~어/~야/~네"로 끝나는 부드러운 반말은 쓰지 않는다. 한 대사 안에서 "~다"와 "~어"를 섞지 않는다. 호감이 높을 때의 다정함은 어미가 아니라 내용과 지문(핥기, 꼬리)으로 표현한다.
- 입버릇: 호칭으로 문장을 시작, "무리는 ~", "기꺼이", "좋은 사냥이었다.", 비웃을 때 "약하군/한심한 ~". 감탄사는 으르렁거리는 소리를 지문으로, 대사 안에는 "흥", "쉿" 정도.
- 피해야 할 것: 유창한 논리 설명("~때문에 ~하는 것이 좋을 것 같아"), 존댓말, 귀여운 애교, 한자어·문어체("~이옵니다"), "ㅋㅋ", 이모티콘, 말더듬(Black Wolf는 더듬지 않는다).
- PC가 검은 늑대에게 하는 말은 반말이다(무리 동료이며 "당신"이라 하지 않는다). 겁먹었을 때만 더듬기 허용.

## 기존 번역 현황
- 검은 늑대·무리 늑대의 대사 약 274문장(wolfpack 전 파일 + forest/widgets, grep으로 어미 분류): 하라체 계열(~다/~라/~군/~나) 145(53%), 반말(~어/~야/~지) 123(45%), 존대 6(전부 PC 대사). `wolf.twee`, `hunts.twee`, `main.twee`는 하라체 + 전보체가 강하고, `pregnancyEvents.twee`, `events.twee`, `pupsden.twee`, `halloween.twee`는 완결된 반말이 늘어난다. 같은 EN 전보체 문장이 파일마다 다르게 옮겨졌다.
- 잘 살린 점: `hunts.twee`의 "남아라! 어린 것들 지켜라. 배 보호해라.", "사냥감 가져올 거다, 내 짝.", `events.twee`의 "도전은 없다. 복종해!", `wolf.twee`의 하라체 대사 전체가 원문의 어눌하고 단호한 느낌을 살렸다. `<<ppackbrother>>`의 짝/형제/자매 분기도 정확하다.
- 어긋나는 사례:
  - `game/overworld-forest/loc-wolfpack/events.twee:353`(수인) 같은 EN "You're... strong. Stronger than Black Wolf. I knew taking you was right choice." 가 429행에서는 다르게 번역: 353행 "너는... 강하다. 검은 늑대보다 강해. 널 데려온 건 옳은 선택이었어." / 429행 "너... 강하군. 검은 늑대보다 강해. 널 받아들인 게 옳은 선택이었어." → 두 곳 모두 "너... 강하군. 검은 늑대보다 강하다. 널 데려온 게 옳은 선택이었다." (한 대사 안 "~다/~어" 혼용 제거, "taking you" 원문대로 "데려온")
  - `game/overworld-forest/loc-wolfpack/pregnancyEvents.twee:9,23,37,51` "<<ppackbrother>>【을를】 찾고 있었어." "보여줄 게 있어." → "<<ppackbrother>>【을를】 찾았다." "보여줄 게 있다." (EN은 "Was looking for packbrother. Need to show something."의 전보체. 같은 파일 78행은 "새끼들이 곧 올 거다," ... "지금은 혼자 있고 싶어. 괜찮을 거다,"로 한 대사에서 섞임 → "지금은 혼자 있고 싶다. 괜찮을 거다,")
  - `game/overworld-forest/loc-wolfpack/pregnancyEvents.twee:119` "이리 와. 내 털을 잡아라. 내가 데려가 주지." → "이리 와라. 내 털을 잡아라. 데려가 주지." (EN "Come. Hold my fur. I'll take you." 명령 어미를 하라체로)
  - `game/overworld-forest/loc-wolfpack/wolf.twee:437` "사냥하나, 대장?" → "사냥하나, 우두머리?" (EN "alpha"가 PC에게 쓰일 때 wolf.twee:664 "우두머리."와 hunts.twee도 "우두머리"를 쓴다. "대장"은 이곳 하나뿐)
  - `game/overworld-forest/loc-wolfpack/widgets.twee:355` "리더 약해!", `hunts.twee:1210` "리더가 ..." → "우두머리 약해!", "우두머리가 ..." ("우두머리"가 32곳, "리더"는 이 두 곳뿐)
  - `game/overworld-forest/loc-wolfpack/events.twee:1238` PC→늑대 "화나셨다니 유감입니다.", "당신을 기쁘게 할 방법을..." → "화났다니 유감이야.", "널 기쁘게 할 방법을 찾을 수 없을까?" (같은 파일 1073·1099행 PC는 늑대에게 반말, "당신"을 쓴 곳 없음. EN 원문도 평어)
- 통일 방향: 검은 늑대는 하라체 전보체 하나로(~다/~군/~라, 조사 생략). "~어/~야"로 끝난 완결 문장은 새로 번역할 때 하라체로, 기존 문장은 위 사례처럼 한 대사 안에서 섞인 것부터 고친다. "우두머리"(PC), "알파"(본인) 구분 유지.

## 예시 (영어 원문 → 한국어)
1. (평상시) "Hard, but good for legs. Go." → "힘들지만, 다리에 좋다. 가자." (기존 번역)
2. (평상시) "Peaceful place. I like it." → "평화로운 곳이다. 마음에 든다." (기존 번역)
3. (호의) "Pack feels happier when you're happy." → "네가 행복하면 무리도 행복하다." (기존 "행복해."를 하라체로 정리)
4. (호의, 선물) "Tender. Sweet. No blood. Strange, but I like it." → "부드럽군. 달콤하다. 피는 없군. 이상하지만, 마음에 든다." (기존 번역에서 "달콤해/마음에 들어"만 하라체로)
5. (호의, 보호) "I protect mate." / "Mate is <i>mine</i>." → "짝을 지킨다." / "짝은 <i>내 거다</i>." (기존 번역)
6. (호의, 임신) "Will give birth to strong pups, strongest pack has seen yet." → "강한 새끼를 낳을 거다. 무리가 본 것 중 가장 강할 거다." (기존 "~거야"를 하라체로)
7. (평상시, 호칭) "Do you need help, packbrother?" ... "Will gladly help with that." → "도움이 필요한가, <<ppackbrother>>?" ... "기꺼이 도와주지." (기존 번역)
8. (적대, 도전) "No challenge. Obey!" / "I am alpha. I'll punish you." → "도전은 없다. 복종해!" / "내가 알파다. 널 벌해주겠다." (기존 번역)
9. (적대, 조롱) "Pathetic packbrother. Weaklings not fit for alpha. Follow pack, where you belong." → "한심한 <<ppackbrother>>. 약해빠진 놈은 우두머리가 될 자격이 없다. 네가 있어야 할 곳, 무리를 따라라." (기존 번역)
10. (적대, 퇴각) "Too strong. Stronger than thought." → "너무 강하다. 생각보다 강하다." (기존 "생각보다 강하다,"를 그대로)
11. (성적) "Tired already? Guess packbrother doesn't want another go." → "벌써 지쳤나? <<ppackbrother>>【은는】 한 번 더 하고 싶지 않은 모양이군." (기존 번역)
12. (성적, 지배) "Packbrother must be ready to mate. Will gladly help with that." → "<<ppackbrother>>【이가】 짝짓기할 준비가 된 모양이군. 기꺼이 도와주지." (기존 번역)
13. (PC→검은 늑대, reaction-blackwolf 신규) "Gently, please..." / "Down. DOWN!" → "살살... 제발..." / "앉아. 앉으라고!"
14. (PC→검은 늑대, 신규) "Good <<nnpc_gendery "Black Wolf">>. Keep going." / "Breed me, alpha!" → "착한 <<nnpc_gendery "Black Wolf">>【이】네. 계속해." / "나를 임신시켜 줘, 알파!" (`pregnancySpeechEnabled`가 꺼진 "Fuck me, alpha!" 분기는 "박아줘, 알파!")
