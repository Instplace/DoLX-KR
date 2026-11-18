# DoL-KR 기술 관례 (EN-old ↔ KR-old 대조 조사 결과)

기존 번역(KR-old, `game`)이 영어 원문에 덧붙인 장치와 관례. 새 패시지는 이것을 그대로 따른다.
수치는 KR-old `*.twee` 전체 집계(예: `<<he>>` 17,401회). 코드(매크로명·변수·링크 대상·패시지명)는 EN-new와 같게 두고 화면에 보이는 글만 옮긴다.

## 0. 한눈에 보는 원칙

1. 대명사·호칭 매크로는 **한국어를 출력**한다. 조사는 대부분 **마커 `【이가】`를 뒤에 붙여** 해소한다.
2. 저장되는 변수 값(의상·NPC 이름·생물 종류 등)은 **영어로 둔 채** 화면에 찍을 때만 사전/`getXxxKr`로 바꾼다.
3. 영어 문법 장치(a/an, 복수형 s, 관사, 소유격 's)는 **없앤다**. 한국어에서 어색한 대명사도 생략한다.
4. 링크 표시는 번역, 링크 대상(`|Target`)·패시지명·`<<set>>`의 키/값은 **그대로**.
5. JS 안의 문자열은 "화면에 찍히는가"로 가른다. 화면에 찍히면 번역, 로직 키·ID면 영어.

---

## 1. 대명사·호칭 위젯

정의: `game/base-system/text.twee` (`<<widget "he">>` 등). 모든 위젯은 `$pronoun`(m/f/i/n/t)을 본다. NPC 선택은 `<<person1>>`…`<<person6>>` / `<<personselect N>>`이 `$pronoun`, `$index`, `$description`을 정한 뒤 쓴다. 원문의 호출 순서를 바꾸지 않는다.

### 1-1. 인칭 대명사 (조사 필요 여부가 핵심)

| 매크로 | 출력 (m / f / i / n / t) | 조사 | 쓰는 법 |
|---|---|---|---|
| `<<he>>` `<<He>>`(`<<He>>`는 아래 참고) | 그 / 그녀 / 그것 / 사람 / 그들 | **마커 필수**(99%) | `<<he>>【이가】 웃는다.` |
| `<<him>>` `<<Him>>` | 그 / 그녀 / 그것 / 그들 / 그들 | 마커 또는 고정 조사 | `<<him>>【을를】`, `<<him>>에게`, `<<him>>의` |
| `<<his>>` `<<His>>` | 그의 / 그녀의 / 그것의 / 그의 / 그들의 | **포함됨**(의) | `<<his>> 손을 잡는다.` 뒤에 마커 쓰지 않는다 |
| `<<hes>>` `<<Hes>>` | 그는 / 그녀는 / 그것은 / 그 사람은 / 그들은 | **포함됨**(은는) | `she's/he's`용. `<<hes>> 정신이 팔린 틈에` |
| `<<hers>>` | 그 / 그녀 / 그 / 그들 / 그들 | 없음(의도 불명, 쓰임이 드묾 119회) | KR-old는 `<<hers>> 손`, `<<hers>> 것`처럼 뒤에 낱말을 이어 씀. 새로 쓸 일이면 `<<his>>`로 풀어 쓴다 |
| `<<himself>>` | 자기 자신 (전부 동일) | 마커/고정 조사 | `<<himself>>【을를】`, `<<himself>>에게` |

- `<<He>>`는 `<<he>>`의 대문자판이 아니라 **별도 위젯**이다. 첫 등장(`$NPCList[$index].intro is 1`)에는 대명사 대신 이름·묘사("그 남자", "에이버리", "창백한 형체")를 찍고, 이후에는 `<<he>>`+대문자화(한글엔 효과 없음)로 "그/그녀"를 찍는다. 그래서 **원문의 `He`/`he` 대소문자를 그대로 보존**한다(문장 중간으로 옮겨도 `<<He>>`는 `<<He>>`). 강제로 대명사만 쓰는 `<<He_Short>>`도 같다.
- `<<he "Robin">>`처럼 인자로 네임드 NPC 이름을 주면 그 NPC의 `pronoun`을 쓴다(`$pronoun`을 덮어씀).
- 대문자 위젯(`<<His>>`, `<<Hes>>`, `<<Him>>`)은 소문자와 출력이 같다. 원문 대소문자를 보존.
- 변수 안에서 쓰는 `?he ?him ?his ?hes ?hers ?himself ?people ?peopley` 템플릿은 `03-JavaScript/03-Templates/t-pronouns.js`. 출력은 위와 같고, **`?hes`는 `그【은는】 `(마커 포함 문자열)**, `?hers`는 `그의 것`, `?himself`는 `자기 자신`. 템플릿 뒤에는 다른 템플릿(`?vulva`, `?admires`)처럼 조사를 마커로 붙인다: `<<his>> ?vulva【을를】`, `<<He>>【은는】 당신의 몸을 ?admires.`

### 1-2. 접두형 (같은 형태, 대상만 다름)

| 접두 | 대상 | 출력 | 비고 |
|---|---|---|---|
| `b` (`bhe bHe bhis bhim bhers bhimself bhes bboy`) | 짐승/몬스터 `$NPCList[인자 또는 $enemyno-1]` | bhe/bhim: 그(수)/그녀(암)/그것(일반 짐승). **bhis: 항상 "그의"**, bhes: "그는", bhimself: "그 자신", bboy: 소년/소녀/짐승 | `<<bHe>>【이가】 으르렁거린다.` bhe 마커 99%, bhim은 마커·고정조사 혼용, bhis/bhes는 조사 포함 |
| `p` (`pshe pShe phim pher phers pherself pshes psir pmum…`) | **플레이어**(`gender_appearance`) | pshe/phim: 그/그녀, pher: 그의/그녀의, pherself: 자기 자신, **pshes: 그가/그녀가(조사 포함)**, psir: 선생님/부인, pmother 아버지/어머니, pmummy 아빠/엄마, pmrs 미스터/미세스, pdaughter 아들/딸 | 대사 안에서 "플레이어를 가리키는 남이 하는 말"에 쓴다 |
| `nnpc_` (`nnpc_he nnpc_his nnpc_him nnpc_hes nnpc_himself nnpc_wife nnpc_title nnpc_mum…`) | **인자로 준 네임드 NPC**: `<<nnpc_he "Robin">>` | 성별(m 아니면 f) 기준 그/그녀, 그의, 그는, 자기 자신, 남편/아내, 형제/자매, 아들/딸, 수도사/수녀, `nnpc_title`=직함 한글 | he/him은 마커, his/hes는 조사 포함. 인자 필수 |
| `farm_` (`farm_he farm_him farm_his`) | 농장 동물 `$farm_work[인자0]`, 인자1은 성별 | 몬스터면 그/그녀, 아니면 그것(his는 그의/그녀의/그것의) | he/him 마커 |
| `o` (`<<ohe>>`) | 적이 beast면 bhe, 아니면 he | 위와 동일 | 마커 |
| `child-` / 아이 | 별도 대명사 위젯이 아니다. 아이 대화·묘사는 `pregnancy/children.twee`의 `<<childKrText "size"/"hair"/"eye"/"skin" 값>>`(§6) 등으로 처리 | | |

### 1-3. 사람·종류·호칭 명사 위젯

| 매크로 | 출력 | 조사 |
|---|---|---|
| `<<person>>` | 직함/묘사(`getDescriptionKr`)+역할: 남자/여자(성인), 소년/소녀(미성년), 사람, 또는 `role`(경비원 등). 네임드면 직함만. 예: "젊은 남자", "수영 교사" | 마커(10,188/11,854회) |
| `<<persons>>` | `<<person>>`+"의" | 포함(의) |
| `<<personsimple>>` `<<personssimple>>` | 형용 없이 종류만(+의) | 마커/포함 |
| `<<personname>>` | `$NPCList[$index].name`의 한글 이름 | 마커 |
| `<<combatperson>>` `<<combatPerson>>` `<<combatpersons>>` | 전투 중 호칭(이름 알면 이름, 아니면 묘사) | 마커, `s`판은 의 포함 |
| `<<beasttype>>` `<<beasttypes>>` `<<beastSimple>>` | 짐승 종류 한글(`getBeastTypeKr`) | 마커(2,044/2,770회), 복수 `beasttypes`/`beastsplural`은 "~들" |
| `<<person1>>`…`<<person6>>` | 출력 없음(선택만) | - |
| `<<someone N>>` `<<someones N>>` `<<their N>>` | 선택한 NPC: 그/이름. `someones`/`their`는 "의" 포함 | `someone`만 마커 |
| `<<theowner>>` | 2명 이상 남자면 "주인", 아니면 `<<he>>` | 마커 |
| `<<people>> <<peopley>> <<group>>` | 남자들/여자들/남녀 모두, 소년들/소녀들, "여자와 남자들" | 마커 가능 |
| `<<girl>> <<lass>> <<woman>> <<lady>> <<gentleman>>` | **플레이어 외모 성별 기준** 소녀/소년, 여자/남자, 숙녀/남자, 신사/숙녀 | 마커(`<<girl>>【은는】`, `【으로로】`, `【이】`) |
| `<<lassie>>` | 꼬마(도렌 호감 50 이상이면 꼬마 도련님/아가씨) | 마커 |
| `<<sir>>` `<<Sir>>` | **항상 "선생님"**(성별 무관) | 조사 없이 쓰는 호칭 |
| `<<maam>>` | m이면 선생님, 아니면 사모님 | 〃 |
| `<<bitch>>` `<<bastard>>` `<<cunt>>` | 암캐 / 새끼·창녀 / 자지·보지 (플레이어 성별) | 마커 가능 |
| `<<father>> <<mum>> <<mummy>> <<uncle>> <<auntie>> <<spouse>> <<partner>> <<actor>>` | `$pronoun` 기준 아버지·어머니, 아빠·엄마, 삼촌·숙모/이모, 남편·아내, 배우 | 마커 |
| `<<master>>` `<<nnpc_master>>` | 주인님 / 여주인님 | - |

번역문에서의 규칙:
- **조사를 직접 적는 때**: 받침과 무관한 조사(에게, 에게서, 의, 도, 만, 처럼, 보다, 한테)는 매크로 뒤에 바로 쓴다: `<<him>>에게`, `<<bhim>>에게`, `<<personsimple>>의 목소리`. 받침에 따라 바뀌는 조사(은는·이가·을를·와과·으로·아야·이다)는 **반드시 마커**: `<<him>>【을를】`.
- **생략**: 한국어에서 소유 대명사가 어색하면 뺀다("his eyes" → "눈", "<<his>> hands over eyes" → "두 손으로 눈을"). 집계: `his` 24,796→17,824, `hes` 927→379, `himself` 1,026→392(대사 중 대부분 생략). 대신 `He`/`person`은 거의 그대로 둔다(30,282→30,093, 11,826→11,854): 주어를 살린다.
- **어순 때문에 소문자로**: 영어 `<<He>> smiles, <<his>> eyes glassy.` → `흐리멍덩한 눈을 한 채 <<he>>【이가】 미소 짓는다.`(문두가 아니므로 `<<he>>`; 대명사 위치가 문장 안으로 이동해도 `He`의 intro 의미는 `<<He>>`에만 있다는 점에 유의: 첫 등장일 가능성이 있는 문장 시작에서는 `<<He>>`를 유지한다).
- **복수 주어 `n`/`t` 대명사**는 "그 사람/그들"로 나온다. 그래서 `<<he>>`에 `는/은` 같은 고정 조사를 붙이지 않는다(마커 사용).

---

## 2. 조사 마커

### 2-1. 종류와 규칙 (`game/kr_js/kr_josa_postrender.js`의 `trSelectPost`)

| 마커 | 받침 있음 / 없음 | 마커 | 받침 있음 / 없음 |
|---|---|---|---|
| `【은는】` | 은 / 는 | `【으로로】` | 으로 / 로 (**ㄹ 받침은 "로"**) |
| `【이가】` | 이 / 가 | `【아야】` | 아 / 야 |
| `【을를】` | 을 / 를 | `【이나나】` | 이나 / 나 |
| `【와과】` | 과 / 와 | `【이】` | 이 / (없음) — 서술격 "~이다" 앞: `<<girl>>【이】구나` |
| | | `【이었였】` | 이었 / 였 — 과거 서술격: `【이었였】다` |

집계(KR-old): 은는 39,688 · 이가 32,155 · 을를 13,712 · 와과 1,614 · 으로로 694 · 이 511 · 아야 176 · 이었였 53. **이 아홉 가지 외의 마커는 없다.**

### 2-2. 후처리 방식
- 패시지 렌더 직후와 DOM 변경 시(MutationObserver) 한 번 돈다. 순서: ① 화면번역 사전(§3) 치환 → ② 조사 마커 해소. 그래서 **사전이 영어를 한글로 바꾼 뒤의 마지막 글자**로 받침을 판정한다.
- 대상: `#passages #ui-bar #sidebar #stats #ui-dialog #ui-dialog-body`의 텍스트 노드. `script style textarea input code pre`는 건너뜀. **HTML 속성(title, alt, placeholder 등) 안의 마커는 처리되지 않는다.**
- 마커 앞의 **공백은 지워진다**(`name 【을를】` → `name을`). 앞 글자는 마커 앞 텍스트에서 `" ' “ ” ‘ ’ ( ) （ ） [ ] { }` 를 **건너뛰고** 찾는다(`"예쁨"【이가】` → 쁨 기준).
- 마커 앞이 `<span>…</span>`·`<<print>>` 출력 등 **다른 요소**여도 DOM에서 앞 형제 노드를 거슬러 올라가 마지막 글자를 찾는다. 출력이 없는 `<<set>>`·`<<run>>`은 무시된다. 그래서 `<span class="gold">…</span>【을를】`도 된다.
- 마지막 글자가 **한글이 아니면**(영어, 숫자, 기호, `.`, `!`, `?`, `£`) 항상 **받침 없음** 형태(는/가/를/와/로/야/나/""/였)가 된다.
  - 숫자 뒤 마커 금지: `3【을를】` → "3를"(삼=을이어야 함). 숫자는 `<<number _n>>개를`, `$x번을`처럼 **단위 한글+고정 조사**로 쓴다.
  - 영어가 남을 수 있는 자리(사전에 없는 새 이름)에 마커를 쓰면 틀린 조사가 나온다. 사전에 먼저 추가(§3).
- 마커 앞에 아무 글자도 없으면(문단 첫머리 등) 마커는 **빈 문자열로 사라진다**.

### 2-3. 쓰는 곳
- 매크로·변수·`<<print>>` 뒤: `<<person>>【이가】`, `$worn.upper.name【을를】`, `<<print window.KR.getToolKr($x)>>【을를】`, `<<= window.KR.getNpcTitleKr(...)>>【이】라`. 변수명 뒤에 한글이 바로 올 때는 `$name`과 한글 사이에 매크로 경계(공백·`>>`)가 필요하다.
- **링크 표시 안**: `<<link [[<<bhim>>【을를】 책략으로 제압한다 (0:10)|Wolf Cave Spar 2]]>>`, `` [[`${$worn.handheld.name}【을를】 사물함에 넣는다`|$passage]] ``. 링크 대상은 건드리지 않는다.
- **위젯 인자·JS 문자열 안**: 최종 DOM 텍스트가 되면 처리된다. `<<actionstentacleadvcheckbox "def" "_tentacle.fullDesc【을를】 때린다" …>>`, `formatList(arr, "【와과】")`, `<<run _lines.push("난 " + (…) + "【이가】 참 좋아,")>>`. 단, **그 문자열을 로직이 비교·키로 쓰면** 마커 상태 그대로 비교된다(조건문에 마커 섞인 문자열을 넣지 말 것). 맵 `_left["…【을를】 때린다"] to "id"`의 키는 표시용이므로 번역, 값(id)은 영어.
- 한글로 끝나는 **고정 낱말**에는 마커를 쓰지 않고 조사를 직접 쓴다(`에이버리가`, `로빈을`, `옷장에`). 네임드 NPC 이름은 본문에 직접 한글로 적는다(`propernouns-clean.tsv`).
- `【이】`는 "이다/이라/이니" 앞: `"<<= …>>【이】라"`, `$NPCList[0].name【이】니까`. 받침 없으면 사라지고 "라/니까"만 남는다.

### 2-4. 흔한 실수 (KR-old에서 실제로 발견됨)
- **지원하지 않는 마커 종류**: `【의】 【에게】 【도】 【이는】 【이야】 【을】 【는】 【과와】`(약 40건, speech-robin/avery 등)은 **조용히 사라진다**. 해당 조사는 직접 적거나 아홉 가지로 바꾼다(`【이야】`→`【이】야`, `【는】`→`【은는】`).
- 닫는 괄호 오타(`【은는}`) → 마커가 그대로 노출됨.
- 숫자·영어 뒤 마커, 마커 앞에 `<br>`·`<<if>>` 분기가 끼어 앞 글자가 달라지는 경우(분기마다 마커를 따로 둔다).
- 마커 뒤 공백 유지에 의존: `【이가】 말한다`처럼 마커 **뒤**의 공백은 그대로 남는다.
- `<<print>>`로 영어 값이 나오는데 사전에 없어 `Wolf【이가】` → "Wolf가"가 됨.

---

## 3. 화면번역 사전과 조회 함수

### 3-1. `window.KR.dict` (`game/kr_js/kr_dict.js`, 약 1,090항목)
- 내용: **의상(의상 이름 `name` 전부)과 섹스 토이**의 영어→한글. 키는 영어 소문자(`"alice band": "머리띠"`), 알파벳순에 가깝게 정렬. 한두 곳에서만 쓰는 이름은 여기 넣지 않고 출력부 위젯/임시변수에 둔다.
- 동작(`kr_display_postrender.js`): 화면에 렌더된 텍스트 노드에서 **키와 일치하는 영어 낱말(대소문자 무시, 앞뒤가 영문/숫자/`_`가 아닌 경계, 긴 키 우선)을 한글로 치환**한다. 키에 공백/`_`/`-`가 있으면 `strap on horse cock`·`strap_on_horse_cock`·`strap-on-horse-cock`·`straponhorsecock` 변형도 자동 인식.
- 자동으로 **바뀌는 곳**: 위 대상 영역의 텍스트 노드(본문, 링크 표시, 버튼 라벨, 저널/다이얼로그 포함). 그래서 `$worn.upper.name`을 그대로 찍어도 한글로 나온다.
- **바뀌지 않는 곳**: HTML 속성(title/alt), `<input>`/`<textarea>` 값, `<code>/<pre>`, 한 낱말이 `<span>`으로 쪼개진 경우, 캔버스, 영어 대소문자 조합이 다른 키(다른 문자열), 콘솔/에러. 또 **영어 본문이 우연히 키와 같으면 같이 바뀐다**(예: 영어 문장에 `skirt`) — 번역문엔 영어를 남기지 않으므로 문제 없다.
- 로직 비교는 영어 키로 한다: `<<if $worn.upper.name isnot "naked">>` 그대로(사전엔 `"naked": "알몸"`이 있음). 검색 등 코드에서 한글명이 필요하면 `window.KR.lookup(영어)`(대소문자 무시, 없으면 undefined).

### 3-2. `getXxxKr` 조회 함수 (전부 `kr_dict.js`, 미등록 값은 **원문 그대로** 반환)

| 함수 | 입력 → 출력 | 호출 예 |
|---|---|---|
| `getPenisDescKr(desc)` (977회) | `$NPCList[0].penisdesc` "knotted cock" → "혹 달린 좆" (낱말 단위 조립) | `<<= window.KR.getPenisDescKr($NPCList[_n].penisdesc)>>【을를】` |
| `getBreastSizeKr(size)` (191) | `breastsdesc`/`breastdesc` → "큰 가슴" | `<<his>> <<= window.KR.getBreastSizeKr(_npc.breastdesc)>>【을를】` |
| `gatPersonNameDictKR(name)` (408; 철자 `gat` 주의) | 랜덤 몹 이름·네임드 NPC 이름·묘사구 → 한글 | `<<print window.KR.gatPersonNameDictKR($npc[0])>>【이가】` |
| `getDescriptionKr(text)` | NPC 체형/인상("tall brunette man")을 낱말별로 번역 | `<<print window.KR.getDescriptionKr($NPCList[0].fullDescription)>>【와과】` |
| `getNpcTitleKr(title)` / `getNpcRoleKr(role)` | 직함(doctor→의사) / 역할(guard→경비원) | `<<= window.KR.getNpcTitleKr(C.npc.Eden.title)>>【이】라` |
| `getCreatureTypeKr(type)` (233) | 촉수·벌레·식물 등(`giant`/`pale` 접두 처리) | `<<set _vorecreatureKr to window.KR.getCreatureTypeKr($vorecreature)>>` |
| `getBeastTypeKr(type)` | 짐승 종족(`wolfboy`→늑대소년, `cowgirl`→젖소소녀) | `<<print window.KR.getBeastTypeKr($NPCList[0].type)>>【은는】` |
| `getTentacleDescKr(word)` | 촉수 묘사 형용사(sticky→달라붙는) | `window.KR.getTentacleDescKr($struggle[$_loc].description) + ' ' + …` |
| `getToolKr(tool)` | NPC 손의 도구(`lefttool`, `$spankobject`) | `window.KR.getToolKr($NPCList[_i].lefttool)` |
| `getBodypartKr(key)` | `left_hand`→왼손, `upper_back`→등 위쪽 | `<<print window.KR.getBodypartKr($parasite[_type][0])>>에` |
| `getBodywritingKr(writing)` | 문신/낙서 영어 원문→`writingKr` | `<<= window.KR.getBodywritingKr($skin[_p].writing)>>` |
| `getClothingSlotKr(slot)` | upper→상의, under_lower→속옷 하의 | `_slotKr`로 받음 |
| `getFluidKr` `getSeasonKr` `getWeatherKr` `getWeatherStateKr` `getGenderKR` | semen→정액, spring→봄, rain→비, storm→폭풍, Female→암컷 | `<<print window.KR.getWeatherKr(Weather.precipitation)>>【을를】` |
| `getContainerNameKr` `getContainerDecoKr` `getFeederNameKr` `getWardrobeNameKr` | 수조/연못/급식기/옷장 이름 | `window.KR.getWardrobeNameKr($wardrobes[_l].name) + " 옷장"` |
| `getPronounKr(field, word)` | `$_npc.pronouns.him` 등 영어 대명사 → 그/그녀 | `KR.getPronounKr("him", $NPCList[0].pronouns.him) + "【와과】 함께"` |
| `getFoodstuffCountKr(key, n)` | "사과 5개" (counter 필드) | `<<print window.KR.getFoodstuffCountKr($_i.name, $_i.need)>>` |
| `getBabyNameKr` (child-generator.js) · `setup.colourName(colour)` (colours.js) · `setup.getPatternName` | 아기 이름 풀 / 색 이름 / 무늬 이름 | `<<print setup.colourName($haircolour)>>` |
| 그 밖: `getToyNameKr`(children-story-functions.js), `getCompoundCameraLocationKr`(widgets.js), `shopHuntDirKr`·`shopHuntItemNameKr`(shop-hunt-functions.js), `getMapNameKr`(base.js `MAP_NAME_KR`), `colorNameTranslate`(color-namer.js) | 해당 데이터 | |

사람 이름 사전은 `window.KR.personNameDict`(랜덤 몹 + 네임드 + 몇몇 비인물: "the witch": 마녀 등).

### 3-3. `kr_stats_name.js`
`<<moneyStatsNamesKr key>>` 매크로. 통계 화면의 Money 키(camelCase)를 한글로 바꾼다: 특수 키 → `fullMatch`(문장 전체) → 복합어 선치환 → 낱말 사전. **사전에 없는 단어는 영어로 남는다.** 새 Money 키가 EN-new에 생기면 `wordDict`/`fullMatch`에 추가.

### 3-4. 새 항목이 EN-new에 생겼을 때 어디에 무엇을 추가하나

| 새로 생긴 것 | 추가할 곳 |
|---|---|
| 의상(`base-clothing/clothing-*.js`의 `name:`) | ① `kr_dict.js` `window.KR.dict`에 `"소문자 영어 name": "한글"` ② 같은 항목 `description:`을 번역 ③ `word:`는 `""`(§7). **`name`은 영어 유지**. (조사한 바로는 EN-new 신규 6건이 사전에 없음: boiler suit, boiler suit trousers, circle bag, lace parasol, mining helmet, school shoulder bag) |
| 섹스 토이·소품 | `dict`의 섹스 토이 구역 + `sexShopMenu.js`(`namecap`, `description`) / `getToolKr`의 default가 dict를 조회 |
| 색상 | `04-Variables/colours.js`의 `name`·`name_cap` 둘 다 한글 (키는 영어) |
| 생물·촉수·짐승 종류 | `getCreatureTypeKr`/`getBeastTypeKr`의 case, 묘사어는 `tentacleDescDict` |
| 새 NPC 이름/직함/역할 | `personNameDict`, `getNpcTitleKr`, `getNpcRoleKr`(+`getDescriptionKr` 낱말) |
| 음식·재료 | `04-Variables/foodstuff.js`의 `name singular plural counter recipe_name seed_name` 한글, `counter`(개/송이/잔…) 추가 |
| 업적 | `feats.js`의 `title desc hint name missing` 한글 |
| 옷장 이름·가구·그림·알약 | `wardrobeNameDict`, `furniture.js`, `paintings.js`, `bedroom-pills.js` |
| 통계 라벨 `statDisplay.create("gxxx", …)` | 라벨 문자열을 한글로(스트레스, 흥분, 타락도…) |
| 위 어디에도 없는 한두 곳짜리 | 출력부에 위젯/임시변수 맵(`_xxxKr`, §6) |

---

## 4. 변수 값을 그대로 찍는 원문

원칙: **저장 변수에는 번역을 넣지 않는다.** 아래 유형별로 처리한다.

| 유형 | 원문 → 기존 번역 | 방식 |
|---|---|---|
| 의상 이름 | `$worn.upper.name` → `$worn.upper.name【을를】` | **그대로 두고 사전에 맡김.** 마커는 사전 치환 후 판정됨. 관사 "your/the"는 `당신의`로. `$NPCList[$index].clothes.lower.name`, `_nnpc.clothes.upper.name`도 같다 |
| NPC 이름·묘사 | `$NPCList[0].name`, `.fullDescription`, `$npc[0]` | **조회 함수로 감쌈**: `gatPersonNameDictKR` / `getDescriptionKr`. 이름 사전에 없으면 원문 유지 |
| 직함·역할·종류 | `C.npc.Eden.title`, `$role`, `.type` | `getNpcTitleKr` / `getNpcRoleKr` / `getBeastTypeKr` |
| 신체 묘사 | `penisdesc`, `breastsdesc`, `bodypart` | `getPenisDescKr`, `getBreastSizeKr`, `getBodypartKr` |
| 색상 | `$haircolour`, `colour` | `setup.colourName(...)` (또는 `_colourKr`에 담아 사용) |
| 날씨·계절·체액 | `Weather.precipitation`, `Time.season` | `getWeatherKr`, `getSeasonKr`, `getFluidKr` |
| 영어 키를 가진 목록 | `$container[$loc].name`, `$wardrobes[x].name` | `getContainerNameKr`, `getWardrobeNameKr` (저장값은 영어 유지) |
| 위젯 내부 | `text.twee`의 `_text_output` | 위젯 안에서 `window.KR…`로 감싼 값을 `_text_output`에 넣음 (`<<person>>`, `<<beasttype>>`) |
| 임의 영어 키 → 한글 (한두 곳) | 새 위젯 `birdLootKr`, `tfPartKr`, `horseHairKr` 등 | `<<set _map to {"stick": "막대기"}>><<print _map[_args[0]] || _args[0]>>` |
| 로직 비교 | `<<if $worn.upper.name isnot "naked">>` | **번역 금지**, 영어 그대로 |
| 링크 표시에 변수 | `[[`${$worn.handheld.name}【을를】 …`|$passage]]` | 표시만 번역 |
| 전투 행동 맵 | `_leftaction["Escape from the "+$x] to "leftescape"` | `_leftaction[_vorecreatureKr + "에게서 탈출한다"] to "leftescape"` — **키(라벨)만 번역, 값(id) 영어** |

---

## 5. JS 파일 안의 문자열

`diff -rq`로 찾은 EN-old↔KR-old 차이 중 **화면에 찍히는 한글이 들어간 .js** (대표만; 나머지 100여 개는 에러 메시지·`console.log`·주석 정도):
- 데이터: `04-Variables/{foodstuff,feats,colours,shop,hair-defs}.js`, `base-clothing/clothing-*.js`(description), `base-clothing/init.js`(코디 세트 이름), `03-JavaScript/{furniture,sexShopMenu,bedroom-pills,sextoys,eyes-related}.js`, `base-system/questmarkers.js`, `overworld-town/loc-museum/paintings.js`, `03-JavaScript/weather/01-setup/weather-descriptions.js`, `03-JavaScript/external/color-namer.js`(세 번째 칸이 한글 색 이름), `03-JavaScript/04-Pregnancy/{child-generator,children-story-functions}.js`.
- 템플릿: `03-JavaScript/03-Templates/t-{pronouns,misc,fluids,bodyparts,actions}.js`(`either()` 목록, 동물·감탄 풀).
- 런타임 문자열: `base-system/{text,effect,widgets,stat-changes}.js`, `special-masturbation/{effects,actions,audience}.js`, `03-JavaScript/{base,ingame,debug-menu,save,ui,time}.js` 등.
- 번역 기준:
  - **번역**: 플레이어 화면에 찍히는 값 — `name/title/desc/hint/description/text/label` 필드, `statDisplay.statChange("스트레스", …)`의 라벨, 날씨 묘사, 사용자에게 보이는 에러·알림, `either("…","…")` 후보, 디버그 메뉴의 링크 **표시**(`link: [`홈`, `Bedroom`]`).
  - **영어 유지**: 오브젝트 키, 의상 `name`(사전이 담당), 패시지명·링크 대상, `V.xxx` 값과 그것과 비교하는 문자열(`"prospective"` 등 목록), CSS class, 정규식, 세이브에 들어가는 값, 로직 id(`"leftescape"`).
  - 저장 가능성이 있는 영어 값에 한글 필드가 필요하면 **필드를 추가**한다(`writingKr`, `getBodywritingKr`는 영어 원문으로 재조회).
- 데이터 문체: 의상/상점 `description`·업적 `desc`는 **합쇼체/명사형**("사치스럽습니다.", "£1,000 보유하기."), 가구 `description`·전투 텍스트는 **한다체**. 인접한 기존 항목 문체에 맞춘다.
- 코드 구조는 EN-new와 같게 한다(키 이름, 배열 길이, 함수 시그니처). 문자열만 바꾼다. 예: `Errors.report("해당 슬롯에서 …", {})`.

---

## 6. 한글판이 새로 만든 위젯·함수·임시변수

이름 끝에 `Kr`/`KR`(엄격 규칙은 아님). 새 위젯(EN-old엔 없음): `birdLootKr`(plains/loc-bird/widgets), `childKrText`(pregnancy/children, 아이의 size/hair/eye/skin), `costumeNameKr`(special-robin), `hairPartKr`(hairDressers), `hangingLabelKr`(furniture shop), `hawkLootKr`(loc-prison), `horseHairKr`(beast-generation), `mannequinNameKr`(shop-hunt), `phaseFoodKR`(loc-cafe), `tfPartKr`(loc-school). 제거: `skinColourName`(EN-old에만 있음). 전역 함수: §3-2. 매크로: `moneyStatsNamesKr`.

유형:
1. **영어 키 → 한글 맵 위젯/임시변수**: `<<set _fishNameKr to {…}[$x] ?? $x>>`, `_colourKr`, `_slotKr`, `_liqKr`, `_attackerKr`, `_sydtextKr`, `_typeKr`. 한두 곳만 쓰는 번역은 여기. 사전(dict)은 가볍게 둔다.
2. **어순 때문에 구조 변경**: 영어는 조건마다 전체 문장을 갈랐지만, 한국어는 변하는 부분만 변수에 담아 한 번 쓴다 → `<<set _vorecreatureKr …>>왼팔이 _vorecreatureKr에게 갇혀 있다.` 임시변수 뒤에 한글이 이어도 되지만 마커/조사는 변수 값이 영어일 수 있으니 맵으로 한글로 바꾼 뒤 쓴다.
3. **복수형 `<<pluralise>>` 생략/단순화**(336→181회): ① 수사로 대체 `<<number $x>>개의 샘플`, `연고 $salve병`; ② 단복 같은 글자 `<<pluralise _n "나뭇가지" "나뭇가지">>`; ③ 구분이 필요하면 `<<pluralise $x "알이" "알들이">>`; ④ 한 인자만 줘도 된다(plural 기본값=원형, "s" 안 붙음).
4. **조사 포함 문자열 합성**: `"그 " + window.KR.getDescriptionKr(…) + " " + …`, `…의 `, `formatList(arr, "【와과】")`.
5. **대명사 인자 변형**: `window.KR.pronounDict`로 `.pronouns.*` 영어 값을 그/그녀로.
6. **분기 재구성**: 수식어가 `<<if>>`/`<<switch>>` 안에 있을 때 한국어 관형절 순서에 맞게 `<<if>>`를 문장 앞으로 옮기되 안의 매크로·`<<set>>`은 EN-new와 같게 유지(`check.mjs`가 structure 경고를 내면 EN-new와 대조).
7. **EN에 없는 필드**: foodstuff `counter`(수 세는 단위), 예 `counter: "송이"`.

---

## 7. 영어 문법 장치 처리

| 영어 장치 | 한국어 처리 | 예 |
|---|---|---|
| a / an (`<<a $x>>`, `<<A>>`) | 위젯은 인자를 **그대로 출력**한다. 호출은 유지하되 문장은 수량으로: "하나" | `<<a _produce>> 하나를 들어 냄새를 맡는다` (EN: `picks up <<a _produce>>`). 의상 `word:` 필드는 `""` |
| 복수형 s / `<<pluralise>>` | §6-3. 가산 수사 단위 `개/명/마리/병/송이`(음식은 `counter`) | `a foreign penis` → `정체불명의 <<pluralise _n "자지" "자지">>` |
| 관사 the / this | 보통 생략, 필요하면 "그/이" | `the <<person>>` → `그 <<person>>` |
| 대문자화 `<<capitalise>> <<Number>> .toUpperFirst()` | **원문 그대로 유지**(한글엔 무효과·무해). `<<He>>`, `<<Girl>>`, `<<Number>>` 대소문자 보존 | `<<Number $x>>개` |
| 소유격 's / of | "의" | `<<print $name>>'s` → `…의`, `<<persons>>`(=person+의), `<<their N>>` |
| 숫자 서수 | `ordinalSuffixOf(i)` → "i번째", `ordinalWritten(i)` → "첫 번째…아홉 번째" (JS가 한글 출력). 본문에서는 `$_i번째`, `<<number $x>>번째` | `the 3rd time` → `세 번째` |
| 목록 `formatList(arr, conj, oxford)` | 기본 접속어 `【와과】`: "A, B【와과】 C". 인자로 "그리고"를 주면 "A, B 그리고 C" | `formatList($_names)`, `formatList(x, "그리고", true)` |
| 따옴표 안의 변수 | 큰따옴표 그대로, 변수는 그대로 두고 **조사는 따옴표 밖에 마커로** | `"<<= either("보지","질")>>【이】야"`, `"$_word"【이가】` |
| 사전/영어 낱말 직접 인용 | 영어를 남기지 않는다. 의상은 사전으로 | `$worn.upper.name【을를】` |
| `<<number>>`+단위 | `<<number $x>>개의 샘플【을를】`: 숫자 뒤엔 단위 한글+고정 조사 | `£<<print $m>>` 뒤 조사는 `원`이 아니라 문장 재구성 |
| 시간·비용 표기 | `(0:10)`, `(£5)`, `<<note>>` 그대로 | `[[떠난다 (0:10)|Bedroom]]` |
| 문체 | 서술 현재형 한다체, 플레이어는 "당신", 선택지는 "~한다" | `[[Leave|Bedroom]]`→`[[떠난다|Bedroom]]` |

---

## 8. 체크리스트 (패시지 하나를 옮길 때)

1. 매크로·변수·링크 대상·HTML 태그/class를 EN-new에서 그대로 복사했는가(번역은 보이는 글뿐).
2. 대명사 매크로의 **대소문자와 위치**를 보존했는가(`<<He>>` 유지). 받침 바뀌는 조사는 **마커**, 아닌 조사는 직접.
3. 마커는 **9종만**, 숫자/영어/속성 값 뒤에 쓰지 않았는가. `【이야】`처럼 없는 마커를 만들지 않았는가.
4. 영어 이름·분류를 찍는 변수는 사전/`getXxxKr`로 처리되는가. 새 의상·생물은 §3-4대로 등록했는가.
5. 로직 비교용 영어 문자열(`"naked"`, id, 패시지명)을 번역하지 않았는가.
6. `<<pluralise>>`/a/an/관사는 정리했는가. 소유 대명사 중 어색한 것은 생략했는가.
7. `구조 검사 도구(원문과 매크로·링크 수 비교)`로 structure 경고를 확인하고, 정당한 차이(대명사 생략, 어순)만 남겼는가.
