# Avery (에이버리)

## 인물
- 마을의 부유한 사업가이자 큰 재력가(마천루 건설, 저택, 헬리콥터, 운전기사 딸린 차). 성별은 게임이 정하며(`<<nnpc_gender "Avery">>`) 대사에서 성별을 드러내지 않는다. 대명사는 `<<he>>`, `<<his>>`, `<<He>>`로만 받는다.
- 첫 만남은 공원/거리에서 PC를 구해 주고 술을 권하는 매력적인 신사(숙녀). 이후 데이트, 사무실 일자리, 입양(`Mansion Intro`)으로 PC를 저택에 들이고 "내 것"으로 만든다. 평소엔 세련되고 여유 있고 정중하다. 그러나 본성은 소유욕, 통제욕, 체면(평판)에 대한 집착이다.
- 가면과 본성: `$averyragerevealed`가 0이면 분노를 숨기고 정중한 말씨로 비꼰다. 1이 되면(데이트 바람맞힘, 반항 등으로 `C.npc.Avery.rage`가 `random(20,100)` 이상일 때 공개) 차갑고 노골적인 명령, 훈육, 체벌로 바뀐다. 분노는 `rage` 20/60/96 문턱에서 단계가 오른다. 화가 날수록 목소리는 낮아지고 차분해지며, 소리를 지르는 쪽이 아니라 조용히 위협하는 쪽이다.
- `love`가 높으면(30, 60) 애칭과 칭찬("착하지", "내 작은 ~")이 늘고 다정해지지만 소유욕은 그대로다. `dom`이 높고 `$avery_mansion`(저택 생활)이면 허락과 복종을 요구하는 명령형이 늘고, PC가 `$speech_attitude`가 "meek"이면 흡족해하고 "bratty"면 비꼬며 벌을 암시한다. `$avery_fate`(마천루 결말)가 "saved"면 누그러지고, "ascended"면 PC를 "천사"로 부르며 집착이 더 노골적이다.
- 남들 앞(파티, 사무실, 거래, 전화, 레미/하퍼/베일리 같은 제3자)에서는 격식을 갖춘 사업가 말투를 쓰고, 사적인 자리에서만 반말이 나온다.

## 말투 규칙
- 기본 구도: Avery가 PC에게 하는 말은 상황의 단계에 따라 둘 중 하나로 고정한다. 한 대사(따옴표 안) 안에서 섞지 않는다.
  - 반말(해체/평어, "~야/~어/~지/~군/~네", 명령형 "~해/~마"): 저택 생활, 파티 사적 장면, 마천루, 던전, 성적 장면, `averyragerevealed`가 1이고 `rage >= 20`일 때. 1인칭 "나/내", 2인칭 "너/네", 호칭 `<<pcpetname "Avery">>`.
  - 해요체("~요/~죠/~네요/~군요"): 첫 만남, 데이트, 사무실, `rage < 20`의 부드러운 성적 대사, 가면을 쓴 정중한 비꼼. 2인칭 "당신".
  - 합쇼체("~습니다/~습니까"): 전화, 공개 석상, 제3자(베일리, 손님, 직원, 경찰)에게 하는 말, 차갑게 격식을 차려 위협할 때("알아들었습니까?"). 분노가 극에 달해도 소리치지 않고 합쇼로 눌러 말하는 장면에 한한다. 1인칭은 "저/제"를 쓸 수 있으나 PC에게 사적으로 말할 때는 "나/내".
- 같은 장면 안에서는 한쪽으로 고정한다. 단계가 바뀌는 변수(`$avery_mansion`, `averyragerevealed`, `rage`/`love` 문턱)가 있을 때만 바꾼다. 사극투(~주마, ~테다, ~도다, ~구나)는 쓰지 않는다. 대신 "~해 줄게", "~할 거야", "~군"을 쓴다.
- 호칭: PC는 `<<pcpetname "Avery">>`(소녀/소년, 인형, 햇살, 공주님, 애완동물, 장난감, 걸레 등 게임이 고름)를 그대로 쓰고 이름은 부르지 않는다. 애정이 있을 때 "자기"가 드물게 나오며 반말과 함께 쓴다("잘했어, 자기."). 다른 인물은 이름만("베일리", "하퍼", "레미", "조던", "브라이어", "로빈"). 로빈, 위트니, 카일러 같은 PC의 지인은 경멸조의 지시어("그 꼬맹이", "그런 부류")로 부른다.
- 문장은 짧고 정돈되어 있다. 단정과 지시가 많다("그만해.", "앉아.", "잘 들어."). 문두 "자,"로 흐름을 잡고 "글쎄.", "흠,", "이런,"으로 비꼰다. 반문은 "~않나?", "~겠어?", "~지?"로 재확인시킨다. 입버릇은 "착하지", "내 ~", "예의", "평판", "버릇", "분수"처럼 통제와 체면 어휘다.
- 말줄임은 "..."(세 점), 끊김은 "—". 더듬기는 거의 없고 숨이 찰 때만 한두 번("너- 너 그게 좋아?"). 웃음은 지문으로 쓰고 "ㅋㅋ"나 이모티콘은 쓰지 않는다.
- 성적 상황: 반말이 기본이고 비속어는 원문 수준을 넘지 않는다. `rage < 20`이고 `consensual`이면 느긋한 해요체 칭찬/놀림("걱정 마요. 내가 가르쳐 줄 테니까."), `rage >= 20`이면 반말 훈육("조용히 해."), `rage >= 60`이면 욕설(`<<bitch>>`, `<<slut>>` 등 매크로)과 짧고 차가운 반말.
- 피해야 할 것: 한 대사 안에서 해요체 + 반말 혼용 또는 "당신" + "너/네" 혼용, 반말 장면에서 갑자기 합쇼, 소리 지르는 듯한 느낌표 남발, 사극투, 로빈처럼 부끄러워하는 말더듬, 지나친 구어체/신조어/인터넷 말투.

