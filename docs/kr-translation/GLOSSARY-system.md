# 용어집: 시스템·UI 용어

근거: EN-old(0.5.12.13)와 KR-old의 같은 파일을 나란히 비교한 결과(`base-system/` 전체, `overlays/`, `settings.twee`, `caption.twee`, `widgets.twee`, `text.js`, `skill-difficulties.twee`, `fame.twee`, `attitudes.twee`, `mobileStats.twee`, `datetime-text.twee`, `kr_js/`, `04-Variables/feats.js`)와 `tm-links*.tsv`.
빈도는 KR-old `game/` 전체를 `grep -o`로 센 수이며, 낱말이 다른 뜻으로도 쓰이면(예: 피곤, 운동, 순결) "혼재"라고 적었다. 빈도가 `-`인 항목은 표기가 하나뿐이다.
화면에 찍히는 낱말은 코드가 아니라 문자열이다. 매크로 이름(`<<gstress>>` 등), 변수, 패시지 이름은 그대로 둔다.

## 0. 말투 현황 (용어 아님, 먼저 알아 둘 것)

기존 번역의 시스템 화면은 파일마다 말투가 다르다. 새로 번역할 때는 같은 파일 안의 기존 말투를 따른다.

| 파일/영역 | 말투 | 근거 |
|---|---|---|
| journal, traits, settings, attitudes 의 설명문 | 합니다체 | `니다.` 종결: journal 381 : 한다체 2, traits 272 : 0, settings 323 : 0, attitudes 46 : 2 |
| social 의 상태 문구(`description:`) | 한다체 | 137 : 0 |
| characteristics | 혼재 (합니다체 72, 한다체 62) | 신체 묘사는 합니다체, 일부 서술은 한다체 |
| 사이드바 상태 문구(피로도, 스트레스, 트라우마, 통제력, 흥분, 매력) | 합니다체 | `widgets.twee` 1160-1412 행 |
| 사이드바의 허기·갈증 문구 | 한다체 | 같은 위젯 안에서 갈린다 |
| 선택지, 스탯 표시 | 한다체/명사 | |

## 1. 핵심 능력치와 상태

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Stress | 스트레스 | - | 모바일 사이드바 약칭 `스트` |
| Trauma | 트라우마 | 외상(2) | 모바일 약칭 `트라` |
| Arousal | 흥분 | 흥분도(23) | 스탯 표시·사이드바 모두 `흥분`. `흥분도`는 통계 화면 등에 남아 있음 |
| Fatigue / tiredness | 피로도 | 피로(혼재) | 스탯 표시·사이드바·`kr_stats_name` 모두 `피로도`. 모바일 약칭만 `피로` |
| Pain | 고통 | 통증(83, 혼재) | 스탯 표시는 `고통`. 서술문의 통증은 허용 |
| Control | 통제력 | 자제력(18, 혼재) | 스탯 이름은 항상 `통제력` |
| Allure | 매력 | 매혹(혼재) | 사이드바 `매력:`. 설정의 Encounter Rate 설명에도 `매력` |
| Beauty | 미모 | 아름다움(혼재) | characteristics, 스탯 표시 모두 `미모` |
| Purity | 순결함 | 순결도(41) | 스탯 표시·characteristics `순결함`(52), statistics 쪽 `순결도`. 통일 필요 |
| Awareness | 성지식 | 순수함(47, Innocence와 혼재) | characteristics `성지식`. 사이드바는 Innocence라 `순수함` |
| Innocence | 순수함 | - | 사이드바·모바일 |
| Willpower | 의지력 | 의지(혼재) | |
| Physique | 체격 | 체력(47, 혼재) | 스탯 이름은 `체격`. 체력은 일반 명사로만 |
| Corruption | 타락도 | 오염도(1) | 스탯 표시 `타락도`. 귀 슬라임 항목(characteristics)만 `오염도` |
| Lewdity | 음란도 | 음란함(혼재) | 스탯 표시·사이드바 `음란도` |
| Promiscuity | 음란 | 음란함 | characteristics·설정 `음란`, attitudes 설명문 `음란함` |
| Exhibitionism | 노출증 | 노출도(5) | |
| Deviancy | 이상성욕 | 일탈(11) | `일탈자`는 Deviant 배경의 이름이라 별개 |
| Delinquency | 불량도 | 범죄도(3) | 스탯 표시는 `불량도`. 경찰 쪽 Crime은 `범죄도` |
| Status (`<<gcool>>`) | 지위 | - | 학교 내 위치. Reputation(`평판`)과 구별 |
| Hunger | 허기 | - | 허기 단계 문구는 한다체 |
| Thirst | 갈증 | - | |
| Drunk / Alcohol | 취기 | 술기운(7) | 스탯 표시 `취기`. 설정의 Alcohol Tolerance는 `주량` |
| Drugged | 약물 | 약물 영향(모바일) | |
| Hallucinogens | 환각제 | 환각(혼재) | |
| Obedience | 복종도 | - | |
| Acceptance | 수용도 | 수용(characteristics) | 스탯 표시 `수용도`, characteristics `수용: ...`. 통일 필요 |
| Stockholm Syndrome | 스톡홀름 증후군 | 스톡홀름 신드롬(5) | traits의 `스톡홀름 신드롬: 에덴` 등 5곳이 소수 |

