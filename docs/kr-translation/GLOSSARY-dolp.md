# 용어집: DoL+ (Herm NPCs Mod) 신규 용어

기반 게임 0.5.13.8과 DoL+의 `git diff --name-status base dolp -- game`(추가 A 파일 약 50개, 변경 M 파일 약 470개)에서 DoL+가 새로 들여온 고유 명사와 반복 용어를 모았다. 기반 게임에 이미 있는 낱말은 `GLOSSARY-propernouns.md`, `GLOSSARY-world.md`, `GLOSSARY-system.md`, `GLOSSARY-body-combat.md`의 표기를 그대로 쓴다(표의 "비고"에 "재사용"이라고 적었다). 영어 열은 원문 표기 그대로다. 경로는 `dolp-src/game/` 기준이다.

표기 규칙: 의상·물건·변수 값은 데이터에 영어로 두고 화면에 찍을 때만 한국어로 바꾼다(`kr_dict.js`). 보석 장신구 이름은 규칙형이라 사전 항목 수백 개를 만들지 말고 정규식(캐럿 수, 보석, 종류)으로 조립한다(10절).

## 1. 인물

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Poppy | 포피 | ModLI/Poppy/* (전체) | 연애 대상(DoL+ 신규). `personNameDict`에 이미 "포피"가 있으므로 추가 항목 없음. 가이드 `characters/Poppy.md` |
| Riley | 라일리 | loc-mma-gym/*, base-system/named-npcs.twee | MMA 체육관 코치. `personNameDict`에 없음: `"Riley": "라일리"` 추가 제안. they/them으로 지칭된 줄이 있어 대명사 매크로 의존을 줄이고 이름으로 받는다. 대사는 거의 `/* */` 주석 안(체육관 레슨 본문)이라 활성화되기 전까지는 번역 불필요 |
| Islander Elder | 섬 주민 장로 | loc-island/waterdragon-events.twee | 이름 없는 인물. 가면을 쓴 섬 주민의 우두머리. 장문 설화 대사. 재사용: islander=섬 주민(GLOSSARY-world) |
| Bakunawa | 바쿠나와 | waterdragon-events.twee:Islander Elder Lore | 타락한 용의 이름(필리핀 신화 차용). 음역 그대로 |
| Auriga | 아우리가 | waterdragon-events.twee:Islander Elder Lore | 용을 타락시킨 존재("the deep scrolls call Auriga"). 음역. 마차부자리의 라틴어와 같은 철자 |
| Parusa | 파루사 | waterdragon-events.twee:Islander Elder Lore 2 | 섬의 옛 이름. "in their tongue and now in ours: punishment" → 뜻 풀이는 "벌" |
| the old ones | 옛 존재들 | waterdragon-events.twee | 섬에 살던 용들. 대문자 아님, 인용 속 강조(이탤릭) |
| Remy's goons | 레미의 부하들 | bike/widget.twee | 레미 재사용. 자전거 도난 문구("Some bumpkin must've stolen it." 쪽은 시골뜨기) |
| Bailey's goons / thugs | 베일리의 부하들 | bike/widget.twee | 재사용 |
| Frostberg | 프로스트버그 | bike/widget.twee, base-system/credits.twee, feats.js | 제작자(개발자) 닉네임. 버그 문구 "go bother Frostberg"에도 나옴. 음역 유지 |
| Frost | 프로스트 | feats.js:Irresistible | Frostberg의 애칭 |
| the poppet | 포피 | base-system/text.js 주석 | 주석이라 번역 안 함 |

그 밖에 이름이 붙은 인물은 없다. 기존 인물(Sirris, Whitney, Zephyr, Sydney, Jordan, Eden, Robin, Wren 등)의 새 장면은 해당 인물의 `characters/*.md`를 따른다. 새 인물 가이드가 필요한 인물은 12절을 본다.

## 2. 장소·가게·건물

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Poppy's flat | 포피의 집 | ModLI/Poppy/flats.twee | 바브 가의 아파트(Flats=아파트, 재사용). 문에 양귀비 꽃 손잡이 |
| The Flats / Flats | 아파트 | ModLI/Poppy/flats.twee | 재사용(kr13 `loc-flats`) |
| Barb Street | 바브 가 | Poppy/flats.twee | 재사용 |
| Poppy's bedroom / living room / kitchen / bathroom | 포피의 침실 / 거실 / 부엌 / 욕실 | flats.twee | |
| MMA Gym | MMA 체육관 | loc-mma-gym/main.twee | 나이팅게일 가. 짐/도장 대신 체육관(운동 시설). 이름 안의 MMA는 알파벳 유지 |
| Footwork / Striking / Kicking / Conditioning Lesson | 풋워크 / 타격 / 발차기 / 컨디셔닝 수업 | loc-mma-gym/*.twee | 링크 표시: "풋워크 수업을 받는다 (£12 1:00)". 아래 6절 스킬과 한 세트 |
| Bike Depot | 자전거 매장 | loc-shop/bikeDepot.twee | 쇼핑센터 안. 재사용: Shopping Centre=쇼핑센터 |
| Jewellery Store | 보석 가게 | loc-shop/jewellery.twee | 쇼핑센터 안. 복수 철자 jewellery(영국식) |
| Boutique | 부티크 | loc-boutique/main.twee | 다뉴브 가의 고급 보석 부티크. 위젯명은 luxury_jewelleryShop |
| HBSC Bank Branch | HBSC 은행 지점 | loc-hbsc-bank-branch/main.twee | 하이 가 시청 옆. 실존 은행명이 아니라 패러디. 알파벳 유지 |
| Priority desk | 우선 창구 | loc-hbsc-bank-branch/main.twee | 계좌 레벨 2 이상 |
| Waiting room | 대기실 | hbsc | |
| Water Dragon Island | 물의 용 섬 | loc-island/waterdragon-events.twee | 위젯·패시지 이름 "Water Dragon Island Travel". 아래 8절 |
| Elk Street | 엘크 가 | events-dismissal.twee | 재사용. 정리 이벤트의 창고가 있는 거리 |
| Underground (brothel) | 지하 창관 | events-dismissal.twee | 재사용: Brothel=창관. 배드 엔딩 "Underground Dungeon" 연결 |
| Ocean Breeze Cafe | 오션 브리즈 카페 | Poppy/events.twee | 재사용 |
| Soup Kitchen | 무료 급식소 | Poppy/events.twee | 재사용 |
| Hospital | 병원 | Poppy/events-pregnancy.twee | 재사용 |
| Nightingale Street / High Street / Danube Street | 나이팅게일 가 / 하이 가 / 다뉴브 가 | mma-gym, bank, boutique | 재사용 |
| Lake Shore / Lake | 호숫가 / 호수 | Poppy/events-lake.twee | 재사용 |
| Temple (main hall) | 신전 (본당) | Poppy/events.twee | 재사용 |
| minimap labels: Aboard Anchored Ship / Beside Anchored Ship / Back of the cave / Car Park / Cargo Containers / Central forest / Central moor / Deep forest / Deep moor / End of the forest / Endless deep / Far out / Feet in rushing water / Forest outskirts / Front Gate / Lorry Unloading Area / Mer Street / Moor outskirts / Near beach / Near shore / Near town / Office | 닻을 내린 배 위 / 닻을 내린 배 옆 / 동굴 안쪽 / 주차장 / 컨테이너 / 숲 중심부 / 황야 중심부 / 깊은 숲 / 깊은 황야 / 숲의 끝 / 끝없는 심해 / 먼 바다 / 급류 속 / 숲 외곽 / 정문 / 트럭 하역장 / 메르 가 / 황야 외곽 / 해변 근처 / 물가 / 마을 근처 / 사무실 | 00-framework-tools/DNA-things/minimap/minimap.twee | 지도 위젯의 위치 라벨. Mer Street=메르 가(재사용) |

## 3. 포피 관련 시스템 용어 (UI, 변수, 특성)

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Patience | 인내심 | base-system/text.js, overlays/social.twee, Poppy/widget.twee | 사회 화면 수치 라벨. 음수가 되면 Anger로 바뀜(같은 칸 이중 표시) |
| Anger | 분노 | 같은 파일들 | 재사용: Rage=분노. `Thug Anger`(자객 분노)와 라벨 겹침 주의 |
| Thug Anger | 불량배의 분노 | text.js(`gthuganger`) | 기반 0.5.13 기능("Town of Thugs"). 기반 번역의 표기로 통일: thug=불량배(GLOSSARY-world) |
| Lust | 욕정 | Poppy/*, overlays/social.twee | 재사용: Lust=욕정 |
| Love / Love interest | 사랑(호감도) / 연애 대상 | | 재사용: 연애 대상 |
| Mod-exclusive Love Interests | 모드 전용 연애 대상 | base-system/settings.twee | DoLP 설정 라벨 |
| Opium Addict | 아편 중독자 | base-system/overlays/traits.twee, effect.js | 특성. 본문 인용 `"Opium Addict"`도 같은 표기. 설명: "You're more vulnerable to aphrodisiacs and alcohol. Inhaling opium helps you sleep better and suppresses your insomnia." |
| Pavlov: Poppy | 파블로프: 포피 | traits.twee, effect.js | 특성 이름. 파블로프의 조건 반사에서 온 이름이라 "파블로프" 음역 |
| Opium Addiction | 아편 중독도 | overlays/statistics.twee | 통계 항목 |
| opium (poppyOpiumPulse) "You smell a powdery scent that makes you feel relieved/drowsy." | 가루 같은 향이 느껴지며 몸이 편안해진다 / 졸음이 몰려온다 | Poppy/widget.twee | 시스템 알림(합쇼체 아님, 서술 한다체). "powdery"는 "분 냄새 나는/가루 같은" |
| Poppy flowers / pot of poppies | 양귀비 / 양귀비 화분 | Poppy/flats.twee | 꽃 이름은 "양귀비". 이름 Poppy는 "포피" |
| fallen fox | 타락한 여우 | Poppy/flats.twee:Doze Ask 2 | "fallen angel"=타락 천사에서 유추. 대사 속 일회성 표현 |
| halo (shattered / dark halo) | 후광(깨진 / 어두운) | flats.twee, events-dismissal.twee | |
| (fox) ears / tail / wings | (여우) 귀 / 꼬리 / 날개 | Poppy/* | |
| vixen | 암여우 | events.twee:Temple Poppy Fallen Story Intro | 신전에서 포피가 이야기하던 인물 |
| pocket knife | 주머니칼 | speech-poppy.twee | |
| Frostburger pillow | 프로스트버거 쿠션 | flats.twee:Living Room | 소파 위 쿠션. Frostberg 농담 가능성(햄버거 브랜드 아님)으로 보임. 음역 유지, 의문 목록 참고 |
| familiar collar | 사역마 목줄 | speech-poppy.twee | 재사용: kr_dict `familiar collar`=사역마 목줄 |
| Whitney's collar / Whitney's collar with leash | 휘트니의 목줄 / 리드줄 달린 휘트니의 목줄 | base-clothing/clothing-neck.js, special-whitney/whitneycollar.twee | 신규 의상. 재사용: collar=목줄, collar with leash=리드줄 달린 목줄 |
| poppyromance / safe house ($poppySafeHouse) | (변수) / 포피의 집 출입 | flats.twee | 번역 대상 아님 |
| kicked out (poppyFlat.kickedUntilDay) | 쫓겨남 | flats.twee | 화면 노출 없음 |
| Valentine's date with Poppy | 포피와의 발렌타인 데이트 | events.twee | 저널 한 줄: "발렌타인 데이트가 저널에 추가되었다" 식 시스템 문구 |
| Poppy Comfort Talk | 포피와의 위로 대화 | events-special.twee | 패시지명(번역 안 함) |
| bad end "soldPoppy" | (변수) | events-dismissal.twee | 번역 안 함 |
| Frostburger | 프로스트버거 | flats.twee:87 | 위 항목 참고 |

## 4. 자전거

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| bike / bicycle | 자전거 | bike/main.twee, bike/widget.twee | 재사용: en13에도 8곳 bicycle. 대화체는 "자전거" |
| Get on your bike (0:01) / Get off your bike | 자전거에 올라탄다 (0:01) / 자전거에서 내린다 | bike/widget.twee | |
| Bike Ride / bike travel | 자전거 이동 | bike/main.twee | |
| durability | 내구도 | bike/widget.twee | |
| repair kit | 수리 키트 | bike/widget.twee, bikeDepot.twee | 최대 5개 소지 |
| make an emergency repair | 응급 수리를 한다 | bike/widget.twee | |
| tune-up | 정비 | bikeDepot.twee | |
| basic bike / intermediate bike / high-end bike | 기본형 / 중급형 / 고급형 자전거 | bikeDepot.twee | 가격 £500 / £1000 / £2500 |
| trade in | 보상 판매 | bikeDepot.twee | |
| security gear | 보안 장비 | bikeDepot.twee:Security Gear | |
| Standard Chain Lock / Heavy-Duty Chain Lock with Hardened Steel / U-Lock / U-Lock with Alarm / Wheel Lock | 일반 체인 자물쇠 / 강화강 중량 체인 자물쇠 / U형 자물쇠 / 경보기 달린 U형 자물쇠 / 바퀴 자물쇠 | bikeDepot.twee | |
| off-road upgrades | 오프로드 업그레이드 | bikeDepot.twee:Off-Road | |
| Suspension fork | 서스펜션 포크 | bikeDepot.twee | "-10% 이동 시간, -25% 내구도 손실(험지)" |
| Wider tyres with tread | 트레드가 있는 넓은 타이어 | bikeDepot.twee | tyres는 영국식 철자 |
| Tubeless Setup | 튜브리스 세팅 | bikeDepot.twee | |
| Hydraulic Disk Brakes | 유압 디스크 브레이크 | bikeDepot.twee | |
| Grippy pedals | 접지력 좋은 페달 | bikeDepot.twee | |
| Ergonomic grips and bar ends | 인체공학 그립과 바 엔드 | bikeDepot.twee | |
| Rough Terrain | 험지 | bikeDepot.twee, bike.js | |
| region: residential / commercial / industrial / forest / lake / moor | 주택가 / 상업 지구 / 공업 지구 / 숲 / 호수 / 황야 | bike/widget.twee | 이동 구간 구분 |
| Bike Settings | 자전거 설정 | base-system/settings.twee | |

## 5. 은행

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| HBSC | HBSC | loc-hbsc-bank-branch/* | 알파벳 유지 |
| teller | 은행 창구 직원 | main.twee | 이름 없는 인물, `<<person>>` |
| savings account | 저축 계좌 | main.twee | |
| Fixed-Term Deposit | 정기 예금 | main.twee, widget.twee | Put down a Fixed-Term Deposit → 정기 예금을 맡긴다 |
| AER | 연 실효 금리(AER) | main.twee | "Interest Rate: 2.50% AER" → "금리: 연 2.50% (AER)" |
| Deposit Limit / Interest Rate / Minimum Balance / Perks | 예치 한도 / 금리 / 최소 잔액 / 혜택 | main.twee | |
| account tiers: Basic / Silver / Gold / Platinum / Black | 베이직 / 실버 / 골드 / 플래티넘 / 블랙 | main.twee | |
| Priority Service | 우선 서비스 | main.twee | |
| Early Withdrawal Fee | 중도 인출 수수료 | main.twee | |
| Deposit Withdrawal Fee (%) / Deposit Max Weeks | 예금 인출 수수료 (%) / 예금 최대 기간(주) | settings.twee | DoLP 설정 라벨 |
| safety deposit box | 대여 금고 | main.twee:HBSC Bank Wait | |
| Stall Deposit / Stall Rental Deposit | 가판대 보증금 / 가판대 임대 보증금 | loc-market/main.twee | deposit=보증금(임대). 은행의 deposit=예금과 구분 |
| Book Rental Deposit | 도서 대여 보증금 | loc-school/library.twee | 같은 deposit |
| Bailey Deposit | 베일리 예치금 | special-robin/main.twee | 패시지명. 맥락 확인 필요 |

## 6. 전투·MMA 체육관·스킬

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Combat Extended (CE) | 확장 전투(CE) | base-system/settings.twee | DoLP 설정. "CE"는 약칭으로 유지 |
| Footwork | 풋워크 | overlays/characteristics.twee, mma-gym | 스킬 |
| Striking | 타격 | 같은 파일 | 스킬 |
| Kicking | 발차기 | 같은 파일 | 스킬 |
| Brawling | 난투 | 같은 파일 | 스킬(주먹질). 기반 게임의 "격투" 계열과 대조 필요 |
| Conditioning | 컨디셔닝 | loc-mma-gym | 체력 훈련. 수업 완료 시 물리/운동/의지 상승 |
| Standing Fight / Standing Fight Type: Normal / Hostile | 스탠딩 전투 / 스탠딩 전투 유형: 일반 / 적대 | settings.twee | |
| Player Guarding / Dodging / Attacking | 플레이어 방어 / 회피 / 공격 | settings.twee | 옵션 헤더 |
| Enemy Martial Arts / Enemy Skills / Enemy CE Actions | 적의 무술 / 적의 스킬 / 적의 CE 행동 | settings.twee | |
| Enemy Day Scaling / Enemy Defeats Scaling | 적 일수 스케일링 / 적 패배 스케일링 | settings.twee | |
| Difficulty presets: Very Easy / Easy / Normal / Hard / Very Hard / Impossible / Frostberg Casual / Frostberg Tryhard | 매우 쉬움 / 쉬움 / 보통 / 어려움 / 매우 어려움 / 불가능 / 프로스트버그 캐주얼 / 프로스트버그 열혈 | settings.twee | 기존 노말/이지/하드 모드와 이름 충돌 주의: 여기는 난이도 프리셋 |
| Encounter Reworks | 조우 개편 | settings.twee | |
| Grind Settings | 반복 작업 설정 | settings.twee | |
| NPC Multipliers / Beast Multipliers / Tentacle Multipliers / Struggle (Lurkers, bees, etc.) Multipliers / NNPC Multipliers | NPC 배율 / 짐승 배율 / 촉수 배율 / 발버둥(럴커, 벌 등) 배율 / 네임드 NPC 배율 | settings.twee | NNPC=네임드 NPC. 재사용: lurker=럴커 |
| Beast Gangbangs / Beast Multi-Orgasm / NPC Multi-Orgasm | 짐승 단체 / 짐승 다중 오르가슴 / NPC 다중 오르가슴 | settings.twee | |
| Base max orgasms | 기본 최대 오르가슴 수 | settings.twee | |
| NPCs Stealing Money Settings | NPC 금품 갈취 설정 | settings.twee | |
| Rebalancing Settings / Rebalance Settings | 재조정 설정 | settings.twee | |
| Vanilla Substance Rebalance | 기본 게임 약물 재조정 | settings.twee | "Vanilla"는 기반 게임을 뜻한다 |
| Dancing Rebalance | 춤 재조정 | settings.twee | |
| Core Characteristics / Stat Gain Multiplier / Beauty Gain | 핵심 능력치 / 능력치 상승 배율 / 매력 상승 | settings.twee | |
| Maths Trait buffs / History Trait buffs | 수학 특성 보너스 / 역사 특성 보너스 | settings.twee | |
| Animal TF Buffs and Nerfs | 동물 변이 버프·너프 | settings.twee | TF=변이(GLOSSARY-world: transformation 변신/변이 혼재, 이 문서는 변이) |
| Anime Main Character Traits | 애니 주인공 특성 | settings.twee | AMC. 아래 11절 |
| Realistic Clothing Transparency | 현실적인 의상 투명도 | settings.twee | |
| Meme Text expanded | 밈 문구 확장 | settings.twee | |
| Enemy Stats Display | 적 능력치 표시 | settings.twee | |

## 7. 농장 (알렉스의 농장)

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Tractor (compact tractor, 30 HP) | 트랙터(소형, 30마력) | loc-farm/upgrades.twee | 재사용: tractor=트랙터 |
| Tractor Plough / Seed Drill / Harvester / Loader | 트랙터 쟁기 / 파종기 / 수확기 / 로더 | upgrades.twee | 부착물 |
| Compost Bin | 퇴비통 | upgrades.twee, work.twee | green manure=녹비 → 퇴비 → fertiliser=비료 |
| Aphrodisiac extraction system (Extract) | 최음제 추출 장치 | upgrades.twee:Extract 1-2 | 럴커 대상. "No more waiting for Alex." |
| Net 1-4 (Polyester …) | 그물 1-4단계(폴리에스터 …) | upgrades.twee | 럴커 운반 한도 |
| Cooler 1-3 | 냉장고 1-3단계 | upgrades.twee | preservation rate=보존율 |
| Water Field 1-4 | 수경지 1-4단계 | upgrades.twee | "논"이 아니라 물을 대는 밭(water field)으로 읽힌다. 확인 필요 |
| Greenhouse Sprinklers / Hydroponics | 온실 스프링클러 / 수경 재배 | upgrades.twee | 고아원 뒤 온실 |
| Parasite Barn / Parasite Tank/Barn Capacity Multiplier | 기생충 헛간 / 기생충 탱크·헛간 수용량 배율 | upgrades.twee, settings.twee | 재사용: parasite=기생충 |
| Irrigation | 관개 시설 | upgrades.twee | |
| Nursery | 아이 방 | upgrades.twee | kr13 기존 번역을 따른다 |
| Express / Premium (upgrade tier) | 속성 / 프리미엄 | upgrades.twee | "Costs £1000. Express costs £3000. Premium costs £4500." → "비용 £1000. 속성은 £3000. 프리미엄은 £4500." |
| Farmers Centre Upgrades (Enquire about improving rates) | 공장 업그레이드(처리 비율 개선 문의) | loc-farmers-centre/main.twee | 기반 표기: Farmers Centre=공장(GLOSSARY-propernouns). 패시지명은 번역 안 함 |
| Produce Yield | 수확량 | settings.twee | |
| The Leading Farmlands / The Verdant Empire | 앞서가는 농지 / 푸른 제국 | feats.js | 12절 |
| Farm Still Player Extract | (패시지명) | loc-farm/main.twee | 번역 안 함 |
| Tower Spar / Guard Seduce | 망루 대련 / 경비 유혹 | loc-farm/fields.twee | 패시지명 |

## 8. 물의 용(Water Dragon) 이야기

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Water Dragon (transformation) | 수룡 | waterdragon-events.twee, overlays/traits.twee | 변이 이름. 특성 "Water Dragon: The sea calls to you…" |
| waterdragonbuild | (변수) | waterdragon-events.twee | |
| black pearl | 흑진주 | Beach Comb | 재사용: pearl=진주 |
| moonstone | 문스톤(월장석) | Beach Comb | 한국어 보석명은 "월장석", 문스톤 병기 |
| Beach Comb | 해변 뒤지기 | Beach Comb | 링크 표시: 해변을 뒤진다 |
| Swallow it / Pocket it | 삼킨다 / 챙긴다 | Beach Comb | |
| Dragon's Grace / Dragon Eyes / Aquatic Lungs | 용의 우아함 / 용의 눈 / 수중 폐 | traits.twee | 특성 |
| Whale / Dolphins / Sea Eye / Shoal / Current / Storm / Song / Black Moon / Blood Moon | 고래 / 돌고래 / 바다의 눈 / 어군 / 해류 / 폭풍 / 노래 / 검은 달 / 붉은 달 | waterdragon-events.twee | 항해 중 이벤트 이름. Blood Moon=붉은 달(재사용), Black Moon=검은 달 |
| crossing (the crossing) | 항해(횡단) | waterdragon-events.twee | "Begin the crossing" → "횡단을 시작한다" |
| masked islanders | 가면 쓴 섬 주민 | waterdragon-events.twee | |
| Spear / Spear Chamber | 창 / 창의 방 | waterdragon-events.twee | |
| Water Dragon Lab | 수룡 연구소 | events-special.twee:405 | 배드 엔딩 출처 문자열(기반 게임 0.5.13.8에는 없음). 확인 필요 |

## 9. 채집·음식·잡화

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| Fly Agaric | 광대버섯 | loc-forest/events.twee | |
| Lady Orchid | 레이디 오키드 | 같은 파일 | 식물. 자주색 난초과(레이디 오키드) |
| Red Helleborine | 붉은 헬레보린 | 같은 파일 | 난초과 |
| Hen of the Woods | 잎새버섯 | 같은 파일 | Grifola frondosa |
| Ghost Orchid (Epipogium aphyllum) | 유령난초 | 같은 파일 | |
| Spiked Rampion | 스파이크 램피언 | loc-moor/events.twee | |
| Cloudberry | 클라우드베리 | loc-moor/events.twee | |
| Scottish Bog Myrtle | 스코틀랜드 보그머틀 | loc-moor/events.twee | |
| Bog Orchid (Hammarbya paludosa) | 늪난초 | loc-moor/events.twee | |
| Marsh Saxifrage | 습지 범의귀 | loc-moor/events.twee | |
| four-leaf clover | 네잎클로버 | Forest Clover, Meadow Clover | |
| Honey Challah | 꿀 할라 | loc-cafe/main.twee | 할라 빵. 재사용: honey=꿀 |
| Honey (Cafe Honey Lick / Show / Ignore) | 꿀 | loc-cafe/main.twee | |
| Large Bear Plushie | 대형 곰 인형 | loc-home/main.twee, loc-farm/cottage.twee | |
| honey pouch / honey hair clip / carrot pin / bear backpack | 꿀 주머니 / 꿀 머리핀 / 당근 핀 / 곰 가방 | clothing-handheld.js, clothing-head.js | 의상 이름 |
| gold necklace / silver ring (lake finds) | 금목걸이 / 은반지 | loc-lake/underwater.twee | |
| Gold Ring (Moor Wear Gold Ring) | 금반지 | loc-moor/events.twee | |
| fuck machine | 섹스 머신 | loc-adultshop/kozmods/machine.twee, loc-home/kozmods/machine.twee | "Use your vaginal/anal fuck machine" → "질/항문용 섹스 머신을 사용한다". 기반 게임 `machine_*`(en13 1곳) 표기 확인 |
| Adult Shop Machine | 성인용품점 기계 | adultshop/kozmods/machine.twee | Sirris가 판매: "Oh, so you're interested into buying one of those puppies" |
| Bedroom Machine | 침실 기계 | home/kozmods/machine.twee | |
| Spa Whitening | 스파 미백 | loc-spa/main.twee | |
| Ears pierced | 귀 뚫기 | loc-shop/tattoo.twee | |
| Kitchen Steal / Housekeeping Take / Housekeeping Leave | 부엌 훔치기 / 챙긴다 / 떠난다 | loc-home, loc-school, loc-temple | 패시지명 포함 |
| Swimming Exam | 수영 시험 | loc-school/exam.twee | |
| Math Project Stim poppy | (패시지명) | loc-school/maths-project.twee | 번역 안 함 |

## 10. 보석·장신구 (규칙형 이름)

`clothing-rings.js`(10,600줄), `clothing-earrings.js`, `clothing-neck.js`, `clothing-hands.js`에 기계적으로 생성된 이름들이다. 사전에는 부품 단위로 넣고 `getClothesNameKr` 쪽에서 정규식으로 조립한다.

| English (패턴) | 한국어 | 비고 |
|---|---|---|
| `{N}ct {gem} ring` (0.1~20ct) | `{N}캐럿 {보석} 반지` | 예: 0.5ct ruby ring → 0.5캐럿 루비 반지 |
| `{N}ct {gem} bracelet` (2~20ct) | `{N}캐럿 {보석} 팔찌` | |
| `{gem} stud / drop / halo / cocktail earrings` | `{보석} 스터드 / 드롭 / 헤일로 / 칵테일 귀걸이` | 귀걸이 종류는 업계 용어 음역 |
| `{gem} pendant` (Classic solitaire / small solitaire / multistone) | `{보석} 펜던트`(클래식 솔리테어 / 작은 솔리테어 / 멀티스톤) | |
| `{gem} necklace` (fringe / rivière) | `{보석} 목걸이`(프린지 / 리비에르) | rivière는 프랑스어 음역 |
| `{gem} strand` (bib / full) | `{보석} 스트랜드`(비브 / 풀) | |
| `{gem} choker` (heart) | `하트 {보석} 초커` | 재사용: heart choker=하트 초커 |
| `metal / gold / silver earrings` (drop, flower, jewelled flower, round, oval, shiny, stud, graphic, snake, cross, upside-down cross, lilac) | `금속 / 금 / 은 귀걸이`(드롭, 꽃, 보석 꽃, 원형, 타원형, 반짝이는, 스터드, 그래픽, 뱀, 십자가, 거꾸로 십자가, 라일락) | |
| `metal / thin / thick / simple metal bracelet`, `tiny / small / medium / big faux jewel bracelet` | `금속 / 얇은 / 두꺼운 / 단순한 금속 팔찌`, `아주 작은 / 작은 / 중간 크기의 / 큰 모조 보석 팔찌` | |
| `antique gold amulet / necklace` | `고풍스러운 금 부적 / 목걸이` | 호수·황야에서 줍는 물건 |
| `metal chain`, `metal choker`, `harness`, `harness with leash` | `금속 사슬`, `금속 초커`, `하네스`, `리드줄 달린 하네스` | 재사용: harness=하네스, leash=리드줄 |
| `elf ears` | `엘프 귀` | 귀걸이 칸에 들어간 변장 소품 |
| gem: amethyst / aquamarine / black diamond / diamond / emerald / morganite / opal / ruby / sapphire / spinel / tanzanite / topaz / pearl / faux jewel | 자수정 / 아쿠아마린 / 블랙 다이아몬드 / 다이아몬드 / 에메랄드 / 모거나이트 / 오팔 / 루비 / 사파이어 / 스피넬 / 탄자나이트 / 토파즈 / 진주 / 모조 보석 | 재사용: 사파이어, 에메랄드, 아쿠아마린, 다이아몬드, 진주는 기반 게임에서 쓰이고 있음 |
| carat (ct) | 캐럿 | 숫자 바로 뒤에 붙여 쓴다(`0.5캐럿`) |
| jewellery / jewelled | 보석(장신구) / 보석 장식 | `jeweled butt plug`=보석 장식 애널 플러그(kr_dict) 재사용 |

## 11. 새 특성(traits) 이름과 설명

| English | 한국어 | 비고 |
|---|---|---|
| Sadism boost / Masochism boost | 가학 성향 강화 / 피학 성향 강화 | |
| Bunny <<girl>> / Bear <<girl>> | 바니걸 / 곰 소녀 | Bunny TF는 재사용: 바니걸. 매크로 `<<girl>>` 유지 |
| Prey Animal / Predatory Animal | 피식자 동물 / 포식자 동물 | |
| Strong Feet | 튼튼한 발 | |
| Aquatic Lungs | 수중 폐 | |
| Water Dragon | 수룡 | |
| Dragon's Grace | 용의 우아함 | |
| Dragon Eyes | 용의 눈 | |
| Spirit of the Wild | 야생의 정령 | |
| Felinous Mischief | 고양이의 장난기 | felinous=고양잇과의 |
| Nature's Nurturer | 자연의 양육자 | |
| Ursine Strength | 곰의 힘 | |
| Sky's Embrace | 하늘의 품 | |
| Vixen's Guile | 암여우의 교활함 | |
| Lapine Celerity | 토끼의 민첩함 | lapine=토끼의 |
| Glide | 활강 | |
| Opium Addict | 아편 중독자 | 3절 |
| Pavlov: Poppy | 파블로프: 포피 | 3절 |
| Tempered Beauty / Physique / Willpower / Skulduggery / Dancing / Swimming / Athletics / Tending / Housekeeping / Brawling | 단련된 미모 / 체격 / 의지력 / 속임수 / 춤 / 수영 / 체육 / 관리 / 가사 / 난투 | 스킬 한계를 넘은 단계. 재사용: Beauty=미모, Physique=체격, Willpower=의지력, Athletics=체육, Dancing=춤, Swimming=수영(GLOSSARY-system). 따라서 `단련된 미모 / 체격 / 의지력 / 체육 / 춤 / 수영` |

## 12. 새 업적(feats) 107개

문체는 기반 번역(`kr13/game/04-Variables/feats.js`)을 따른다. 설명은 목표형이면 "~하기."(예: "£1,000 보유하기."), 상태·서술형이면 합쇼체("~했습니다.", "~입니다.")다. 제목은 짧은 명사구. 명성 업적은 "명성"=fame(GLOSSARY-system §155).

| English | 한국어 제목 | 설명 한국어 |
|---|---|---|
| Decamillionaire | 천만장자 | £10,000,000 보유하기. |
| Hectomillionaire | 억만장자 | £100,000,000 보유하기. |
| Billionaire | 십억장자 | £1,000,000,000 보유하기. |
| The Leading Farmlands | 앞서가는 농지 | 농장 확장 14개를 최대로 업그레이드하기. |
| The Verdant Empire | 푸른 제국 | 농장 확장을 전부 건설하기. |
| Seven in a Row / Nine in a Row / Ten in a Row | 일곱 연승 / 아홉 연승 / 열 연승 | 블랙잭을 일곱 / 아홉 / 열 판 연속으로 이기기. |
| Powerful | 강력함 | 인간 체력의 정점에 도달했습니다. |
| Disciplined | 절제된 정신 | 당신의 정신은 단단합니다. |
| Peddler | 행상 | 작게 시작해 지역에 파세요. |
| Supplier | 공급업자 | 늘어나는 수요를 맞추세요. |
| Distributor | 유통업자 | 판로를 넓히세요. |
| Wholesaler | 도매상 | 도매 시장을 장악하세요. |
| Agronomist | 농학자 | 농사의 기술을 통달하세요. |
| Agricultural Tycoon | 농업 재벌 | 농업 제국을 지배하세요. |
| Brilliant Reputation / Radiant Reputation / Luminous Reputation | 빛나는 평판 / 눈부신 평판 / 찬란한 평판 | 올바른 방면으로만 유명해졌습니다. |
| Zephyr the captain | 선장 제퍼 | 승진 축하해, 친구. |
| Bailey the 'caretaker' | '보호자' 베일리 | 빚 청산 완료(농담입니다). |
| Fall with me | 나와 함께 타락해 | 포피에게 당신의 순결을 바쳤습니다. |
| Hungry Fox | 배고픈 여우 | 포피가 가장 좋아하는 음식을 선물했습니다. |
| Prey to the Slaughter | 도살장의 먹잇감 | 축하합니다, 당신은 형편없는 연인입니다! |
| Owned | 소유물 | 누군가의 소유가 되는 것도 나쁘지만은 않습니다. |
| Street King | 거리의 왕 | 전투 명성 2000 달성하기. |
| Community Pillar | 지역 사회의 기둥 | 선행 명성 2000 달성하기. |
| Entrepreneur | 기업가 | 사업 명성 2000 달성하기. |
| Social Luminary | 사교계의 명사 | 사교 명성 2000 달성하기. |
| Studio Star | 스튜디오 스타 | 모델 명성 2000 달성하기. |
| Town Bicycle | 마을 자전거 | 성 명성 2000 달성하기. (속어: 누구나 타는 것) |
| Streetwalker | 길거리 여자 | 매춘 명성 2000 달성하기. |
| Easy | 쉬운 사람 | 강간 명성 2000 달성하기. |
| Animal Lover | 동물 애호가 | 수간 명성 2000 달성하기. |
| Flaunter | 과시하는 사람 | 노출 명성 2000 달성하기. |
| Bearer | 품는 자 | 임신 명성 2000 달성하기. |
| Stud | 종마 | 임신시킨 명성 2000 달성하기. |
| Lost Legacy | 잃어버린 유산 | 멸종에서 돌아왔습니다. |
| Bnuuy Syndrome | 바누이 증후군 | 뇌 대신 바누이가 들어 있습니다. (밈) |
| Unadulterated Power | 순수한 힘 | 최상위 포식자입니다. |
| Silver Tongue / Smooth Talker / Master of Persuasion | 은빛 혀 / 말솜씨 좋은 사람 / 설득의 달인 | 팁 한 번으로 £1000 / £1500 / £2000 넘게 벌었습니다. |
| Aphrodite | 아프로디테 | 신들마저 당신의 아름다움에 얼굴을 붉힙니다. |
| Unstoppable Force | 멈출 수 없는 힘 | 당신의 몸이 가진 힘에 맞설 자가 없습니다. |
| Immovable Object | 움직일 수 없는 물체 | 아무도 다시는 당신의 정신을 조종하지 못할 겁니다. |
| Agent 47 | 에이전트 47 | 눈에 띄지 않게 숨어 있습니다. |
| Can't Touch This | 건드릴 수 없어 | 아무도 당신을 맞히지 못합니다. 당신의 반사 신경은 말 그대로 즉각적입니다. |
| Atlantean | 아틀란티스인 | 어떤 물고기보다도 더 물고기답습니다. (밈, 의역) |
| Ludicrous Speed | 터무니없는 속도 | 광속도 너무 느립니다! |
| Grass Toucher | 풀 만지는 사람 | 누구보다 풀을 잘 만집니다. |
| Demolisher of Filth | 오물 파괴자 | 전설의 하녀들조차 당신만큼 깨끗하게 유지하지 못합니다. |
| Menace to the Ecosystem | 생태계의 위협 | 여자는 나를 원하고 물고기는 나를 두려워한다. (밈, 영문도 소문자) |
| Smarter than Einstein | 아인슈타인보다 똑똑해 | "엄밀히 말해서" 기술을 터득했습니다. |
| Human Calculator | 인간 계산기 | (밈. 인종 농담이라 의역 또는 삭제 여부 의문 목록 참고) |
| Voice of All Things | 만물의 목소리 | 원피스는 실존한다!!! (밈) |
| Errm, ackshually | 어, 사실은 말이야 | 나와 다르게 생각하는 건 불법입니다. |
| Return to Monke | 원숭이로 돌아가라 | 인류의 정점에 도달했으니, 이제 원숭이로 돌아가 승천하세요. |
| Irresistible | 저항할 수 없는 사람 | 당신의 유혹에는 누구도 저항하지 못합니다. 프로스트조차도. |
| God of Lust | 욕정의 신 | 아무도, 정말 아무도 당신과 5초를 버티지 못합니다. 당신은 욕정의 신이 되었습니다. |
| Rivers of White | 하얀 강 | 당신이 내는 젖의 양으로 세상을 잠기게 할 겁니다. |
| Sticky Fountain | 끈적한 분수 | 뒤처리하는 사람이 정말 후한 보수를 받길 바랍니다. |
| Many Punch Man | 다중 펀치맨 | 둘? 넷? 여섯? 상관없으니 한꺼번에 덤벼 보세요. |
| Fleet-Footed | 날랜 발 | 빠른 발, 날카로운 머리. 발놀림이 흐트러지지 않습니다. |
| Knockout Artist | 녹아웃 아티스트 | 깔끔한 한 방이면 충분합니다. |
| Bladed Legs | 칼날 다리 | 칼보다 날카롭고 강철보다 단단한 발차기. |
| Urban Myth | 도시 괴담 | 전투 명성 4000 달성하기. |
| Guardian Angel | 수호천사 | 선행 명성 4000 달성하기. |
| Mogul | 거물 | 사업 명성 4000 달성하기. |
| The Unmissable | 놓칠 수 없는 사람 | 사교 명성 4000 달성하기. |
| Face of the Spotlight | 스포트라이트의 얼굴 | 모델 명성 4000 달성하기. |
| Public Transit | 대중교통 | 성 명성 4000 달성하기. (속어) |
| Lady of the Night | 밤의 여인 | 매춘 명성 4000 달성하기. |
| Public Fucktoy | 공공 육변기 | 강간 명성 4000 달성하기. (재사용: fucktoy=육변기) |
| Absolute Deviant | 완전한 일탈자 | 수간 명성 4000 달성하기. (재사용: Deviant=일탈자) |
| Attention Addict | 관심 중독자 | 노출 명성 4000 달성하기. |
| Eve | 이브 | 임신 명성 4000 달성하기. |
| Progenitor | 시조 | 임신시킨 명성 4000 달성하기. |
| Starting Point | 출발점 | 기본 게임 최상위 1대1 전투를 이겼지만, 그게 전부입니다. |
| One Step | 한 걸음 | 기본 게임 최상위 다수 전투를 이겼습니다. 나쁘지 않습니다. |
| One Leap | 한 번의 도약 | 꽤 대단합니다. |
| Five Thousand / Ten Thousand / Twenty Thousand / Fifty Thousand / One Hundred Thousand / Two Hundred Thousand / Five Hundred Thousand / One Million | 오천 / 만 / 이만 / 오만 / 십만 / 이십만 / 오십만 / 백만 | 설명은 제목과 같은 숫자에 느낌표(예: "오천!"). 무엇을 센 숫자인지 `feats.js` 해당 정의 확인 |
| Hitless | 무피격 | 상대는 생채기 하나 내지 못했습니다. |
| Brawler | 난투꾼 | 숫자는 중요하지 않습니다. 마치 육감이 있는 것 같습니다. |
| Balanced | 균형 | 무슨 일이 있어도 두 발로 서 있습니다. 땅이 당신이 넘어지는 걸 두려워하는 것 같습니다. |
| Heavy Hands | 무거운 주먹 | 당신의 주먹은 쇠망치 같은 힘으로 꽂힙니다. |
| Steel Legs | 강철 다리 | 온몸을 실어 걷어차며, 티가 납니다. |
| Ghost Buster | 유령 사냥꾼 | 상아의 원혼 쓰러뜨리기. (재사용: Ivory Wraith=상아의 원혼) |
| Demon of Purity | 순결의 악마 | 순결을 지킨 채 음란의 심연으로 떨어졌습니다. |
| Fabled Cap | 전설의 갓 | 광대버섯을 찾아 무사히 땄습니다. |
| Noble Harvest | 고귀한 수확 | 레이디 오키드를 찾아 무사히 땄습니다. |
| Crimson Veil | 진홍의 베일 | 붉은 헬레보린을 찾아 무사히 땄습니다. |
| Whispering Fungi | 속삭이는 균류 | 잎새버섯을 찾아 무사히 땄습니다. |
| Phantom Bloom | 유령의 꽃 | 유령난초를 찾아 무사히 땄습니다. |
| Thorned Crown | 가시 왕관 | 스파이크 램피언을 찾아 무사히 땄습니다. |
| Amber Harvest | 호박빛 수확 | 클라우드베리를 찾아 무사히 땄습니다. |
| Scent of the Highlands | 고원의 향기 | 스코틀랜드 보그머틀을 찾아 무사히 땄습니다. |
| Bog Whisperer | 늪의 속삭임 | 늪난초를 찾아 무사히 땄습니다. |
| Marshlight | 늪의 불빛 | 습지 범의귀를 찾아 무사히 땄습니다. |
| Stroke of Luck | 행운의 순간 | 네잎클로버를 찾았습니다. |

## 13. 설정·UI 라벨 (DoLP 설정 탭 등)

| English | 한국어 | 등장 파일 | 비고 |
|---|---|---|---|
| DoLP Settings | DoLP 설정 | base-system/settings.twee | 탭 이름. 합쇼체 안내문이 따라온다 |
| Degrees of Lewdity Plus | 디그리즈 오브 루드니티 플러스 | base-system/credits.twee | 기반 게임 제목 표기(GLOSSARY-propernouns)와 맞춘다 |
| Lead Developer / Super Contributor / Contributor | 총괄 개발자 / 핵심 기여자 / 기여자 | credits.twee | 사람 이름은 음역하지 않고 영어 그대로 |
| Activated in this save | 이 저장 파일에서 활성화됨 | settings.twee | |
| Banner Toggle: No / Default / Alien / Blood / Bronze / Silver / Golden Banner | 배너 전환: 없음 / 기본 / 외계 / 핏빛 / 청동 / 은 / 금 배너 | settings.twee | |
| Miniature / Tall / Large / Giant | 소형 / 장신 / 대형 / 거대 | settings.twee | 체격(Body Size) 옵션. 기존 체격 표기와 대조 |
| Breast size: Pert / Modest / Full / Large / Ample / Massive / Huge / Gigantic / Enormous | 가슴 크기: 봉긋한 / 탱탱한 / 풍만한 / 큰 / 커다란 / 큼지막한 / 거대한 / 엄청난 / 어마어마한 | settings.twee | 기반 `getBreastSizeKr` 그대로 재사용 |
| Ass size: Cushioned / Soft / Round / Plump / Large / Huge | 엉덩이 크기: 푹신한 / 부드러운 / 둥근 / 통통한 / 큰 / 거대한 | settings.twee | 기반 bottomsize 표기 재사용 |
| Penis size: Micro / Mini / Normal / Large / Enormous | 자지 크기: 초소형 / 매우 작은 / 보통 / 큰 / 엄청난 | settings.twee | 기반 penissize 표기 재사용(micro 초소형, mini 매우 작은, large 큰, enormous 엄청난) |
| Demeanour | 태도 | settings.twee | 얼굴 변형 선택(영국식 철자) |
| Natural eye colour / hair colour / Hair length: Chest / Navel / Thighs / Feet | 타고난 눈 색 / 머리 색 / 머리 길이: 가슴 / 배꼽 / 허벅지 / 발 | settings.twee | 머리 색: crimson 진홍 / wine 와인 / ebony 칠흑 / jet black 흑옥색 / burnt orange 구운 주황 / blood orange 핏빛 주황 / strawberry blond 딸기빛 금발 / platinum blond 백금발 / frost blue 서리 파랑 / neon blue 네온 파랑 / toxic green 독초록 / rose gold 로즈 골드 / hot pink 핫핑크 등 |
| Sensitive / Very sensitive / Hyper sensitive | 민감한 / 매우 민감한 / 극도로 민감한 | settings.twee | 기반 sensitive=민감한, tender=여린, receptive=잘 느끼는과 다른 단계이므로 신규 라벨. 확인 필요 |
| Percentage of women that have only a vagina / both / only a penis (men: only a penis / both / only a vagina) | 보지만 가진 여성의 비율 / 둘 다 가진 여성의 비율 / 자지만 가진 여성의 비율 (남성: …) | settings.twee | 재사용: pussy=보지, penis=자지 |
| NPC Breast Generation / NPC Penis Generation / NPC Description Generation / NPC Flavor Generation Settings | NPC 가슴 생성 / NPC 자지 생성 / NPC 묘사 생성 / NPC 분위기 생성 설정 | settings.twee | |
| Wardrobe Capacity Multiplier | 옷장 수용량 배율 | settings.twee | |
| Toggle All / Toggle Day Scaling / Toggle Defeat Scaling / Toggle All Characteristics / Fluids / Skills / Sex Skills / Negative Fames / Positive Fames | 모두 전환 / 일수 스케일링 전환 / 패배 스케일링 전환 / 모든 능력치 전환 / 체액 / 스킬 / 성 스킬 / 부정적 명성 / 긍정적 명성 | settings.twee | |
| Top of Page | 맨 위로 | settings.twee | |
| Modded Waiting Room / Vanilla Waiting Room | 모드 대기실 / 기본 대기실 | 00-framework-tools/02-version/waiting-room.twee | 패시지명. 기본 게임 쪽 문구가 번역되었다면 맞춘다 |
| GE Cheat (reclaimWhitney / reclaimKylar / godClothe) | (치트 위젯) | GrimaceMods/GECheat.twee | 화면 노출 없음 |
| Cheat: Poppy Patience / Anger | 치트: 포피의 인내심 / 분노 | Poppy/widget.twee:poppyTemper | 치트 화면은 합쇼체: "포피의 인내심을 0% 아래로 내리면 분노로 바뀝니다." (원문: Setting Poppy's patience below 0% will switch it to anger.) |
| Raising it back to 0% switches to patience. | 0%로 다시 올리면 인내심으로 돌아옵니다. | widget.twee:poppyTemper | |

## 14. 포피 장면의 표현형 용어

| English | 한국어 | 비고 |
|---|---|---|
| my jewel / my precious jewel | 내 보석 / 소중한 내 보석 | 포피의 대표 애칭(대사 전반) |
| darling | 자기야 | |
| love / my love | 내 사랑 | |
| honey | 자기야 | 능글맞은 반격 |
| sweet thing / pretty thing | 귀염둥이 / 예쁜이 | `poppyChooseEndearment` |
| Good <<girl>> | 착하네 | 성별 매크로를 피한다 |
| kiddos | 얘들아 | 고아원 아이들 |
| fallen fox | 타락한 여우 | 3절 |
| clear your vision / See what you're meant to see, what you want to see | 눈을 맑게 떠 봐 / 네가 봐야 할 것, 보고 싶은 것을 봐 | 파랑/남색 강조(span blue/navy). 변이 공개 장면의 주문 |
| Take it further | 더 나아간다 | 링크 표시. 재사용: take it further |
| Plead / Knock / Leave something behind | 애원한다 / 문을 두드린다 / 뭔가를 놓고 간다 | 잠긴 문 앞 선택지 |
| Pick the lock | 자물쇠를 딴다 | 재사용 |
| Approach Poppy | 포피에게 다가간다 | 링크 |
| Rest on the couch (0:15) | 소파에서 쉰다 (0:15) | |
| Help Poppy make breakfast / dinner (0:20) | 포피가 아침 / 저녁 식사를 준비하는 것을 돕는다 (0:20) | |
| Eat breakfast / dinner (0:20) | 아침 / 저녁을 먹는다 (0:20) | |
| Tell Poppy all of it / the short version / Ask why he never came looking | 포피에게 전부 털어놓는다 / 간단히 말한다 / 왜 찾으러 오지 않았느냐고 묻는다 | `<<he>>`는 대명사 매크로이므로 "그/그녀" 대신 이름이나 생략 |

## 15. 다른 이름 붙은 NPC와 가이드 필요 여부

| NPC | 대사량 | 가이드 필요 여부 |
|---|---|---|
| Poppy | 압도적으로 많음(수천 줄) | 작성함: `characters/Poppy.md` |
| Riley (MMA 코치) | 레슨 본문 대사가 138개 이상이나 거의 `/* */` 주석 안 | 활성화되지 않은 동안 불필요. 주석이 풀릴 때를 대비해 거친 반말 + 짧은 문장으로 번역하라고 메모해 둔다 |
| Islander Elder (이름 없음) | 장로의 설화 대사 약 50줄(`waterdragon-events.twee:680-830`) | 한 장면 한정이라 별도 가이드는 불필요. PC에게는 정중하고 차분한 해요체("앉으세요", "미안합니다" 식 격식 있는 존대), 가면 쓴 주민들에게는 짧은 명령("나가 있게" 아닌 "자리를 비워라" 해체). 설화 부분은 한다체 서술 느낌의 담담한 어조 |
| Bank teller (이름 없음) | 짧은 창구 대사 | `_GENERIC.md`의 직무 말투(해요체)로 충분 |
| Sirris (기계 판매) | 이 파일 대사 약 10줄 | 기존 `Sirris.md` 사용 |
| Whitney / Zephyr / Robin / Sydney / Eden 신규 장면 | 각각 수십~수백 줄 | 기존 가이드 사용. Whitney의 `Public Sex`, `Collar Replace` 장면은 기존 말투(거친 반말 + 애정)를 따른다 |

## 16. 의문 목록 (사람이 정해야 할 것)

1. 포피의 화계: 학생을 가르치는 교사이자 연애 대상이다. 이 가이드는 모든 상대에게 반말로 두었으나, 연애 전 단계에서 해요체로 시작해 연애 후 반말로 바꾸는 선택도 가능하다. 원문이 단계별로 어투를 구분하지 않아 반말 일관안을 채택했다.
2. "my jewel"의 번역: "내 보석"(직역, 일관) vs "내 보물"(자연스러움). 보석 가게·장신구 장면과 어울리는 "내 보석"을 제안했다. 확정 필요.
3. Frostburger pillow: 소파 위 "Frostburger pillow"가 개발자 농담인지 가게 브랜드인지 불명. 일단 음역.
4. Riley: 코치의 성별이 대사에서 they로 처리되었다. `personNameDict`에 "라일리" 추가 여부 확정 필요.
5. HBSC: 실존 은행 패러디라 알파벳을 유지했다. "HBSC 은행"으로 풀지, 영문 그대로 둘지 확정 필요.
6. deposit 번역 충돌: 은행의 deposit(예금/예치)과 임대 deposit(보증금)을 구분했다.
7. Water Dragon: 변이 이름을 "수룡"으로 제안했다. "물의 용"이 더 길지만 풀어쓴 쪽이라 기존 변이 표기(늑대, 고양이, 여우 등 한 글자 명사)와는 "수룡"이 더 어울린다. 단 "용"이 이미 쓰인 곳이 있는지 확인 필요(`en13`에 "Dragon" 단독 용례 없음).
8. 보석 이름 철자: 자수정/아메시스트, 모거나이트/모가나이트, 탄자나이트/탄자나이트. 기반 게임에서 쓰인 다이아몬드, 사파이어, 에메랄드, 아쿠아마린, 루비는 그대로, 나머지는 한국 보석 업계 표기를 제안했다.
9. 밈 업적(Bnuuy Syndrome, Human Calculator, Voice of All Things 등): 원문이 영어 밈·인종 농담이라 직역하면 불쾌할 수 있다. 번역하되 "Human Calculator"의 마지막 문장은 의역 또는 삭제 여부 결정 필요.
10. "Town Bicycle", "Public Transit", "Easy", "Public Fucktoy" 등 성 명성 업적의 속어 번역 수위: 원문 수위를 그대로 따른다는 STYLE.md 8항에 따라 직역했다.
11. 업적 설명 문체: 기반 업적 설명이 한다체인지 명사구인지 `feats.js` 대조 필요(여기서는 한다체).
12. 설정 화면 문체: DoLP 설정 탭은 기반 설정 화면과 같은 합쇼체. 단, 라벨(체크박스 이름)은 명사구.
13. "Thug Anger"는 기반 0.5.13 기능이다. 기반 번역의 표기와 맞출 것.
14. 포피 정리 이벤트의 욕설 수위: 원문이 매우 거칠다(cocksleeve 등). `GLOSSARY-body-combat.md`의 가장 직접적인 표현으로 번역하되 "자지" 낱말은 "좆구멍"처럼 원문 수위를 넘지 않게 정해야 한다. 확정 필요.
15. `Minimap` 라벨의 "Mer Street": GLOSSARY-propernouns.md에서 표기 확인 후 맞출 것.

## 17. 결정 (16절의 열린 질문)

- 포피의 화계: 모든 단계에서 PC에게 반말. 처음 만날 때도 원문에 격식이 없고, 기반 게임의 교사(시리스, 윈터)도 학생에게 반말이다.
- my jewel → "내 보석"(precious jewel → "소중한 내 보석").
- HBSC → "HBSC 은행"(지문과 링크에서 처음 나올 때), 이후 "은행".
- Water Dragon → "수룡". 변신 이름, 섬 이름, 아이 종족 모두 같은 말을 쓴다(Water Dragon Island → 수룡 섬).
- Deposit: 은행은 "예금", 대여·임대는 "보증금"으로 나눈다(제안대로).
- Frostburger pillow: 개발자 장난이므로 "프로스트버거 베개"로 음역.
- 보석 이름: 자수정, 모거나이트, 탄자나이트, 스피넬 그대로 쓴다.
- 밈 위업(feat): 원문 수위를 넘기지 않고 옮기되, 인종을 비하하는 뉘앙스는 덧붙이지 않는다. 뜻이 통하지 않는 말장난은 풀어 쓴다.
- 정리 이벤트의 욕설: GLOSSARY-body-combat.md 표준(새끼, 걸레, 씨발)을 따른다.
- 민감도 단계와 Brawling: 기반 게임 용어가 있으면 그것을 쓰고, 없으면 이 표의 제안(난투 등)을 쓴다.

## 18. 번역하며 정한 표기 (2026-11-17, 1차 번역)

| 영어 | 한국어 | 비고 |
| --- | --- | --- |
| Tribal tattoos | 부족 문양 문신 | |
| Whitening salon | 미백 살롱 | |
| Jewellery Boutique / Store | 보석 부티크 / 보석상 | |
| HBSC Bank Branch | HBSC 은행 지점 | |
| MMA Gym | MMA 체육관 | MMA는 로마자 유지 |
| Lockpick Training Set (Basic/Intermediate/Advanced/Master/Lockpick Lawyer) | 자물쇠 따기 연습 세트 (기본/중급/고급/마스터/락픽 로이어) | |
| spools (수선 실) | 실패 | |
| Stability (전투 균형) | 균형 | |
| reverse rape | 역강간 | |
| feint / haymaker / hook punch | 페인트 동작 / 대포알 같은 주먹 / 훅 펀치 | |
| cocksleeve / cumdump | 육변기 / 정액받이 | 기존 번역과 같음 |
| kit / vixen (여우) | 새끼 여우 / 암여우 | |
| Okami / Kitsune / Seraphim / Cherub | 오카미 / 키츠네 / 세라핌 / 케루브 | |
| Bunny / Bear girl | 바니<<girl>> / 곰<<girl>>, 무리는 바니걸과 바니보이들 | |
| Poppy endearments (darling, love, sweet thing, my jewel, pretty thing) | 자기야, 내 사랑, 귀염둥이, 내 보석, 예쁜이 | `_poppyTerm` 값 |
| Some Orphan (기본 칭호) | 평범한 고아 | nicknames.twee와 fame.twee 비교문을 함께 바꿈 |
| Moor Castle / Forest Outskirts / Farmlands | 황야의 성 / 숲 외곽 / 농지 | |
| Amazoom | 아마줌 | |
| crimson hound / silver fox / high elk (NPC 칭호) | 진홍빛 사냥개 / 은여우 / 고귀한 엘크 | getNpcTitleKr |
