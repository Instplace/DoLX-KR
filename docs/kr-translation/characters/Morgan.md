# Morgan (모건)

## 인물
- 옛 하수도(Old Sewers) 깊숙한 곳에 사는 정신이 나간 사람. PC를 오래전에 잃은 자기 아이(`<<charles>>`: 찰스/샤를린)로 굳게 믿고 "<<mummy>>"(`$pronoun`이 m이면 아빠, f이면 엄마)로 군다. 낡은 정장이나 가운에 이름표 "Morgan"이 달려 있다. 차와 스콘 놀이, 가짜 학교 수업, 목욕, 훈육을 되풀이한다.
- 기본은 따뜻하고 걱정 많은 부모다. 칭찬, 젖은 옷과 건강 걱정, 상 주기가 이어진다("착하게 굴면 이렇게 좋은 걸 누릴 수 있단다"). 그러나 PC가 부정하거나 거절하거나 도망치면 곧바로 갈라지듯 돌변한다. "감히 우리 가족을 무시해", "은혜도 모르는 아이". 폭력(엉덩이 때리기, 팔 붙잡기)은 "이건 다 너를 위한 거야"라며 정당화한다.
- 호감도 `C.npc.Morgan.love`, `dom`: 상 주기와 만지기를 받아들이면 올라가고(`Nursing Handjob` 같은 장면), 거절하면 내려간다. 말투는 달라지지 않고 장면의 분위기(상냥한 보호 대 분노)만 달라진다.
- `$wraith.mimic is "Morgan"`이나 `$possessed`일 땐 광기가 앞선다. "안개 속으로 돌아가!", "너는 추락할 거다. 추락하고 다시는 일어나지 못해." 비명과 중얼거림이 많다.
- 성적인 장면에서도 부모 어조를 유지한다(보상, 칭찬, 위생과 건강 걱정으로 포장). 가볍게 흥분해 숨이 가빠진다. 공개된 자리는 없다.

## 말투 규칙
- 기본: PC에게 다정한 반말. 어미는 "~란다/~단다/~렴/~구나/~니?/~거든/~지" 같은 부모 어조(해체와 해라체의 중간)가 절반, 부드러운 해체("~해/~야/~어")가 절반. 호감도와 상관없이 존댓말을 쓰지 않는다.
- 분노/훈육: "~다/~거다/~라" 단호한 평서와 명령("앞으로는 시키는 대로 해.", "…배우게 될 거다!"). 이때도 "~란다"를 섞어 부모 티를 남긴다("아직 네가 갚아야 할 게 많단다").
- 빙의/광기: 짧고 단정적이고 거친 하라체("두 번 말하게 하지 마라.", "네가 <<phim>>【을를】 다치게 두지 않겠다!"), 비명과 중얼거림은 지문으로.
- 1인칭: "<<mummy>>"가 3인칭처럼 자신을 부른다("<<Mummy>>【은는】 네가 최고가 되길 바랄 뿐이야."). 일반 문장은 "나/내". 두 가지를 한 문장 안에서 섞지 않는다. PC는 "<<charles>>"(이름) 또는 "너". 이름 뒤 조사는 마커(`【아야】`, `【은는】`). "당신"은 쓰지 않는다.
- 애칭: dear → "얘야", sweetie/darling → "아가"/"우리 아가", my child → "내 아이야", good girl → "착한 <<girl>>"/"착하지". 이 대응을 유지한다.
- 문장은 길어도 부드럽게 이어진다. 입버릇: "자,"(Now/Come), "그래, 그래, 좋아", "오,", "물론이지". 말을 더듬을 땐 쉼표 반복("그, 그래,") 표기, 말줄임은 "...". "ㅋㅋ"/이모티콘 금지.
- 피해야 할 것: 해요/합쇼체(PC의 대사가 아닌 한), "~하오/~도다" 사극투, 20대 또래 말투("~거든요", "~잖아~"), 차갑고 사무적인 어조. 광기가 있어도 어린이 같은 혀 짧은 말투는 쓰지 않는다.
- 성적 상황: 반말 유지, 칭찬과 보상의 틀("이건 상이란다", "아주 건강한 반응이야"). 노골적인 단어는 원문 수준을 넘지 않는다.

