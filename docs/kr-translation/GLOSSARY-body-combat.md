# 용어집: 몸과 성적 어휘, 전투 문장

기존 번역(KR-old, 0.5.12.13)이 정한 낱말을 잇기 위한 문서다. 이 게임은 성인용이고 번역은 원문의 노골적인 수위를 그대로 따른다(`cunt`는 `보지`/`씹구멍`, `fuck`은 `박다`, `slut`은 `걸레`).
빈도는 KR-old `game/` 아래 `*.twee`(표시 없으면) 기준 grep 개수. `+js`는 kr_dict.js 등 포함. 매크로 개수는 `<<이름>>` 호출 수.
"기본" 열이 새 번역이 쓸 표준이다. 매크로가 이미 출력하는 낱말은 본문에 다시 쓰지 말고 매크로를 그대로 둔다.

## 1. 신체 부위 (찍는 위젯과 출력)

| 영어 | 한국어(표준) | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| pussy (`<<pussy>>` 971) | 보지 | 질 172(안쪽·체액이 흘러나오는 곳), 음부 28, 외음부 9, 씹구멍 9 | `pussyNames()` = 보지/보지/음부/질(각성도·순결도에 따라 열림). 리터럴 보지 2697 |
| vagina(내부) | 질 | 보지 | "질에서 흘러나온다", "질 내부". 자궁 88, 처녀막 69 |
| `?vulva` 템플릿 (43) | 외음부/질/음순/보지 중 무작위 | | t-bodyparts.js. 고정해 쓰지 말고 템플릿 그대로 |
| `<<npcVagina>>` 69 | 보지 | | 정조대면 정조대 이름을 찍는다 |
| labia | 음순 | 대음순 24(outer lips/labia) | 음순 144(+js). `outer labia`/`outer lips`만 대음순 |
| clit (`<<clit>>` 23) | 클리토리스 | 클리 약 10(구어, 클리프 제외), 음핵 2 | 페니스가 있으면 `<<clit>>`은 `<<penis>>`가 된다 |
| penis/cock (`<<penis>>` 1112, `<<penisSimple>>` 68) | 자지 | 페니스 약 10(밴드 제외), 좆 128, 음경 3, 고추 4, 육봉 3 | `penisNames()` 전부 자지. 크기·상태 수식어가 앞에 붙는다(5.3절) |
| `<<npcPenis>>` 160 / `<<npcPenisSimple>>` 159 | npcPenis는 `getPenisDescKr(penisdesc)`, Simple은 자지(가끔 육봉) | | 정조대 쓴 NPC는 "구속된 자지" |
| strap-on | 페니스 밴드 | | 리터럴 213. `playerHasStrapon()`이면 `<<penis>>`가 이 낱말을 찍는다 |
| shaft / length | 기둥 | 물건 | 기둥 357. "기둥을 매만진다". `<<penises>>` 최고 흥분 단계도 "기둥들" |
| glans | 귀두 | | 191. foreskin 포피 54, frenulum 소대 |
| balls / testes | 고환 | 불알 34 | 고환 40. `ballsExist ? "고환" : "보지"` 같은 print 안에도 있음 |
| anus (`<<npcAnus>>`) | 항문 | 애널 99(형용: 애널 플러그·애널 비즈), 후장 5, 똥구멍 4 | 항문 732. 장 속 4, 직장 27 |
| breasts (`<<breasts>>` 790) | (크기) 가슴 | 젖가슴 24, 젖통 18(비속 대사), 유방 4(`chestsimple`), 빈유 3 | `getBreastSizeKr` 아래. 크기 0이면 "유두만 있는 가슴" |
| nipple (`<<nipple>>` 27, `<<nipples>>` 64) | 젖꼭지 | 유두 152(+js 220) | `<<nipples>>` = "양쪽 젖꼭지". 사전·UI(getBodypartKr)는 유두 |
| chest | 가슴 | | 크기 0일 때만 `chest` = 가슴 |
| bottom (`<<bottom>>` 1395) | (크기) 엉덩이 | 궁둥이 106, 둔부 3 | `[" 엉덩이"," 궁둥이"," 둔부"].pluck()`(원문 ass/bum/butt). 대사 속은 `either("엉덩이","엉덩이","궁둥이")` |
| `<<bottomsimple>>` 35 | 엉덩이/궁둥이/둔부 중 무작위 | | |
| crotch | 사타구니 | 가랑이 191 | 사타구니 417. pubic = 사타구니(getBodypartKr) |
| thigh | 허벅지 | | 865 |
| mouth/lips | 입, 입술 | | `<<mouth>>` = 입술. tongue 혀 |
| womb / cervix / prostate | 자궁 / 자궁경부 / 전립선 | | 88 / 18 / 15 |
| genitals (`<<genitals>>` 906) | 성기 | | "순결한/구속된 자지【와과】 보지" 식으로 조립. 리터럴 성기 218 |
| tummy / chest / back / thigh (부위 키) | 배 / 가슴 / 등 / 허벅지 | | getBodypartKr. left_X는 왼쪽 X, 팔·손·발은 "왼팔·오른손" 붙여 씀 |

