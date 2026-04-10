import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [1. 리그 한글 매핑 리스트]
const leagueNameMap: { [key: number]: string } = {
  39: "잉글랜드 프리미어리그", 40: "잉글랜드 챔피언십", 45: "잉글랜드 FA컵", 48: "EFL컵",
  140: "스페인 라리가", 141: "스페인 세군다 디비시온", 143: "코파 델 레이",
  78: "독일 분데스리가", 79: "독일 2. 분데스리가", 81: "DFB 포칼",
  135: "이탈리아 세리에 A", 136: "이탈리아 세리에 B", 137: "코파 이탈리아",
  61: "프랑스 리그 앙", 62: "프랑스 리그 두", 66: "쿠프 드 프랑스",
  88: "네덜란드 에레디비시", 89: "네덜란드 에이르스터 디비시", 90: "네덜란드 KNVB 베이커",
  179: "스코틀랜드 프리미어십", 180: "스코틀랜드 챔피언십", 183: "스코틀랜드 컵",
  94: "포르투갈 프리메이라리가", 95: "리가 포르투갈 2", 96: "타사 드 포르투갈",
  203: "튀르키예 수페르리그", 204: "튀르키예 1. 리그", 205: "튀르키예 컵",
  197: "그리스 슈퍼리그 1", 198: "그리스 슈퍼리그 2", 199: "그리스 컵",
  106: "폴란드 엑스트라클라사", 107: "폴란드 I 리가", 108: "폴란드 컵",
  103: "노르웨이 엘리테세리엔", 104: "노르웨이 1. 디비전", 105: "노르웨이 컵",
  119: "덴마크 수페르리가", 120: "덴마크 1. 디비전", 121: "덴마크 DBU 포칼렌",
  172: "불가리아 1부 리그", 173: "불가리아 2부 리그", 174: "불가리아 컵",
  271: "헝가리 NB I", 272: "헝가리 NB II", 273: "헝가리 머저르 쿠퍼",
  218: "크로아티아 HNL", 219: "크로아티아 Prva NL", 220: "크로아티아 컵",
  144: "벨기에 주필러 프로리그", 145: "벨기에 챌린저 프로리그", 146: "벨기에 컵",
  207: "스위스 슈퍼리그", 208: "스위스 챌린지 리그", 209: "스위스 컵",
  357: "아일랜드 프리미어 디비전", 358: "아일랜드 1부 디비전", 359: "아일랜드 FAI 컵",
  292: "K리그 1", 293: "K리그 2", 295: "코리아컵",
  98: "J1 리그", 99: "J2 리그", 102: "일본 일왕배", 101: "J리그컵",
  169: "중국 슈퍼리그", 170: "중국 갑급 리그", 171: "중국 CFA 컵",
  253: "미국 MLS", 255: "미국 USL 챔피언십", 257: "미국 US 오픈컵",
  262: "멕시코 리가 MX", 263: "멕시코 리가 데 익스판시온", 264: "멕시코 코파 MX",
  71: "브라질 세리에 A", 72: "브라질 세리에 B", 73: "브라질 코파 두 브라질",
  128: "아르헨티나 리가 프로페셔널", 129: "아르헨티나 프리메라 나시오날", 130: "아르헨티나 코파 아르헨티나",
  188: "호주 A-리그", 189: "호주 오스트레일리아 컵",
  1: "FIFA 월드컵", 4: "UEFA 유로", 5: "UEFA 네이션스 리그", 9: "코파 아메리카",
  2: "UEFA 챔피언스리그", 3: "UEFA 유로파리그", 848: "UEFA 유로파 컨퍼런스리그", 13: "코파 리베르타도레스", 17: "AFC 챔피언스리그"
};

