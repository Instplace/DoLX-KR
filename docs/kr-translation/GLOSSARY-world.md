# 용어집: 세계의 일반 명사

고유 명사(인물·장소·가게·조직의 이름)는 `GLOSSARY-propernouns.md`가 맡는다. 이 문서는 일반 명사를 다룬다: 직업·역할 호칭, 생물, 물건(의상 제외), 가구·장소의 일반 명칭, 화폐·단위, 날씨, 게임 고유의 낱말.

## 쓰는 법과 근거

- 표준은 KR-old(0.5.12.13 한국어판)에서 같은 영어가 가장 많이 옮겨진 쪽이다. 빈도는 EN-old와 KR-old의 같은 줄을 짝지은 번역 기억(`tm.pkl`)에서 센 "그 영어 낱말이 든 줄 수"다. 한 줄에 둘 이상 나오면 각각 센다. 숫자 앞에 "전체"가 붙은 것은 KR-old 본문 전체의 한글 낱말 출현 수다.
- 다른 표기 열은 표준이 아닌 쪽과 그 줄 수다. 표기 차이가 문맥(사람 호칭 대 직함 표기, 물건 대 장소)에서 오면 비고에 적었다.
- 화면 번역 사전(`kr_dict.js`의 `getNpcRoleKr`, `getNpcTitleKr`, `getCreatureTypeKr`, `getBeastTypeKr`)의 표기가 본문의 다수 표기와 다른 곳은 "통일이 필요한 용어"에 모았다.