## 2. 능력치 변화 표시 (`<<gXXX>>`, `<<lXXX>>` 위젯)

`statDisplay.statChange("이름", 수, 색)`이 ` | + 이름`, ` | + + 이름`, ` | + + + 이름`(감소는 `-`)을 찍는다. 이름 문자열은 `base-system/text.js`가 정하며, 새 위젯을 만들 때는 아래 이름을 그대로 쓴다.
`<<gstress>>`는 빨간색 `+ 스트레스`, `<<lstress>>`는 초록색 `- 스트레스`다. 좋고 나쁨에 따라 색이 달라지는 항목은 코드가 정하므로 번역하지 않는다.

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Stress / Trauma / Arousal / Pain | 스트레스 / 트라우마 / 흥분 / 고통 | - | |
| Fatigue | 피로도 | - | |
| Control | 통제력 | - | `combatcontrol`도 같은 이름 |
| Lewdity | 음란도 | - | |
| Purity | 순결함 | - | Sydney's Purity: `시드니의 순결함` |
| Awareness | 성지식(알게 됨) / 순수함(잃음) | - | `<<gawareness>>`는 상태에 따라 갈림 |
| Corruption | 타락도 | - | Sydney: `시드니의 타락도`, World: `세계 타락도` |
| Willpower | 의지력 | - | |
| Physique | 체격 | - | |
| Beauty | 미모 | - | |
| Delinquency | 불량도 | - | |
| Status | 지위 | - | |
| Trust | 신뢰 | - | |
| Love | 사랑 | - | NPC 지정 시 `로빈의 사랑`처럼 `이름+의` |
| Lust | 욕정 | - | NPC 지정 시 `시드니의 욕정` |
| Obedience | 복종도 | - | |
| Hunger | 허기 | - | |
| Acceptance | 수용도 | - | |
| Rebelliousness | 반항심 | 반항(3) | 3 : 3 |
| Dominance / Respect / Suspicion / Jealousy / Rage / Endearment / Hope | 지배력 / 존중 / 의심 / 질투심 / 분노 / 애정 / 희망 | - | NPC 관계 수치 |
| Daring / Interest / Impatience / Security / Attention / Knowledge | 대담함 / 관심도 / 조급함 / 보안 / 주목도 / 지식 | - | |
| Oxygen / Saltiness / Chaos / Shame / Insecurity | 산소 / 염도 / 혼돈 / 수치심 / 불안감 | - | |
| Hallucinogens | 환각제 | - | |
| Alcohol / Drugged | 취기 / 약물 | - | text.twee 6536-6566 |
| Seduction / Skulduggery | 유혹 / 속임수 | - | |
| `+ N% pass chance` | `+ N% 성공 확률` | - | |
| Hypnosis Potency | 최면 위력 | 최면력(1) | 6 : 1 |
| Escape chance | 탈출 확률 | 도주 확률(3) | 3 : 3 |
| Pound respect | 보호소 평판 | 보호소 존중도(1) | 5 : 1 |
| Readiness | 준비 태세 | 준비도(1) | 2 : 1 |
| Handful of walnuts | 한 줌의 호두 | 호두 한 줌(1) | 2 : 1 |
| Camp concealment | 야영지 은폐 | 야영지 은폐도(1) | 1 : 1 |
| Increases chance of finding treasure | 보물을 찾을 확률 증가 | - | 감소는 `감소` |
| Stray happiness | 길고양이 만족도 | 유기견 만족도(5) | 고양이/개 구분이 아니라 두 곳의 표기가 다름, 통일 필요 |