### 1.1 크기·상태 수식어(위젯이 찍음)

- 가슴(getBreastSizeKr): budding 아주 작은 / tiny 작은 / small 아담한 / pert 봉긋한 / modest 탱탱한 / full 풍만한 / large 큰 / ample 커다란 / massive 큼지막한 / huge 거대한 / gigantic 엄청난 / enormous 어마어마한.
- 엉덩이(bottomsize 0~8): 가느다란 / 날씬한 / 보통의 / 푹신한 / 부드러운 / 둥근 / 통통한 / 큰 / 거대한.
- 자지 크기(penissize): micro 초소형 / mini 매우 작은 / tiny 아주 작은 / small 작은 / (보통은 빈칸) / large 큰 / enormous 엄청난.
- 감도(`breast/bottom/genital/mouthsensitivity`): sensitive 민감한 / tender 여린 / receptive 잘 느끼는.
- 상태(genitalstate): dripping 뚝뚝 흐르는 / tortured 고문받은 / spent 지쳐버린 / twitching 경련하는 / tired 피로한 / tingling 얼얼한 / parasitic 기생하는 / caged 구속된 / sealed 봉인된 / virgin 순결한.

## 2. 체액

| 영어 | 한국어(표준) | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| semen / cum / ejaculate(명사) | 정액 | 사정액 16, 정자 31(`?semen` 템플릿: 정액/정자/사정액) | 정액 1717. `<<semen>>`은 페니스 없으면 "음탕한 액체" |
| juices / 여성의 분비 | 애액 | 체액 296, 음란한 체액 75 | 애액 232. NPC 여성 절정은 애액 |
| pre-cum | 쿠퍼액 | | 111 |
| bodily fluid(성별 불명) | 체액 | 끈적한 액체 37 | |
| lube / lubricant | 윤활제 | 윤활액 6 | 85. `<<vagina_lube_text>>` 등 |
| goo / slime | 점액 | | 99. `getFluidKr`: semen 정액, goo 점액, nectar 넥타르 |
| saliva / drool | 침 | 타액 25 | |
| milk(모유) | 모유 | 젖 27 | 97. 가축 우유는 우유 |
| squirt | 분수(를 쏘다/치다) | 뿜어낸다 | 여성 분출 |

## 3. 성행위·전투 동사