## 1. 직업·역할 호칭

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| teacher | 선생님 (146) | 교사 (52) | 호칭과 서술은 선생님. "수학 교사" 같은 직함 표기는 사전이 교사 |
| headteacher | 교장 (45) | 교장 선생님 (전체 57) | 서술은 교장, 부를 때는 교장 선생님 |
| nurse / school nurse | 간호사 (98) | 양호교사 (38) | 통일 필요 |
| doctor | 의사 (340) | 박사 (40) | Dr. 하퍼는 아래 통일 목록 |
| (police) officer | 경찰관 (184) | 경찰 (73) | 집단은 경찰, 개인은 경찰관 |
| guard / guardsman | 경비원 (263) | 경비 (45) | 간수는 박물관 그림 속 인물 전용(전체 120) |
| inmate / prisoner | 죄수 (135 / 100) | 수감자 (8 / 6) | 사전의 inmate 수감자와 어긋남 |
| bishop | 주교 (121) | 주교님 | 호칭은 님 |
| priest | 사제 (40) | 신부 (1) | |
| confessor | 고해 사제 (45) | 고해사제 (전체 22) | 띄어 쓴다 |
| cultist | 신도 (전체 606) | 광신도 (전체 2) | 사전 role이 광신도 |
| initiate | 수련생 (79) | 입문자 (65), 수련자 (37) | 통일 필요 |
| volunteer | 자원봉사자 (65) | 수련생 (14) | 신전 문맥은 수련생과 겹침 |
| student / pupil | 학생 (1049) | - | pupil은 눈 동공일 때 동공 |
| classmate | 반 친구 (67) | 반 (83) | |
| manager | 매니저 (32) | 관리자 (16) | 통일 필요 |
| janitor | 관리인 (19) | 청소부 (4) | 사전 role은 청소부 |
| bouncer | 문지기 (10) | 경비원 (5) | 클럽 |
| waiter / waitress | 종업원 (7 / 6) | 웨이터 / 웨이트리스 (4 / 3) | 남녀 구분 없이 종업원 |
| chef | 요리사 (24) | 셰프 (17), 주방장 (8) | 통일 필요 |
| customer / patron | 손님 (190 / 71) | 고객 (18) | client는 고객 (38), 손님 (13) |
| shopkeeper | 상점 주인 (3) | 가게 주인 (2), 주인 (6) | |
| owner | 주인 (198) | - | 술집 주인, 클럽 주인, 창관 주인 |
| master / owner(of slave) | 주인 (71) | 주인님 (18) | 호칭은 님 |
| servant | 하인 (87) | - | 에이버리 저택 |
| farmer | 농부 (52) | 농장주 (3) | 사전 title이 농장주 |
| farmhand | 농장 인부 (249) | 농장 일꾼 (41), 일꾼 (50) | 사전 title이 농장 일꾼 |
| thug | 불량배 (55) | 깡패 (28), 폭력배 (17), 부하 (30) | 통일 필요 |
| bully | 불량배 | - | thug와 같은 낱말을 쓴다 |
| gang | 패거리 (28) | 무리 (27), 갱단 (12) | 학교 패거리는 패거리 |
| pirate | 해적 (25) | - | 해적선 (26) |
| captain | 선장 (61) | 대장 (5) | 사전은 대장 |
| islander | 섬 주민 (42) | 주민 (62) | |
| photographer | 사진작가 (27) | 사진사 (27) | 같은 수. 사전이 사진작가 |
| smuggler | 밀수꾼 (13) | 밀수업자 (10) | 사전이 밀수꾼 |
| rapist | 강간범 (20) | 강간마 (4) | |
| mayor | 시장 (83) | 시장님 (13) | |
| lifeguard | 구조대원 (5) | 안전 요원 (3) | |
| dancer | 댄서 (17) | 무용수 (4) | |
| artist | 예술가 (13) | 아티스트 (7) | |
| man / woman | 남자 / 여자 | - | boy/girl은 소년/소녀, 학생 문맥은 남학생/여학생 |
| baby | 아기 (123) | 아이 (16) | |
| teenager | 십 대 (7) | 십대 (3) | 띄어 쓴다 |
| parent | 부모 (52) | 부모님 (43) | 당사자 시점은 부모님 |
| (변이 없는 나머지) | police=경찰 (전체 643); priestess=여사제 (6); monk=수도사 (35); nun=수녀 (27); orphan=고아 (343); librarian=사서 (14); receptionist=접수원 (39); bartender=바텐더 (27); maid=메이드 (13); hunter=사냥꾼 (전체 51); sailor=선원 (58); criminal=범죄자 (35); pervert=변태 (160); predator=포식자 (20); beggar=거지 (30); stranger=낯선 사람 (34); tourist=관광객 (10); neighbour=이웃 (11); scientist=과학자 (4); employee=직원 (28); firefighter / paramedic=소방관 / 구급대원; model=모델 (37); whore / prostitute=창녀 (141); child / children=아이 / 아이들; twin=쌍둥이 | - | 표기가 하나로 일관 |

