# Poppy (포피)

DoL+ (Herm NPCs Mod) 전용 연애 대상. 기반 게임에는 없다. 영어 원문만 있고 한국어 번역은 아직 없다(아래 "기존 번역 현황"). 근거는 `dolp-src/game/ModLI/Poppy/` 전체를 읽은 것이다. 경로는 모두 `dolp-src/game/ModLI/Poppy/` 기준이다.

## 인물
- 이름: `kr_dict.js`의 `personNameDict`에 이미 `"Poppy": "포피"`가 있다(무작위 몹 이름 풀의 Poppy). 같은 표기를 그대로 쓰므로 새로 추가할 항목은 없다. 꽃 이름 poppy(양귀비)와의 말장난이 있다("Well who did you think they named the flower after?" `flats.twee:510`). 한국어로는 말장난이 살지 않으니 "포피"로 두고 이 대사는 풀어 옮긴다(예시 11).
- 성별은 설정에 따라 바뀐다(`C.npc.Poppy.gender` "m"/"f", `events.twee:469`, `events-lake.twee:222`). 모든 대사는 성별이 드러나지 않게 쓴다. 지문의 대명사는 `<<he>>`/`<<his>>`/`<<him>>`, 대사 속 호칭 "Good <<girl>>"은 `<<girl>>` 매크로(플레이어 기준)다. "I'm a very busy man/woman"처럼 분기된 곳은 "바쁜 사람"으로 중성화하고 분기는 EN 구조 그대로 둔다.
- 정체: 붉은 머리(crimson red locks, `events.twee:248`)의 사람. 관계가 깊어지면(또는 `awareness` 5 이상, `Poppy TF` 장면) 여우 귀와 꼬리, 깨진 후광, 먹빛 날개를 가진 "fallen fox"(타락한 여우)임이 드러난다(`flats.twee:355`, `events-dismissal.twee:51`). 과거에 신전의 독실한 신도였으나 "반항기"를 거쳐 타락했고 지금은 신전에서 환영받지 못한다. 조던이 눈을 마주치지 못한다고 한다(`events.twee:374`). 사냥꾼에게 쫓긴 경험이 있다("I thought the hunter caught me", `flats.twee:322`).
- 직업/위치: 학교 가사(housekeeping) 수업을 돕는 교사. 리버와 함께 수업에서 질문을 받는다("feel free to ask River or me during class", `events.twee:20`). 복도에서 수업을 빼먹는 PC를 잡아낸다(`events.twee:220`). 주말에는 호수, 카페 오션 브리즈, 신전, 베일리 사무실, 급식소에 나타나고 바브 가의 아파트(flats)에 산다. 문에 포피(양귀비) 꽃 손잡이가 달려 있고 모든 창가에 양귀비 화분이 있다. 집과 그에게서 아편 냄새가 나서 PC는 졸음이나 통증 완화를 겪는다(`poppyOpiumPulse`; 특성 "Opium Addict", "Pavlov: Poppy").
- 관계: 베일리와 아는 사이다. 베일리를 "Bailey"라고 부르며 집세 상납 때 PC를 압박하는 베일리 편에 선다("It's for the best", `flats.twee:1876`). 상납금 대신 내 달라고 하면 반쯤은 거절한다("Sorry, I can't", `flats.twee:1930`). 휘트니, 카일라, 로빈, 에이버리 등 다른 연애 대상의 이름이나 몸에 쓰인 글씨에 질투한다(`speech-poppy.twee:30-48`, `widget.twee:120`). 그윌란은 "collar-witch"라 부른다(`speech-poppy.twee:36`). 어린 신전 신도 시드니를 "little Sydney"라고 부른다(`events.twee:353`).
- 성격: 여유 있고 능글맞고 장난기 많은 연상. 상대를 약 올리고 얼굴을 붉히게 만드는 것을 즐긴다("Not so bold now, are you?" `events-lake.twee:229`). 소유욕이 강하다("Now you're making me feel possessive", `speech-poppy.twee:24`). 속은 다정하고 외로움을 탄다. 사랑 고백 때는 수줍어지고(`events-lake.twee:34`), 발렌타인 저녁에는 "그때 내가 한 선택이 의미 있었다"고 진지하게 털어놓는다(`events-special.twee:260`). 단정하고 점잖은 외양 밑에 날카로움이 있어 PC가 선을 넘으면(방문 잠금 따기, 몸에 쓴 낙서, 목줄) 말이 싸늘해지고 행동이 먼저 나간다(주머니칼로 목줄을 자른다, `speech-poppy.twee:58-66`).
- 애칭: "my jewel"(가장 자주, `events-lake.twee` 곳곳), "my precious jewel", "darling", "love"/"my love", "sweet thing", "pretty thing", "honey". 무작위 애칭은 `poppyChooseEndearment`(`ejaculation-poppy.twee:25`)가 darling / love / sweet thing / my jewel / pretty thing 중에서 고른다.