| 영어 | 한국어(표준) | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| fuck / pound / ravage | 박는다, 박아댄다 | 쑤신다 372, 유린한다 205, 범한다 290 | 박(으며/고/는/아) 692. 대사에서는 "박아줄게", 지문에서 삽입 동작은 "쑤셔 넣는다" |
| thrust / plunge | 찌른다, 쑤셔 넣는다, 밀어붙인다 | 들이박는다 22, 파고든다 | 찌르 176, 밀어붙인다 101 |
| penetrate / enter | 삽입한다, 꿰뚫는다 | 침범한다, 관통한다 | 삽입 275. 처녀성 상실 문장은 "침범한다/꿰뚫린다" |
| rub / grind / frot | 문지른다, 비빈다, 비벼댄다 | 문질 177 | 문지르 1359, 비벼 278. frot 메뉴는 "비빈다" |
| stroke / caress | 쓰다듬는다, 애무한다 | 어루만진다, 주무른다 | `<<strokes>>`(분노·흥분 단계별 8종), `?stroke` |
| lick / suck | 핥는다 / 빤다 | 핥아먹는다 14 | |
| tease / edge | 애태운다 | 몰아간다 | edge는 "~직전까지 몰아간다"로 통일 필요(7절) |
| press against | 밀착한다 | | "상대의 보지에 밀착한다" |
| straddle | 올라탄다 | | "자지 위로 올라탄다" |
| envelop / take it | 받아들인다 | | "두 자지를 모두 받아들인다" |
| cooperate / pull out / pull away / stop / rest | 협조한다 / 빼낸다 / 물러난다 / 멈춘다 / 쉰다 | | 메뉴 라벨은 "~한다" |
| grab / grope | 붙잡는다, 더듬는다 | 움켜쥔다, 쥐어짠다 | |
| pinch / tweak | 꼬집는다 | | |
| spank / slap | 때린다, 찰싹 때린다 | 후려친다, 철썩 | 철썩/찰싹 혼용 |
| squeeze | 꽉 쥔다, 한데 모아 쥔다 | 쥐어짜 | |
| cum (동사) | 사정한다 | 가버린다 445(대사·구어), 절정에 달한다 542, 절정한다 145, 싼다 | 사정 1548. 남녀 구분 없이 사정한다를 씀 |
| orgasm (명사) | 절정 | 오르가즘 100, 오르가슴 57 | 절정 1579 |
| ejaculate onto X | X에 사정한다 | | "당신의 가슴에 사정한다" |
| spurt / shoot | 뿜어낸다 | 쏟아낸다, 흩뿌린다, 쏘아낸다 | |
| breed / knock up | 임신시킨다 | 씨를 뿌린다 | `<<bred>>` = 교배당한(임신 설정 켬) / 따먹힌(끔) |
| rape / molest | 강간(당한다) | 유린한다, 겁탈 2, 능욕 18 | 강간 164 |
| virgin / purity | 처녀, 동정(남성·페니스), 순결 | | 처녀 342, 동정 147, 순결 390 |
| in heat | 발정 났다 | | 발정 100 |
| masturbate | 자위한다 | | 59 |

## 4. 흥분·절정·통증 상투 표현

| 영어 | 한국어(표준) | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| arousal / aroused | 흥분 | | 1096. 달아오른다 209, 쾌감 353, 쾌락 204 |
| pleasure | 쾌락, 쾌감 | | 쾌락에 취해 정신을 놓았다(lost in the moment) |
| shiver / shudder / tremble | 몸을 떤다, 파르르 떤다 | 부르르, 덜덜, 잘게 떤다 | 파르르가 가장 흔함 |
| convulse / spasm / twitch | 경련한다 | 씰룩거린다, 꿈틀거린다 | |
| throbbing | 펄떡이는 | 맥동하는, 발딱 선 | |
| tingle / jolt | 찌릿하다, 짜릿하다 | 얼얼한(상태 수식), 따끔 | 짜릿 119, 찌릿 33 |
| pain / hurt | 고통, 아프다 | 통증 83, 아픔 13 | 고통 1371. 따끔 76, 욱신 43, 쓰라 31 |
| blush | 얼굴이 붉어진다, 화끈 달아오른다 | | |
| sweat / wet | 땀 / 젖다, 흠뻑 젖다 | 축축 167, 흥건 5, 번들 34 | |
| drip / leak | 뚝뚝 흐른다, 흘러내린다 | 줄줄 22 | 흘러내린다 131 |
| sigh / shallow breath | 한숨을 쉰다/내쉰다 / 얕은 숨을 내뱉는다 | | |
| lost in the moment | 쾌락에 취해 정신을 놓았다 | | 고정 문장 |
| exposed / lewd | 노출된 / 음란한 | 음탕한 140, 외설적인 51, 야한 58 | 음란 657. `lewd`(class) 대부분 음란 |

## 5. 욕설과 비속어(수위: 원문과 같은 선)

