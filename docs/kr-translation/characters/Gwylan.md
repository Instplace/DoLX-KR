# Gwylan (그윌란)

## 인물
- 숲속 헌 옷 가게(Forest Shop)의 주인이자 마녀. 가게와 숲, 카페 발코니(바다를 보는 자리)에서 만난다. 침착하고 여유롭고 다정한 어른이지만 속은 외롭고 상처가 깊다. 장난기("Aww, are you shy?"), 마녀다운 허세, 숲과 짐승에 대한 애착이 있다. 여우 혈통(`gwylan_tf_revealed`), 성별은 `<<He>>`/`<<his>>`로 처리한다. 대사에서 성별을 드러내지 않는다.
- PC와는 처음엔 단골과 가게 주인, 곧 이야기 상대와 보호자 역할이다. 도와주고 가르치고 걱정하는 쪽이다. 이후 최면(`$hypnosis_traits.devotion`), 숲 의식(`ritual_beast`/`ritual_sex`), 연애(`$gwylanSeen.includes("romance")`)로 갈수록 PC를 쓰다듬고 길들이는 주인 같은 태도가 된다.
- 호감도 `C.npc.Gwylan.love`(`_gwylanLovePercent`): 낮으면 정중하고 조심스럽고("Hello, dear. Is there something you need?"), 높으면 일부러 반가워하고 장난치며 몸을 가까이 둔다. 신뢰가 쌓이면 `<<pcpetname 'Gwylan'>>` 애칭이 붙는다.
- 지배/애착 수치 `C.npc.Gwylan.dom`("yearning"): 낮으면 경계하고 밀어낸다("그 단어는 그만 써, 내가 보답할 수 있는 것도 아니고"). 높아지면 매달리고 소유욕이 강해지고 "날 떠나지 마", "넌 약속했잖아"가 나온다. `$gwylan.wary`/`_gwylanStatus.includes("cautious")`일 때는 말수가 줄고 건조해진다.
- 분노, 질투(`namedrop`: 다른 연인 이름이 나올 때)에는 목소리가 차갑게 낮아지되 소리치지 않는다("사과만으로는 부족해"). 성적 상황에서는 놀리고 칭찬하고 가르치듯 이끈다. 발정(`heat`)이거나 `$abomination`일 땐 숨이 거칠고 직설적이 된다.
- 공개된 자리(카페 손님)에서는 점잖게 말한다. 최면 상담 연기(`gwylan-hypnosis`)에서만 의사 같은 존댓말을 쓴다.

## 말투 규칙
- 기본: PC에게 부드러운 반말(해체). 보호자처럼 다정하고 차분하다. 호감도, 지배/복종, 성적 상황과 무관하게 PC에게 해요체를 쓰지 않는다.
- 상황별 변화: 평소는 "~해/~야/~지/~네/~거든". 달래거나 훈계할 때 "~렴/~잖니/~란다"가 간혹 섞인다(전체의 1~2%, 얘야와 함께). 마녀 명령과 의식 장면은 짧은 명령형 "앉아.", "와.", "벗어."(`<<gwylanCommand>>` 안은 이 꼴 그대로). 위로할 때는 낮고 느린 반말.
- 예외(존댓말 허용): 최면 상담 연기(`gwylan-hypnosis` 1408~1450행 부근)의 해요/합쇼("이야기해 봅시다", "이건 현실이에요")만. 이 외엔 해요체 금지.
- 1인칭 "나"(대사), PC는 "너". 호칭은 "얘야"(Hello, dear 계열: "안녕, 얘야."), 연애면 "내 사랑"(dearest), 호감이 높으면 `<<pcpetname 'Gwylan' ...>>`(소년/소녀/강아지/새끼 여우 등, 뒤에 `【아야】`). "당신"은 쓰지 않는다. 반대로 PC의 대사는 `$speech_attitude`에 따라 나뉜다(meek는 해요체, bratty·default는 반말, "당신" 호칭). 이건 PC 쪽이라 가이드 대상이 아니다.
- 다른 인물: "로빈", "에덴", "카일라", "블랙 울프/그레이트 호크"(`<<nnpc_him>>` 마커), 할아버지는 "할아버지". 경칭 없이 이름만.
- 문장은 짧고 부드러운 단문과 한두 줄의 설명. 어미는 "~해", "~야", "~지", "~네", "~군(감탄)", "~구나", "~잖아", "~거든". 입버릇: "오 이런", "저런"(Oh dear/Oh my), "킥킥 웃는다", "쉿", "자,"(Come on). 웃음은 지문("킥킥 웃는다")으로 처리하고 대사에 "ㅋㅋ"를 쓰지 않는다. 말줄임은 "...", 더듬기는 거의 없다.
- 피해야 할 것: 해요체(상담 연기 외), 하라체 평서("~겠다/~거다/고맙다/알겠다")와 하게체("~하겠네/~하게"), 사극투 "~도다/~소", 거친 욕설, 이모티콘, 의성어 남발. 진지한 장면이라도 "고맙다"가 아니라 "고마워".
- 성적 상황: 반말 유지. 칭찬과 놀림("오, 이거 좋아?"), 보호하는 가르침("턱에 힘 빼"), 소유 선언("넌 이 짐승을 깨웠으니 만족시켜 줘야지"). 원문 수위를 넘기지 않는다.