## 3. 스킬

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Skill | 스킬 | 기술(혼재) | 이름 뒤에 붙일 때 `○○ 스킬`. 아래 표의 스킬 이름 자체는 단독으로도 쓴다 |
| Skulduggery | 속임수 | - | 102곳 모두 `속임수` |
| Dancing / Dance skill | 춤 | 춤 스킬(5), 댄스 스킬(1) | characteristics `춤`, 스탯 표시 `춤 스킬` |
| Swimming | 수영 | 수영 스킬(3) | |
| Athletics | 체육 | 운동(skill_difficulty, 혼재) | 통일 필요, `체육`이 표준 |
| Tending | 관리 | 관리 스킬(21) | 작물·동물 돌봄. 단독 `관리` |
| Housekeeping | 가사 | 가사 스킬(11) | |
| Seduction | 유혹 | 유혹 기술(7) | |
| Sex Skills | 섹스 스킬 | - | characteristics 소제목 |
| Sprays / Nets / Batons / Whips | 후추 스프레이 / 그물 / 봉 / 채찍 | - | `<<gbaton>>`은 `봉 숙련도` |
| Proficiency | 숙련도 | 숙련(혼재) | 그물·봉·채찍 |
| Science / Maths / English / History | 과학 / 수학 / 영어 / 역사 | - | |
| Grade letters (F-, F, D, ... S) | 그대로 | - | 번역 금지 |
| Colour codes: Terrible/Bad/Poor/Okay/Decent/Good/Excellent | 끔찍함/나쁨/보통/괜찮음/좋음/훌륭함/완벽함 | - | 툴팁 `색상 코드` |

## 4. 난이도와 성공 확률

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Very Easy | 매우 쉬움 | - | 초록 |
| Easy | 쉬움 | - | 청록 |
| Medium | 보통 | - | |
| Challenging | 까다로움 | - | |
| Hard | 어려움 | - | |
| Very Hard | 매우 어려움 | - | |
| Impossible | 불가능 | - | 빨강 |
| Skill Check Display | 스킬 판정 표시 | 스킬 체크(5) | 설정 항목 이름 |
| Success Chance | 성공 확률 | - | |
| Skulduggery required | 필요한 속임수 등급 | - | `○○ 스킬이 필요하다/합니다`와 병존 |

## 5. 성향(attitudes), 특성(traits), 데모어

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Attitudes | 태도 | - | |
| Traits | 특성 | 트레이트(2) | 사이드바 버튼 `특성` |
| General / Medicinal / Special / School / Trauma / NPC / Hypnosis / Acceptance Traits | 일반 / 약물 / 특별 / 학교 / 트라우마 / NPC / 최면 / 수용 특성 | - | traits 소제목 |
| Demeanour | 인상(설정), 태도(attitudes) | - | 같은 낱말이 두 화면에서 다름. 통일 필요 |
| Neutral | 중립적 | - | |
| Meek | 순종적(attitudes), 유순함(traits) | 유순(10) | 통일 필요 |
| Submissive | 순종 | 복종(혼재) | 특성 이름 |
| Bratty | 버릇없음(traits), 반항적(attitudes 선택지), 건방진(attitudes 설명) | - | 세 가지로 갈림. 통일 필요 |
| Defiant | 반항적 | 반항(혼재) | |
| Innocent | 순수함 | - | |
| Masochist / Sadist | 마조히스트 / 사디스트 | 마조(29) | 4단계 수식어는 기존 표기 유지 |
| Hypnotic / Bewitched / Beguiled / Mesmeric / Sublime | 희미한 / 불안한 / 강박적인 / 매혹된 / 절정의 ○○ | - | 최면 5단계. Bewitched 단독은 `마법에 걸림` |
| Elk-scarred / marked / bitten / ruptured / spawned | 엘크의 흉터 / 낙인 / 엘크에게 물림 / 엘크의 파열 / 엘크의 부산물 | - | |
| Consensual sex | 합의된 성관계 | 합의 성관계(2) | 5 : 2 |
| Love interest | 연애 대상 | 러브 인터레스트(1) | 9 : 1 |
| Named NPC | 네임드 NPC | - | `네임드`(16) 단독도 씀 |
| Generic NPC | 일반 NPC | - | |