| 영어 | 한국어(표준) | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| slut (`<<slut>>` 65) | 걸레 | 변태(남성 외형 `<<slut>>`), 걸레년 231 | 걸레 951. 호칭은 "걸레야/걸레년아" |
| whore | 창녀 | 매춘부 8(직업 서술) | 301. 직업은 매춘부, 욕설은 창녀 |
| bitch (`<<bitch>>` 460) | 암캐 | | 호칭 뒤 `<<bitch>>【아야】`. 암캐 148 |
| bastard | 새끼 / 창녀 | | `<<bastard>>`: 남성 외형 새끼, 여성 창녀. 새끼 706 |
| fucktoy | 육변기 | | 55. cum dump = 정액받이 27, 성노예 9 |
| cunt (`<<cunt>>`) | 보지 / 씹구멍 | 씹 | `<<cunt>>` = 남성 외형 자지, 여성 보지 |
| fuck(감탄) / fucking | 씨발 / 좆같은 / 존나 | 씨발 421, 존나 108, 좆같 39, 썅 22, 지랄 13 | `Fucking <<bitch>>` → "씨발 <<bitch>>" |
| shit / damn / bloody | 젠장 / 빌어먹을 | 젠장 229, 빌어먹을 167, 망할 75, 제기랄 9 | "No one gives a shit" → "좆도 신경 안 쓴다" |
| pervert / freak | 변태 | | 447 |
| filthy / dirty | 더러운 / 음란한 | | 더러운 201 |
| dog / pig(모욕) | 개 / 돼지 | | |
| 호칭: boy/girl (`<<girl>>` 1203) | 소년/소녀 | | 대사에서는 "여자애/남자애"도 씀 |

## 6. 신음·비명·소리 표기

- 서술 동사: moan 신음한다(`신음하` 516, `신음한` 338) / scream 비명을 지른다 / gasp·pant 헐떡인다(531) / whimper·grunt 끙끙댄다, 앓는 소리를 낸다(73) / sob 흐느낀다 / whine 칭얼거린다 / sigh 한숨을 쉰다.
- `?orgasmMoans` 템플릿(63회): 신음한다, 끙끙댄다, 헐떡인다, 한숨을 내쉰다, 비명을 지른다, 흐느낀다, 웃음을 터뜨린다. 문장 앞뒤를 이 동사로 닫을 수 있게 쓴다(`<<He>>【은는】 ?orgasmMoans …`).
- 대사 속 소리: "아!", "아앗!", "아아앗!", "으윽!", "하아...", "흑", "앗". 말줄임은 반드시 `...`(마침표 3개; `...` 726 : `…` 0).
- 더듬기는 하이픈: "이-이건", "저-정조대"(원문 `I-I`), 말을 삼키면 "하, 하지만".
- 의성·의태: 찰싹 / 철썩(때림), 파르르(떨림), 꿈틀(촉수), 뚝뚝(액체), 푹(삽입).

## 7. 문장 틀: 조사 마커와 대명사 위젯

NPC 주어는 `<<He>>`(그/그녀)에 마커가 붙는다. 서술의 첫 주어는 `【이가】`(행동), 상태·반응은 `【은는】`이 많다(`<<He>>【은는】` 3931 : `【이가】` 1577). 신체 위젯 뒤에는 목적격 `【을를】`(penis 234, pussy 179, bottom 255), 위치격 `에/의`는 마커 없이 쓴다(penis:에 234).
`<<his>>`는 그의/그녀의, `<<him>>【을를】`, `<<himself>>`는 자기 자신/자신. NPC 수식 "상대"는 메뉴 라벨에서 `$_target.pronouns.his` 대신 쓰는 낱말이다. 한국어에 어색한 `<<his>>`는 생략한다.

