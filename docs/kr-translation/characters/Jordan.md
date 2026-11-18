# Jordan (조던)

## 인물
- 신전의 젊은 수도자(사제. `<<nnpc_brother "Jordan">> Jordan`, 성별 가변이라 `<<he>>`로만 처리). 정조대 검사와 용서 의식, 성찬, 견습생 안내를 맡는다. 온화하고 성실하고 순진하며, 부끄러움을 잘 타고(몸을 씻다 들키면 비명, 칭찬엔 얼굴이 붉어짐), 서투르다("저는 이것을 해본 적이 없습니다."). 선의가 몸에 밴 사람이라 PC가 곤란하면 진심으로 걱정한다.
- 주교 쪽 "손"들(`<<bishop_hands>>`, 한 목소리로 말하는 두 명)이 서약을 이유로 개입을 막으면 말을 삼키고 사과하며 물러난다("저— 죄송합니다, 아이야"). 베일리가 신전에서 PC를 정기적으로 살피겠다고 해도 막지 못한다. 순수함이 곧 방패라는 것이 신전 안쪽의 평가다.
- 변수: `C.npc.Jordan.love`(창을 되찾아 주면 +10, 기도·고백에서 올라 다정해진다), `$temple_rank`(prospective/monk/priest. 지위가 오르면 "당신도 우리 중 하나"라며 비밀을 알려 주지만 말씨는 같다), `$jordanSin`(목욕 중인 조던을 훔쳐본 사건의 표시), `$temple_bailey`(베일리 방문), `$pronoun`(수도사/수녀 호칭), `knowsAboutPregnancy("pc","Jordan")`(임신을 알면 "성스러운 술을 강요하지 않겠습니다").
- 상황별 태도: 정조 검사·정조대·의식에서는 엄숙하고 절차적. 기도와 함께하는 방에서는 부드럽고 수줍다. 베일리 앞에서는 정중하되 흔들린다. 성적 사건(목욕 장면 들킴, 의식 도중)에서는 당황해 말이 끊기고, 금세 무마하려 하며("당신이 말하지 않는다면 저도 아무에게도 말하지 않겠습니다") 노골적인 말을 하지 않는다.

## 말투 규칙
- 기본 화계: PC에게 합쇼체(~습니다/~십시오/~겠습니까)와 해요체(~군요/~지요/~세요)를 섞은 정중한 존댓말. 공식 의식·고지는 합쇼체, 걱정·권유는 해요체가 낫다. 기도와 훈계조의 하라체("~거라", "~란다")는 쓰지 않는다. 교단의 주교 손들이 쓰는 투("~하라", "~이다")와 구분한다.
- 1인칭 "저/제"("나"는 쓰지 않는다). 2인칭 "당신". 호칭은 "<<sister>>"(자매/형제, 단독 호명 `"<<Sister>>."`)와 `child`의 번역 "아이야". `My child,` → "나의 아이야," / `, child` → "…, 아이야". 사제를 "<<nnpc_brother "Jordan">> 조던"으로 소개한다.
- 문장은 짧고 완곡하다. 입버릇은 "용서하십시오", "죄송합니다", "감사합니다", "부디", "~시지요", 그리고 말이 많아졌다는 걸 깨닫고 "아, 제가 너무 많이 말했군요!"로 고개를 숙이는 버릇이다. 더듬기는 서약에 막혔을 때 "저—", "죄—"처럼 대시로 끊는다("..."보다 "—"). 말줄임표는 기도할 때만. 감탄은 "아", "오". 웃음은 지문("웃는다")으로.
- 피해야 할 것: 해체·하라체·하게체("기억해라", "걱정하지 마라", "들어오게", "~란다"), 거친 말·속어, "너" 호칭, "~이다" 단정, 능글맞거나 도발하는 투, 설교조. 위엄을 부리지 않고 겸손하게 말한다.
- 성적 상황: 놀람과 부끄러움이 먼저다("꺄악" 같은 비명 표기는 지문으로). 평소의 합쇼를 유지하고, 의식이나 접촉 중에도 말이 끊기고 사과가 늘 뿐 노골적인 어휘를 직접 말하지 않는다. 낮은 호감도에서는 격식, 높은 호감도에서는 같은 합쇼에 따뜻한 해요체가 섞인다.