## 수치와 상태
- 인내심(patience, -100~100): 양수일 땐 "Patience", 음수일 땐 "Anger"로 표시된다(`system.js:49-75`, `text.js` `gpatience`). 0~33 `LowPatience`(말수가 줄고 눈을 안 마주침, 대부분의 호의 선택지가 막힘), 34~66 `MidPatience`, 67 이상 `HighPatience`. 사랑(love)이 오르려면 인내심 34 이상이 필요하다.
- 연애(`$poppyromance` 0 이상): 호감도 100과 인내심 100이 되면 호수에서 먼저 고백한다(`events-lake.twee:34`). 연애가 열리면 욕정(lust), 키스, 침실, 임신 장면이 열린다.
- 인내심이 -100 근처(분노 최대)면 정리 이벤트가 터져 PC를 납치해 지하 창관에 판다(`events-dismissal.twee`). 이후 포피는 마을에서 사라진다.
- PC의 `$speech_attitude`(meek/shy, docile, polite/flamboyant, confident, bratty/cruel)에 따라 PC의 대사만 갈린다. 포피의 대사는 태도에 따라 달라지지 않는다. PC 대사는 `_PC.md`를 따른다.

## 말투 규칙
- 기본: PC에게 반말(해체). 원문의 포피는 학생·고아·낯선 PC에게도 격식을 두지 않고("I'll pay you £50", "Hey! Fancy seeing you here."), 어른이 아랫사람을 예뻐하며 놀리는 높낮이를 쓴다. 연애 여부, 호감도, 지배/욕정과 무관하게 PC에게 존댓말(해요체/합쇼체)을 쓰지 않는다. 한 대사 안에서 화계를 섞지 않는다.
- 어미: 여유 있고 약간 늘어지는 해체. "~지", "~네", "~잖아", "~거든", "~할까?", "~볼까?", "~래?", "~해 줘", "알았지?". 성별이 드러나는 어미("~란다", "~걸", "~이야~"형 애교, "~해라"형 명령)는 쓰지 않는다. 문장은 중간 길이이고 쉼표로 빈틈을 만든다.
- 1인칭 "나", 2인칭 "너". 호칭은 이름 없이 "너"가 기본이고 애칭을 섞는다. "당신"은 쓰지 않는다(분노 최대 상태의 정리 이벤트에서도 "너"로 간다).
- 애칭 표준(GLOSSARY-dolp.md): my jewel → "내 보석", my precious jewel → "소중한 내 보석", darling → "자기야", love / my love → "내 사랑", honey → "자기야"(능글맞은 반격에서는 "어머, 자기야"), sweet thing → "귀염둥이", pretty thing → "예쁜이". "Good <<girl>>"은 `착하네`로 풀어 성별 매크로를 피한다.
- 다른 인물: "베일리"(성 없이, 서로 반말), "리버", "시드니"(꼬마 시드니), "그윌란"("목줄 마녀"로 투덜댈 때), "휘트니"(비꼴 때 "휘트니? 정말?"). 고아원 아이들에게는 반말("얘들아! 누가 쿠키 가져왔게?"). 베일리에게도 반말이다. 서로 대등하고 오랜 지인 사이로 읽힌다(`flats.twee:1833`).
- 낯선 사람 앞/영업: 웨이터 등에게는 해요체가 자연스럽다("팬케이크 한 접시 더 부탁해요"). 이 전환은 상대가 바뀔 때만 일어난다.
- 학교 수업 중: 같은 반말을 쓰되 또박또박한 교사 어조로. "Please pay attention." → "집중해 줘." 혼낼 때는 "~하지 마"/"~라고 했지"까지만 쓰고 해라체("~해라")로 올라가지 않는다. 한 문장 안에서 혼내다 웃는 결을 살린다.
- 웃음/소리: 지문으로 처리한다("킥킥거린다", "웃는다"). 대사에 "ㅋㅋ", 이모티콘, 물결표(~)를 쓰지 않는다. 정리 이벤트의 "Enjoy being a slut in the underground brothel~"의 `~`는 한국어에서 말끝을 길게 끄는 정도로 "즐거워 해~" 한 번만 허용한다.
- 신음: 짧은 "음...", "응!", "하..." 정도. 길게 늘이지 않는다. `poppyMoan`의 Mm.../Mmh!/Ah.../Hn.../Hnng! → 음.../읍!/아.../흥.../으읏!(길게 늘이지 않기, `_PC.md` 7항).
- 피해야 할 것: "당신"과 "저/제", 해요체 PC 호칭("~님"), 사극투("~하구나", "~도다"), "~란다/~렴"(Sirris의 어조와 겹침), 지나친 애교체, 성별 노출 어미, "ㅋㅋ", 이모티콘.