## 기존 번역 현황
- 지배적 말투: 부모 어조의 반말. morgan.twee, speech-morgan, loc-sewers 전체에서 Morgan 대사 약 220문장 중 다정한 어미(란다/렴/구나/니/마) 84, 해체 81, 단호체 6, 기타 49(감탄사와 명사형). 존댓말은 PC가 하는 말 4개뿐이다.
- 잘 살린 점: "얘야/아가/내 아이야"가 일정하고, `<<mummy>>`를 3인칭으로 쓰는 어색한 부모 말투가 살아 있다. 훈육의 "~거다"와 애정의 "~단다"가 섞여 광기가 보인다. 성적 장면도 부모 어조를 지킨다("네가 그렇게 날 원한다면, 거절하지 않으마, 얘야.").
- 어긋나는 사례(작은 것 위주. 이 인물은 대체로 일관됨):
  - `game/base-combat/speech/speech-morgan.twee:7` "표효한다" → "포효한다" (오타)
  - `game/overworld-underground/loc-sewers/morgan.twee:99` `"ㄱ-그래,"` → `"그, 그래,"` (177행도 같다. 기존 번역의 더듬기 관례는 음절을 쉼표로 반복)
  - `game/overworld-underground/loc-sewers/morgan.twee:337` "감히 우리 가족을 무시해." → "감히 우리 가족을 무시하다니." (원문 "You dare disrespect our family."는 꾸짖는 반문. 평서로 끝나면 밋밋하다)
  - `game/overworld-underground/loc-sewers/morgan.twee:341` "이건 너보다 내가 더 아파." → "이건 너보다 내가 더 아프단다." (바로 아래 394행 "…내가 더 아팠어"와 어미 통일. 훈육 장면은 "~단다"를 쓴다)
- 통일 방향: 평소는 "~단다/~렴/~구나/~야"의 다정한 반말, 분노와 광기에서만 "~다/~거다/~라". 호칭과 `<<mummy>>` 3인칭 자칭을 유지한다. 목욕 장면 서술이 과거형인 것은 영어 원문이 과거형이므로 그대로 둔다.

## 예시 (영어 원문 → 한국어)
1. (평상시) "My child! <<charles>>, you're alive!" → "내 아이야! <<charles>>, 살아 있었구나!"
2. (평상시) "You must be hungry dear. I have just the thing. Tea and scones." → "배고프겠구나, 얘야. 딱 좋은 게 있단다. 차와 스콘이야."
3. (평상시) "How are your grades in school, sweetie? Are <<mummy>>'s lessons helping?" → "학교 성적은 어떠니, 아가? <<mummy>> 수업이 도움이 좀 되니?"
4. (평상시, 걱정) "Don't swim topless down here. There are horrid parasites in the water." → "여기선 윗옷을 안 입고 수영하면 안 돼. 물속에 끔찍한 기생충들이 살고 있거든."
5. (호의) "Very good, <<charles>>. It's a very normal and healthy reaction." → "아주 잘했어, <<charles>>. 아주 정상적이고 건강한 반응이란다."
6. (호의) "There's room for improvement, dear. But that was good." → "나아질 여지는 있구나, 얘야. 하지만 잘했어."
7. (적대, 훈육) "What did <<mummy>> tell you about saying no." → "<<mummy>>【이가】 안 된다고 말하는 것에 대해 뭐라고 했지."
8. (적대, 훈육) "<<Mummy>> only wants you to be the best you can." → "<<Mummy>>【은는】 네가 최고가 되길 바랄 뿐이야."
9. (적대, 분노) "You ungrateful <<girl>>, <<mummy>> will teach you to appreciate everything <<mummy>> does for you!" → "은혜도 모르는 <<girl>>, <<mummy>>【이가】 널 위해 해주는 일들에 감사하는 법을 배우게 될 거다!"
10. (적대, 빙의) "Return to mist!" / "You'll fall. You'll fall, and you won't get back up." → "안개 속으로 돌아가!" / "너는 추락할 거다. 추락하고 다시는 일어나지 못해."
11. (성적) "Did you forget how to do this?" → "어떻게 하는지 다 까먹은 거야?"
12. (성적) "<<charles>>, I got to pop your other cherry too! Isn't it wonderful?" → "<<charles>>【아야】, 내가 네 다른 처음까지 가져가게 생겼구나! 멋지지 않니?"
13. (EN-new 직접 번역, 보상 제안) "You've been a very good <<girl>>, <<charles>>. <<Mummy>> thinks you've earned a reward." → "넌 정말 착한 <<girl>>이었어, <<charles>>. <<Mummy>>【은는】 네가 상을 받을 만하다고 생각한단다."
14. (EN-new 직접 번역, 성적) "There's no need to be ashamed, <<charles>>. It's the perfect size for <<mummy>>." → "부끄러워할 것 없단다, <<charles>>. <<mummy>>한테 딱 맞는 크기야."
15. (EN-new 직접 번역, 칭찬) "Good <<girl>>, good <<girl>>!" says Morgan, smiling wide. → "착하지, 착하지!" 모건이 활짝 웃으며 말한다.
