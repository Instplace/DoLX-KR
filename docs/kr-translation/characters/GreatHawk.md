# Great Hawk (거대 매)

## 인물
- 황야(moor)의 탑에 둥지를 튼 거대한 매. 성별은 `<<bhe>>`/`<<bHe>>` 매크로로 처리한다. 수인/하피 모드(`$monster is 1`, `resolveIfNamedBeastIsMonster("greathawk")`)에서만 말을 한다. 일반 모드에서는 지저귐, 날개 짓, 쪼기 같은 지문뿐이니 대사 번역 대상이 아니다.
- PC를 짝으로 삼아 하늘로 납치해 둥지에 데려다 놓는 포식자지만, 악의가 없고 순진하다("It's not his fault. He only wants a mate."). 자기가 정한 규칙에 어긋나면 서운해하고, PC가 다치거나 도망치려 하면 걱정과 집착이 앞선다.
- PC를 `<<wife>>`(`$player.gender_appearance`에 따라 남편/아내)라 3인칭으로 부르는 것이 가장 큰 버릇이다("<<Wife>> should rest."). 감정이 높아지거나 가까워지면 "너/네"와 "나"로 직접 말한다("I want you to be safe").
- 땅에 사는 것들(landbound, wingless)의 문화에 서툴다("Value of landbound trinkets is hard to understand."). 선물·옷·반지에 진지하게 감탄하고, 틀리면 풀이 죽어 사과한다.
- 태도 변수: `$syndromebird`(스톡홀름, 짝으로 받아들임), `$birdescaped`(도망 횟수, 클수록 "<<Wife>> shouldn't run away" 같은 단속), `$harpy`(PC가 하피로 변한 정도, 높으면 "날 줄 알면"으로 대사가 바뀜), `C.npc["Great Hawk"].love`(높을수록 "사랑해", 눈물, 안아 줌), `.dom`(PC가 이기면 풀이 죽고 순종적으로).
- 적대: PC가 밀쳐 내거나 가까이하기를 거부하면 상처받은 얼굴로 물러나고 대사가 짧아진다. 사냥을 방해받으면 화를 낸다("You spoiled my catch!"). 다른 사람(캠프, 침입자)에게는 거만하고 비꼰다.
- 성적/임신: 알, 둥지, 짝, 털 고르기가 중심이다. 직설적인 성적 대사는 거의 없고 애정 표현과 "알이 온다"가 대부분이다.

## 말투 규칙
- 기본 화계: PC에게 부드러운 반말(해체). 하라체("~다/~군")를 섞은 단정한 말투다. 하오체/해요체/합쇼체는 쓰지 않는다. 비율 목표는 "~어/~야/~지" 70%, "~다/~군/~나" 30%.
- 1인칭 "나"(`I`)는 대사 중간에 불쑥 나온다("내가 지켜줄게"). 2인칭은 `<<wife>>`(3인칭 호칭)와 "너/네"를 둘 다 쓴다. 한 문장 안에서 `<<wife>>`와 "너"를 번갈아 쓰지 않는다: 호칭을 부를 땐 `<<Wife>>【은는】 쉬어야 해.` 식으로, 직접 말할 땐 "널 위해". "당신"은 쓰지 않는다.
- 높임 없이도 존중이 드러나게 한다: "부디", "~해 줄래?"는 쓰되 "~해 주시오"는 쓰지 않는다. 애정 표현은 "사랑해", "보고 싶었어", "곁에 있어 줘."
- 서툰 순간(원문 전보체): 초기 사냥 교습의 "<<Wife>> 아직 준비 안 됐다." 같은 조사 생략 문장은 원문이 `Wife asks again. Wife really wants to help?`처럼 전보체인 곳에서만. 그 외 대사는 조사를 넣는다.
- 입버릇: "<<Wife>>【은는】 ~해야 해/~해도 돼?", "내가 ~할게", "땅에 사는 것들은 ~", "날개 없는 것들". 사과는 "미안해.", 감탄은 "와!", "좋았어!". 웃음은 지문("꼬리/날개를 펼친다").
- 피해야 할 것: 하오체("~하오/~구려/~시오/~소"), 높임 어미, 존칭 "당신", 사극투, 유창한 설명조, "ㅋㅋ", 이모티콘. 말더듬은 쓰지 않는다.
- 상황별: 걱정/다정 = "<<Wife>>【이가】 다치면 안 돼. 쉬어야 해." / 삐침·사과 = 짧은 "미안해. 다음엔 더 반짝이는 걸 가져올게." / 사냥 지도 = "높이 날아라"류 명령은 하라체 "~라/~해" 허용 / 분노 = "네가 내 사냥감을 망쳤잖아!" 반말 단문 / 성적·임신 = 부끄러움과 기쁨이 섞인 짧은 평서("<<Wife>>의 알이 오고 있어!").
- PC→매 대사(reaction-greathawk 포함)는 반말로 쓴다.