## 6. 명성(fame)과 평판

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Fame | 명성 | 악명(13) | |
| Reputation | 평판 | - | social 소제목. Fame과 구별 |
| sex / prostitution / rape / bestiality / exhibitionism | 섹스 / 매춘 / 강간 / 수간 / 노출 명성 | - | `<<fameProse>>` |
| pregnancy / impregnation | 임신 명성 / 임신 명성 | - | 둘이 같은 표기로 겹침. 후자를 `임신시킴 명성` 등으로 나눌 것 |
| business / combat / kindness / socialite / modelling | 사업 / 전투 / 친절 / 사교 / 모델 명성 | - | |
| Primary Relationships | 주요 관계 | - | social |
| People of Interest | 관심 인물 | 주요 인물(kr_stats_name) | 통일 필요 |

## 7. 변이(transformations)와 신체 유형

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Angel / Fallen Angel / Demon | 천사 / 타락 천사 / 악마 | - | |
| Wolf / Cat / Fox | 늑대 / 고양이 / 여우 | - | |
| Cow | 젖소(여) / 황소(남) | - | 성별로 갈림 |
| Harpy / Bird | 하피 / 새 | - | 수인 모드면 하피 |
| Monster people | 수인 | 괴물 인간(1) | 52 : 1 |
| Beast | 짐승 | 야수(38) | 설정 `Beast Type`은 `야수 유형` |

## 8. 업적(feats)

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Feats | 업적 | 도전 과제(9, Challenge와 혼재) | 112 : 9 |
| Challenge | 챌린지 | 도전 과제(9) | 11 : 9. `스트레스 챌린지`, journal의 `챌린지` |
| Ironman mode | 철인 모드 | 아이언맨(3) | 10 : 3 |
| Broodmother Host | 무리의 어미 숙주 | - | traits의 `부화장 어머니`와 불일치 |
| Broken Dam / Seed Spreader | 번역 없음 | - | 영어 그대로 남음. 번역할 것 |

feats.js 의 title은 256개이며 2개를 제외하고 번역돼 있다. 인물명이 붙은 제목은 `○○ 의 형용사` 꼴이다(예: Sydney the Pure-Hearted = 순수한 마음의 시드니).

## 9. 설정 화면(settings, options)

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Settings tabs: General / Theme / Performance / Advanced / Information | 일반 / 테마 / 성능 / 고급 / 정보 | - | |
| Normal mode / Soft mode / Hard mode | 노말 모드 / 이지 모드 / 하드 모드 | 일반 모드(0), 소프트 모드(0) | Soft가 `이지`인 것은 의도된 기존 표기 |
| Replace Beasts with Monster People | 짐승을 수인로 대체 | - | `수인으로` 오타. 조사 마커 `【으로로】` 필요 |
| Randomise | 무작위 생성(시작) / 무작위 설정(게임) | - | 통일 필요 |
| Body Size / Body Shape | 체격 / 체형 | - | Body Size가 `체격`이라 Physique와 겹침 |
| Awareness | 성지식 | - | |
| Background | 배경 | - | Waif 부랑아, Nerd 범생이, Athlete 운동선수, Delinquent 불량배, Promiscuous 난잡함, Exhibitionist 노출증, Deviant 일탈자, Beautiful 미모 |
| Bailey's Rent | 베일리의 상납금 | 집세(6), 임대료(5), 월세(1) | 통일 필요, 아래 목록 참고 |
| Enable ... | ... 활성화 | 켜기(임신 설정 일부) | 같은 설정 화면에서 `활성화`와 `켜기`가 섞임. `활성화`로 |
| Disable / Enable (라디오) | 비활성 / 활성 | 비활성화 / 활성화 | options의 Extra Info는 `비활성/활성`, 나머지는 `비활성화/활성화` |
| On / Off | 켜짐 / 꺼짐 | - | |
| Default | 기본값 | 기본(`'기본' 옵션`) | |

## 10. 사이드바와 오버레이 표제

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Characteristics | 캐릭터(사이드바 버튼) / 특징(overlay-replace) | - | 같은 화면이 두 이름. 통일 필요 |
| Traits | 특성 | - | |
| Journal | 저널 | 일지(203, 일반 명사) | 버튼은 `저널`. 본문의 일지는 일반 낱말 |
| Statistics | 통계 | 스탯(24, 혼재) | 사이드바 버튼 `통계` |
| Feats | 업적 | - | |
| Time-Sensitive | 중요 알림 | - | journal |
| First experiences (Virginities) | 첫 경험 | 동정(혼재) | statistics. 질 `첫 경험`, 자지 `동정`으로 갈림. 통일 필요 |
| Money (statistics) | 자금 | 소지금(2), 보유 금액(1) | 사이드바 `소지금`, 통계 `자금`, 보충 `보유 금액` |