## 상태별 말투
- 호감도 낮음/비연애(친구 단계): 상냥하고 도움이 되는 연상. 가볍게 장난치되 선을 지킨다. 친절한 반말에 쉼표와 "~지?" 정도. 애칭은 쓰지 않는다. 예: "와, 이런 데서 다 보네. 잠깐 앉을래?"(`events.twee:275`).
- 연애(`poppyromance` 0 이상): 애칭이 붙고 놀림이 늘고 입맞춤이 따른다. 동사 어미는 "~네", "~잖아", "~거든"이 많아진다. 소유욕이 말에 섞인다("내가 질투하게 만드네"). 예 "My precious jewel." 같은 인사.
- 욕정(lust 높음): 문장이 짧아지고 속삭이듯 끊긴다. 명령과 청유가 섞인다. "곁에 있어, 내 보석. 네 반응 하나하나 다 느끼고 싶어."(`speech-poppy.twee:105`). 노골적인 단어는 원문 수준을 넘기지 않는다.
- 지배: 포피는 늘 주도권을 쥔다. 놀리고(`Careful now, I bite.`), 턱을 잡고, 상대가 애원할 때까지 뜸을 들인다("Hmm..." → "음..."). 거칠어지지 않는다. 처음 사랑 고백과 발렌타인 저녁에서만 이 여유가 무너지고 더듬는다("I-I'm glad you like it", `events.twee:412`).
- 인내심 낮음(`LowPatience`)/분노: 말이 사라지고 눈을 피한다. 말을 하더라도 짧고 싸늘하다("Whitney's... toy?" "Seriously..."). 이 상태에서 PC를 대놓고 모욕하지는 않는다. 행동(칼로 목줄을 자른다, 문을 닫는다)이 먼저 나간다. 문 앞에서 PC가 사과해도 대답이 없다.
- 정리 이벤트(분노 최대, 창관에 팔아넘김): 이 한 장면만 거친 욕과 조롱을 쓴다("good-for-nothing asshole", "cocksleeve", "slut"). `GLOSSARY-body-combat.md` 표준(새끼, 걸레, 씨발)을 쓰고 원문 수위를 넘기지 않는다. 화계는 반말을 유지하되 비웃는 늘임을 쓴다. 차갑게 시작해("You're awake at last") 폭발한다.
- 위로/화해(PC가 며칠 사라졌다 돌아왔을 때): 앉으라고 먼저 말하고 "알고 싶어"라고 묻는 침착한 반말. 서운함이 쌓였으면 "며칠이나 지났는지 세다가 그만뒀다가 다시 세기 시작했어"처럼 담담하게 가장 아픈 말을 한다(`events-special.twee:372`).
- 임신 관련: 기쁨과 걱정이 섞인 다정한 반말. "I'm sorry for doubting you, my jewel." 같은 사과도 반말이다. 병원 친자 확인 후의 사과와 초음파 사진을 받고 감동하는 장면은 다정하지만 호들갑스럽지 않다.
- 크리스마스/발렌타인: 과장되게 신나고 능청스러운 어조. 산타 복장으로 "Hey, kiddos! Guess who brought cookies?" 같은 큰 목소리. 발렌타인 저녁은 우아하고 로맨틱한 문어체에 가까운 반말("연애 데이트는 춤으로 끝나야 하잖아, 안 그래?").

## 기존 번역 현황
- 번역 없음. `kr13`/`DoL-KR`에는 `ModLI/Poppy/` 파일이 없다. 이름 "포피"만 `personNameDict`에 있다. 따라서 "어긋나는 사례"는 해당 없고, 처음부터 위 규칙에 맞춰 쓴다.
- 구조적 주의: 여러 곳에서 `<<npc Poppy>><<person1>>`와 `<<nnpc_he "Poppy">>`를 쓴다. `<<He>>`가 포피를 가리킨다. 대사 화자가 포피일 때는 `Poppy`(이름)로 받는 줄이 많으므로 `포피가 말한다`/`<<He>>【이가】`를 섞어도 되지만 한 장면 안에서 통일한다.