## 2. 생물과 괴물

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| creature | 생물 (277) | 괴물 (51), 존재 (5) | |
| beast | 짐승 (212) | 야수 (32) | 야수는 늑대 무리 같은 문장체 |
| monster | 괴물 (86) | 수인 (21), 몬스터 (10) | monster people은 수인, 설정창은 몬스터 |
| wraith | 원혼 (12) | 악령 (3) | |
| cowgirl / bullboy | 카우걸 (25) / 불보이 (20) | 젖소소녀, 황소 소년 (3) | 사전은 젖소소녀·황소소년 |
| wolf | 늑대 (546) | - | black wolf는 검은 늑대, wolf people은 늑대인간 (9) |
| dog | 개 (284) | - | puppy는 강아지, pup은 새끼 (155) |
| horse | 말 (134) | 목마 (32) | 목마는 흔들 목마 |
| cow / bull | 소 / 황소 (22) | 암소 (17) | cow는 문맥에 따라 소와 암소 |
| chicken | 닭 | 치킨 (13) | 요리는 닭고기 |
| hawk | 매 (188) | 새 (11) | great hawk는 거대 매 |
| bird | 새 (185) | 하피 (2) | 사전의 bird는 하피 |
| fish | 물고기 (153) | 생선 (35) | 요리와 식재료는 생선 |
| slug | 민달팽이 (63) | 달팽이 | |
| eel | 장어 (13) | 뱀장어 (4) | |
| worm | 벌레 (21) | 지렁이 (7), 웜 (2) | 미끼는 지렁이 |
| tendril | 촉수 (90) | 덩굴손 (29) | 사전은 덩굴손 |
| pack / herd / flock | 무리 (330 / 51) / 무리 / 신도들 | - | flock이 신자일 때 신도 |
| egg | 알 (98) | 달걀 (7) | 닭의 알은 달걀 |
| mother / father | 어머니 / 아버지 | 어미, 아비 | 짐승 쪽은 어미·아비 |
| (변이 없는 나머지) | abomination=흉물 (11); ghost=유령 (14); demon / angel / fallen angel=악마 / 천사 / 타락 천사; harpy=하피 (15); centaur=켄타우로스 (65); cat=고양이 (99); pig / boar=돼지 (83) / 멧돼지 (19); cattle / livestock=가축 (37 / 9); seagull=갈매기 (24); swan=백조 (13); fox / deer / rabbit=여우 / 사슴 / 토끼; bear / lizard / dolphin / whale=곰 / 도마뱀 / 돌고래 / 고래; frog / bee / wasp=개구리 / 벌 / 말벌; spider / web=거미 / 거미줄 (28); snake=뱀 (129); maggot / squid / oyster=구더기 / 오징어 / 굴; urchin / jellyfish / shark=성게 / 해파리 / 상어; tentacle=촉수 (482); vine / root / shoot=덩굴 (223) / 뿌리 / 새순; slime=슬라임 (580); lurker=럴커 (219); parasite=기생충 (231); nest / den / kennel=둥지 (261) / 굴 / 개집 (65) | - | 표기가 하나로 일관 |

## 3. 게임 고유의 낱말

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| lewd fluid | 음란한 체액 (65) | 음란한 액체 (29) | 통일 필요 |
| cum (명사) | 정액 (579) | - | 동사는 사정한다 (198) |
| nectar | 넥타르 (183) | 꿀 (12) | |
| goo | 끈적한 액체 (9) | 점액 (5), 끈적한 (17) | 사전 getFluidKr는 점액 |
| juice (애액) | 애액 (98) | 즙 (30), 주스 (12) | 음료는 주스 |
| pregnancy | 임신 (158) | - | pregnancy test는 임신 테스트기 (20) |
| pill(s) | 알약 (98) | 약 (127) | 알약이 정확한 낱말일 때 알약 |
| transformation | 변신 (26) | 변이 (10) | |
| chastity belt | 정조대 (전체 344) | - | cage는 정조 케이지 (10), 케이지 (27) |
| lube | 윤활제 (23) | 윤활유 (7) | |
| sex toy | 섹스 토이 (46) | 토이 (46) | toy 자체는 장난감 |
| blindfold | 안대 (78) | 눈가리개 (30) | |
| rope | 밧줄 (245) | 줄 (263) | |
| chain | 사슬 (155) | 쇠사슬 (15) | |
| shackle | 족쇄 (65) | 수갑 (2) | |
| manacle | 족쇄 (29) | 수갑 (10) | |
| collar | 목줄 (216) | 목걸이 (296) | 아래 통일 목록 |
| leash / lead | 목줄 (388) | 가죽끈 (72), 리드줄 (13) | |
| baton | 곤봉 (69) | 경찰봉 (4) | nightstick은 경찰봉 |
| cage | 우리 (273) | 케이지 (27) | 정조 케이지만 케이지 |
| bondage | 결박 (전체 357) | 구속구 (전체 60) | 도구는 구속구 |
| (변이 없는 나머지) | semen=정액 (724); milk / breast milk=우유 (139) / 모유 (98); womb=자궁 (61); aphrodisiac=최음제 (26); hallucination=환각 (14); condom=콘돔 (161); dildo / vibrator=딜도 / 바이브레이터; stroker=오나홀; paddle=패들 (89); whip / riding crop=채찍 (244) / 승마 채찍; gag=재갈 (124); handcuffs=수갑 (12) | - | 표기가 하나로 일관 |