## 기존 번역 현황
- 지배적 말투: 반말(해체) 약 94%. 전용 파일(forestshop 전체 + speech-gwylan)에서 Gwylan이 말하는 줄 약 1,630개 중 반말 어미(해/야/어/지/네/군/구나) 약 1,590개. 해요체는 최면 상담 연기뿐이다. "고마워" 39 대 "고맙다" 6, "알았어" 13 대 "알겠다" 2.
- 잘 살린 점: "안녕, 얘야.", "안녕, 내 사랑."처럼 호칭이 호감도와 로맨스 여부에 따라 갈린다. 성적 장면 반말이 일관되고 장난과 소유 어조가 분명하다("부끄러워하지 마, 나한텐 마법의 손이 있거든."). `<<pcpetname>>` 뒤 `【아야】` 마커가 빠짐없이 붙어 있다.
- 어긋나는 사례:
  - `game/overworld-forest/loc-forestshop/shop-events.twee:1051` "뭘 먹을 땐 좀 더 조심해야 해요." → "뭘 먹을 땐 좀 더 조심해야 해." (Gwylan이 PC 얼굴을 닦아주며 하는 말. 이 한 곳만 해요체)
  - `game/overworld-forest/loc-forestshop/gwylan-requests.twee:950` "바로 사용하겠네. 고맙다." → "바로 쓸게. 고마워." (하게체+하라체. 같은 장면의 954행 "말만 하게"도 "말만 해"로)
  - `game/overworld-forest/loc-forestshop/gwylan-ritual-sex.twee:1748` "고맙다." → "고마워." (1740행 "날 믿어줘서 고맙다"도 "고마워")
  - `game/overworld-forest/loc-forestshop/gwylan-requests.twee:2517` "알겠다." → "알았어." (같은 파일 다른 곳은 "알았어")
  - `game/overworld-forest/loc-forestshop/shop-events.twee:3069` "영향을 제거하게 해다오. ... 버릴 거다." → "...제거하게 해 줘. ...버릴 거야." (간청하는 장면에 하라체. 원문 "I am begging you")
  - `game/overworld-forest/loc-forestshop/gwylan-ritual-beast.twee:16` "알겠다. 준비되면 다시 와라." → "알았어. 준비되면 다시 와." (의식 장면도 반말)
  - `game/overworld-forest/loc-forestshop/gwylan-hypnosis.twee:3165` "미안하다. 이렇게까지..." → "미안해. 이렇게까지..." (사과는 "미안해"가 12 대 2로 다수)
- 통일 방향: Gwylan이 PC에게 하는 모든 말은 부드러운 반말(나/너, 얘야/내 사랑). 하라체/하게체/해요체를 쓰지 않고, 최면 상담 연기만 해요체/합쇼.

## 예시 (영어 원문 → 한국어)
1. (평상시) "Hello, dear." → "안녕, 얘야."
2. (연애) "Hello, dearest." → "안녕, 내 사랑."
3. (평상시, 오랜만) "I'm glad to see you again. I was starting to think you had forgotten about me." → "다시 만나서 기뻐. 날 잊어버린 줄 알았거든."
4. (평상시, 새로) "I understand more than you could possibly imagine." / "You are not alone." → "네가 상상하는 것보다 훨씬 잘 이해해." / "넌 혼자가 아니야."
5. (호의, 최면 중) "Come on dear, don't tease me. There's work to be done." → "자, 얘야, 날 놀리지 마. 할 일이 있잖니."
6. (호의, 경고) "Just hold still, it'll be over soon." → "가만히 있어, 곧 끝날 테니까."
7. (적대/질투) "Shh. There's no need to call out other names. It's just us two." → "쉿. 굳이 다른 이름들을 부를 필요 없어. 우리 둘 뿐이니까."
8. (적대, 빙의) "You're stronger than it. I know you are." → "넌 그것보다 강해. 난 알아."
9. (적대, 훈계) "It will take more than an apology, <<pcpetname 'Gwylan'>>." → "사과만으로는 부족해, <<pcpetname 'Gwylan'>>【아야】."
10. (성적) "Don't feel ashamed, I have magic hands." → "부끄러워하지 마, 나한텐 마법의 손이 있거든."
11. (성적) "Can't even outlast me with a toy? Poor <<pcpetname 'Gwylan' 'simple'>>." → "장난감으로도 나보다 오래 못 버티는 거야? 불쌍한 <<pcpetname 'Gwylan' 'simple'>>【아야】."
12. (성적, 발정/abomination) "You started this. You can't back away now." → "네가 시작한 일이야. 이제 물러설 수는 없어."
13. (성적, 따뜻함) "Warm." / "I needed this. I needed your seed inside me." → "따뜻해." / "이게 필요했어. 네 씨앗이 내 안에 필요했어."
14. (EN-new 직접 번역, 광산 이야기) "People are weak alone, but together, they become stronger." → "사람은 혼자일 땐 약하지만, 함께하면 더 강해지는 법이야."
15. (EN-new 직접 번역) "I've suspected that the mines had resumed operation, I'm glad you stopped it." → "광산이 다시 가동되고 있을 거라고 의심했어. 네가 막아줘서 다행이야."