// [2. 주요 팀 한글 매핑 리스트 - 🔥 쉼표 오류 완벽 수정본!]
const teamNameMap: { [key: string]: string } = {
  "Arsenal": "아스널", "Aston Villa": "아스톤 빌라", "Bournemouth": "본머스", "Brentford": "브렌트포드", "Brighton": "브라이튼", "Chelsea": "첼시", "Crystal Palace": "크리스탈 팰리스", "Everton": "에버턴", "Fulham": "풀럼", "Ipswich": "입스위치", "Leicester": "레스터", "Liverpool": "리버풀", "Manchester City": "맨시티", "Manchester United": "맨체스터 유나이티드", "Newcastle": "뉴캐슬", "Nottingham Forest": "노팅엄", "Southampton": "사우샘프턴", "Tottenham": "토트넘", "West Ham": "웨스트햄", "Wolves": "울버햄튼",
  "Alaves": "알라베스", "Athletic Club": "빌바오", "Atletico Madrid": "AT 마드리드", "Barcelona": "바르셀로나", "Celta Vigo": "셀타 비고", "Espanyol": "에스파뇰", "Getafe": "헤타페", "Girona": "지로나", "Las Palmas": "라스팔마스", "Leganes": "레가네스", "Mallorca": "마요르카", "Osasuna": "오사수나", "Ray오 Vallecano": "라요", "Real Betis": "베티스", "Real Madrid": "레알 마드리드", "Real Sociedad": "소시에다드", "Sevilla": "세비야", "Valencia": "발렌시아", "Valladolid": "바야돌리드", "Villarreal": "비야레알",
  "Augsburg": "아우크스부르크", "Bayer Leverkusen": "레버쿠젠", "Bayern München": "바이에른 뮌헨", "Bayern Munich": "바이에른 뮌헨", "Borussia Dortmund": "도르트문트", "Borussia Monchengladbach": "글라트바흐", "Eintracht Frankfurt": "프랑크푸르트", "SC Freiburg": "프라이부르크", "Heidenheim": "하이덴하임", "Hoffenheim": "호펜하임", "Holstein Kiel": "홀슈타인 킬", "RB Leipzig": "라이프치히", "FSV Mainz 05": "마인츠", "St. Pauli": "상파울루", "Stuttgart": "슈투트가르트", "Union Berlin": "우니온 베를린", "Werder Bremen": "브레멘", "Wolfsburg": "볼프스부르크",
  "AC Milan": "AC 밀란", "Atalanta": "아탈란타", "Bologna": "볼로냐", "Cagliari": "칼리아리", "Como": "코모", "Empoli": "엠폴리", "Fiorentina": "피오렌티나", "Genoa": "제노아", "Inter": "인테르", "Juventus": "유벤투스", "Lazio": "라치오", "Lecce": "레체", "Monza": "몬차", "Napoli": "나폴리", "Parma": "파르마", "Roma": "AS 로마", "Torino": "토리노", "Udinese": "우디네세", "Venezia": "베네치아", "Verona": "베로나",
  "Auxerre": "오세르", "Angers": "앙제", "Brest": "브레스투아", "Le Havre": "르아브르", "Lens": "랑스", "Lille": "릴", "Lyon": "리옹", "Marseille": "마르세유", "Monaco": "모나코", "Montpellier": "몽펠리에", "Nantes": "낭트", "Nice": "니스", "Paris Saint Germain": "PSG", "Reims": "랭스", "Rennes": "렌", "Saint Etienne": "생테티엔", "Strasbourg": "스트라스부르", "Toulouse": "툴루즈",
  "Ulsan HD": "울산 HD", "Pohang Steelers": "포항 스틸러스", "Gwangju FC": "광주 FC", "Jeonbuk Motors": "전북 현대", "Daegu FC": "대구 FC", "Incheon United": "인천 유나이티드", "FC Seoul": "FC 서울", "Daejeon Citizen": "대전 하나시티즌", "Jeju United": "제주 유나이티드", "Gangwon FC": "강원 FC", "Suwon FC": "수원 FC", "Gimcheon Sangmu": "김천 상무", // 🔥 1번 쉼표 추가!
  "Benfica": "벤피카", "FC Porto": "FC 포르투", "Sporting CP": "스포르팅 CP", "SC Braga": "브라가", "Guimaraes": "비토리아 기마랑이스", "Moreirense": "모레이렌세", "Arouca": "아로카",
  "Famalicao": "파말리캉", "Casa Pia": "카사 피아", "Farense": "파렌세", "Rio Ave": "히우 아브", "Gil Vicente": "질 비센트", "Estoril": "에스토릴", "Boavista": "보아비스타", "Estrela": "이스트렐라",
  "AVS": "AVS", "Santa Clara": "산타 클라라", "Nacional": "나시오날", "Portimonense": "포르티모넨세", "Vizela": "비젤라", "Chaves": "샤베스", "Maritimo": "마리티무", "Pacos de Ferreira": "파수스 드 페헤이라",
  "Tondela": "톤델라", "Torreense": "토렌세", "Benfica B": "벤피카 B", "Mafra": "마프라", "Porto B": "포르투 B", "Leixoes": "레이숑이스 (레이소에스)", "Alverca": "알베르카", "Feirense": "페이렌세", "Academico Viseu": "아카데미코 비제우",
  "Penafiel": "페나피엘", "Felgueiras": "펠게이라스", "Oliveirense": "올리베이렌세", "Leiria": "레이리아", "Galatasaray": "갈라타사라이", "Fenerbahce": "페네르바흐체", "Beşiktaş": "베식타시", "Trabzonspor": "트라브존스포르",
  "Basaksehir": "바샥셰히르", "Kasimpasa": "카슴파샤", "Alanyaspor": "알라니아스포르", "Antalyaspor": "안탈리아스포르", "Sivasspor": "시바스스포르", "Rizespor": "리제스포르", "Konyaspor": "코냐스포르",
  "Gaziantep FK": "가지안테프 FK", "Göztepe": "괴즈테페", "Eyupspor": "에위프스포르", "Samsunspor": "삼순스포르", "Bodrumspor": "보드룸스포르", "Hatayspor": "하타이스포르", "Kayserispor": "카이세리스포르", "Ankaragucu": "앙카라귀쥐",
  "Pendikspor": "펜디크스포르", "Karagumruk": "카라귐뤼크", "Istanbulspor": "이스탄불스포르", "Corum FK": "초룸 FK", "Kocaelispor": "코자엘리스포르", "Sakaryaspor": "사카리아스포르", "Genclerbirligi": "겐츨레르비를리이",
  "Boluspor": "볼루스포르", "Bandirmaspor": "반드르마스포르", "Erzurumspor": "에르주룸스포르", "Manisa F.K.": "마니사 FK", "Ümraniyespor": "움라니예스포르", "Keçiörengücü": "케치외렌귀쥐", "Iğdır FK": "이그디르 FK",
  "Esenler Erokspor": "에센레르 에록스포르", "Amed SK": "아메드 SK", "Sanliurfaspor": "샨리우르파스포르", "PAOK": "PAOK (파오크)", "AEK Athens": "AEK 아테네", "Olympiacos": "올림피아코스",
  "Panathinaikos": "파나티나이코스", "Aris": "아리스", "Lamia": "라미아", "Asteras Tripolis": "아스테라스 트리폴리스", "Panserraikos": "판세라이코스", "OFI Crete": "OFI 크레타", "Atromitos": "아트로미토스",
  "Panetolikos": "파네톨리코스", "Volos": "볼로스", "Levadiakos": "레바디아코스", "Athens Kallithea": "아테네 칼리테아", "Jagiellonia Bialystok": "야기엘로니아 비아위스토크", "Slask Wroclaw": "슬롱스크 브로츠와프",
  "Legia Warszawa": "레기아 바르샤바", "Lech Poznan": "레흐 포즈난", "Pogon Szczecin": "포곤 슈체친", "Raków Częstochowa": "라쿠프 쳉스토호바", "Gornik Zabrze": "구르니크 자브제", "Stal Mielec": "스탈 미엘레츠",
  "Widzew Lodz": "비제프 우치", "Piast Gliwice": "피아스트 글리비체", "Zaglebie Lubin": "자글렝비에 루빈", "Cracovia": "크라코비아", "Radomiak Radom": "라도미아크 라돔", "Puszcza Niepolomice": "푸슈차 니에폴로미체",
  "Lechia Gdansk": "레히아 그단스크", "GKS Katowice": "GKS 카토비체", "Motor Lublin": "모토르 루블린", "Bodo/Glimt": "보되/글림트", "Molde": "몰데", "Viking": "비킹", "Brann": "브란",
  "Rosenborg": "로젠보리", "Tromso": "트롬쇠", "Lillestrom": "릴레스트롬", "Sarpsborg 08": "사릅스보르그 08", "Stromsgodset": "스트룀스고드셋", "Odd": "오드", "Ham-Kam": "함캄", "FK Haugesund": "하우게순",
  "Fredrikstad": "프레드릭스타드", "KFUM Oslo": "KFUM 오슬로", "Sandefjord": "산데피오르", "Kristiansund": "크리스티안순", "FC Copenhagen": "FC 코펜하겐", "FC Midtjylland": "FC 미트윌란", "Brondby": "브뢴뷔", "FC Nordsjaelland": "FC 노르셸란",
  "AGF Aarhus": "AGF 오르후스", "Silkeborg": "실케보르", "Viborg": "비보르", "Odense": "오덴세", "Randers FC": "란데르스 FC", "Vejle": "바일레", "Sonderjyske": "쇤데르위스케", "Aalborg": "올보르", "Ludogorets": "루도고레츠",
  "CSKA Sofia": "CSKA 소피아", "Cherno More": "체르노 모레", "Levski Sofia": "레프스키 소피아", "Lokomotiv Plovdiv": "로코모티브 플로브디프", "CSKA 1948": "CSKA 1948",
  "Arda Kardzhali": "아르다 카르잘리", "Botev Plovdiv": "보테프 플로브디프", "Slavia Sofia": "슬라비아 소피아", "Beroe": "베로에", "Hebar 1918": "헤바르 1918", "Krumovgrad": "크루모브그라드", "Spartak Varna": "스파르타크 바르나",
  "Septemvri Sofia": "세프템브리 소피아", "Ferencvaros": "페렌츠바로시", "Paksi SE": "팍시 SE", "Fehervar FC": "페헤르바르 FC", "Puskas Academia": "푸스카스 아카데미아", "Debrecen": "데브레첸", "MTK Budapest": "MTK 부다페스트",
  "Diosgyor": "디오시죄르", "Zalaegerszeg": "잘러에게르세그", "Kecskemeti TE": "케치케메트 TE", "Ujpest": "우이페슈트", "Nyiregyhaza": "니레지하저", "Gyor": "죄르", "Dinamo Zagreb": "디나모 자그레브",
  "Rijeka": "리예카", "Hajduk Split": "하이두크 스플리트", "Osijek": "오시예크", "Lokomotiva Zagreb": "로코모티바 자그레브", "Varazdin": "바라즈딘", "Gorica": "고리차", "Istra 1961": "이스트라 1961",
  "Slaven Belupo": "슬라벤 벨루포", "Sibenik": "시베니크", "Club Brugge KV": "클뤼프 브뤼허", "Union St. Gilloise": "위니옹 생질루아즈", "Anderlecht": "안데를레흐트",
  "Antwerp": "앤트워프", "Genk": "헹크", "Gent": "헨트", "Cercle Brugge KSV": "세르클 브뤼허", "Mechelen": "메헬렌", "Sint-Truiden": "신트트라위던", "Standard Liege": "스탕다르 리에주", "Westerlo": "베스테를로",
  "Sporting Charleroi": "스포르팅 샤를루아", "Kortrijk": "코르트레이크", "RWDM": "RWDM", "Beerschot VA": "비어스호트 VA", "Dender": "덴데르", "Young Boys": "영 보이스", "Servette": "세르베트", "Lugano": "루가노",
  "FC Zurich": "FC 취리히", "St. Gallen": "장크트갈렌", "Winterthur": "빈터투어", "FC Luzern": "FC 루체른", "Basel": "바젤", "Grasshopper": "그라스호퍼", "Yverdon": "이베르동", "Lausanne Sport": "로잔 스포르", "Sion": "시옹",
  "Shamrock Rovers": "샴록 로버스", "Derry City": "데리 시티", "St. Patricks": "세인트 패트릭스", "Shelbourne": "셸본", "Dundalk": "던독", "Bohemians": "보헤미안스", "Sligo Rovers": "슬라이고 로버스",
  "Galway United": "골웨이 유나이티드", "Waterford": "워터퍼드", "Drogheda United": "드로헤다 유나이티드", "PSV Eindhoven": "PSV 에인트호번", "Feyenoord": "페예노르트", "Twente": "트벤테", "AZ Alkmaar": "AZ 알크마르",
  "Ajax": "아약스", "NEC Nijmegen": "NEC 네이메헌", "Utrecht": "위트레흐트", "Sparta Rotterdam": "스파르타 로테르담", "Go Ahead Eagles": "고 어헤드 이글스", "Fortuna Sittard": "포르투나 시타르트",
  "Heerenveen": "헤이렌베인", "PEC Zwolle": "PEC 즈볼러", "Almere City": "알메러 시티", "Heracles": "헤라클레스", "Waalwijk": "발베이크", "Willem II": "빌럼 II", "Groningen": "흐로닝언", "NAC Breda": "NAC 브레다",
  "Vitesse": "비테세", "Volendam": "볼렌담", "Excelsior": "엑셀시오르", "Roda": "로다", "Dordrecht": "도르드레흐트", "ADO Den Haag": "ADO 덴하흐", "De Graafschap": "더 흐라프스합", "Emmen": "에먼", "Maastricht": "마스트리흐트",
  "Cambuur": "캄뷔르", "VVV Venlo": "VVV 펜로", "Helmond Sport": "헬몬트 스포르트", "Telstar": "텔스타", "TOP Oss": "TOP 오스", "FC Eindhoven": "FC 에인트호번", "Den Bosch": "덴보스", "Jong PSV": "용 PSV",
  "Jong Ajax": "용 아약스", "Jong AZ": "용 AZ", "Jong Utrecht": "용 위트레흐트", "Celtic": "셀틱", "Rangers": "레인저스", "Hearts": "하츠", "Kilmarnock": "킬마녹", "St. Mirren": "세인트 미렌", "Dundee FC": "던디 FC",
  "Aberdeen": "애버딘", "Motherwell": "마더웰", "Hibernian": "히버니언", "Ross County": "로스 카운티", "St. Johnstone": "세인트 존스톤", "Dundee Utd": "던디 유나이티드", "Livingston": "리빙스턴", "Raith Rovers": "레이스 로버스",
  "Partick Thistle": "파틱 시슬", "Airdrieonians": "에어드리오니언스", "Falkirk": "폴커크", "Hamilton Academical": "해밀턴 아카데미컬", "Greenock Morton": "그리녹 모턴", "Dunfermline": "던펌린", "Queen's Park": "퀸스 파크",
  "Ayr United": "에어 유나이티드", "Central Coast Mariners": "센트럴 코스트 매리너스", "Melbourne Victory": "멜버른 빅토리", "Sydney FC": "시드니 FC", "Macarthur FC": "맥아더 FC", "Wellington Phoenix": "웰링턴 피닉스",
  "Melbourne City": "멜버른 시티", "Western Sydney Wanderers": "웨스턴 시드니 원더러스", "Adelaide United": "애들레이드 유나이티드", "Brisbane Roar": "브리즈번 로어", "Perth Glory": "퍼스 글로리", "Newcastle Jets": "뉴캐슬 제츠",
  "Western United": "웨스턴 유나이티드", "Auckland FC": "오클랜드 FC", "Nam Dinh": "남딘", "Binh Dinh": "빈딘", "Ha Noi FC": "하노이 FC", "The Cong-Viettel": "더콩-비엣텔", "Cong An Ha Noi": "공안 하노이",
  "Hai Phong": "하이퐁", "Binh Duong": "빈즈엉", "Hong Linh Ha Tinh": "홍린 하띤", "Dong A Thanh Hoa": "동아 타인호아", "TP Ho Chi Minh": "호치민 시티", "Hoang Anh Gia Lai": "호앙아인 잘라이", "Song Lam Nghe An": "송람 응에안",
  "Quang Nam": "꽝남", "SHB Da Nang": "SHB 다낭", "Buriram United": "부리람 유나이티드", "Bangkok United": "방콕 유나이티드", "Port FC": "포트 FC", "BG Pathum United": "BG 빠툼 유나이티드", "Muang Thong United": "무앙통 유나이티드",
  "Ratchaburi": "랏차부리", "Chiangrai United": "치앙라이 유나이티드", "Khon Kaen United": "콘깬 유나이티드", "Lamphun Warriors": "람푼 워리어스", "Uthai Thani": "우타이타니", "Sukhothai": "수코타이", "Nakhon Pathom": "나콘파톰",
  "Prachuap": "쁘라추압", "Nakhon Ratchasima": "나콘랏차시마", "Nong Bua Pitchaya": "농부아 피차야", "Rayong": "라용", "Al-Hilal Saudi FC": "알 힐랄", "Al-Nassr": "알 나스르", "Al Ahli": "알 아흘리", "Al Taawon": "알 타아운",
  "Al-Ittihad FC": "알 이티하드", "Al Ettifaq": "알 이티파크", "Al Fateh": "알 파테흐", "Al Shabab": "알 샤바브", "Al-Fayha": "알 파이하", "Damac": "다막", "Al Khaleej": "알 칼리지", "Al Wehda": "알 웨흐다",
  "Al Riyadh": "알 리야드", "Al Akhdoud": "알 아크두드", "Al Raed": "알 라에드", "Al Qadisiyah": "알 카디시야", "Al Kholood": "알 콜루드", "Al Orubah": "알 오루바", "Mohun Bagan": "모훈 바간", "Mumbai City": "뭄바이 시티",
  "FC Goa": "FC 고아", "Odisha FC": "오디샤 FC", "Kerala Blasters": "케랄라 블래스터스", "Chennaiyin": "첸나이인", "NorthEast United": "노스이스트 유나이티드", "East Bengal": "이스트 벵골", "Punjab": "펀자브",
  "Bengaluru": "벵갈루루", "Jamshedpur": "잠셰드푸르", "Hyderabad": "하이데라바드", "Mohammedan": "모하메단", "Borneo": "보르네오", "Persib Bandung": "페르십 반둥", "Bali United": "발리 유나이티드", "Madura United": "마두라 유나이티드",
  "Dewa United": "데와 유나이티드", "PSIS Semarang": "PSIS 스마랑", "Persis Solo": "페르시스 솔로", "Persija Jakarta": "페르시자 자카르타", "Persik Kediri": "페르식 케디리", "Barito Putera": "바리토 푸테라",
  "Persebaya": "페르세바야", "PSM Makassar": "PSM 마카사르", "PSS Sleman": "PSS 슬레만", "Arema": "아레마", "Semen Padang": "세멘 파당", "PSBS Biak": "PSBS 비악", "Malut United": "말루트 유나이티드",
  "Al Sadd": "알 사드", "Al-Duhail SC": "알 두하일", "Al-Gharafa": "알 가라파", "Al Wakrah": "알 와크라", "Al-Arabi SC": "알 아라비", "Al-Rayyan SC": "알 라이얀", "UMM Salal": "움 살랄", "Al Ahli Doha": "알 아흘리 도하",
  "Qatar SC": "카타르 SC", "Al Shamal": "알 샤말", "Al-Khor": "알 코르", "Al Shahaniya": "알 샤하니야", "Al-Wasl": "알 와슬", "Shabab Al Ahli": "샤밥 알 아흘리", "Al-Ain": "알 아인", "Al-Sharjah": "알 샤르자",
  "Al Wahda": "알 와흐다", "Al-Nasr": "알 나스르", "Al-Bataeh": "알 바타에흐", "Al-Ittihad Kalba": "칼바", "Bani Yas": "바니야스", "Ajman": "아지만", "Khorfakkan": "코르파칸", "Al-Jazira": "알 자지라",
  "Al-Uruba": "알 우루바", "Dibba Al Hisn": "딥바 알 히슨", "Johor Darul Ta'zim": "조호르 다룰 타짐", "Selangor": "슬랑오르", "Terengganu": "트렝가누", "Sabah": "사바", "Kedah": "케다",
  "Kuala Lumpur City": "쿠알라룸푸르 시티", "PDRM": "PDRM", "Sri Pahang": "스리 파항", "Perak": "페락", "Penang": "페낭", "Kuching City": "쿠칭 시티", "Negeri Sembilan": "느그리 셈빌란", "Kelantan Darul Naim": "클란탄 다룰 나임",
  "Al-Faisaly Amman": "알 파이살리 암만", "Al-Wehdat": "알 웨흐다트", "Al-Hussein": "알 후세인", "Ramtha": "람타", "Shabab Al-Ordon": "샤밥 알 오르돈", "Al-Jazeera Amman": "알 자지라 암만", "Al-Salt": "알 살트",
  "Ma'an": "마안", "Moghayer Al-Sarhan": "모가예르 알 사르한", "Al-Ahli Amman": "알 아흘리 암만", "Al-Sareeh": "알 사리흐", "Al-Baqa'a": "알 바카아", "Inter Miami": "인터 마이애미", "Columbus Crew": "콜럼버스 크루",
  "Los Angeles FC": "LA FC", "LA Galaxy": "LA 갤럭시", "FC Cincinnati": "FC 신시내티", "Real Salt Lake": "레알 솔트레이크", "New York City FC": "뉴욕 시티 FC", "New York Red Bulls": "뉴욕 레드불스",
  "Orlando City SC": "올랜도 시티", "Houston Dynamo": "휴스턴 다이너모", "Seattle Sounders": "시애틀 사운더스", "Colorado Rapids": "콜로라도 래피즈", "Vancouver Whitecaps": "밴쿠버 화이트캡스", "Portland Timbers": "포틀랜드 팀버스",
  "Charlotte FC": "샬럿 FC", "Minnesota United": "미네소타 유나이티드", "St. Louis City SC": "세인트루이스 시티", "Atlanta United": "애틀랜타 유나이티드", "FC Dallas": "FC 댈러스", "Philadelphia Union": "필라델피아 유니언",
  "Nashville SC": "내슈빌 SC", "Austin FC": "오스틴 FC", "D.C. United": "DC 유나이티드", "New England Revolution": "뉴잉글랜드 레볼루션", "Toronto FC": "토론토 FC", "Sporting Kansas City": "스포르팅 캔자스시티",
  "Chicago Fire": "시카고 파이어", "San Jose Earthquakes": "산호세 어스퀘이크스", "Club America": "클루브 아메리카", "Cruz Azul": "크루스 아술", "Tigres UANL": "티그레스 UANL", "Monterrey": "몬테레이",
  "Guadalajara (Chivas)": "과달라하라 (치바스)", "Pumas UNAM": "푸마스 UNAM", "Toluca": "톨루카", "Pachuca": "파추카", "Leon": "레온", "Santos Laguna": "산토스 라구나", "Tijuana": "티후아나", "Atlas": "아틀라스",
  "Queretaro": "케레타로", "Necaxa": "네카사", "Mazatlan FC": "마사틀란 FC", "FC Juarez": "FC 후아레스", "Puebla": "푸에블라", "Atletico San Luis": "아틀레티코 산루이스", "Forge FC": "포지 FC", "Cavalry FC": "캐벌리 FC",
  "Pacific FC": "퍼시픽 FC", "York United": "요크 유나이티드", "Atletico Ottawa": "아틀레티코 오타와", "Valour FC": "발루어 FC", "Vancouver FC": "밴쿠버 FC", "Halifax Wanderers": "핼리팩스 원더러스", "Palmeiras": "파우메이라스",
  "Flamengo": "플라멩구", "Botafogo": "보타포구", "Fortaleza": "포르탈레자", "Sao Paulo": "상파울루", "Internacional": "인테르나시오나우", "Cruzeiro": "크루제이루", "Bahia": "바이아", "Vasco da Gama": "바스쿠 다 가마",
  "Atletico Mineiro": "아틀레치쿠 미네이루", "Gremio": "그레미우", "Corinthians": "코린치앙스", "Athletico Paranaense": "아틀레치쿠 파라나엔시", "Fluminense": "플루미넨시", "Cuiaba": "쿠이아바", "Vitoria": "비토리아",
  "Juventude": "주벤투지", "Bragantino": "브라간치누", "Criciuma": "크리시우마", "Atletico Goianiense": "아틀레치쿠 고이아니엔시", "River Plate": "리버 플레이트", "Boca Juniors": "보카 주니어스", "Racing Club": "라싱 클루브",
  "Talleres Cordoba": "탈레레스 코르도바", "Huracan": "우라칸", "Union": "우니온", "Atletico Tucuman": "아틀레티코 투쿠만", "Velez Sarsfield": "벨레스 사르스필드", "Estudiantes": "에스투디안테스", "Independiente": "인디펜디엔테",
  "Lanus": "라누스", "Belgrano": "벨그라노", "Godoy Cruz": "고도이 크루스", "San Lorenzo": "산로렌소",
  "Newell's Old Boys": "뉴웰스 올드 보이스", "Rosario Central": "로사리오 센트랄", "Aguilas Doradas": "아길라스 도라다스", "Alianza": "알리안사", "America de Cali": "아메리카 데 칼리", "Atlético Bucaramanga": "아틀레티코 부카라망가",
  "Atlético Nacional": "아틀레티코 나시오날", "Boyacá Chicó": "보야카 치코", "Deportes Tolima": "데포르테스 톨리마", "Deportivo Cali": "데포르티보 칼리", "Deportivo Pasto": "데포르티보 파스토", "Deportivo Pereira": "데포르티보 페레이라",
  "Envigado": "엔비가도", "Fortaleza CEIF": "포르탈레사 CEIF", "Independiente Medellín": "인디펜디엔테 메데인", "Jaguares de Córdoba": "하과레스 데 코르도바", "Junior": "주니오르", "La Equidad": "라 에키다드",
  "Millonarios": "미요나리오스", "Once Caldas": "온세 칼다스", "Patriotas Boyacá": "파트리오타스 보야카", "Santa Fe": "산타페", "Audax Italiano": "아우닥스 이탈리아노", "Cobreloa": "코브렐로아", "Cobresal": "코브레살",
  "Colo Colo": "콜로콜로", "Coquimbo Unido": "코킴보 우니도", "Deportes Copiapó": "데포르테스 코피아포", "Deportes Iquique": "데포르테스 이키케", "Everton de Viña del Mar": "에버턴 데 비냐 델 마르", "Huachipato": "우아치파토",
  "Ñublense": "뉴블렌세", "O'Higgins": "오이긴스", "Palestino": "팔레스티노", "Unión Española": "우니온 에스파뇰라", "Unión La Calera": "우니온 라 칼레라", "Universidad Catolica": "우니베르시다드 카톨리카",
  "Universidad de Chile": "우니베르시다드 데 칠레", "Aucas": "아우카스", "Barcelona SC": "바르셀로나 SC", "Cumbayá": "쿰바야", "Deportivo Cuenca": "데포르티보 쿠엥카", "Delfin": "델핀", "El Nacional": "엘 나시오날", "Imbabura": "임바부라",
  "Independiente del Valle": "인디펜디엔테 델 바예", "LDU Quito": "LDU 키토", "Libertad": "리베르타드", "Macará": "마카라", "Mushuc Runa": "무슈크 루나", "Orense": "오렌세", "Técnico Universitario": "테크니코 우니베르시타리오",
  "Universidad Católica": "우니베르시다드 카톨리카", "Vía del Mar": "비아 델 마르", "2 de Mayo": "2 데 마요", "Cerro Porteño": "세로 포르테뇨", "General Caballero JLM": "헤네랄 카바예로 JLM", "Guaraní": "과라니",
  "Libertad": "리베르타드", "Nacional Asunción": "나시오날 아순시온", "Olimpia": "올림피아", "Sol de América": "솔 데 아메리카", "Sportivo Ameliano": "스포르티보 아멜리아노", "Sportivo Luqueño": "스포르티보 루케뇨",
  "Sportivo Trinidense": "스포르티보 트리니덴세", "Tacuary": "타쿠아리", "Boston River": "보스턴 리버", "Cerro": "세로", "Cerro Largo": "세로 라르고", "Danubio": "다누비오", "Defensor Sporting": "데펜소르 스포르팅",
  "Deportivo Maldonado": "데포르티보 말도나도", "Fénix": "페닉스", "Liverpool M.": "리버풀 몬테비데오", "Miramar Misiones": "미라마르 미시오네스", "Montevideo Wanderers": "몬테비데오 원더러스", "Nacional": "나시오날",
  "Peñarol": "페냐롤", "Progreso": "프로그레소", "Racing": "라싱", "Rampla Juniors": "람플라 주니어스", "River Plate": "리버 플레이트", "ADT": "ADT", "Alianza Atlético": "알리안사 아틀레티코", "Alianza Lima": "알리안사 리마",
  "Atlético Grau": "아틀레티코 그라우", "Carlos Mannucci": "카를로스 만누치", "Cienciano": "시엔시아노", "Comerciantes Unidos": "코메르시안테스 우니도스", "Cusco": "쿠스코", "Deportivo Garcilaso": "데포르티보 가르실라소",
  "Los Chankas": "로스 찬카스", "Melgar": "멜가르", "Sport Boys": "스포르트 보이스", "Sport Huancayo": "스포르트 우앙카요", "Sporting Cristal": "스포르팅 크리스탈", "Tarma": "타르마", "Unión Comercio": "우니온 코메르시오",
  "UTC": "UTC", "Universitario": "우니베르시타리오", "Always Ready": "올웨이즈 레디", "Aurora": "아우로라", "Blooming": "블루밍", "Bolívar": "볼리바르", "Guabirá": "과비라", "Gualberto Villarroel": "과알베르토 비야로엘", 
  "Independiente Petrolero": "인디펜디엔테 페트롤레로", "Nacional Potosí": "나시오날 포토시", "Oriente Petrolero": "오리엔테 페트롤레로", "Real Santa Cruz": "레알 산타크루스", "Real Tomayapo": "레알 토마야포", "Royal Pari": "로열 파리",
  "San Antonio": "산 안토니오", "The Strongest": "더 스트롱기스트", "Universitario de Vinto": "우니베르시타리오 데 빈토", "Wilstermann": "윌스테르만", "Blackburn": "블랙번", "Bristol City": "브리스톨 시티", "Burnley": "번리",
  "Cardiff": "카디프", "Coventry": "코번트리", "Derby": "더비 카운티", "Hull City": "헐 시티", "Luton": "루턴", "Middlesbrough": "미들즈브러", "Millwall": "밀월", "Norwich": "노리치", "Oxford United": "옥스퍼드 유나이티드",
  "Plymouth": "플리머스", "Portsmouth": "포츠머스", "Preston": "프레스턴", "QPR": "QPR", "Sheffield Utd": "셰필드 유나이티드", "Sheffield Wednesday": "셰필드 웬즈데이", "Stoke City": "스토크 시티", "Sunderland": "선덜랜드",
  "Swansea": "스완지", "Watford": "왓포드", "West Brom": "웨스트 브롬", "Leeds": "리즈", "Albacete": "알바세테", "Almeria": "알메리아", "Burgos": "부르고스", "Cadiz": "카디스", "Cartagena": "카르타헤나",
  "Castellon": "카스테욘", "Cordoba": "코르도바", "Deportivo La Coruna": "데포르티보 라코루냐", "Eibar": "에이바르", "Eldense": "엘덴세", "Elche": "엘체", "Ferrol": "페롤", "Gijon": "히혼", "Granada": "그라나다",
  "Huesca": "우에스카", "Levante": "레반테", "Malaga": "말라가", "Mirandes": "미란데스", "Oviedo": "오비에도", "Racing Santander": "라싱 산탄데르", "Tenerife": "테네리페", "Zaragoza": "사라고사", "Darmstadt 98": "다름슈타트",
  "FC Koln": "쾰른", "Fortuna Düsseldorf": "뒤셀도르프", "Greuther Furth": "그로이터 퓌르트", "Hamburger SV": "함부르크", "Hannover 96": "하노버", "Hertha Berlin": "헤르타 베를린", "Jahn Regensburg": "얀 레겐스부르크",
  "Kaiserslautern": "카이저슬라우테른", "Karlsruher SC": "카를스루에", "Magdeburg": "마그데부르크", "Nurnberg": "뉘른베르크", "Paderborn 07": "파더보른", "Preussen Munster": "프로이센 뮌스터", "Schalke 04": "샬케",
  "SV Elversberg": "엘버스베르크", "Ulm": "울름", "Eintracht Braunschweig": "브라운슈바이크", "Bari": "바리", "Brescia": "브레시아", "Carrarese": "카라레세", "Catanzaro": "카탄차로", "Cesena": "체세나", "Cittadella": "치타델라",
  "Cosenza": "코센차", "Cremonese": "크레모네세", "Frosinone": "프로시노네", "Juve Stabia": "유베 스타비아", "Mantova": "만토바", "Modena": "모데나", "Palermo": "팔레르모", "Pisa": "피사", "Reggiana": "레지아나",
  "Salernitana": "살레르니타나", "Sampdoria": "삼프도리아", "Sassuolo": "사수올로", "Spezia": "스페치아", "Sudtirol": "쥐트티롤", "Ajaccio": "아작시오", "Amiens": "아미앵", "Annecy": "안시", "Bastia": "바스티아", "Caen": "캉",
  "Clermont Foot": "클레르몽", "Dunkerque": "됭케르크", "Grenoble": "그르노블", "Nancy": "낭시", "Guingamp": "갱강", "Laval": "라발", "Lorient": "로리앙", "Martigues": "마르티그", "Metz": "메스", "Paris FC": "파리 FC", "PAU": "포", // 🔥 2번 쉼표 추가!
  "Red Star": "레드 스타", "Rodez": "로데즈", "Troyes": "트루아", "Busan I'Park": "부산 아이파크", "Gyeongnam FC": "경남 FC", "Bucheon FC 1995": "부천 FC 1995", "FC Anyang": "FC 안양", "Jeonnam Dragons": "전남 드래곤즈", "Chungbuk Cheongju": "충북 청주",
  "Seongnam FC": "성남 FC", "Chungnam Asan": "충남 아산", "Seoul E-Land": "서울 이랜드", "Gimpo FC": "김포 FC", "Ansan Greeners": "안산 그리너스", "Cheonan City": "천안 시티", "Vissel Kobe": "비셀 고베",
  "Yokohama F. Marinos": "요코하마 F. 마리노스", "Kawasaki Frontale": "가와사키 프론탈레", "Sanfrecce Hiroshima": "산프레체 히로시마", "Kashima Antlers": "가시마 앤틀러스", "Nagoya Grampus": "나고야 그램퍼스", "Urawa Red Diamonds": "우라와 레드 다이아몬즈",
  "Cerezo Osaka": "세레소 오사카", "Albirex Niigata": "알비렉스 니가타", "Avispa Fukuoka": "아비스파 후쿠오카", "Gamba Osaka": "감바 오사카", "FC Tokyo": "FC 도쿄", "Tokyo Verdy": "도쿄 베르디", "Machida Zelvia": "마치다 젤비아",
  "Jubilo Iwata": "주빌로 이와타", "Kyoto Sanga": "교토 상가", "Sagan Tosu": "사간 도스", "Shonan Bellmare": "쇼난 벨마레", "Kashiwa Reysol": "가시와 레이솔", "Consadole Sapporo": "콘사도레 삿포로", "Shimizu S-Pulse": "시미즈 S-펄스",
  "Yokohama FC": "요코하마 FC", "Ventforet Kofu": "반포레 고후", "Montedio Yamagata": "몬테디오 야마가타", "JEF United Chiba": "제프 유나이티드 지바", "V-Varen Nagasaki": "V-바렌 나가사키", "Oita Trinita": "오이타 트리니타",
  "Fagiano Okayama": "파지아노 오카야마", "Thespa Gunma": "더스파 군마", "Vegalta Sendai": "베갈타 센다이", "Blaublitz Akita": "블라우블리츠 아키타", "Roasso Kumamoto": "로아소 구마모토", "Tokushima Vortis": "도쿠시마 보르티스",
  "Mito Hollyhock": "미토 홀리호크", "Iwaki FC": "이와키 FC", "Fujieda MYFC": "후지에다 MYFC", "Tochigi SC": "도치기 SC", "Renofa Yamaguchi": "레노파 야마구치", "Kagoshima United": "가고시마 유나이티드", "Ehime FC": "에히메 FC",
  "Shanghai Port": "상하이 포트", "Shanghai Shenhua": "상하이 선화", "Shandong Taishan": "산둥 타이산", "Zhejiang Professional": "저장 프로페셔널", "Chengdu Rongcheng": "청두 룽청", "Beijing Guoan": "베이징 궈안",
  "Wuhan Three Towns": "우한 싼전", "Tianjin Jinmen Tiger": "톈진 진먼 타이거", "Changchun Yatai": "창춘 야타이", "Henan": "허난", "Meizhou Hakka": "메이저우 하카", "Cangzhou Mighty Lions": "창저우 마이티 라이온즈",
  "Qingdao Hainiu": "칭다오 하이뉴", "Nantong Zhiyun": "난퉁 즈윈", "Shenzhen Peng City": "선전 펑시티", "Qingdao West Coast": "칭다오 웨스트코스트", "Guangxi Pingguo Haliao": "광시 핑궈 할랴오",
  "Nanjing City": "난징 시티", "Shijiazhuang Gongfu": "스자좡 궁푸", "Suzhou Dongwu": "쑤저우 둥우", "Yanbian Longding": "옌볜 룽딩", "Heilongjiang Ice City": "헤이룽장 아이스시티", "Shanghai Jiading Huilong": "상하이 자딩 후이룽",
  "Liaoning Tieli": "랴오닝 톄리", "Guangzhou FC": "광저우 FC", "Yunnan Yukun": "윈난 위쿤", "Dalian Young Boy": "다롄 영 보이", "Chongqing Tonglianglong": "충칭 퉁량룽", "Wuxi Wugo": "우시 우거", "Jiangxi Lushan": "장시 루산",
  "Foshan Nanshi": "포산 난스", "RB Salzburg": "잘츠부르크", "Shakhtar Donetsk": "샤흐타르", "Sparta Praha": "스파르타 프라하", "Sturm Graz": "슈투름 그라츠", "Slovan Bratislava": "슬로반 브라티슬라바",
  "FK Crvena Zvezda": "즈베즈다", "Cerro Porteno": "세로 포르테뇨", "Kifisia": "키피시아", "Al-Ahli Jeddah": "알 아흘리 제다", "Ghazl El Mehalla": "가즐 엘 마할라", "El Gouna FC": "엘 구나 FC",
  "Haras El Hodood": "하라스 엘 호두드", "Future FC": "퓨처 FC", "Wadi Degla": "와디 데글라", "Pharco": "파르코", "Orange County SC": "오렌지 카운티 SC", "San Antonio": "샌안토니오 FC", "Lokomotiv Sofia": "로코모티브 소피아", // 🔥 3번 쉼표 추가!
  "Sevlievo": "세블리에보", "Spartak Pleven": "스파르탁 플레벤", "Chernomorets 1919 Burgas": "체르노모레츠 부르가스", "Pirin Blagoevgrad": "피린 블라고에브그라드", "Montana": "몬타나", "Cherno More Varna": "체르노 모레 바르나",
  "Belasitsa": "벨라시차", "Fratria": "프라트리아", "Lokomotiv G. Oryahovitsa": "로코모티브 고르나 오랴호비차", "Dobrudzha": "도브루자", "Botev Vratsa": "보테프 브라차", "Ludogorets II": "루도고레츠 2군", "FK Minyor Pernik": "미뇨르 페르니크",
  "Sportist Svoge": "스포르티스트 스보게", "CSKA Sofia II": "CSKA 소피아 2군", "Marek": "마레크", "Vihren": "비흐렌", "Zawisza Bydgoszcz": "자비샤 비드고슈치", "Miedz Legnica": "미에츠 레그니차", "Polonia Bytom": "폴로니아 비톰",
  "Arka Gdynia": "아르카 그디니아", "Chrobry Głogów": "크로브리 그워구프", "Ruch Chorzów": "루흐 호주프", "Pogon Grodzisk Mazowiecki": "포곤 그로지스크 마조비에츠키", "Korona Kielce": "코로나 키엘체", "Wisla Plock": "비스와 프워츠크",
  "Polonia Warszawa": "폴로니아 바르샤바", "Jong PSV": "용 PSV", "FC Volendam": "FC 폴렌담", "Schwarz-Weiß Bregenz": "슈바르츠바이스 브레겐츠", "Sturm Graz II": "슈투름 그라츠 2군", "SKN ST. Polten": "장크트 푈텐",
  "Austria Klagenfurt": "아우스트리아 클라겐푸르트", "Admira Wacker": "아드미라 바커", "Stripfing": "슈트리핑", "SKU Amstetten": "암슈테텐", "Rapid Wien II": "라피드 빈 2군", "WSPG Wels": "벨스", "SV Kapfenberg": "카펜베르크",
  "Red Bull Salzburg": "잘츠부르크", "LASK Linz": "LASK 린츠", "Çorum FK": "초룸 FK", "Bodrum FK": "보드룸 FK", "İnegölspor": "이네골스포르", "Elazığspor": "엘라즈으스포르", "Serik Spor": "세리크스포르", "Vanspor FK": "반스포르",
  "Kastamonuspor": "카스타모누스포르", "Karaman FK": "카라만 FK", "Ankaraspor": "앙카라스포르", "Batman Petrolspor": "배트맨 페트롤스포르", "İskenderunspor": "이스켄데룬스포르", "24 Erzincanspor": "에르진잔스포르",
  "Beykoz Anadolu": "베이코즈 아나돌루", "Altinordu": "알튼오르두", "Bucaspor 1928": "부카스포르 1928", "Beyoğlu Yeni Çarşı": "베이욜루 예니 차르시", "Erbaaspor": "에르바스포르", "Adana 01 FK": "아다나 01 FK",
  "Kepezspor": "케페즈스포르", "Ankaragücü": "앙카라귀쥐", "Muğlaspor": "무을라스포르", "Karacabey Belediyespor": "카라자베이 벨레디예스포르", "Basaksehir": "바샥셰히르", "Bandirmaspor": "반디르마스포르",
  "Sariyer": "사르예르", "Adana Demirspor": "아다나 데미르스포르", "Amed": "아메드", "İstanbulspor": "이스탄불스포르", "Erzurumspor FK": "에르주룸스포르", "Larisa": "라리사", "FC Porto B": "포르투 B",
  "Felgueiras 1932": "펠게이라스", "Pacos Ferreira": "파수스 페헤이라", "FC Aarau": "아라우", "Étoile Carouge": "에투알 카루주", "Stade Lausanne-Ouchy": "스타드 로잔 우시", "Rapperswil": "라퍼스빌", "FC Vaduz": "파두츠",
  "Bellinzona": "벨린초나", "Neuchatel Xamax FC": "뇌샤텔 자막스", "Stade Nyonnais": "스타드 니오네", "FC WIL 1900": "빌 1900", "Aalesund": "올레순", "Kongsvinger": "콩스빙에르", "Bryne": "브뤼네", "hodd": "회드",
  "Sandnes ULF": "산네스 울프", "Kristiansund BK": "크리스티안순", "Sarpsborg 08 FF": "사릅스보르그", "Start": "스타르트", "Ayr Utd": "에어 유나이티드", "Montrose": "몬트로즈", "Cove Rangers": "코브 레인저스",
  "Wrexham": "렉섬", "St Patrick's Athl.": "세인트 패트릭스", "Athlone Town": "애슬론 타운", "Longford Town": "롱퍼드 타운", "Bray Wanderers": "브레이 원더러스", "Finn Harps": "핀 하프스", "Cobh Ramblers": "코브 램블러스",
  "Treaty United": "트리티 유나이티드", "Cork City": "코크 시티", "Kerry": "케리", "UCD": "UCD", "Wexford": "웩스퍼드", "Aarhus": "오르후스", "Hobro": "호브로", "HB Koge": "HB 쾨게", "Middelfart": "미델파르트",
  "Esbjerg": "에스비에르", "Hvidovre": "흐비도브레", "Arminia Bielefeld": "아르미니아 빌레펠트", "KV Mechelen": "KV 메헬렌", "Castellon": "카스테욘", "Granada CF": "그라나다", "Sporting Gijon": "스포르팅 히혼",
  "Real Sociedad II": "레알 소시에다드 B", "Rayo Vallecano": "라요 바예카노", "Vanraure Hachinohe": "반라우레 하치노헤", "Le Mans": "르망", "AEK Athens FC": "AEK 아테네", "Puskas Academy": "푸스카시 아카데미아",
  "Gyori ETO FC": "죄르 ETO", "Ferencvarosi TC": "페렌츠바로시", "Diosgyori VTK": "디오슈죄르", "Dalian Zhixing": "다롄 즈싱", "Hangzhou Greentown": "항저우 그린타운", "Club Nacional": "나시오날", "Mirassol": "미라솔",
  "Midland": "미들랜드", "Acassuso": "아카수소", "Independiente Medellin": "인데펜디엔테 메데진", "Estudiantes L.P.": "에스투디안테스", "Sarmiento Junin": "사르미엔토", "Tristan Suarez": "트리스탄 수아레스",
  "Deportivo Armenio": "데포르티보 아르메니오", "Independ. Rivadavia": "인데펜디엔테 리바다비아", "Deportivo La Guaira": "데포르티보 라 과이라", "Tapatío": "타파티오", "Tlaxcala": "틀락스칼라", "Club Queretaro": "케레타로",
  "Atlanta": "아틀란타", "Nueva Chicago": "누에바 시카고", "LDU de Quito": "LDU 키토", "U. Catolica": "우니베르시다드 카톨리카", "Estudiantes de Rio Cuarto": "에스투디안테스 리오쿠아르토", "San Martin Tucuman": "산마르틴 투쿠만",
  "Argentinos JRS": "아르헨티노스 주니어스", "Banfield": "반필드", "Goias": "고이아스", "Instituto Cordoba": "인스티투토 코르도바", "Defensa Y Justicia": "데펜사 이 후스티시아", "Libertad Asuncion": "리베르타드",
  "Gimnasia L.P.": "힘나시아", "Deportivo Camioneros": "카미오네로스", "Platense": "플라텐세", "Penarol": "페냐롤", "Lokeren-Temse": "로케런-템세", "Yverdon Sport": "이버돈 스포르트",
  "Odra Opole": "오드라 오폴레", "Seraing United": "세랭 유나이티드", "Jagiellonia": "야기엘로니아", "Puszcza Niepołomice": "푸슈차 니에폴로미체", "FC Augsburg": "아우크스부르크", "Austria Lustenau": "아우스트리아 루스테나우",
  "AD Ceuta FC": "AD 세우타", "AS Roma": "AS 로마", "1899 Hoffenheim": "호펜하임", "Charleroi": "샤를루아", "Loudoun United": "라우던 유나이티드",
  "Louisville City": "루이빌 시티", "Botafogo SP": "보타포구 SP", "Belgrano Cordoba": "벨그라노 코르도바", "Aldosivi": "알도시비", "Alebrijes de Oaxaca": "알레브리헤스 데 오아하카", "CDS Tampico Madero": "탐피코 마데로",
  "CA La Paz": "라 파스", "Tepatitlán": "테파티틀란", "Club Tijuana": "클루브 티후아나", "Canberra Olympic": "캔버라 올림픽", "Canberra FC": "캔버라 FC", "Auckland": "오클랜드", "V-varen Nagasaki": "V-바렌 나가사키",
  "Shimizu S-pulse": "시미즈 S-펄스", "Jeju United FC": "제주 유나이티드", "Busan I Park": "부산 아이파크", "Yongin City": "용인시청", "Suwon City FC": "수원FC", "FC Gifu": "FC 기후", "Osaka": "오사카",
  "Kataller Toyama": "카탈레르 도야마", "Changwon City": "창원시청", "Busan Transportation": "부산교통공사", "Gyeongju HNP": "경주 한수원", "Yangpyeong": "양평", "Mokpo City": "목포시청", "Pocheon": "포천",
  "Yeoju Sejong": "여주 세종", "Dangjin Citizen": "당진시민", "Brindabella": "브린다벨라", "Daejeon Korail": "대전 코레일", "Siheung Citizen": "시흥시민", "Ulsan Hyundai FC": "울산 현대", "Hwaseong": "화성",
  "Paju Citizen": "파주시민", "Seoul E-Land FC": "서울 이랜드", "Shaanxi Union": "산시 유니온", "Ningbo Professional": "닝보 프로페셔널", "Shenzhen Juniors": "선전 주니어스", "Chongqing Tongliang Long": "충칭 통량룽",
  "Qingdao Youth Island": "칭다오 유스 아일랜드", "Shenyang Urban": "선양 어반", "Guangzhou E-Power": "광저우 E-파워", "Wuxi Wugou": "우시 우거우", "Meizhou Kejia": "메이저우 커자", "Guangxi Hengchen": "광시 헝천",
  "Henan Jianye": "허난 젠예", "Shandong Luneng": "산둥 루넝", "SHANGHAI SIPG": "상하이 SIPG", "Monaro Panthers": "모나로 팬서스", "Tuggeranong United": "터거라농 유나이티드", "Queanbeyan City": "퀸비언 시티",
  "Canberra Juventus": "캔버라 유벤투스", "Belconnen United": "벨코넨 유나이티드", "Cooma Tigers FC": "쿠마 타이거스", "Canberra White Eagles": "캔버라 화이트 이글스", "Sydney": "시드니", "Sarıyer": "사르예르",
  "Hillerød": "힐레뢰드", "AC Horsens": "호르센스", "Hertha BSC": "헤르타 베를린", "1. FC Kaiserslautern": "카이저슬라우테른", "1. FC Nürnberg": "뉘른베르크", "Dynamo Dresden": "디나모 드레스덴", "Preußen Münster": "프로이센 뮌스터",
  "SpVgg Greuther Fürth": "그로이터 퓌르트", "Başakşehir": "바샥셰히르", "Gençlerbirligi S.K.": "겐츨레르비를리이", "Boulogne": "불로뉴", "RED Star FC 93": "레드 스타", "Haugesund": "하우게순", "Sandnes ULF": "산네스 울프",
  "ODD Ballklubb": "오드", "Sogndal": "송달", "Lyn": "린", "Strommen": "스트룀멘", "Egersund": "에게르순", "Aarhus Fremad": "오르후스 프레마드", "Austria Salzburg": "아우스트리아 잘츠부르크", "FC Liefering": "리퍼링",
  "Floridsdorfer AC": "플로리츠도르퍼", "Lyngby": "링비", "Kolding IF": "콜딩", "Widzew Łódź": "비제프 우치", "Nieciecza": "니에치에차", "Hellas Verona": "엘라스 베로나", "Sporting CP B": "스포르팅 B", "Çorum FK": "초룸 FK",
  "Virtus Entella": "비르투스 엔텔라", "Pescara": "페스카라", "Kazincbarcikai": "카진크바르치카이", "1. FC Heidenheim": "하이덴하임", "Borussia Mönchengladbach": "묀헨글라트바흐", "VfL Wolfsburg": "볼프스부르크",
  "ST Mirren": "세인트 미렌", "Heart Of Midlothian": "하츠", "Dundee": "던디", "Arbroath": "아브로스", "Partick": "파틱", "Morton": "모턴", "ST Johnstone": "세인트 존스톤", "Airdrie United": "에어드리 유나이티드",
  "East Fife": "이스트 파이프", "Peterhead": "피터헤드", "Alloa Athletic": "알로아 애슬레틱", "Kelty Hearts": "켈티 하츠", "Queen of the South": "퀸 오브 더 사우스", "Charlton": "찰턴", "RSC Anderlecht II": "안데를레흐트 2군",
  "Budafoki LC": "부다포키", "Mezokovesd-zsory": "메조쾨베슈드", "Szeged 2011": "세게드", "Szentlörinc SE": "센틀뢰린츠", "Vasas": "바사시", "Cercle Brugge": "세르클 브뤼헤", "RAAL La Louvière": "라 루비에르",
  "Austria Vienna (Am)": "아우스트리아 빈 (아마추어)"
};