1. `<<He>> gives your clitoris a tweak.` → `<<He>>【이가】 당신의 클리토리스를 꼬집는다.`
2. `<<He>> <<strokes>> your labia.` → `<<He>>【이가】 당신의 음순을 <<strokes>>` (strokes 위젯이 "부드럽게 애무한다." 같은 완결 서술을 찍으므로 뒤에 동사를 붙이지 않는다)
3. `<<He>> moves <<his>> _args[0] hand away from your <<pussy>>.` → `<<He>>【이가】 <<print _args[0] is "left" ? "왼손" : "오른손">>【을를】 당신의 <<pussy>>에서 치운다.`
4. `<<He>> plunges a finger into your warm <<pussy>>.` → `<<He>>【이가】 따뜻한 당신의 <<pussy>> 속으로 손가락을 깊숙이 쑤셔 넣는다.`
5. `<<He>> releases your <<penis>> from <<his>> grip.` → `<<He>>【이가】 꽉 움켜쥐었던 당신의 <<penis>>【을를】 놓아준다.` (`<<his>> grip`은 관형절로 풀었다)
6. `<<He>> ejaculates onto your chest.` → `<<He>>【이가】 당신의 가슴에 사정한다.`
7. `<<He>> groans as <<he>> cums; ejaculate covers your feet.` → `<<He>>【은는】 신음하며 사정한다. 정액이 당신의 발을 덮는다.`
8. `<<He>> ?orgasmMoans and grasps your arm as your $currentSexToyLeft.name brings <<him>> to orgasm.` → `<<He>>【은는】 당신의 $currentSexToyLeft.name【이가】 <<him>>【을를】 절정으로 이끌자 ?orgasmMoans 당신의 팔을 움켜쥔다.` (변수에도 마커)
9. `You <<peniletext>> prod the <<beasttypes>> tongue with your <<penis>>.` → `당신은 <<penis>>【으로로】 <<beasttypes>> 혀를 <<peniletext>> 찌른다.` (`<<beasttypes>>`는 "…의"까지 찍는다. 부사 위젯은 동사 앞으로 옮김)
10. `"Push your penis against " + $_target.pronouns.his + " " + _pp` → `"당신의 자지를 상대의 " + _pp + "에 밀어붙인다"` (메뉴 라벨은 문자열 조립이라 마커를 못 쓰고 받침 무관한 조사만 고른다. 조사가 걸리면 `"당신의 " + $worn.genitals.name + "【을를】 …"`처럼 마커를 문자열에 넣는다)
11. `<<He>> grabs you by the <<print ($player.ballsExist ? "balls" : "pussy")>>` → `<<He>>【은는】 당신의 <<print ($player.ballsExist ? "고환을" : "보지를")>> 붙잡고` (print 안의 선택은 조사를 같이 넣는다)
12. `<<He>> rapidly rubs <<his>> $NPCList[_nn].penisdesc` → `<<He>>【은는】 빠르게 <<his>> <<print window.KR.getPenisDescKr($NPCList[_nn].penisdesc)>>【을를】 비비더니` (penisdesc는 영어 값 그대로 두고 getPenisDescKr로 찍는다)
13. `<<bHe>> eases your virgin penis into <<bhis>> ass,` → `<<bHe>>【이가】 당신의 동정 자지를 <<bhis>> 엉덩이로 천천히 이끌고,` (`<<bHe>>`는 야수/괴물용 대명사 위젯, `<<bhis>>` = 그의)
14. 대사 `"<<pShe>> is cumming again! Such a nasty <<bitch>>."` → `"또 가네! 정말 음탕한 <<bitch>>【아야】."` (호칭은 `【아야】`. `<<pShe>>`는 플레이어를 3인칭으로 가리킬 때: pshe 그가/그녀가, pher 그의/그녀의, phim 그/그녀)
15. `"Holy shit, that was so much."` → `"세상에, 엄청나게 싸댔군."` (비속어는 순화 없이 의미에 맞추되 1:1 직역을 강요하지 않는다)

참고: 메뉴 라벨 시제는 "~한다"(`협조한다`, `빼낸다`), 선택지 앞의 부위 목적어는 "보지를 대신 내민다"처럼 "~를 ~한다" 순서. 상대 지칭은 "상대의 X". `<<their _args[0]>>`는 hisselect(이름 있으면 "이름의", 둘 이상이면 "그들의").

## 8. 통일이 필요한 용어 (다수 : 소수)