## 예시 (영어 원문 → 한국어)
1. (일반, 데이트 신청, `events.twee:275`) "Hey! Fancy seeing you here. Care to join me for awhile?" → "어, 여기서 다 보네! 잠깐 같이 앉을래?"
2. (일반, 부탁/고용, `events.twee:469`) "I need someone to tend to the flowers around my place. I'm a very busy <<if C.npc.Poppy.pronoun is "m">>man<<else>>woman<</if>> and always forget to take care of them. I'll pay you £50." → "우리 집 꽃을 돌봐 줄 사람이 필요해. 내가 워낙 바빠서 자꾸 깜빡하거든. £50 줄게." (성별 분기는 "사람"으로 중성화)
3. (수업, 집중 안 할 때, `events.twee:28`) "Please pay attention." → "집중해 줘."
4. (수업, 마무리, `events.twee:19-20`) "Alright... If you have any more questions, feel free to ask River or me during class, okay?" → "자, 더 궁금한 건 수업 시간에 리버나 나한테 편하게 물어봐. 알았지?"
5. (호수, 고백, `events-lake.twee:34`) "I'm in love with you. I feel drawn to you and want to... progress further into our relationship." → "널 사랑해. 자꾸 네가 끌려서... 우리 사이를 한 걸음 더 나아가게 하고 싶어."
6. (연애, 초대, `events-lake.twee:103`) "My precious jewel. You should come and visit me at my place sometime." → "소중한 내 보석. 언제 한번 우리 집에 놀러 와."
7. (연애, 놀림, `events-lake.twee:229`) "Not so bold now, are you?" → "이제 별로 용감하지 않네, 응?"
8. (연애, 꼬리, `events-lake.twee:188`) "Careful now, I bite." <<He>> looks over <<his>> shoulder, giving you a suggestive grin. "You're into that, aren't you?" → "조심해, 나 문다." <<He>>【은는】 어깨 너머로 노골적인 미소를 짓는다. "이런 거 좋아하잖아, 그렇지?"
9. (연애, 거절, `events-lake.twee:468`) "Not right now, darling." → "지금은 안 돼, 자기야."
10. (욕정/성관계 중, `speech-poppy.twee:92`) "I love doing this with you. You feel so good," <<he>> murmurs. → "너랑 이러는 거 정말 좋아. 너무 좋아," <<he>>【이가】 속삭인다.
11. (낯선 사이, 꽃, `flats.twee:510`) "Well who did you think they named the flower after?" → "글쎄, 꽃 이름이 누구 이름을 땄다고 생각했어?" (원문의 말장난은 보존 불가. 포피의 이름이 꽃 이름 뒤에서 나온다는 농담을 살려 "꽃 이름이 누구 이름에서 왔을 것 같은데?"로 다듬어도 된다.)
12. (경고, 목줄, `speech-poppy.twee:60`) "Never wear that again, you hear me?" → "다시는 그거 하지 마. 알아들었어?"
13. (질투, `speech-poppy.twee:24`) "Your first kiss too? Now you're making me feel possessive." → "첫 키스도 나랑 한 거야? 자꾸 소유욕이 생기잖아."
14. (불신/방문 잠금, `flats.twee:1432`) "Just what do you think you're doing?" → "지금 뭘 하는 거야?" / "I think you should leave. ... Such behaviour is not welcome in my home." → "그만 가 줬으면 해. 이런 행동은 우리 집에선 환영받지 못해."
15. (정리 이벤트, `events-dismissal.twee:47`) "You're a good-for-nothing asshole. I would kill you, but where's the fun in that?" → "넌 쓸모없는 개새끼야. 죽여 버릴까도 했는데, 그럼 재미가 없잖아?" (욕설은 GLOSSARY-body-combat.md의 새끼/씨발 수위)
16. (위로, 돌아온 PC에게, `events-special.twee:372`) "You've been gone for <<print _comfortDays>> days. I want to know what happened." → "<<print _comfortDays>>일이나 안 보였어. 무슨 일이 있었는지 알고 싶어."
17. (임신, 사과, `events-pregnancy.twee:37`) "I'm sorry for doubting you, my jewel." → "의심해서 미안해, 내 보석."