## 기존 번역 현황
- 매 대사 약 255문장(loc-bird main/hunts/widgets/gifts에서 매 관련 대사를 grep으로 추정, 어미 분류): "~어/~야/~지" 계열 172(67%), "~다/~라/~나" 계열 49(19%), "~군/~구나" 21(8%), 하오체 약 13(5%, 확인된 줄은 26줄). 지배적 말투는 부드러운 반말이고 `<<wife>>` 3인칭 호칭이 일관된다. 호칭 조사 마커(`【은는】` 등) 168곳 vs 생략 29곳.
- 잘 살린 점: 호칭 `<<wife>>`와 3인칭 말하기, 선물 장면 "용서해라, <<wife>>."(gifts.twee:79)의 미안함, "<<Wife>>【이가】 알을 가졌어!"(main.twee:3067)의 기쁨이 인물에 맞다. 하늘 사냥 교습의 간결한 하라체("항상 높이 날아라, 사냥감은 널 보지 못할 것이다.")도 좋다.
- 어긋나는 사례:
  - `game/overworld-plains/loc-bird/main.twee:2168` "부디 곧 돌아와 주시오, <<wife>>." ... "사랑하오." → "곧 돌아와 줘, <<wife>>." ... "사랑해." (2194~2254 같은 문장 4곳도 같은 방식. 같은 EN "I love you"를 main.twee:6812는 "나도 사랑해, <<wife>>."로 옮겼다)
  - `game/overworld-plains/loc-bird/main.twee:2399` "미안하오. 땅에 있는 장신구의 가치는 이해하기 어렵구려. 다음번엔 더 반짝이는 걸 가져오겠소." → "미안해. 땅에 사는 것들의 장신구는 가치를 이해하기 어렵군. 다음엔 더 반짝이는 걸 가져올게." (EN "I'm sorry. Value of landbound trinkets is hard to understand. Will bring something more shiny next time." 2314행 "미안하오, <<wife>>. 다음 사냥에서는 ... 찾아오겠소."도 "미안해, <<wife>>. ... 찾아올게."로)
  - `game/overworld-plains/loc-bird/main.twee:2721` "배고프지 않소? <<Wife>>【은는】 힘을 내기 위해 먹어야 하오." → "배고프지 않아? <<Wife>>【은는】 힘을 내려면 먹어야 해." (EN "No hunger? Wife should eat to stay strong.")
  - `game/overworld-plains/loc-bird/main.twee:7974` "미안하오. ... 생각은 없었소. 준비되면 먹으시오." → "미안해. ... 생각은 없었어. 준비되면 먹어." (7940, 7942, 7947도 "~하오" → "~해". 이 파일의 하오체 26줄은 2168~2820행과 7900~7974행에 몰려 있다)
  - `game/overworld-plains/loc-bird/hunts.twee:5294` "<<Wife>> 똑똑하다, 좋은 계획 세운다." → "<<Wife>>【은는】 똑똑해, 좋은 계획이야." (EN "<<Wife>> is smart, making good plans". 같은 매의 4965행은 "똑똑해, 이런 걸 만들다니.", 4234행은 "똑똑하다. 좋은 계획이야."로 같은 표현이 셋으로 갈린다)
  - `game/overworld-plains/loc-bird/gifts.twee:45` "용서해라. 인간의 풍습은 잘 모른다." → "용서해줘. 인간의 풍습은 잘 몰라." (하라체 명령형 "~해라"는 사과에 맞지 않는다. 79행도 "용서해라, <<wife>>." → "용서해줘, <<wife>>.")