1. orgasm 명사: 절정 1579 : 오르가즘 100 : 오르가슴 57. 절정으로 통일. 오르가슴은 ejaculation-alex/leighton·audience에 몰려 있음.
2. cum 동사 서술: 사정한다 1548 : 절정에 달한다 542(+절정한다 145) : 가버린다 445. 지문은 사정한다/절정에 달한다, 구어 대사는 가버린다/싼다로 역할을 고정. 같은 문장 틀 안에서 섞지 않는다.
3. nipple: 유두 152 : 젖꼭지 148(twee). 위젯이 젖꼭지이므로 서술은 젖꼭지, UI·dict만 유두.
4. testes: 고환 37 : 불알 30. 서술은 고환, 비속 대사만 불알.
5. 가슴 계열: 가슴 1761 : 젖가슴 24 : 젖통 18 : 유방 4. 가슴으로 통일(젖통은 비속 대사 한정, 유방은 `chestsimple` 위젯의 값 하나).
6. 윤활: 윤활제 85 : 윤활액 6 : 로션 6(로션은 별개 아이템이면 유지).
7. 자지 크기 낱말이 두 곳에서 다르다: penissize 위젯(micro 초소형, mini 매우 작은, tiny 아주 작은, enormous 엄청난)과 getPenisDescKr(micro 실같은, mini 아주 작은, tiny 조그만, enormous 거대한, huge 커다란) 4쌍. 위젯 쪽으로 맞추는 쪽을 권한다.
8. 가슴 크기와 자지 크기가 같은 낱말을 쓴다(큰/거대한/엄청난). 구분이 필요하면 getBreastSizeKr만 손볼 것(예: gigantic 엄청난 ↔ enormous 어마어마한).
9. 이중 삽입 메뉴 어순: "보지 이중 삽입으로 대신 유도한다"·"항문 이중 삽입으로 대신 유도한다"(10) : "대신 이중 항문 삽입을 유도한다"(1). 앞쪽으로 통일.
10. edge 메뉴: "절정 직전에 애태운다" 31 : "사정 직전까지 몰아간다" 5. 둘이 따로 있는 건 원문이 `Edge`/`Edge them`을 나눠서이므로 단수는 "애태운다", 복수는 "둘을 ~까지 몰아간다"로 정리하되 사정/절정 낱말은 절정으로 맞춘다.
11. 여성 분출·절정 체액: 애액 232 : 정액(여성 NPC 분출을 정액으로 옮긴 줄, 확인된 것 1건: clit을 문지르며 입에 뿜는 장면). 여성 몸에서 나오는 것은 애액.
12. 대명사 위젯 불일치: `<<he>>` n → "사람", `<<him>>` n → "그들"(같은 n인데 다름). `<<pshes>>`는 "그가/그녀가"(hes는 "그는/그녀는") 1:1 대응이 깨져 "<<pshes>> 어디에 쓰이는지"가 어색.
13. knot: 혹 달린(kr_dict) 1 : 노트(서술 "노트까지 부풀어", "당신의 노트가") 약 4 : "꽉 묶여버리길"(1). 혹으로 통일.
14. 미번역 라벨 3곳: actions-anus.twee:189 `"?????"`, actions-feet.twee:90 `"Rub " + … + " crotch"`, actions-vagina.twee:274 `"Try to keep it away with your thighs"`. 한국어로 옮긴다("사타구니를 문지른다", "허벅지로 막아낸다" 계열은 이미 있음).
15. himself: 자신의 119 : 스스로 51 : 자기 자신 7(`<<himself>>` 392회 호출). 위젯 출력은 "자기 자신", 서술 소유는 "자신의". 어색하면 생략.
16. 의성어 때림: 찰싹 : 철썩 : 후려친다가 같은 spank/slap에 섞여 있음(찰싹 우세). 찰싹으로 통일하고 세게일 때만 후려친다.
17. 신음 계열: 신음한다/하며 854 : 앓는 소리를 낸다 73 : 끙끙대다·거리다 33 : 끙 소리 몇 건. groan은 신음, grunt·whimper는 끙끙대다, 앓는 소리는 whine·whimper의 보조 표현으로만.
18. 헐떡이다: 헐떡인 531 : 헐떡거 6. 헐떡인다로 통일.
19. 정조대 이름: 정조대 344 : 구속된 자지(npcPenis, genitalstate) : 정조 기생충. 구속된 상태 수식은 "구속된", 물건 이름은 정조대.
20. `ballsExist ? … : "보지"` print 안의 고환/불알이 파일마다 다르다(고환 4 : 불알 5 쌍). 위 4번 규칙대로 서술 지문은 고환.

## 9. 표준으로 정한 주요 용어 (요약)

보지, 자지, 가슴/젖꼭지, 엉덩이, 항문, 정액/애액, 절정, 사정한다, 걸레/창녀/암캐/육변기, 신음한다/비명을 지른다/헐떡인다.