## 4. 물건


| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| meal | 식사 (133) | - | breakfast/lunch/dinner는 아침/점심/저녁 식사 |
| snack | 간식 (21) | 과자 (4) | |
| sweets / candy | 사탕 (47 / 16) | 과자 (15) | |
| chocolate | 초콜릿 (112) | - | hot chocolate은 핫초코 (55) |
| bread / toast | 빵 (25) / 토스트 (23) | - | 음식 데이터는 빵 |
| chips | 감자튀김 (15) | - | crisps는 감자칩 (8) |
| pasta / pizza / burger | 파스타 / 피자 / 햄버거 | 버거 (2) | |
| rice | 쌀 | - | 요리는 밥 |
| pepper | 후추 (27) | 피망 | 식재료 pepper(피망)는 foodstuff 값 따름, 스프레이는 후추 스프레이 |
| milkshake | 밀크쉐이크 (26) | 밀크셰이크 (17) | 통일 필요 |
| lemonade | 레모네이드 (70) | - | 가판대 레모네이드 |
| cider | 사이다 (20) | 사과주 (6) | 통일 필요 |
| alcohol | 술 (12) | 알코올 (17) | 성분은 알코올 |
| foodstuff 단위어 | 개, 송이(꽃), 병, 접시, 판, 마리, 덩이, 장 | - | 데이터의 counter. 첼시 번, 사모사 등은 개 |
| (변이 없는 나머지) | sandwich / cake / pie=샌드위치 / 케이크 / 파이; soup / stew / salad=수프 / 스튜 / 샐러드; cheese / butter / jam=치즈 / 버터 / 잼; honey=꿀; flour / sugar / salt=밀가루 / 설탕 / 소금; tea / coffee=차 (48) / 커피 (123); juice (drink)=주스; wine / beer / whisky / vodka=와인 / 맥주 / 위스키 / 보드카; champagne / cocktail=샴페인 / 칵테일; ingredient / recipe=재료 (61) / 레시피 (51) | - | 표기가 하나로 일관 |
| flower | 꽃 | - | 단위 송이 |
| rose / tulip / daisy / orchid | 장미 / 튤립 / 데이지 / 난초 | 오키드 (2) | |
| lily / lotus / poppy | 백합 / 연꽃 / 양귀비 | 수련 (3) | water lily만 수련 |
| mushroom | 버섯 (71) | - | wolfshroom 늑대버섯, ghostshroom 유령버섯 |
| tree | 나무 (567) | - | oak는 떡갈나무 (12) |
| bush | 덤불 (223) | 수풀 (25) | |
| grass | 풀 (241) | 풀밭 (132), 잔디 (61) | 잔디는 가꾼 곳 |
| hay / straw | 건초 (86) / 짚 (11) | 빨대 (24) | 마실 때는 빨대 |
| (변이 없는 나머지) | weed=잡초 (59); seed=씨앗 (115); fruit / vegetable=과일 (116) / 채소 (25); pumpkin=호박 (16) | - | 표기가 하나로 일관 |
| torch | 횃불 (192) | 손전등 (17) | flashlight는 손전등 |
| lantern | 랜턴 (4) | - | jack-o'-lantern은 잭오랜턴 |
| phone | 휴대폰 (287) | 전화기 (50), 핸드폰 (24) | 통일 필요 |
| radio | 무전기 (25) | 라디오 (18) | 경찰 무전기, 가정용은 라디오 |
| bag | 가방 (158) | 봉지 (56), 봉투 (55) | 쓰레기·과자는 봉지, 종이는 봉투 |
| backpack / bookbag | 배낭 (38) / 책가방 (10) | 가방 | |
| cup / mug / glass | 컵 / 머그잔 / 잔 | - | glass는 재질일 때 유리, 안경 |
| blanket | 담요 (55) | 이불 (15) | 침대 위는 이불 |
| sheet | 시트 (49) | 이불 (13) | |
| rug | 양탄자 (12) | 돗자리 (11), 러그 (3) | 통일 필요 |
| candle | 양초 (15) | 촛불 (12) | 불꽃은 촛불 |
| book / textbook | 책 / 교과서 (105) | - | notebook은 공책 (16) |
| trophy / ticket | 트로피 / 티켓 (21) | 표 (4) | |
| (변이 없는 나머지) | pickaxe / shovel / hammer=곡괭이 / 삽 / 망치; crowbar=쇠지렛대 (8); bucket=양동이 (120); fishing rod / bait / net=낚싯대 / 미끼 (44) / 그물 (49); key / lock=열쇠 (240) / 자물쇠 (396); camera / laptop / computer=카메라 / 노트북 / 컴퓨터; wallet / purse=지갑 (31 / 32); box / crate=상자 (335 / 115); basket / jar / bottle=바구니 / 병 / 병; plate / bowl / spoon / fork=접시 / 그릇 / 숟가락 / 포크; towel=수건 (581); pillow / curtain / carpet=베개 / 커튼 / 카펫; mirror / clock / lamp=거울 / 시계 / 램프; umbrella=우산 (69); pen / pencil=펜 (149) / 연필 (25); magazine / photo=잡지 / 사진; gift=선물 (158); balloon=풍선 (22); pamphlet / flyer / poster=팸플릿 / 전단지 / 포스터 | - | 표기가 하나로 일관 |
| antique | 골동품 (43) | - | artefact는 유물 (11) |
| crystal | 수정 (22) | 결정 (6), 결정체 | 박물관은 결정체 |
| gold / silver | 금 / 은 | 황금 (22) | 금괴 (31), 은괴 (21)은 bar |
| pearl / amber / sapphire / diamond | 진주 / 호박색 / 사파이어 / 다이아몬드 | - | amber는 색일 때 호박색 |
| obsidian / fossil | 흑요석 / 화석 | - | 삼엽충 화석 |
| ring | 반지 (24) | - | 소리는 울린다 |
| bell / horn | 종 (119) / 뿔 (64) | 방울 (11), 경적 (15) | |
| dagger / sword | 단검 (21) / 검 | 은장도 | |
| (변이 없는 나머지) | gem / gemstone=보석 (24); ivory=상아 (전체 101); copper / brass=구리 / 황동; coal=석탄 (6); coin=동전 (71); pendant / necklace=펜던트 (93) / 목걸이 (88); brooch / amulet=브로치 / 부적; sand / stone / rock=모래 (196) / 돌 (102) / 바위 (172); shell / seaweed / driftwood=껍데기 / 해초 / 유목 | - | 표기가 하나로 일관 |