## 11. 시간·날짜·날씨·돈

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| am / pm | 오전 / 오후 | - | `오전 01:00` 꼴, 0패딩 |
| dawn / day / dusk / night | 새벽 / 낮 / 황혼 / 밤 | - | |
| Sun–Sat | 일 월 화 수 목 금 토 + `요일` | - | `Time.weekDayName`은 한 글자라 `○요일` |
| 날짜 | `MM월 DD일 YYYY년` | - | en-US, zh-CN 형식 / en-GB는 `DD일 MM월 YYYY년` |
| January ... | 1월 ... | - | 달 이름은 숫자 월 |
| Spring / Summer / Autumn / Winter | 봄 / 여름 / 가을 / 겨울 | - | |
| Clear / light clouds / heavy clouds | 맑음 / 약한 흐림 / 짙은 흐림 | - | `getWeatherStateKr` |
| New / Waxing crescent / First quarter / Waxing gibbous / Full | 신월 / 초승달 / 상현달 / 상현망 / 보름달 | - | |
| Waning gibbous / Last quarter / Waning crescent | 하현망 / 하현달 / 그믐달 | - | |
| £ | £ | - | 744곳 모두 기호 그대로. `원`, `파운드` 쓰지 않음 |
| Community service | 사회 봉사 | 사회봉사(25) | 9 : 25로 붙여 쓴 쪽이 다수. 아래 목록 참고 |

## 12. 사이드바 상태 문구 (7단계, 합니다체)

색은 코드가 정하므로 문구만 번역한다. 위가 가장 나쁜 상태다.

| 영어 | 한국어 |
|---|---|
| Fatigue: exhausted / fatigued / tired / wearied / alert / wide awake / refreshed | 탈진 직전입니다 / 몹시 지쳤습니다 / 피곤합니다 / 지쳤습니다 / 멀쩡합니다 / 정신이 또렷합니다 / 상쾌합니다 |
| Stress: overwhelmed / distressed / strained / tense / calm / placid / serene | 압도되었습니다 / 고통받고 있습니다 / 억눌려 있습니다 / 긴장되어 있습니다 / 침착합니다 / 평온합니다 / 고요합니다 |
| Trauma: numb / tormented / disturbed / troubled / nervous / uneasy / healthy | 무감각합니다 / 고통받고 있습니다 / 동요하고 있습니다 / 불안합니다 / 초조합니다 / 불편합니다 / 건강합니다 |
| Control: in control / nearly / struggling / hollow / numb / puppeteered / helpless | 통제하고 있습니다 / 거의 통제하고 있습니다 / 애쓰고 있습니다 / 몸이 공허하게 느껴집니다 / 마음이 멍해집니다 / 꼭두각시처럼 조종당하고 있습니다 / 완전히 무력합니다 |
| Arousal: shake / heat rises / horny / lustful / aroused / stimulated / cold | 흥분으로 몸을 떱니다 / 내면에서 열기가 피어오릅니다 / 성욕을 느낍니다 / 꼴림을 느낍니다 / 자극을 느낍니다 / 짜릿함을 느낍니다 / 차분합니다 |
| Allure: ravaged / perverted / lewd / stand out / attract attention / glances / unremarkable | 유린당하고 싶어 보입니다 / 변태처럼 보입니다 / 음란해 보입니다 / 돋보입니다 / 주의를 끕니다 / 시선을 끕니다 / 평범해 보입니다 |
| Hunger: starving ... full | 아사하기 직전이다 / 몹시 굶주렸다 / 극심한 허기가 밀려온다 / 배가 고프다 / 출출하다 / 허기를 달랬다 / 배가 부르다 (한다체) |

## 13. 통일이 필요한 용어 (다수 : 소수)

번역 때는 다수 쪽을 쓴다. 이미 소수 쪽이 들어간 곳은 Phase D에서 맞춘다.