## 기존 번역 현황
- 지배적 말투(따옴표 속 Avery 대사, 서술의 "에이버리가 말한다/<<he>>【이가】 말한다" 곁 대사 1,255개 대략 집계): 반말 약 68%(852), 해요체 약 19%(238), 합쇼 약 9%(107), 한 대사 안 혼용 약 4%(58). 파일별로 갈린다. `mansion*`, `party`, `skyscraper`, `cards`, `dungeon`, `speech-avery`는 반말 75~95%, `main`(데이트)과 `office`, `valentines`는 해요체/합쇼가 절반 이상이다. 2인칭은 "너/네" 129 vs "당신" 71(데이트/사무실 파일에 "당신"이 몰려 있다), 1인칭 "나/내" 218, "저/제" 28(사무실, 발렌타인).
- 잘 살린 점: 첫 만남과 데이트의 정중한 가면("에이버리라고 합니다. 같이 한잔할까요?"), 저택에서의 반말 지시("거기가 네 자리야"), `rage`에 따른 훈육 대사(박살 내겠다는 위협 풍)와 `pcpetname` 호칭(소녀/인형/공주님 등 단계별)이 인물의 두 얼굴을 잘 드러낸다.
- 어긋나는 사례:
  - `game/base-combat/speech/speech-avery.twee:88` "자, 이렇게 됐네요. 너처럼 반항적인 꼬맹이한테 딱 어울리는 결말이지." → "자, 이렇게 됐군. 너처럼 반항적인 꼬맹이한테 딱 어울리는 결말이지." (해요체 + 반말 + "너"가 한 대사에 섞임)
  - `game/base-combat/speech/speech-avery.twee:128` "…네 그 뻔뻔한 태도를 내가 진지하게 여겨줄 거라 기대하는 건가요?" → "…네 그 뻔뻔한 태도를 내가 진지하게 여겨줄 거라 기대하는 거야?" ("네"+해요체 혼용, 같은 파일 130행도 "네 몸이~좋을 텐데요" → "~좋을 텐데")
  - `game/base-combat/speech/speech-avery.twee:1894` "네 목에 이런 걸 둘렀는지… 당신 목에는 훨씬 걸맞고… 당신한테 더 잘 어울리는 색" → "네 목에는 훨씬 걸맞고… 네게 더 잘 어울리는 색" (한 대사에서 "네"와 "당신" 혼용)
  - `game/overworld-town/special-avery/dungeon.twee:603,614` "너- 너 그게 좋은 겁니까? … 아직-아직 더 남았습니다." / "네가 뭘 하는지 압니다… 곤란해지고 싶습니까?" → "너- 너 그게 좋아? … 아직- 아직 더 남았어." / "네가 뭘 하는지 알아… 곤란해지고 싶어?" (같은 파일 737행 "그 입 때문에 곤란해질 거야. 네 안전을 위해서라도…"와 같은 인물·같은 상황이 반말인데 여기만 합쇼. 반말+"너" 조합이 합쇼와도 어긋난다)
  - `game/overworld-town/special-avery/valentines.twee:47,106` "…드문 일입니다," + 바로 아래 50,108행 "이건 내가 없었다면 절대 가질 수 없었을 거야." → "…드문 일이야," (같은 장면이 합쇼에서 반말로 바뀜. 단, 같은 passage의 이전 대사 "좋습니다."와 `rage` 분기(`averyragerevealed` + `rage >= 20`이면 반말) 중 어느 쪽에 맞출지는 위 규칙대로 단계 변수에 따라 정한다. 공개 전 데이트(해요)라면 "…드문 일이에요,"로 통일)
  - `game/overworld-town/special-avery/main.twee:3937` "조용히 좀 해줄래요?" … "운전하려는 중입니다." → "…운전하려는 중이에요." (해요체와 합쇼 혼용. 같은 passage의 3929 "그만 울어요." 등이 해요체)
  - `game/overworld-town/special-avery/main.twee:2798` "하지만 쓰레기가 아닌 척은 해야 합니다. 당신의 행동은 내 평판에도 영향을 주니까요" → "…척은 해야 해요. 당신의 행동은…" (같은 대사 앞 문장 "이번엔 용서해주죠."는 해요체)
  - `game/overworld-town/special-avery/main.twee:6666,6684,7107` 혼잣말 "이럴 시간 없습니다." → "이럴 시간 없어." (원문 "I don't have time for this" mutters, 앞 문장 "소란 죄송합니다"는 바깥 사람에게 하는 합쇼가 맞고 혼잣말은 반말)
  - `game/overworld-town/special-avery/mansion intro.twee:94,120,145,162` 베일리에게 "술 한잔하러 초대해도 될까요?" → "술 한잔하러 초대해도 될까?" (같은 장면 4, 49, 53행의 베일리에게 하는 말은 반말이다)
  - `game/base-combat/speech/speech-avery.twee:1503~1511` "박살 내 버릴 테다", "상기시켜주마" 등 → "박살 내 버릴 거야", "몇 번이고 상기시켜 줄 거야" (사극투)