## 5. 장소와 가구의 일반 명칭

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| infirmary | 양호실 (32) | 의무실 (2) | |
| toilet | 화장실 (94) | 변기 (17) | 기구는 변기 |
| bathroom | 욕실 (76) | 화장실 (54) | 통일 필요 |
| shower / bath | 샤워실 (30) / 욕조 (90) | 목욕 (35) | |
| sink | 세면대 (59) | 싱크대 (30) | 부엌은 싱크대 |
| kitchen | 부엌 (168) | 주방 (100) | 통일 필요 |
| lounge | 라운지 (68) | 응접실 (9) | |
| bedroom / bed | 침실 (164) / 침대 (742) | - | bunk는 침상 (18) |
| mattress / sofa | 매트리스 / 소파 | - | couch도 소파 |
| table | 테이블 (756) | 탁자 (172) | 통일 필요 |
| chair / stool / bench | 의자 / 의자 (40) / 벤치 | 스툴 (9) | |
| cupboard | 찬장 (99) | 벽장 (33) | 통일 필요 |
| cabinet | 캐비닛 (45) | 수납장 (25) | 통일 필요 |
| fridge / oven / stove | 냉장고 / 오븐 / 스토브 | 난로 (3) | |
| counter | 카운터 (334) | 계산대 (42) | 상점 계산대 |
| cage | 우리 (273) | 케이지 (27) | |
| altar / pew | 제단 / 신도석 (19) | 좌석 (13) | |
| cell | 감옥 (290) | 독방 (39), 방 (77) | 독방은 혼자 쓰는 방 |
| dungeon | 지하 감옥 (105) | 던전 (6) | |
| prison | 감옥 | 교도소 (57) | 고유 명사 문서를 따른다 |
| orphanage / temple | 고아원 / 신전 | 보육원 (2) | |
| cottage / cabin / shack | 오두막 | - | 셋 모두 같은 낱말 |
| flat | 아파트 (67) | 플랫 (26) | 고유 명사 문서 쪽이 정한다 |
| barn | 축사 (132) | 헛간 (131) | 통일 필요 |
| shop / store | 가게 (420) | 상점 (220) | 통일 필요 |
| stall | 가판대 (158) | 노점 (2) | |
| market / pub / cafe | 시장 / 술집 (129) / 카페 | 펍 (41) | 하베스트 가의 펍은 장소 이름 |
| brothel | 창관 (62) | 사창가 (9) | |
| arcade | 오락실 (46) | 아케이드 (12) | |
| window / door / gate | 창문 / 문 / 문 | 정문 (61) | gate는 정문일 때 정문 |
| wall / floor / ceiling / roof | 벽 / 바닥 / 천장 / 지붕 | 옥상 (16) | roof가 올라가는 곳이면 옥상 |
| elevator / lift | 엘리베이터 (54) | 승강기 (14) | 통일 필요 |
| bridge / road / street / alley | 다리 / 도로 / 거리 / 골목 | 길 (60) | 거리 이름은 고유 명사 문서 |
| lake / pond / pool | 호수 / 연못 / 수영장 (243) | 웅덩이 (72) | 고인 물은 웅덩이 |
| beach / shore / coast | 해변 / 해안 (108) | 물가 (38) | |
| dock / pier | 부두 (150 / 95) | 선착장 (1) | |
| boat / ship | 보트 (78) / 배 | 해적선 | |
| (변이 없는 나머지) | classroom=교실 (223); locker=사물함 (182); changing room=탈의실 (133); library / canteen=도서관 / 식당 (106); desk=책상 (691); wardrobe / shelf / drawer=옷장 / 선반 / 서랍; stage=무대 (395); asylum=정신병원 (93); mansion / manor / estate=저택; coop / stable / trough=닭장 / 마구간 / 여물통; greenhouse / tractor=온실 / 트랙터; corridor / hallway / stairs=복도 / 복도 / 계단; fence=울타리 (234); cave / tunnel / sewer=동굴 / 터널 / 하수도; mine / mines=광산; path / trail / clearing=길 / 오솔길 / 공터; bus / car / van / lorry=버스 / 차 / 밴 / 트럭; hospital / museum / school / farm=병원 / 박물관 / 학교 / 농장 | - | 표기가 하나로 일관 |