| 영어 | 표준(다수) | 소수 | 빈도 |
|---|---|---|---|
| Brothel | 창관 | 사창가 / 매음굴 | 87 : 9 : 2 |
| Stockholm Syndrome | 스톡홀름 증후군 | 스톡홀름 신드롬 | 32 : 5 |
| Prostitution | 매춘 | 성매매 | 27 : 6 |
| Consensual sex | 합의된 성관계 | 합의 성관계 | 5 : 2 |
| Community service | 사회봉사 | 사회 봉사 | 25 : 9 |
| Feat | 업적 | 도전 과제 | 112 : 9 |
| Ironman | 철인 모드 | 아이언맨 | 10 : 3 |
| Love interest | 연애 대상 | 러브 인터레스트 | 9 : 1 |
| Monster people | 수인 | 괴물 인간 | 52 : 1 |
| Purity | 순결함 | 순결도 | 52 : 41 (스탯 이름만 세지 않은 상한) |
| Corruption | 타락도 | 오염도 | 22 : 1 (귀 슬라임 항목) |
| Athletics | 체육 | 운동 | skill_difficulty 의 `"운동"` 1곳을 `체육`으로 |
| Fatigue | 피로도 | 피로 | 모바일 약칭 외에는 `피로도` |
| Arousal | 흥분 | 흥분도 | 1096 : 23 |
| Hypnosis Potency | 최면 위력 | 최면력 | 6 : 1 |
| Purification(영어 미확인) | 정화 효율 | 정화력 | 6 : 1 |
| Pound respect | 보호소 평판 | 보호소 존중도 | 5 : 1 |
| Readiness | 준비 태세 | 준비도 | 2 : 1 |
| Handful of walnuts | 한 줌의 호두 | 호두 한 줌 | 2 : 1 |
| Rebelliousness | 반항심 | 반항 | 3 : 3 (동수, `반항심`으로) |
| Escape chance | 탈출 확률 | 도주 확률 | 3 : 3 (동수, `탈출 확률`로) |
| Camp concealment | 야영지 은폐 | 야영지 은폐도 | 1 : 1 (동수) |
| Construction progress | 건설 진행도 | 건축 진행도 | 1 : 1 (동수, 일반 명사는 건설 78 : 건축 67) |
| Bailey's rent | 집세 | 상납금 / 임대료 / 월세 | 6 : 5 : 5 : 1 (베일리 것만 센 수가 아님, 상납금은 설정 화면에 쓰임) |
| Money (sidebar) | 소지금 | 보유 금액 | 2 : 1 (통계는 자금 13) |
| Stray happiness | 길고양이 만족도 | 유기견 만족도 | 5 : 5 (동수) |
| Characteristics (버튼) | 캐릭터 | 특징 | 사이드바 `캐릭터`, overlay-replace `특징`. 한쪽으로 맞출 것 |
| Meek | 순종적 | 유순함 | traits 한 곳만 `유순함` |
| Bratty | 반항적 / 버릇없음 / 건방진 | - | 세 갈래. 하나로 정할 것 |
| Awareness vs Innocence | 성지식 / 순수함 | - | 용어는 맞지만 두 이름을 한 화면에서 구분해서 쓸 것 |
| Acceptance | 수용도 | 수용 | characteristics `수용: ...` |
| People of Interest | 관심 인물 | 주요 인물 | social 소제목 vs kr_stats_name |
| Broodmother | 부화장 어머니 | 무리의 어미 | traits vs feats |
| Randomise | 무작위 생성 | 무작위 설정 | 설정 화면 두 곳 |
| Enable / On | 활성화 | 켜기 | 임신 설정 일부 |
| impregnation fame | (미정) | 임신 명성 | 임신과 임신시킴이 같은 표기라 구분 필요 |
| Broken Dam, Seed Spreader | (번역 필요) | 영어 그대로 | feats 2개 |

통일이 필요한 항목은 위 표 기준 37개다(동수 5개 포함, 번역 누락 1개 포함).

## 14. 선택지 표준

`tm-links.tsv`, `tm-links-mixed.tsv` 빈도에서 다수 표기를 표준으로 삼았다. 표기가 하나로 안 갈릴 때는 "~한다" 꼴(BRIEF 규칙)을 우선하고, 명사형(`~하기`)은 쓰지 않는다. 시간·비용 표기 `(0:10)`, `(£5)`는 그대로 둔다.