- 통일 방향: 매는 부드러운 반말 하나로, 하오체는 전부 반말로. 하라체는 지시·단정에만. `<<wife>>` 3인칭 호칭과 "너"를 한 문장에서 섞지 않는다.

## 예시 (영어 원문 → 한국어)
1. (평상시) "<<Wife>> should rest. The nest lining is fresh... I will go hunting, and bring back gifts for <<wife>>." → "<<Wife>>【은는】 쉬어야 해. 둥지 안감은 새것이고, <<wife>>【은는】 아주 편안할 거야." ... "나는 사냥하러 가서, <<wife>>【을를】 위한 선물을 가져올게." (기존 번역)
2. (평상시) "Come, <<wife>>. Fly with me." → "와라, <<wife>>. 나와 함께 날자." (기존 번역, 부드럽게 "와, <<wife>>. 나와 함께 날자.")
3. (평상시) "Hunting at night time? Difficult. If <<wife>> wants to..." → "밤에 사냥을? 어렵겠군. <<wife>>【이가】 원한다면야..." (기존 번역)
4. (호의) "Nothing will hurt <<wife>> while <<pshe>> is here." → "<<pshe>>【이가】 여기 있는 동안 아무도 <<wife>>【을를】 해치지 못할 거야." (기존 번역)
5. (호의) "I love you too, <<wife>>." → "나도 사랑해, <<wife>>." (기존 번역, main.twee:6812)
6. (호의, 선물) "It's beautiful. Thank you, <<wife>>." → "아름답군. 고맙다, <<wife>>." (기존 번역, gifts.twee:47. 한 대사 안은 한 계열이라 "아름다워. 고마워, <<wife>>."도 가능)
7. (호의, 서툶) "I'm sorry. Value of landbound trinkets is hard to understand. Will bring something more shiny next time." → "미안해. 땅에 사는 것들의 장신구는 가치를 이해하기 어렵군. 다음엔 더 반짝이는 걸 가져올게." (기존 하오체를 반말로)
8. (적대, 상처) "No?" ... "That's okay. Here if you need me." → "싫어?" ... "괜찮아. 필요하면 여기 있을게." (기존 번역, main.twee:3448)
9. (적대, 분노) "You spoiled my catch!" → "네가 내 사냥감을 망쳤잖아!" (기존 번역)
10. (적대, 단속) "<<Wife>> shouldn't run away." / "Safer at the nest." → "<<Wife>>【은는】 도망치면 안 돼." / "둥지가 더 안전해." (원문 대응 확인용으로 직접 번역. 기존 번역 main.twee:614는 같은 취지를 "도망치면 안 돼!"로 옮겼다)
11. (성적/임신) "<<Wife>>'s eggs are coming!" / "<<Wife>> is carrying eggs!" → "<<Wife>>의 알이 오고 있어!" / "<<Wife>>【이가】 알을 가졌어!" (기존 번역)
12. (성적/임신) "<<Wife>>! I will have eggs soon." → "<<Wife>>! 나 곧 알을 낳을 거야." (기존 번역)
13. (EN-new 신규, 취향 표현) "I hate it. Dangerous. But if you like it— Put something over it when you're not using it." → "싫어. 위험해. 하지만 네가 좋아한다면... 안 쓸 땐 뭐라도 덮어 둬."
14. (PC→매, reaction-greathawk 신규) "Y-you're going to take care of me, right?" / "Stop pecking me!" → "ㄴ-너, 날 돌봐줄 거지?" / "쪼지 마!"
15. (PC→매, 신규) "You're not a terror. You're all I need." → "넌 무서운 존재가 아니야. 넌 내게 필요한 전부야."