## 6. 화폐·단위·시간

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| £ / pound (돈) | £ | 파운드 (전체 3) | 기호 그대로 |
| cash | 현금 (121) | - | 금전등록기는 계산대 |
| black money | 암시장 (전체 31) | - | 변수 이름은 번역하지 않는다 |
| inch / foot (길이) | 인치 (47) / 피트 (56) | 센티 (3) | cm는 그대로 |
| day | 하루 (253) | 일 (354), 날 (242) | 날수는 일, 하루는 기간 |
| week / month / year | 주 / 달 (39) / 년 (95) | 개월 (4), 해 (48) | 몇 달, 몇 주 |
| midnight / dawn / dusk | 자정 / 새벽 / 황혼 (8) | 해 질 녘 (6) | |
| (변이 없는 나머지) | money=돈; coin=동전; debt=빚 (26); wage=임금 (8); tip=팁 (150); minute / hour=분 / 시간 | - | 표기가 하나로 일관 |

## 7. 날씨와 자연

| 영어 | 한국어 | 다른 표기(빈도) | 비고 |
|---|---|---|---|
| rain / snow | 비 / 눈 | - | 사전: 비 / 눈 |
| fog / mist | 안개 | - | mist(분홍 안개)는 분홍빛 안개 |
| storm | 폭풍 (39) | - | thunderstorm은 뇌우 |
| cloud(s) | 구름 (85) | - | cloudy는 구름 낀 |
| sun / moon | 해 / 달 | 태양 (55) | 서술은 해, 시적인 곳은 태양 |
| blood moon | 붉은 달 (전체 117) | 피의 달 (전체 2) | 사전 bloodMoon은 붉은 달 |
| clear / overcast | 맑음 / 흐림 | - | 사전: 약한 흐림, 짙은 흐림 |
| (변이 없는 나머지) | thunder / lightning=천둥 (33) / 번개 (30); wind / breeze=바람 (311) / 산들바람 (89); snowflake=눈송이 (16); moonlight=달빛 (92); sky / horizon=하늘 / 지평선 | - | 표기가 하나로 일관 |