- 통일 방향: Avery가 PC에게 하는 말은 단계 변수(데이트·사무실·가면 = 해요체+당신 / 저택·분노 공개·성적 훈육 = 반말+너)에 따라 한쪽으로 고정하고, 합쇼는 제3자·공개석상·냉정한 위협에만 남기며, 한 대사 안의 혼용과 사극투를 걷어낸다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 첫 만남) "You okay?" ... "I'm Avery." ... "This is a little out of nowhere, but would you like to get a drink? I know this cute little place." → "괜찮아요?" ... "에이버리라고 합니다." ... "조금 갑작스럽긴 하지만, 같이 한잔할까요? 아주 괜찮은 곳을 알고 있거든요."
2. (평상시, 저택) "That's your seat," <<he>> says. "Except when we have guests. Then it's here." → "거기가 네 자리야," <<he>>【이가】 말한다. "손님이 있을 때만 빼고. 그때는 여기지."
3. (평상시, 저택) "Here." <<He>> holds out a key. "I had a second made. Go on, open it." → "여기." <<He>>【은는】 열쇠를 내민다. "하나 더 만들었어. 자, 열어봐."
4. (평상시, 소유욕) "Best you no longer associate with those people." → "저 사람들과는 더 이상 어울리지 않는 게 좋아."
5. (호의적, 파티 후) "I'm glad I brought you, <<pcpetname "Avery">>. You left a good impression." → "당신을 데려오길 잘했네요, <<pcpetname "Avery">>. 좋은 인상을 남겼어요."
6. (호의적, 다음 날) "Last night was wonderful. Thank you for indulging me." → "어젯밤은 정말 멋졌어요. 내게 어울려줘서 고마워요."
7. (호의적, 성적) <<He>> laughs. "Have you never done this before? Don't worry. I'll teach you." → <<He>>【이가】 웃는다. "이런 거 한 번도 안 해봤어요? 걱정 마요. 내가 가르쳐 줄 테니까."
8. (호의적, 성적) "Does my little puppy want to go on another walk?" → "내 작은 강아지가 또 산책하러 가고 싶은 건가요?"
9. (적대적, 파티 후) "I'll forgive you this time. But you need to pretend you aren't trash. Your behaviour reflects on me, <<pcpetname "Avery">>." → "이번엔 용서해주죠. 하지만 쓰레기가 아닌 척은 해야 해요. 당신의 행동은 내 평판에도 영향을 주니까요, <<pcpetname "Avery">>."
10. (적대적, 던전) "Your mouth will get you in trouble," <<he>> says. "I'd best correct your behaviour soon. For your safety." → "그 입 때문에 곤란해질 거야." <<he>>【이가】 말한다. "네 안전을 위해서라도, 네 행동을 빨리 교정해주는 게 좋겠어."
11. (적대적, 성적) "Quiet now. Take your discipline like a good <<girl>>." → "조용히 해. 착한 <<girl>>답게 벌이나 받아."
12. (적대적, 성적) "Your attitude is dreadful, but you still feel exquisite in my hand." → "네 태도는 끔찍하지만, 넌 여전히 내 손안에서 끝내주는 감각을 주는군."
13. (EN-new, 호의적, 헬기 안) "Still not used to living the good life, are we? Don't worry." <<He>> pats you on the thigh. "You'll grow accustomed to luxury sooner or later." → "아직도 호강이 낯선가 보네. 걱정 마." <<He>>【은는】 당신의 허벅지를 토닥인다. "사치에 익숙해지는 건 시간문제야."
14. (EN-new, 평상시, 용돈) "You should buy something nice. My treat." → "근사한 걸 사 봐. 내가 낼게."
15. (EN-new, 적대적, 헬기 안) "Oh, I'll be having what I want, whether you intend to cooperate or not. You threw away your chance to have it gentle." → "아, 원하는 건 가질 거야. 네가 협조하든 말든. 부드럽게 할 기회는 네가 걷어찼으니까."
16. (EN-new, 적대적) "You're lucky that I don't have the time to discipline you for that, <<girl>>. But don't think I'll be forgiving you for it." → "그 일로 널 훈육할 시간이 없는 걸 다행으로 알아, <<girl>>【아야】. 그렇다고 용서해 줄 거라 생각하진 마."