## 기존 번역 현황
- 지배적 말투: 존댓말. 조던이 화자인 문장 약 256개 표본(main, cloister, prayer, bailey)에서 합쇼 75%, 해요 9%(존대 합계 약 84%), 반말 8%, 하라체 7%. 정조 검사, 성찬, 용서 의식, 베일리와의 대화는 합쇼체로 매끈하다. "아이야" 호칭은 main에서 25회로 일관된다.
- 잘 살린 점: 정조 검사, 성찬, 용서 의식에서 "~습니다/~십시오"의 엄숙한 존댓말이 안정적이다. "용서하십시오, 나의 아이야", "이해해 주셔서 감사합니다. 보호자를 걱정하실 권리는 충분히 있습니다." 같은 완곡어가 인물의 선량함을 보여 준다. 서약에 막혀 "저— 죄송합니다, 아이야"로 끊기는 표현도 원문("I'm— I'm sorry, child")과 맞다.
- 어긋나는 사례:
  - `game/overworld-town/loc-temple/cloister.twee:109` "기억해라.", `:147` "걱정하지 마라.", `:229` "이 무기들은 연습이 필요하다.", `:246` "나를 따라와라.", `:374` "…또 다른 비밀이지.", `:380` "무서운 표정에 겁먹지 마라." 등 → "기억하십시오.", "걱정하지 마십시오.", "저를 따라오십시오.", "이 무기들은 연습이 필요합니다." (원문은 한결같이 공손한 어조이고 `:124`, `:301` 같은 줄은 합쇼)
  - `game/overworld-town/loc-temple/cloister.twee:147` "자, 경기장으로 들어오게, <<sister>>." (`:188` 포함) → "자, 경기장으로 들어오십시오, <<sister>>." (하게체)
  - `game/overworld-town/loc-temple/confess.twee:1366` "자신이 없는 모양이구나, 아이여. … 내가 어떻게 하는지 가르쳐 주마." → "자신이 없는 모양이군요, 아이야. … 제가 어떻게 하는지 가르쳐 드리겠습니다." (`:1380` "~이란다", `:1404` "~하거라"까지 하라체)
  - `game/overworld-town/loc-temple/confess.twee:1997` "안녕하신가, 아이여. 무탈한가?" → "안녕하십니까, 아이야. 별일 없으십니까?" (조던 대사의 "아이여"는 main의 "아이야"와 어긋난다)
  - `game/overworld-town/loc-temple/main.twee:23` "나의 아이야. 네 정조 검사를 받을 시간입니다." → "나의 아이야. 당신의 정조 검사를 받을 시간입니다." (`:25` `:58` `:60`도 같다. 같은 대사 안에서 "네"와 "~입니다"가 섞인다)
- 통일 방향: 조던의 모든 대사를 합쇼체+해요체 존댓말, 1인칭 "저", 2인칭 "당신"으로 모으고 `child`는 "아이야"로 통일한다. 하라체는 주교의 손들(익명 사제 목소리)에게만 남긴다.

## 예시 (영어 원문 → 한국어)
1. (평상시, 정조 검사) "My child," <<he>> says. "It is time for your chastity examination." → "나의 아이야." <<he>>【이가】 말한다. "당신의 정조 검사를 받을 시간입니다."
2. (평상시, 첫 만남) "Welcome. I don't recall meeting you. I'm Brother Jordan." → "환영합니다. 당신을 만난 기억은 없군요. 저는 <<nnpc_brother "Jordan">> 조던입니다."
3. (평상시, 베일리에게) "Thank you for your understanding. You've every right to be concerned for your ward." → "이해해 주셔서 감사합니다. 보호자를 걱정하실 권리는 충분히 있습니다."
4. (평상시, 가족 방문) "It's good to stay in contact with family. You're welcome here whenever you like." → "가족과 연락을 유지하는 것은 좋은 일입니다. 언제든 이곳에 오시는 것을 환영합니다."
5. (호의적, 창을 되찾음) "Child. That spear. Where did you— It doesn't matter. Thank you. You've done more for the world than you know." → "아이야. 그 창. 어디서 그걸— 상관없습니다. 감사합니다. 당신은 자신이 아는 것보다 훨씬 더 많은 일을 세상을 위해 해냈습니다."
6. (호의적, 기도) "I know that shortcut too. I remember reading about it at school. Shall we pray together?" → "저도 그 지름길을 알고 있습니다. 학교에서 그에 관해 읽었던 기억이 납니다. 함께 기도할까요?"
7. (호의적, 안내) "Remember. Everything you learn here is a secret to the outside world." → "기억하십시오. 여기서 배우는 모든 것은 바깥 세상에 비밀입니다." (cloister:109의 개선)
8. (호의적, 안내) "Now step into the arena, sister. Don't worry. This is just a demonstration." → "자, 경기장으로 들어오십시오, <<sister>>. 걱정하지 마십시오. 이건 그냥 시범일 뿐입니다." (cloister:147의 개선)
9. (적대적/거절) "I'm sorry, child. Admission to the sisterhood is restricted to virgins and those who have made amends via the trial of purity." → "미안합니다, 나의 아이야. <<sister>>단에 들어오는 것은 처녀와 동정, 그리고 순결의 시련을 통해 속죄한 이들로 제한됩니다."
10. (냉담, 서약 앞에서) "Forgive me, child. Despite the setback, you managed to retrieve the spear, and at great danger to your person." → "용서하십시오, 나의 아이야. 차질은 있었지만, 당신은 큰 위험을 무릅쓰고 창을 되찾아냈습니다."
11. (성적, 목욕 장면) "You're covered in soot. You should be more careful, but I won't tell anyone if you don't." → "온통 그을음투성이군요. 좀 더 조심해야 합니다. 하지만 당신이 말하지 않는다면 저도 아무에게도 말하지 않겠습니다."
12. (성적, 의식 도중) "I did it!" <<he>> shouts, excited. "Did it work?" → "해냈습니다!" 조던이 들뜬 목소리로 외친다. "효과가 있었습니까?"
13. (평상시, 몰래 들어온 PC에게) "I didn't expect to find anyone here," <<he>> whispers. "Did you sneak in?" → "여기에 누가 있을 줄은 몰랐군요," <<he>>【은는】 속삭인다. "몰래 들어왔습니까?"
14. (호의적, 말이 많아짐) "Perhaps you'll take part. It would make me feel better. Ah, but I say too much!" → "어쩌면 당신도 참여하게 될지 모릅니다. 그러면 제 마음이 조금 놓이겠군요. 아, 제가 너무 많은 말을 했습니다!"
15. (서약에 막힘) "But I spoke with them outside the dark one's home, and—" → "하지만 제가 어둠의 존재의 집 밖에서 <<phim>>【와과】 이야기를 나눴고, 그리고—" (기존 번역 인용. 조던 전용 대사는 EN-old와 EN-new가 같고 코드만 달라졌다)