## 통일이 필요한 용어 (다수:소수)

사람·역할 (사전 getNpcRoleKr/getNpcTitleKr와 어긋나는 것은 "사전" 표시):
1. teacher 선생님 : 교사 = 146 : 52. 호칭과 서술은 선생님, 직함 표기("영어 교사")만 교사.
2. nurse 간호사 : 양호교사 = 98 : 38.
3. Dr. Harper 하퍼 의사 : 하퍼 박사 = 93 : 32.
4. officer 경찰관 : 경찰 = 184 : 73. 개인은 경찰관.
5. thug 불량배 : 부하 : 깡패 : 폭력배 = 55 : 30 : 28 : 17. 부하는 henchmen일 때만.
6. initiate 수련생 : 입문자 : 수련자 = 79 : 65 : 37. 사전 role은 수련자, title은 입문자.
7. cultist 신도 : 광신도 = 606 : 2(전체). 사전 role을 신도로.
8. farmhand 농장 인부 : 농장 일꾼 = 249 : 41. 사전 title을 농장 인부로.
9. farmer 농부 : 농장주 = 52 : 3. 사전 title을 농부로.
10. captain 선장 : 대장 = 61 : 5. 사전 role을 선장으로.
11. inmate 죄수 : 수감자 = 135 : 8. 사전 role을 죄수로.
12. janitor 관리인 : 청소부 = 19 : 4. 사전 role을 관리인으로.
13. manager 매니저 : 관리자 = 32 : 16.
14. chef 요리사 : 셰프 : 주방장 = 24 : 17 : 8.
15. photographer 사진작가 : 사진사 = 27 : 27. smuggler 밀수꾼 : 밀수업자 = 13 : 10. 사전이 사진작가, 밀수꾼.

생물·체액·도구:
16. lewd fluid 음란한 체액 : 음란한 액체 = 65 : 29.
17. collar 목걸이 : 목줄 = 296 : 216. 다수는 목걸이지만 necklace와 겹치고 사전과 상품명이 목줄이라 목줄로 모은다. leash는 목줄 : 가죽끈 : 리드줄 = 388 : 72 : 13이라 목줄.
18. goo 끈적한 액체 : 점액 = 9 : 5. 사전(getFluidKr)은 점액.
19. tendril 촉수 : 덩굴손 = 90 : 29. 사전은 덩굴손.
20. cowgirl 카우걸 : 젖소소녀(사전) = 25 : 사전 / bullboy 불보이 : 황소소년 = 20 : 3. getBeastTypeKr 조립 결과를 카우걸, 불보이로.
21. bird 새 : 하피 = 185 : 2. 사전 getBeastTypeKr의 bird는 하피(harpy와 같다).
22. monster 괴물 : 수인 : 몬스터 = 86 : 21 : 10.
23. phone 휴대폰 : 전화기 : 핸드폰 = 287 : 50 : 24.
24. milkshake 밀크쉐이크 : 밀크셰이크 = 26 : 17. cider 사이다 : 사과주 = 20 : 6.
25. rug 양탄자 : 돗자리 : 러그 = 12 : 11 : 3.

