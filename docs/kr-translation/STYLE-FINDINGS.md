# 기존 번역(KR-old) 문체 불일치 조사

대상: `game/**/*.twee` 667개 파일, 78만 줄. 주석·매크로·HTML·조사 마커를 떼고 센 값이며, 대사("..." 안)는 서술에서 뺐다.
스크립트는 python3 -I로 일회성으로 돌렸다(저장하지 않음). 수치는 어림 ±3% 안이다(마커·매크로로 문장이 끊긴 곳, 여러 줄에 걸친 대사는 오차).
"한다체 문장"은 `다.`로 끝나는 서술 문장이다(`아니다` 등 `니다` 오탐은 제외).

## 한눈에 보기 (항목별 한 줄 결론)

1. 시제: 과거 서술은 약 6,150문장(전체 한다체 서술의 3.2%). 3개 박물관 그림 파일은 원문이 과거라 정당하고, 나머지 약 5,270은 대부분 번역자 습관이거나 결과 상태 표현이다. 현재형으로 통일하되, 사람이 파일별로 판단한다.
2. 선택지: `~하기`계 약 1,480개(링크 표시의 7.8%). 같은 영어가 한다/하기 두 꼴로 번역된 원문이 261종이다. `~한다`로 통일한다(디버그 화면만 예외). 기계로 고칠 수 있다.
3. PC 호칭: "당신" 약 10.5만 회로 사실상 단일이다. 서술에 샌 "너"는 1줄 정도라 고칠 것이 거의 없다(대사의 너/그대는 정상).
4. 문장부호: 직선 큰따옴표(") 단일, 말줄임은 "..." 99.5% 단일이라 통일돼 있다. 비어 있는 것은 대사 뒤 쉼표(`," X가 말한다`) 하나뿐이다: 마침표 68% 대 쉼표 32%이므로 마침표로 통일한다(기계 가능).
5. 시스템 문구: 도움말·설정·저널·치트는 합쇼체(약 90%)로 정돈돼 있다. 어긋나는 곳은 해요체 약 500문장, 특히 개발자 문구와 start/waiting-room, 합쇼 알림이 이야기 파일에 섞인 곳이다. 합쇼체로 통일(판단 필요).
6. 조사 마커: 마커 오용은 아주 적다(한글 뒤 마커 9, 괄호식 "은(는)" 2, 오타 마커 2). 대명사 매크로 뒤 생조사 약 64곳. 기계로 대부분 고칠 수 있다.
7. 미번역·오탈자: 미번역 영어 서술은 약 100줄 안팎으로 몇 개 파일에 몰려 있다. 같은 고정 문구의 중복 번역은 링크에서만도 수백 종이다(예: "Everything fades to black..." 11가지). 오탈자는 "되요" 22건 외엔 드물다.
8. 기타: 네/예·아니오/아니요 혼용, 보조동사 띄어쓰기(붙여쓰기 86%), "모든 것이" 암전 문구, 대사 뒤 말머리 어미 등. 뒤에 정리.

---

## 1. 서술의 시제와 어미

**실태** (대사 제외, 문장 단위)

| 어미 | 문장 수 | 비고 |
|---|---:|---|
| 현재 한다체 `~한다/~이다/~있다` | 185,144 | 기준 |
| 과거 `~했다/~었다/~았다/~였다` | 6,149 | 3.2% |
| 합쇼체 `~합니다` | 3,440 | 시스템 문구가 대부분 (5항) |
| 해요체 `~해요` | 574 | 대사 안에서 따옴표가 안 닫힌 것 포함 |

과거형이 서술에서 가장 많은 파일(과거 문장 수 / 같은 파일의 현재 문장 수, 비율):

```
loc-museum/painting-snake.twee      414 / 1984  17%   (원문이 과거: 정당)
loc-farm/woodland.twee              355 /  307  54%   <- 가장 심함
loc-museum/painting-snake-cell.twee 278 / 1226  18%   (정당)
special-avery/mansion.twee          254 / 1915  12%
loc-museum/painting-ward.twee       168 /  950  15%   (정당)
loc-street/events.twee              155 / 3529   4%
loc-flats/hookah.twee               153 /  236  39%   <- 심함
special-doren/main.twee             128 /  158  45%   <- 심함
loc-farm/work.twee                  128 /  869  13%
special-robin/main.twee             125 / 3386   4%
loc-bird/hunts.twee                 111 / 2757   4%
loc-school/maths-project.twee        94 /  754  11%
special-whitney/main.twee            93 / 3057   3%
loc-sewers/morgan.twee               89 /  399  18%
loc-domus-homes/work.twee            58 /  879   6%
loc-school/widgets.twee              57 / 1288   4%
loc-bird/main.twee                   57 / 2764   2%
loc-danube-homes/work.twee           56 /  654   8%
loc-forest/events.twee               54 / 1857   3%
loc-landfill/main.twee               52 /  318  14%
special-robin/walk.twee              51 / 1087   4%
loc-cafe/main.twee                   51 /  737   6%
special-exhibition/main.twee         49 / 1123   4%
special-avery/office.twee            46 / 1377   3%
special-nightmares/main.twee         45 / 1099   4%
base-combat/speech/speech.twee       42 /  464   8%
loc-home/garden.twee                 42 /  395  10%
loc-school/english-play.twee         41 / 1085   4%
special-avery/skyscraper.twee        39 / 1231   3%
loc-forestshop/gwylan-hypnosis.twee  35 / 1323   3%
```
(경로는 `game/overworld-*/` 이하를 줄였다.) 비율이 높은 그 밖의 파일: base-system/tending.twee 46%, base-combat/end.twee 43%, special-masturbation/widgets.twee 39%, loc-school/special-olive.twee 25%, loc-flats/main.twee 19%.
디렉터리별로는 loc-museum 898, loc-farm 568, loc-school 450, special-avery 422, loc-street 245, loc-flats 232.

**원문이 과거인 장면과 구분** (EN-old와 대조):
- 정당: painting-snake / snake-cell / ward는 원문이 과거로 쓴 전설·꿈 서술이다(`You've finally reached heaven together.` EN 5299 ⇒ KR painting-snake.twee:5291 `당신들은 마침내 함께 천국에 도달했다.`, KR 4425 `꽃들이 뿌리를 내리고 무성하게 자라났다`). 약 860문장은 그대로 둔다.
- 결과 상태의 과거(완료상): `loc-farm/work.twee:296 돌담이 시멘트로 보강되었다`, `:302 공사가 완료되었다`, `loc-street/events.twee:115 …간 지 한 시간이 넘었다`, `:113 군중의 규모가 훨씬 더 커졌다`. 한국어로 자연스러워 손대지 않는다.
- 번역자 습관(원문은 현재): `loc-flats/hookah.twee:985 "한 명당 £50." 당신은 손을 내밀며 말했다.` (EN `you say, holding out your hand`), `special-doren/main.twee:469 도렌이 껄껄 웃었다.` (EN `Doren chuckles.`), `special-avery/mansion.twee:1827 에이버리는 <<his>> 시계를 힐끗 보았다.` (EN `Avery glances at <<his>> watch.`), `loc-farm/woodland.twee:700 버섯을 약간 찾았다.` (EN `You find some mushrooms.`), `loc-flats/hookah.twee:1121 당신은 다시 가게 앞쪽으로 향했다.`
- `loc-wolfpack/hunts.twee:288 사슴은 도망쳤다` 같은 줄은 EN-old가 `the deer bolts`(현재, 1206)라 번역자 습관 쪽이다.

**합쇼체 서술** : 이야기 파일(시스템·디버그 제외)에서 따옴표 없는 줄만 센 합쇼 서술이 약 634줄, 182개 파일. 몰린 곳: loc-arcade/widgets 30, loc-bird/main 21, special-templates/main 20(템플릿 안내 문구), loc-school/toilets 17, loc-shop/clothing-v2 13, loc-hospital/pharmacy 13. 표본: `loc-pound/main.twee:2103 …벌었습니다`, `loc-tentacle-world/forest.twee:158 괴물이 당신의 패턴을 학습했습니다`, `base-clothing/wardrobes.twee:2014 …무료입니다`, `loc-shop/clothing-v2.twee:1146 …벗어야 합니다`, `special-sydney/walk.twee:1817 …발견한 것입니다`.
대부분 상태 알림·가격·경고 문구로, 서술이 합쇼로 새어 든 것이 아니라 시스템 문구가 이야기 파일에 놓인 것이다(5항 참조).

**권장**: 서술 과거형은 현재형 한다체로 바꾼다(원문이 현재이므로). 단 painting-* 3개 파일과 위의 결과 상태 표현은 둔다. 해야 할 파일 순서: woodland, hookah, doren, mansion, work(farm), morgan, tending, special-olive.
**기계/판단**: 판단 필요. 어미 치환(`했다→한다`)은 앞 어간에 따라 달라져 자동화 위험이 크다. 파일 단위로 EN-old 줄과 비교하며 고친다. 단 `말했다/웃었다/보았다/말했다` 같은 대사 꼬리와 `찾았다/발견했다` 류는 목록을 만들어 기계 치환 후보로 쓸 수 있다.

## 2. 선택지(링크 표시)의 꼴

**실태**: 링크 표시(`[[표시|대상]]`의 표시) 기준 `~한다`계 17,603, `~하기`계 1,483(`하기` 482 + 그 밖의 `~기` 1,001), `~요체` 23(아니요 등). 원문↔번역 쌍(tm-links)으로는 `다` 17,325 대 `기` 1,435.
같은 영어가 두 꼴로 번역된 원문이 261종이다(예, tm-links.tsv):

```
Leave    떠난다 784 / 나간다 83 / 떠나기 57 / 나가기 22 / 자리를 뜬다 11
Stop     그만둔다 69 / 멈춘다 44 / 그만두기 31
Continue 계속한다 73 / 계속하기 21 / 계속 10
Return   돌아간다 32 / 돌아가기 18
Refuse   거절한다 615 / 거부한다 132 / 거절하기 4 / 거부하기 4
Ignore   무시한다 247 / 무시하기 6
Run      도망친다 85 / 달아난다 34 / 달린다 18 / 달리기 4 / 도망치기 4
```
`~하기`가 몰린 파일(링크 수, 한다 대비): loc-cabin/main 78(91), loc-dance-studio/job 46(73), loc-beach/phallus-project 36(32), loc-school/english-play 33(58), loc-moor/events 33(86), loc-lake/main 30(33), loc-bird/hunts 27(199), loc-cabin/events 27(127), loc-hospital/pharmacy 26(18), loc-hospital/main 26(72), loc-farm/woodland 26(29), loc-asylum/main 25(52), base-debug/test encounters 25(23), loc-school/science-project 23(16), loc-prison/intro 23(13), loc-livestock/barn 23(36). `loc-bus-station/main.twee`는 13 대 0으로 전부 하기꼴.
같은 낱말 쌍 비교(전체): 떠난다 98 대 떠나기 59, 돌아간다 18 대 돌아가기 34, 그만둔다 10 대 그만두기 32, 나간다 12 대 나가기 24, 계속한다 9 대 계속하기 22, 유혹한다 7 대 유혹하기 12. 즉 일부 낱말은 하기꼴이 역전돼 있다.
표본: `loc-cabin/main.twee:160 침실 공간 살펴보기`, `:538 러브시트 요청하기`, `loc-dance-studio/job.twee:600 다른 것을 달라고 요청하기`, `loc-hospital/pharmacy.twee:7 돌아가기`, `loc-beach/phallus-project.twee:143 측정하기`, `loc-bus-station/main.twee:29 정문으로 나가기`, `loc-lake/main.twee:910 계속 휴식하기`.

**정당한 경우**: 디버그/테스트 도구 화면(base-debug 33개), 낚시 디버그 `special-fishing/debug.twee:75 포획: 갈매기` 같은 라벨형, 설정 화면 토글(`~하기` 아님). 이야기 속 행동 선택에서 정당한 하기는 없다. 한 파일 안에서 `[[떠난다]]`와 `[[떠나기]]`가 같이 나오는 곳이 많아(loc-cabin/main 등) 의도된 구분이 아니다.
기타: `다음`(Next) 링크는 16,454로 통일돼 있다. `아니요(14)`/`그래(10)`/`예(38)`/`네(26)` 등 응답형은 8항.
**권장**: `~한다`로 통일(다수 94%, 원문 영어가 동사 원형이라 한다체와 대응). 디버그 파일은 건드리지 않는다.
**기계/판단**: 대부분 기계 가능. `하기`로 끝나는 링크 표시를 어간+`한다/ㄴ다`로 치환하는 규칙(`돌아가기→돌아간다`, `유혹하기→유혹한다`, `계속 읽기→계속 읽는다`)을 만들면 된다. `~하기`가 사실상 명사형인 것(`수영 연습하기`→`수영을 연습한다`)은 목적어·조사 조정이 필요해 판단. 같은 영어의 서로 다른 동사(떠난다/나간다, 거절/거부)는 이 항목이 아니라 7항.

## 3. PC를 가리키는 말

**실태** (대사 제외 서술): 당신 104,959 / 당신들 377 / 너계 922(대부분 대사 줄) / 플레이어 48 / 그대 29 / 여러분 8 / 귀하 7(전부 "귀하다") / 자네 1 / 주인공 4 / 캐릭터 54.
- 서술에 샌 2인칭 "너": 따옴표가 없는 줄에서 38줄이 걸렸지만 대부분이 줄 바뀌어 이어지는 대사다. 진짜 누출은 `loc-forestshop/gwylan-events.twee:1978 …그윌란이 널 빤히 쳐다보고 있다는 걸 알아챈다.` 정도다.
- "그대"는 전부 고풍 연설·의식: `special-scarlet`(17), `painting-snake`(8), `gwylan-ritual-beast:2255 잎의 동족이여, 그대의 나무를 떠나라`. 의도된 것이다.
- "플레이어"는 설정 화면(`base-system/settings.twee` 15), 치트(5), 시작 경고(`01-config/start.twee:21 일부 플레이어에게 불쾌감을…`)로 시스템 문구다. 단 `shop-hunt.twee:1143 엘크 스폰이 플레이어를 찾아냈습니다`는 개발자 주석성 문구다.
- 이야기 속 `여러분`은 NPC 연설(party.twee:4643, shows.twee:1636)로 정당.
**권장**: 변경 불필요. gwylan-events:1978 한 곳만 `당신을`로. 시스템 문구의 "플레이어"는 유지.
**기계/판단**: 해당 없음(단건 수정).

## 4. 따옴표와 문장부호

**실태** (한글이 있는 줄 수, 줄 단위)

| 항목 | 수 | 비고 |
|---|---:|---|
| 직선 큰따옴표 `"` | 57,241줄 | 사실상 단일 |
| 곡선 큰따옴표 `“ ”` | 3줄 | `base-combat/actions-text.twee:2904`, `loc-forestshop/shop-events.twee:2539`, `loc-livestock/jobs.twee:2066` |
| 곡선 작은따옴표 `‘ ’` | 5줄 | 전부 `special-avery/office.twee`(2050, 2148, 2457, 2669, 2679) |
| `「」『』《》`·전각 `！？，` | 1줄 | `loc-hospital/famequest.twee:111`(일본어 원문 대사가 섞인 것) |
| 말줄임 `...` | 4,898 | 99.5% |
| 말줄임 `…` | 0 | |
| 말줄임 `......` (6점) | 20 | gwylan-events:2305, gwylan-clothes:780 |
| `....` (4점) | 6 | gwylan-ritual-sex:1226 `두 번째 규칙....` |
| `..` (2점) | 39 | `loc-lake/events.twee:342 그..그냥`, `loc-asylum/main.twee:952 어떻게..?` |
| 엠대시 `—` | 658줄 | `——` 6줄(loc-asylum/main:952), `--` 14 |
| 느낌표/물음표 겹침 `!!` `??` | 194 | 대부분 정상 대사(`거야?!`)와 디버그 `???` |
| `~` | 16 | 거의 수치 범위(`7~8시간`) |
| 말더듬 `가-가` | 1,117줄 | 160개 파일, 원문의 stutter를 따른 것 |

**대사 뒤 꼬리**: 대사 끝 부호 + 닫는 따옴표 + 화자 + 말하다 꼴을 센 결과
- 마침표 `." 로빈이 말한다` 11,594
- 쉼표 `," 로빈이 말한다` 5,424
- 물음표 2,851 / 느낌표 1,034(원문과 같아 문제 없음)
마침표 68%, 쉼표 32%. 한 파일 안에 둘이 10회 이상씩 섞인 파일이 99개(꼬리가 있는 409개 중). 대표적으로 special-robin/main(쉼표 191/마침표 202), special-kylar/main(173/166), special-whitney/main(195/141), special-avery/mansion return(115/150), special-avery/party(111/346), loc-street/events(91/280). 한쪽으로 치우친 파일: 쉼표만 쓰는 loc-spa/work(115/0), changing-rooms-events(57/0), loc-museum/painting-ward(100/10); 마침표만 쓰는 loc-bird/hunts(1/136), loc-museum/museumAntiques(0/63), loc-school/maths-project(0/69).
표본(쉼표): `base-combat/speech/speech-avery.twee:1782 "평생 목줄을 채워둬야겠어," …말한다.` / (마침표): `base-combat/actions-text.twee:5328 "계속 가던 길 가." 당신이 말한다.`
**권장**: 대사 뒤에 화자·말하기 꼬리가 붙으면 마침표(`.`)로 통일(다수 68%). 대사가 이어서 다시 시작하는 경우(`"…," 말한다. "…"`)도 쉼표 대신 마침표로 맞춘다. 직선 큰따옴표만 쓴다(곡선 3줄·작은따옴표 곡선 5줄은 `"`/`'`로). 말줄임은 `...`로(6점·4점·2점 정리 약 65줄). `—`는 그대로.
**기계/판단**: 마침표 통일은 정규식으로 기계 가능(`,"` + 공백 + 화자·말하다 꼬리, 같은 줄에 다음 따옴표가 이어지지 않는 경우만). 이어지는 대사 앞의 쉼표는 판단. 따옴표·말줄임 정리는 기계 가능.

## 5. 시스템 문구의 화계

**실태** (문장 어미, 대사 제외)

| 영역 | 합쇼 | 한다 | 해요 | 비고 |
|---|---:|---:|---:|---|
| overlays 전체 | 784 | 184 | 37 | 한다체 184는 거의 설명 문구(social 128, characteristics 54), 사실상 합쇼 |
| settings.twee | 320 | 0 | 14 | 해요 14 |
| tips.twee (도움말) | 186/205 | 3 | - | 나머지는 `하십시오` 계 명령 |
| overlays/journal | 372 | 2 | 10 | |
| overlays/cheats | 85 | 0 | 4 | |
| 01-config(시작 화면) | 20 | 0 | 5 | |
| overlays/feats-ui | 123 | 0 | 3 | |
| base-system/attitudes | 45 | 2 | 1 | |
| base-system/widgets(상태·사이드바) | 121 | 319 | 0 | 한다 319는 월드 상태 묘사(`눈이 오는 날이다`), 합쇼 121은 알림 |
| base-debug | 43 | 304 | 16 | 디버그는 한다체가 주 |
| base-combat/tutorial | 45 | 32 | 2 | |
| base-system/mirror | 50 | 42 | 3 | |
- 즉 규칙은 "시스템 UI는 합쇼체, 월드 묘사는 한다체"에 가깝고 대부분 지켜진다.
- 어긋나는 곳(해요체·한다체가 UI에 섞임):
  - `00-framework-tools/02-version/waiting-room.twee:4 …다시 저장해 업데이트해 주세요`, `:14 벌써 끝났네요`, `:25 …최신 버전으로 돌아가세요` (해요 3, 합쇼 아님)
  - `base-system/settings.twee:481 …설정값을 낮추세요`, `:609 …게임 설정 탭을 이용하세요`, `:790 …탭을 방문하세요`
  - `base-system/overlays/saves-export-import.twee:4 …유의하세요`, `:30 …사용하세요`, `:34 …붙여넣으세요`
  - `01-config/start.twee:65 …유지하세요`, `:65 조심하세요`, `:69 교복과 가방을 잊지 마세요`
  - 같은 start.twee가 합쇼(`…적합하지 않습니다`, `:21`)와 해요(`:65`)를 섞어 쓴다.
  - 명령형은 `하세요` vs `하십시오`가 섞임: 설정·디버그에서 하세요 75, 하십시오 39(tips.twee는 `…하십시오` 일색).
  - `base-debug/test encounters.twee:525 원하는 NPC를 추가하세요`, `:1057 …선택하십시오. 기본 생성을 원하시면 비워두십시오`(같은 파일 안에서 혼용).
- 이야기 파일에 놓인 시스템성 알림(합쇼)은 1항 참조. 개발 주석/버그 문구(`…발견한 것입니다`)도 합쇼.
**권장**: 시스템 UI·도움말·설정·경고·알림은 합쇼체 `~합니다/~하십시오`로 통일(다수). 월드 상태 묘사는 한다체 유지. 디버그 도구는 한다체/합쇼 어느 쪽이든 두되 한 파일 안에서 통일. 명령형은 `~하십시오`(tips 기준)를 쓴다.
**기계/판단**: 해요체 약 500문장 중 `~하세요→~하십시오`, `~주세요→~주십시오` 같은 어미 치환은 기계 가능하나 연결 어미(`~해요`/`~네요`)는 판단. 상태 알림이 어느 쪽인지는 파일 단위 판단.

## 6. 조사 마커

**실태**
- 마커 총 사용: 매크로/변수 뒤 마커 약 88,000회, 마커 뒤 공백+한글 80,079회. 문제는 아주 적다.
- 한글로 끝나는 고정 낱말 뒤에 쓸데없이 붙은 마커: 9곳. `base-combat/man-combat.twee:1825 초록빛 빛【을를】 꺼내들어`, `:1827 벽옥 펜던트【을를】`, `:1835`, `:1837`(같은 4곳), `special-whitney/main.twee:8279 카일라【은는】 믿을 거야`, `special-avery/skyscraper.twee`(3곳). → 마커를 걷고 `을`/`를` 등 직접 조사로.
- 마커 없이 "을(를)" 식: `은(는)` 1, `이(가)` 1 = `special-nightmares/main.twee:907 $worn.genitals.name은(는) 먼지가 되어`, `:909 …name이(가) 바닥으로`. (0.5.12에서 번역이 마커 없이 남은 곳.) → `$worn.genitals.name【은는】`, `【이가】`.
- 변수 뒤 생조사: `$childRecords[...].species를`(children-events:338, 416), `£$dorenhotchocoprice를`(loc-park/robin:983) 등 5곳. 마커 `【을를】`로.
- 대명사·`<<print>>` 매크로 뒤 생조사(`<<him>>을 향해`, `<<bhim>>과`, `<<He>>【이가】 …>>으로`): `으로` 26(대부분 `<<print "왼손"/"오른손">>으로`로 받침 고정이라 정상), 가 12, 을 10, 를 6, 는 3, 과 3, 이 2, 와 1, 은 1: 총 64곳, 몰린 파일은 `base-combat/man-combat.twee` 25, `special-avery/party` 11, `loc-school/english-play` 8, `loc-bird/main` 5. 표본: `english-play.twee:2964 <<him>>을 향해 손을 흔든다`, `loc-bird/main.twee:7330 <<bhim>>과 함께`. → 마커로.
- 이중 조사: `special-avery/party.twee:4330 <<he>>【이었였】는지`, `loc-school/widgets-events.twee:452 <<bellyDescription pc>>【으로로】는`, `loc-livestock/intro.twee:971 <<girl>>【이었였】는데` 3곳은 의도(`~였는지`처럼 어미 연결)라 정상일 수 있어 확인 후 둔다.
- 마커 앞 공백(`>> 【이가】`, `<<bhim 2>> 【을를】`): 18곳(gwylan-ritual-beast 9, loc-forest/events 3, loc-bird/main 3). → 공백 제거.
- 정의되지 않은 마커: 41개로 보였으나 실제로는 `【의】` 21(`speech-robin.twee:146 <<he>>【의】 표정`, shop-events:1753), `【을】`1(`speech-avery.twee:601`), `【이야】`1(:649), `【는】`1(:2143), 오타 `【은는}`1(`ejaculation-plant.twee:499`). `【의】`/`【을】`는 받침 무관하므로 마커가 필요 없다. 오타 하나는 `】`로 고친다.
**권장**: 위 항목을 고친다. `【의】`는 `의`로 풀어도 되지만 표시상 문제가 없어 낮은 우선순위.
**기계/판단**: 한글 뒤 마커·마커 앞 공백·오타 마커·`을(를)` 4종은 기계 가능. 대명사 뒤 생조사는 `<<him>>을→<<him>>【을를】`처럼 기계 가능하나 `에게/과 함께`는 받침 따라 달라지는 조사(`과/와`, `을/를`)만 대상.

## 7. 미번역 영어·오탈자·고정 문구

**미번역 영어 서술** (코드·주석 제외, 한글이 없는 줄 약 110줄 / 21개 파일):
`loc-livestock/main.twee`(약 22줄, 예 2482 `The farmhands crowd closer, eager to watch. You feel the centaur cock prod your rear.`, 2490), `special-whitney/main.twee:41, :3019 No one comes to your aid, likely due to your reputation as a delinquent.`(6줄), `loc-park/main.twee:619 You scream, but no one comes to your aid against the police.`, `base-clothing/portalPanties.twee:325 You're forced to swallow the cum.`, `loc-police/community.twee:76`(영어 대사 한 줄), `loc-mines/main.twee:18`(`"Right," the one says…` 영어 대사가 번역 중간에 남음), `04-Variables/variables-versionUpdate.twee:6370`, `04-Variables/variables-static.twee:810 Win at least £1,000 worth of bets…`(업적 메시지 영어). 영어 문장이 한국어 줄에 섞인 것은 `special-robin/lemonade.twee:548, :699 …gave you on the stand.`, `base-system/sleep.twee:572~592`(약 10줄, 꿈 힌트 영어), `base-system/text.twee:6266`.
**오탈자·띄어쓰기** (표기 쌍 개수):
- `되요` 22 / `돼요` 0 → 오타. 예 `loc-forestshop/gwylan-hypnosis.twee:1433`, `loc-asylum/events.twee:1389`. 기계 가능(`안되요→안 돼요`, `되요→돼요` 맥락 확인).
- 보조동사 붙여쓰기 vs 띄어쓰기: `~해주다` 붙임 1,552 대 띄움 281, `~해보다` 1,468 대 238, `~버리다` 629 대 111, `~놓다/두다` 278 대 91, `~내다` 1,159 대 101, `못+동사` 붙임 2,014 대 띄움 131. 둘 다 맞춤법상 허용이므로 다수인 붙여쓰기로 통일(약 14% 소수 정리). 기계 가능하나 `먹어 주고 있다`처럼 문장 구조가 얽힌 곳은 판단.
- `한번` 503 대 `한 번` 970(횟수 `한 번`이 맞음), `정도` 붙임 21 대 띄움 994(붙임 21은 `ejaculation.twee:1739` 등, 확인 필요). `로서` 85 대 `로써` 48은 구분이 맞는지 판단이 필요해 센 값만 적는다.
- 그 밖에 `어떻게`(1,306) 대 `어떡해`(14), `할게`(354) 대 `할께`(0), `금세`(116) 대 `금새`(0)는 정돈돼 있다.
**같은 고정 문구의 여러 번역** (tm-links-mixed.tsv 기준, 영어→번역별 횟수):
```
Everything fades to black...  141  어둠 속으로 사라진다 80 / 암전된다 19 / 어둠에 잠긴다 15 / 암흑 속으로 사라진다 7 / 눈앞이 캄캄해진다 6 / 어둠 속으로 희미해진다 5 / 까맣게 흐려진다 3 / (6가지 더)
Remain silent  133  침묵한다 56 / 조용히 있는다 33 / 침묵을 지킨다 32 / 침묵 지키기 6 / 가만히 있는다 4
Leave          958  떠난다 784 / 나간다 83 / 떠나기 57 / 나가기 22 / 자리를 뜬다 11
Accept         255  수락한다 167 / 받아들인다 73 / 받는다 6 / 승낙한다 2 / 허락한다 1
Refuse         755  거절한다 615 / 거부한다 132
Struggle        73  발버둥친다 35 / 저항한다 23 / 몸부림친다 8 / 발버둥 친다 6   (띄어쓰기도 다름)
Take it        101  가져간다 72 / 챙긴다 15 / 가져가기 6 / 받는다 3
Endure          95  견딘다 49 / 참는다 34 / 버틴다 5 / 참아낸다 3
Go quietly      55  조용히 따른다 21 / 조용히 따라간다 18 / 조용히 간다 6 / 얌전히 따라간다 4
```
`Everything fades to black...`에는 `~합니다`(`암흑 속으로 사라집니다...` 1)까지 섞였다. 링크 중 영어 하나에 번역이 2종 이상인 원문은 tm-links-mixed.tsv에 872종이 있다(위는 상위 몇 개). 다수 쪽이 압도적이면(80/141) 그쪽으로, 팽팽하면(33 대 32) 사람이 고른다.
**권장**: 미번역은 EN-old와 대조해 번역한다(이번 EN-new에서 바뀐 줄은 별도 작업이 다룬다). 고정 문구는 가장 많은 번역으로 통일(`어둠 속으로 사라진다...`, `침묵한다`, `떠난다`, `거절한다`, `수락한다`, `가져간다`, `견딘다`). 
**기계/판단**: 고정 문구 통일은 링크 표시에 한해 기계 가능(원문 영어를 아는 tm-links.tsv로 대응). 원문이 같아도 문맥상 다른 뜻이면 둔다. 미번역 줄은 번역 작업.

## 8. 그 밖의 불일치

- **응답형**: 예 38 / 네 26 / 그래 10 (Yes 링크), 아니오 34 / 아니요 14 / 아니 7 (No 링크). 표준 대답은 `아니요`(`아니오`는 서술어 어미). 권장 `네`/`예` 중 하나(다수 `예`)와 `아니요`. 기계 가능하지만 `Yes/No`가 아닌 `그래/아니`는 문맥(친구 대사)이므로 둔다.
- **`다음` 링크**: `Next`는 `다음` 16,454로 통일. `다음으로` 2는 같은 뜻이므로 `다음`으로 맞춘다(tm-links-mixed 기준).
- **`Continue`**: `계속한다`(73) / `계속하기`(21) / `계속`(10) → `계속한다`.
- **대사 안의 합쇼/해요 혼용**: 화자별 말투는 `characters/` 가이드로 따로 다룬다. 해요체 문장이 몰린 파일은 loc-school/special-olive 55, special-sydney/main 42, special-scarlet 40이다(화자 말투 확인은 characters/ 가이드).
- **서술의 `~할 수 있다`/`~가능하다`**: `수 있` 5,569 대 `수있` 0으로 정돈.
- **`것 같다`**: `것 같` 4,262 대 `것같` 1. 정돈.
- **전각·특수문자**: 전각 문장부호 1줄(famequest 일본어), `♥` 계열 0. 문제 없음.
- **통화**: `£` 342줄 / `파운드` 2줄(loc-docks/widgets.twee:914 외 1). → 파운드 2곳을 `£`로(원문 기호가 `£`).

## 권장 작업 순서 (기계 가능한 것 먼저)

1. 기계: 한다/하기 링크 통일(~1,480건), 대사 뒤 쉼표→마침표(~5,400건 중 이어지는 대사 제외), 마커 오류 4종(~100건), 곡선 따옴표·말줄임 정리(~75건), `되요`, `파운드`, 응답형, 고정 링크 문구.
2. 반기계: 보조동사 띄어쓰기(~720건), 해요체→합쇼체 시스템 문구(~500문장).
3. 사람 판단: 서술 과거형(약 5,270문장, 파일별), 미번역 영어(약 110줄), 고정 문구의 팽팽한 쌍.