// ==========================
// 🔥 Logic B: 시간 가중치 폼 계산 함수
// ==========================
function calcForm(matches: any[], isAttack: boolean) {
  if (matches.length === 0) return 1.3;
  let total = 0, weightSum = 0;
  matches.forEach((m) => {
    const days = (Date.now() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
    const timeWeight = Math.exp(-days / 30);
    const val = isAttack ? m.goals : m.conceded;
    total += val * timeWeight;
    weightSum += timeWeight;
  });
  const avg = total / weightSum;
  return isAttack ? Math.max(0.5, avg) : Math.max(0.3, avg);
}

function factorial(n: number): number { return n <= 1 ? 1 : n * factorial(n - 1); }
function poissonProb(lambda: number, k: number) { return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k); }

function poisson(homeGoals: number, awayGoals: number) {
  const max = 6;
  let matrix = [];
  for (let i = 0; i <= max; i++) {
    for (let j = 0; j <= max; j++) {
      const p = poissonProb(homeGoals, i) * poissonProb(awayGoals, j);
      matrix.push({ homeScore: i, awayScore: j, p });
    }
  }
  const homeWin = matrix.filter((m) => m.homeScore > m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const draw = matrix.filter((m) => m.homeScore === m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const awayWin = matrix.filter((m) => m.homeScore < m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const total = homeWin + draw + awayWin;
  
  return {
    prob: { 
      home: Math.round((homeWin / total) * 100), 
      draw: Math.round((draw / total) * 100), 
      away: Math.round((awayWin / total) * 100) 
    }
  };
}

// ==========================
// 🛡️ API 보호용 글로벌 메모리 캐시 (기본 경기 방어막 완벽 탑재)
// ==========================
let fixturesCache: { [dateStr: string]: { timestamp: number, data: any } } = {}; // 🔥 기본 경기 데이터 1차 방어막!
let predictionCache: { [leagueSeason: string]: { timestamp: number, data: any[] } } = {};
let oddsCache: { [fixtureId: number]: { timestamp: number, data: any } } = {}; 
let standingsCache: { [leagueSeason: string]: { timestamp: number, data: any } } = {};
let eventsCache: { [fixtureId: number]: { timestamp: number, data: any[] } } = {};

const FIXTURES_CACHE_TTL = 1 * 60 * 1000; // 🔥 새로고침 연타 방지용 (1분 유지)
const CACHE_TTL = 60 * 60 * 1000; 
const ODDS_CACHE_TTL = 2 * 60 * 60 * 1000;
const STANDINGS_CACHE_TTL = 6 * 60 * 60 * 1000; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  const targetDateStr = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    const prevDate = new Date(targetDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const now = Date.now();

    const fetchAPI = (endpoint: string, params: string) => 
      fetch(`https://v3.football.api-sports.io/${endpoint}?${params}`, { 
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } 
      }).then(r => r.json());

    // 🔥 API 총알 방어용 캐시 체크 함수
    const getFixturesWithCache = async (dateString: string) => {
      if (fixturesCache[dateString] && (now - fixturesCache[dateString].timestamp < FIXTURES_CACHE_TTL)) {
        return fixturesCache[dateString].data;
      }
      const data = await fetchAPI('fixtures', `date=${dateString}`);
      fixturesCache[dateString] = { timestamp: now, data };
      return data;
    };

    const [targetData, prevData] = await Promise.all([
      getFixturesWithCache(targetDateStr),
      getFixturesWithCache(prevDateStr)
    ]);

    const allMatches = [...(targetData.response || []), ...(prevData.response || [])];

    const rawFilteredMatches = allMatches.filter((item: any) => {
      if (leagueNameMap[item.league.id] === undefined) return false;
      const matchDateKST = new Date(item.fixture.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
      return matchDateKST === targetDateStr;
    });

    const uniqueLeagues = new Set<string>();
    rawFilteredMatches.forEach((m: any) => { uniqueLeagues.add(`${m.league.id}-${m.league.season}`); });

    const standingsPromises = Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      if (!standingsCache[key] || now - standingsCache[key].timestamp > STANDINGS_CACHE_TTL) {
        const res = await fetchAPI('standings', `league=${leagueId}&season=${season}`);
        standingsCache[key] = { timestamp: now, data: res };
      }
      return standingsCache[key].data;
    });
    const standingsResults = await Promise.all(standingsPromises);

    const leagueAvgMap: { [key: string]: number } = {};
    const leagueStandingsMap: { [key: string]: any[] } = {};

    standingsResults.forEach((res: any) => {
      if (res && res.response && res.response.length > 0 && res.response[0].league.standings[0]) {
        const leagueInfo = res.response[0].league;
        const leagueKey = `${leagueInfo.id}-${leagueInfo.season}`;
        let totalGoals = 0, totalPlayed = 0;

        leagueStandingsMap[leagueKey] = leagueInfo.standings[0].map((t: any) => {
          const tName = t.team.name;
          const mappedName = typeof teamNameMap !== 'undefined' && teamNameMap[tName] ? teamNameMap[tName] : tName;
          return {
            rank: t.rank,
            team: mappedName,
            played: t.all.played,
            win: t.all.win,
            draw: t.all.draw,
            lose: t.all.lose,
            goalDiff: t.goalsDiff,
            points: t.points
          };
        });

        leagueInfo.standings[0].forEach((team: any) => {
          if (team.all && team.all.goals && team.all.goals.for !== undefined) {
            totalGoals += team.all.goals.for;
            totalPlayed += team.all.played;
          }
        });
        leagueAvgMap[leagueKey] = totalPlayed > 0 ? totalGoals / totalPlayed : 1.3;
      }
    });

    await Promise.all(Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      if (!predictionCache[key] || now - predictionCache[key].timestamp > CACHE_TTL) {
        const pastMatchesRes = await fetchAPI('fixtures', `league=${leagueId}&season=${season}&status=FT`);
        predictionCache[key] = { timestamp: now, data: pastMatchesRes.response || [] };
      }
    }));

    const fixturesToFetchOdds = rawFilteredMatches.filter(item => {
      const fId = item.fixture.id;
      return !oddsCache[fId] || now - oddsCache[fId].timestamp > ODDS_CACHE_TTL;
    });

    const batchSize = 5; 
    for (let i = 0; i < fixturesToFetchOdds.length; i += batchSize) {
      const batch = fixturesToFetchOdds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item: any) => {
        const fId = item.fixture.id;
        try {
          const oddsRes = await fetchAPI('odds', `fixture=${fId}&bet=1`);
          let oddsData = null;
          
          if (oddsRes && oddsRes.response && oddsRes.response.length > 0) {
            let bookmaker = oddsRes.response[0].bookmakers.find((b: any) => b.id === 8 || b.name === 'Bet365');
            if (!bookmaker) bookmaker = oddsRes.response[0].bookmakers[0]; 

            const market = bookmaker?.bets[0];
            if (market) {
              oddsData = {
                home: market.values.find((v: any) => v.value === 'Home' || v.value === '1')?.odd,
                draw: market.values.find((v: any) => v.value === 'Draw' || v.value === 'X')?.odd,
                away: market.values.find((v: any) => v.value === 'Away' || v.value === '2')?.odd
              };
            }
          }
          oddsCache[fId] = { timestamp: now, data: oddsData };
        } catch (e) {
          console.error(`Odds fetch failed for fixture ${fId}`, e);
          oddsCache[fId] = { timestamp: now, data: null };
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const fixturesToFetchEvents = rawFilteredMatches.filter((item: any) => {
      const fId = item.fixture.id;
      const status = item.fixture.status.short;
      
      if (status === 'NS') return false; 
      
      const cached = eventsCache[fId];
      if (!cached) return true; 
      
      const isFinished = ['FT', 'AET', 'PEN'].includes(status);
      const ttl = isFinished ? 24 * 60 * 60 * 1000 : 2 * 60 * 1000;
      
      return now - cached.timestamp > ttl;
    });

    for (let i = 0; i < fixturesToFetchEvents.length; i += batchSize) {
      const batch = fixturesToFetchEvents.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item: any) => {
        const fId = item.fixture.id;
        try {
          const eventsRes = await fetchAPI('fixtures/events', `fixture=${fId}`);
          eventsCache[fId] = { timestamp: now, data: eventsRes.response || [] };
        } catch (e) {
          console.error(`Events fetch failed for fixture ${fId}`, e);
          eventsCache[fId] = { timestamp: now, data: [] };
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const filteredMatches = rawFilteredMatches.map((item: any) => {
      const hName = item.teams.home.name;
      const aName = item.teams.away.name;
      const homeId = item.teams.home.id;
      const awayId = item.teams.away.id;
      const leagueKey = `${item.league.id}-${item.league.season}`;
      
      const pastMatches = predictionCache[leagueKey]?.data || [];
      const validPastMatches = pastMatches.filter((m: any) => m.fixture.id !== item.fixture.id);
      const leagueAvgGoals = leagueAvgMap[leagueKey] || 1.3;

      const rawEvents = eventsCache[item.fixture.id]?.data || [];
      const mappedEvents = rawEvents.map((ev: any) => {
        let type = "";
        if (ev.type === "Goal") type = "goal";
        else if (ev.type === "Card" && ev.detail.includes("Yellow")) type = "yellow";
        else if (ev.type === "Card" && ev.detail.includes("Red")) type = "red";
        else if (ev.type === "subst") type = "sub";

        if (!type) return null; 

        return {
          minute: ev.time.elapsed,
          team: ev.team.id === homeId ? "home" : "away",
          type: type,
          player: ev.player?.name,
          playerOut: type === "sub" ? ev.player?.name : undefined,
          playerIn: type === "sub" ? ev.assist?.name : undefined
        };
      }).filter((e: any) => e !== null); 

      const getRecentMatches = (teamId: number, targetMatches: any[]) => {
        return targetMatches
          .filter((m: any) => m.teams.home.id === teamId || m.teams.away.id === teamId)
          .sort((a: any, b: any) => b.fixture.timestamp - a.fixture.timestamp)
          .slice(0, 5) 
          .map((m: any) => {
            const isHome = m.teams.home.id === teamId;
            return { 
              date: m.fixture.date, 
              isHome, 
              goals: isHome ? m.goals.home : m.goals.away, 
              conceded: isHome ? m.goals.away : m.goals.home
            };
          });
      };

      const homeRecent = getRecentMatches(homeId, validPastMatches);
      const awayRecent = getRecentMatches(awayId, validPastMatches);

      const homeAttack = calcForm(homeRecent.filter((m: any) => m.isHome), true);
      const homeDefense = calcForm(homeRecent.filter((m: any) => m.isHome), false);
      const awayAttack = calcForm(awayRecent.filter((m: any) => !m.isHome), true);
      const awayDefense = calcForm(awayRecent.filter((m: any) => !m.isHome), false);

      const expectedHomeGoals = Math.max(0.5, homeAttack * (awayDefense / leagueAvgGoals) * 1.1);
      const expectedAwayGoals = Math.max(0.5, awayAttack * (homeDefense / leagueAvgGoals) * 0.9);

      const logicBPredictions = poisson(expectedHomeGoals, expectedAwayGoals);
      const logicBProbHome = logicBPredictions.prob.home;
      const logicBProbDraw = logicBPredictions.prob.draw;
      const logicBProbAway = logicBPredictions.prob.away;

      let logicCProbHome = 33, logicCProbDraw = 33, logicCProbAway = 34;
      let hasOdds = false;
      
      const matchOdds = oddsCache[item.fixture.id]?.data || null;
      if (matchOdds && matchOdds.home && matchOdds.draw && matchOdds.away) {
        const invHome = 1 / parseFloat(matchOdds.home);
        const invDraw = 1 / parseFloat(matchOdds.draw);
        const invAway = 1 / parseFloat(matchOdds.away);
        const totalInv = invHome + invDraw + invAway;

        logicCProbHome = (invHome / totalInv) * 100;
        logicCProbDraw = (invDraw / totalInv) * 100;
        logicCProbAway = (invAway / totalInv) * 100;
        hasOdds = true;
      }

      let finalProbHome = logicBProbHome;
      let finalProbDraw = logicBProbDraw;
      let finalProbAway = logicBProbAway;

      if (hasOdds) {
        finalProbHome = Math.round((logicBProbHome * 0.6) + (logicCProbHome * 0.4));
        finalProbDraw = Math.round((logicBProbDraw * 0.6) + (logicCProbDraw * 0.4));
        finalProbAway = Math.max(0, 100 - finalProbHome - finalProbDraw); 
      }

      let predictHome = Math.round(expectedHomeGoals);
      let predictAway = Math.round(expectedAwayGoals);

      if (predictHome === predictAway) {
        if (finalProbHome - finalProbAway >= 10) predictHome += 1;
        else if (finalProbAway - finalProbHome >= 10) predictAway += 1;
      }

      const kstDate = new Date(new Date(item.fixture.date).toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const m = kstDate.getMonth() + 1;
      const d = kstDate.getDate();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const w = days[kstDate.getDay()];
      const h = String(kstDate.getHours()).padStart(2, '0');
      const min = String(kstDate.getMinutes()).padStart(2, '0');
      const customKorTime = `${m}/${d} (${w}) ${h}:${min}`;

      return {
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: leagueNameMap[item.league.id],
        home: teamNameMap[hName] || hName,
        away: teamNameMap[aName] || aName,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        status: item.fixture.status.short,
        elapsed: item.fixture.status.elapsed,
        korTime: customKorTime, 
        predict: { home: predictHome, away: predictAway },
        probs: { home: finalProbHome, draw: finalProbDraw, away: finalProbAway },
        odds: matchOdds,
        events: mappedEvents,
        standings: leagueStandingsMap[leagueKey] || [] 
      };
    })
    .sort((a: any, b: any) => {
      const statusOrder: any = { 'LIVE': 0, '1H': 0, 'HT': 0, '2H': 0, 'ET': 0, 'P': 0, 'BT': 0, 'NS': 1, 'FT': 2 };
      const orderA = statusOrder[a.status] ?? 3;
      const orderB = statusOrder[b.status] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return a.timestamp - b.timestamp;
    });

    return res.status(200).json({ matches: filteredMatches });
  } catch (error) {
    console.error("Match Fetch Error:", error);
    return res.status(200).json({ matches: [] }); // 🔥 쉼표 오류 시 빈 데이터를 내려줌
  }
}