장소·가구:
26. bathroom 욕실 : 화장실 = 76 : 54. kitchen 부엌 : 주방 = 168 : 100.
27. table 테이블 : 탁자 = 756 : 172. cupboard 찬장 : 벽장 = 99 : 33. cabinet 캐비닛 : 수납장 = 45 : 25.
28. barn 축사 : 헛간 = 132 : 131. 거의 같은 수라 사육장 이름("기생충 축사")에 맞춰 축사.
29. shop/store 가게 : 상점 = 420 : 220.
30. elevator/lift 엘리베이터 : 승강기 = 54 : 14.
31. 박물관 금속 접두어: 띄어 쓴 것(은 브로치, 금 동전, 구리 나침반 등 15) : 붙인 것(은반지, 금반지, 은가면, 은검 등 8). 띄어 쓰는 쪽으로.

## 새 용어 제안 (EN-new에만 나오는 일반 명사)

광산(`loc-mines/`의 mining, minecarts, cleaning, night, punishment, revolt, birth, escape, passout, MineMaze.js)은 새로 쓰인 파일이고, 서재(library.twee), 공원(park.twee), 버스(thug.twee)도 아래 낱말이 처음 나온다. 번역 기억이 없는 것만 적었다. 괄호 안은 KR-old 근거.

| 영어 | 제안 | 근거와 비고 |
|---|---|---|
| minecart | 광차 | 광차·갱도 용례 없음. 광산 안에서만 쓰고 다른 곳의 "수레"와 구분 |
| gem / crystal (small, medium, large) | 보석 / 수정, 작은·중간·큰 | 광산 위젯의 크기 접두어 (보석 24, 수정 22) |
| rusty pickaxe / shovel handle | 녹슨 곡괭이 / 삽 자루 | 곡괭이 6 |
| lantern (광산) | 랜턴 | 랜턴 4 |
| elevator (광산 출입) | 엘리베이터 | 통일 목록 30 |
| shackles / baton (광산 경비) | 족쇄 / 곤봉 | 기존 표기 |
| slave(s) / hostage | 노예 / 인질 | 노예 4, 인질 2. 성노예와 구분 |
| guards' quarters | 경비원 숙소 | |
| tarp / bomb / bomb part | 방수포 / 폭탄 / 폭탄 부품 | 방수포 11, 폭탄 8 |
| fireworks | 폭죽 | 폭죽 1. 새 날씨 캔버스 효과의 이름이기도 하다 |
| collapsed / flooded tunnel | 무너진 터널 / 물에 잠긴 터널 | 터널 203 |
| scriptorium | 필사실 | 필사 149와 같은 계열 (고유 명사 문서의 "신전 필사") |
| calligraphy / calligrapher / scribe | 서예 / 서예가 / 필사가 | 고유 명사 문서와 같다 |
| quill / inkwell | 깃펜 / 잉크병 | 깃펜 없음, 잉크 40 |
| parchment / tome | 양피지 / 고서 | 양피지 1 |
| pumpkin carving / stencil / competitor | 호박 조각 / 밑그림 틀 / 참가자 | 호박 16, 조각 9 |
| shakedown / dues (thug.twee) | 갈취 / 상납금 | 갈취 1, 상납 6 |
| beatdown | 집단 구타 | 구타 18 |
| pickpocket / mugger | 소매치기 / 강도 | 소매치기 3 |
| duffel / nightstick | 더플백 / 경찰봉 | 더플백 2, 경찰봉 2 |