| 영어 | 표준 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| Next | 다음 | 다음으로(2) | 16454 |
| Leave | 떠난다 | 나간다(83), 떠나기(57), 나가기(22), 자리를 뜬다(11) | 장소나 자리를 떠날 때 `떠난다`. `나간다`는 방·문 밖일 때만 |
| Refuse | 거절한다 | 거부한다(132), 거절하기(4), 거부하기(4) | 615 : 132 |
| Decline | 거절한다 | 거절하기(1) | 98 : 1 |
| Ignore | 무시한다 | 무시하기(6) | |
| Fight | 싸운다 | 저항한다(5) | |
| Accept | 수락한다 | 받아들인다(73), 받는다(6) | 167 : 73 |
| Resist | 저항한다 | 반항한다(5) | |
| Run | 도망친다 | 달아난다(34), 달린다(18) | 85 : 34 : 18 |
| Escape | 탈출한다 | 탈출(6) | |
| Seduce | 유혹한다 | 유혹하기(6) | |
| Flirt | 추파를 던진다 | 유혹한다(20) | 43 : 20. 유혹한다는 Seduce와 겹치므로 쓰지 않음 |
| Tease | 놀린다 | 유혹한다(11) | 35 : 11 |
| Continue | 계속한다 | 계속하기(21), 계속(10), 계속 진행한다(4) | 73 : 21 |
| Take it | 가져간다 | 챙긴다(15), 가져가기(6) | 72 : 15 |
| Back | 뒤로 | 돌아가기(5), 돌아간다(2) | 69 |
| Stop | 그만둔다 | 멈춘다(44), 그만두기(31) | 69 : 44 : 31 |
| Remain silent / Stay silent | 침묵한다 | 조용히 있는다(33), 침묵을 지킨다(32), 침묵 지키기(6) | 56 : 33 : 32 |
| Get angry | 화낸다 | 화를 낸다(17) | 56 : 17 |
| Step away | 물러선다 | 물러난다(23) | 51 : 23 |
| Obey | 복종한다 | 따른다(12) | 49 : 12 |
| Endure | 견딘다 | 참는다(34), 버틴다(5) | 49 : 34 |
| Yes | 예 | 네(9), 그래(8) | 38 : 9 : 8 |
| No | 아니오 | 아니요(11), 아니(7) | 34 : 11 |
| Wake up | 깨어난다 | 일어난다(26) | 37 : 26 |
| Pull away | 몸을 뺀다 | 물러난다(12), 뿌리친다(5) | 35 : 12 |
| Struggle | 발버둥친다 | 저항한다(23), 몸부림친다(8), 발버둥 친다(6) | 35 : 23. 저항한다는 Resist와 겹치므로 쓰지 않음, 띄어쓰기 없이 |
| Submit | 굴복한다 | 복종한다(13) | 35 : 13 |
| Give in | 굴복한다 | 포기한다(11) | 22 : 11 |
| Let it happen | 내버려둔다 | 가만히 있는다(11), 그냥 둔다(6) | 35 : 11 |
| Leave it | 놔둔다 | 내버려 둔다(18) | 21 : 18. 위 `내버려둔다`와 맞춰 `내버려둔다`로 통일해도 됨 |
| Defy | 거역한다 | 반항한다(13), 저항한다(9), 거부한다(7) | 13 : 13 : 9 : 7 (동수, `거역한다`로) |
| Do nothing | 아무것도 하지 않는다 | 가만히 있는다(6) | 32 : 6 |
| Sleep | 잔다 | 잠자기(14), 잠든다(8) | 명사형이 다수이나 규칙에 따라 `잔다`로 |
| Call for help | 도움을 요청한다 | 도움을 청한다(6) | 20 : 6 |
| Everything fades to black... | 모든 것이 어둠 속으로 사라진다... | 모든 것이 암전된다...(19), 모든 것이 어둠에 잠긴다...(15), 모든 것이 암흑 속으로 사라진다...(7), 눈앞이 캄캄해진다...(6), 그 외 6종 | 80 : 19 : 15 (총 141). 합니다체 `사라집니다...` 1곳은 오류 |

- 선택지에 동사 활용이 안 맞는 **명사형**(`~하기`)은 다수 표준이 아니다. 새로 만들 때는 쓰지 않는다.
- 같은 한국어를 서로 다른 영어에 쓰지 않는다. `저항한다`는 Resist에, `유혹한다`는 Seduce에만 둔다.
