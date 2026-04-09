import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [1. 리그 한글 매핑 리스트 - 지정된 국가 및 핵심 대회만 서비스]
const leagueNameMap: { [key: number]: string } = {
  // 🌍 유럽 (Europe)
  // 잉글랜드
  39: "잉글랜드 프리미어리그", 40: "잉글랜드 챔피언십", 45: "잉글랜드 FA컵", 48: "EFL컵",
  // 스페인
  140: "스페인 라리가", 141: "스페인 세군다 디비시온", 143: "코파 델 레이",
  // 독일
  78: "독일 분데스리가", 79: "독일 2. 분데스리가", 81: "DFB 포칼",
  // 이탈리아
  135: "이탈리아 세리에 A", 136: "이탈리아 세리에 B", 137: "코파 이탈리아",
  // 프랑스
  61: "프랑스 리그 앙", 62: "프랑스 리그 두", 66: "쿠프 드 프랑스",
  // 네덜란드
  88: "네덜란드 에레디비시", 89: "네덜란드 에이르스터 디비시", 90: "네덜란드 KNVB 베이커",
  // 스코틀랜드
  179: "스코틀랜드 프리미어십", 180: "스코틀랜드 챔피언십", 183: "스코틀랜드 컵",
  // 포르투갈
  94: "포르투갈 프리메이라리가", 95: "리가 포르투갈 2", 96: "타사 드 포르투갈",
  // 튀르키예
  203: "튀르키예 수페르리그", 204: "튀르키예 1. 리그", 205: "튀르키예 컵",
  // 그리스
  197: "그리스 슈퍼리그 1", 198: "그리스 슈퍼리그 2", 199: "그리스 컵",
  // 폴란드
  106: "폴란드 엑스트라클라사", 107: "폴란드 I 리가", 108: "폴란드 컵",
  // 노르웨이
  103: "노르웨이 엘리테세리엔", 104: "노르웨이 1. 디비전", 105: "노르웨이 컵",
  // 덴마크
  119: "덴마크 수페르리가", 120: "덴마크 1. 디비전", 121: "덴마크 DBU 포칼렌",
  // 불가리아
  172: "불가리아 1부 리그", 173: "불가리아 2부 리그", 174: "불가리아 컵",
  // 헝가리
  271: "헝가리 NB I", 272: "헝가리 NB II", 273: "헝가리 머저르 쿠퍼",
  // 크로아티아
  218: "크로아티아 HNL", 219: "크로아티아 Prva NL", 220: "크로아티아 컵",
  // 벨기에
  144: "벨기에 주필러 프로리그", 145: "벨기에 챌린저 프로리그", 146: "벨기에 컵",
  // 스위스
  207: "스위스 슈퍼리그", 208: "스위스 챌린지 리그", 209: "스위스 컵",
  // 아일랜드
  357: "아일랜드 프리미어 디비전", 358: "아일랜드 1부 디비전", 359: "아일랜드 FAI 컵",

  // 🌏 아시아 (Asia)
  // 대한민국
  292: "K리그 1", 293: "K리그 2", 295: "코리아컵",
  // 일본
  98: "J1 리그", 99: "J2 리그", 102: "일본 일왕배", 101: "J리그컵",
  // 중국
  169: "중국 슈퍼리그", 170: "중국 갑급 리그", 171: "중국 CFA 컵",

  // 🌎 아메리카 (America)
  // 미국
  253: "미국 MLS", 255: "미국 USL 챔피언십", 257: "미국 US 오픈컵",
  // 멕시코
  262: "멕시코 리가 MX", 263: "멕시코 리가 데 익스판시온", 264: "멕시코 코파 MX",
  // 브라질
  71: "브라질 세리에 A", 72: "브라질 세리에 B", 73: "브라질 코파 두 브라질",
  // 아르헨티나
  128: "아르헨티나 리가 프로페셔널", 129: "아르헨티나 프리메라 나시오날", 130: "아르헨티나 코파 아르헨티나",

  // 🦘 오세아니아 (Oceania)
  // 호주
  188: "호주 A-리그", 189: "호주 오스트레일리아 컵",

  // 🏆 주요 국제 대회 & 대륙간 클럽 대회 (International)
  1: "FIFA 월드컵",
  4: "UEFA 유로",
  5: "UEFA 네이션스 리그",
  9: "코파 아메리카",
  2: "UEFA 챔피언스리그",
  3: "UEFA 유로파리그",
  848: "UEFA 유로파 컨퍼런스리그",
  13: "코파 리베르타도레스",
  17: "AFC 챔피언스리그"
};

// [2. 주요 150개 팀 한글 매핑 리스트]
// 사장님, 아래 리스트에 없는 팀은 자동으로 영문명이 노출됩니다. 
// 나중에 영문명을 보고 여기에 한 줄씩 추가만 하시면 바로 한글로 바뀝니다.
const teamNameMap: { [key: string]: string } = {
  "1. FC Heidenheim": "하이덴하임", "1. FC Kaiserslautern": "카이저슬라우테른", "1. FC Nürnberg": "뉘른베르크", "1899 Hoffenheim": "호펜하임", "2 de Mayo": "2 데 마요", "24 Erzincanspor": "에르진잔스포르", "AC Horsens": "호르센스", "AC Milan": "AC 밀란", "AD Ceuta FC": "AD 세우타", "ADO Den Haag": "ADO 덴하흐",
  "ADT": "ADT", "AEK Athens": "AEK 아테네", "AEK Athens FC": "AEK 아테네", "AGF Aarhus": "AGF 오르후스", "AS Roma": "AS 로마", "AVS": "AVS", "AZ Alkmaar": "AZ 알크마르", "Aalborg": "올보르", "Aalesund": "올레순", "Aarhus": "오르후스",
  "Aarhus Fremad": "오르후스 프레마드", "Aberdeen": "애버딘", "Academico Viseu": "아카데미코 비제우", "Acassuso": "아카수소", "Adana 01 FK": "아다나 01 FK", "Adana Demirspor": "아다나 데미르스포르", "Adelaide United": "애들레이드 유나이티드", "Admira Wacker": "아드미라 바커", "Aguilas Doradas": "아길라스 도라다스", "Airdrie United": "에어드리 유나이티드",
  "Airdrieonians": "에어드리오니언스", "Ajaccio": "아작시오", "Ajax": "아약스", "Ajman": "아지만", "Al Ahli": "알 아흘리", "Al Ahli Doha": "알 아흘리 도하", "Al Akhdoud": "알 아크두드", "Al Ettifaq": "알 이티파크", "Al Fateh": "알 파테흐", "Al Fayha": "알 파이하",
  "Al Khaleej": "알 칼리지", "Al Kholood": "알 콜루드", "Al Orubah": "알 오루바", "Al Qadisiyah": "알 카디시야", "Al Raed": "알 라에드", "Al Riyadh": "알 리야드", "Al Sadd": "알 사드", "Al Shabab": "알 샤바브", "Al Shahaniya": "알 샤하니야", "Al Shamal": "알 샤말",
  "Al Taawon": "알 타아운", "Al Wakrah": "알 와크라", "Al Wehda": "알 웨흐다", "Al-Ahli Amman": "알 아흘리 암만", "Al-Ahli Jeddah": "알 아흘리 제다", "Al-Ain": "알 아인", "Al-Arabi SC": "알 아라비", "Al-Baqa'a": "알 바카아", "Al-Bataeh": "알 바타에흐", "Al-Duhail SC": "알 두하일",
  "Al-Faisaly Amman": "알 파이살리 암만", "Al-Fayha": "알 파이하", "Al-Gharafa": "알 가라파", "Al-Hilal Saudi FC": "알 힐랄", "Al-Hussein": "알 후세인", "Al-Ittihad FC": "알 이티하드", "Al-Ittihad Kalba": "칼바", "Al-Jazeera Amman": "알 자지라 암만", "Al-Jazira": "알 자지라", "Al-Khor": "알 코르",
  "Al-Nasr": "알 나스르", "Al-Nassr": "알 나스르", "Al-Rayyan SC": "알 라이얀", "Al-Salt": "알 살트", "Al-Sareeh": "알 사리흐", "Al-Sharjah": "알 샤르자", "Al-Uruba": "알 우루바", "Al-Wasl": "알 와슬", "Al-Wehdat": "알 웨흐다트", "Alaves": "알라베스",
  "Albacete": "알바세테", "Albirex Niigata": "알비렉스 니가타", "Aldosivi": "알도시비", "Alebrijes de Oaxaca": "알레브리헤스 데 오아하카", "Alianza": "알리안사", "Alianza Atlético": "알리안사 아틀레티코", "Alianza Lima": "알리안사 리마", "Alanyaspor": "알라니아스포르", "Alloa Athletic": "알로아 애슬레틱", "Almere City": "알메러 시티",
  "Altinordu": "알튼오르두", "Alverca": "알베르카", "Always Ready": "올웨이즈 레디", "Amed": "아메드", "Amed SK": "아메드 SK", "America de Cali": "아메리카 데 칼리", "Amiens": "아미앵", "Anderlecht": "안데를레흐트", "Angers": "앙제", "Ankaragucu": "앙카라귀쥐",
  "Ankaragücü": "앙카라귀쥐", "Ankaraspor": "앙카라스포르", "Annecy": "안시", "Ansan Greeners": "안산 그리너스", "Antalyaspor": "안탈리아스포르", "Antwerp": "앤트워프", "Arbroath": "아브로스", "Arda Kardzhali": "아르다 카르잘리", "Arema": "아레마", "Argentinos JRS": "아르헨티노스 주니어스",
  "Aris": "아리스", "Arka Gdynia": "아르카 그디니아", "Arminia Bielefeld": "아르미니아 빌레펠트", "Arouca": "아로카", "Arsenal": "아스널", "Asteras Tripolis": "아스테라스 트리폴리스", "Aston Villa": "아스톤 빌라", "Atalanta": "아탈란타", "Athens Kallithea": "아테네 칼리테아", "Athletic Club": "빌바오",
  "Athletico Paranaense": "아틀레치쿠 파라나엔시", "Athlone Town": "애슬론 타운", "Atlanta": "아틀란타", "Atlanta United": "애틀랜타 유나이티드", "Atlas": "아틀라스", "Atletico Bucaramanga": "아틀레티코 부카라망가", "Atletico Goianiense": "아틀레치쿠 고이아니엔시", "Atletico Grau": "아틀레티코 그라우", "Atletico Madrid": "AT 마드리드", "Atletico Mineiro": "아틀레치쿠 미네이루",
  "Atletico Nacional": "아틀레티코 나시오날", "Atletico Ottawa": "아틀레티코 오타와", "Atletico San Luis": "아틀레티코 산루이스", "Atletico Tucuman": "아틀레티코 투쿠만", "Atromitos": "아트로미토스", "Aucas": "아우카스", "Auckland": "오클랜드", "Auckland FC": "오클랜드 FC", "Audax Italiano": "아우닥스 이탈리아노", "Augsburg": "아우크스부르크",
  "Aurora": "아우로라", "Austin FC": "오스틴 FC", "Austria Klagenfurt": "아우스트리아 클라겐푸르트", "Austria Lustenau": "아우스트리아 루스테나우", "Austria Salzburg": "아우스트리아 잘츠부르크", "Austria Vienna (Am)": "아우스트리아 빈 (아마추어)", "Auxerre": "오세르", "Avispa Fukuoka": "아비스파 후쿠오카", "Ayr Utd": "에어 유나이티드", "Ayr United": "에어 유나이티드",
  "BG Pathum United": "BG 빠툼 유나이티드", "Bahia": "바이아", "Bali United": "발리 유나이티드", "Bandirmaspor": "반드르마스포르", "Banfield": "반필드", "Bangkok United": "방콕 유나이티드", "Bani Yas": "바니야스", "Barcelona": "바르셀로나", "Barcelona SC": "바르셀로나 SC", "Bari": "바리",
  "Barito Putera": "바리토 푸테라", "Basaksehir": "바샥셰히르", "Basel": "바젤", "Bastia": "바스티아", "Başakşehir": "바샥셰히르", "Batman Petrolspor": "배트맨 페트롤스포르", "Bayer Leverkusen": "레버쿠젠", "Bayern Munich": "바이에른 뮌헨", "Bayern München": "바이에른 뮌헨", "Beerschot VA": "비어스호트 VA",
  "Beijing Guoan": "베이징 궈안", "Belasitsa": "벨라시차", "Belconnen United": "벨코넨 유나이티드", "Belgrano": "벨그라노", "Belgrano Cordoba": "벨그라노 코르도바", "Bellinzona": "벨린초나", "Benfica": "벤피카", "Benfica B": "벤피카 B", "Beroe": "베로에", "Beykoz Anadolu": "베이코즈 아나돌루",
  "Beyoğlu Yeni Çarşı": "베이욜루 예니 차르시", "Beşiktaş": "베식타시", "Binh Dinh": "빈딘", "Binh Duong": "빈즈엉", "Blackburn": "블랙번", "Blaublitz Akita": "블라우블리츠 아키타", "Blooming": "블루밍", "Boca Juniors": "보카 주니어스", "Bodo/Glimt": "보되/글림트", "Bodrum FK": "보드룸 FK",
  "Bodrumspor": "보드룸스포르", "Bohemians": "보헤미안스", "Bologna": "볼로냐", "Boluspor": "볼루스포르", "Bolívar": "볼리바르", "Borneo": "보르네오", "Borussia Dortmund": "도르트문트", "Borussia Monchengladbach": "글라트바흐", "Borussia Mönchengladbach": "묀헨글라트바흐", "Boston River": "보스턴 리버",
  "Botafogo": "보타포구", "Botafogo SP": "보타포구 SP", "Botev Plovdiv": "보테프 플로브디프", "Botev Vratsa": "보테프 브라차", "Boulogne": "불로뉴", "Bournemouth": "본머스", "Boyacá Chicó": "보야카 치코", "Bragantino": "브라간치누", "Brann": "브란", "Bray Wanderers": "브레이 원더러스",
  "Brentford": "브렌트포드", "Brescia": "브레시아", "Brest": "브레스투아", "Brighton": "브라이튼", "Brindabella": "브린다벨라", "Brisbane Roar": "브리즈번 로어", "Bristol City": "브리스톨 시티", "Brondby": "브뢴뷔", "Bryne": "브뤼네", "Bucaspor 1928": "부카스포르 1928",
  "Bucheon FC 1995": "부천 FC 1995", "Budafoki LC": "부다포키", "Burgos": "부르고스", "Buriram United": "부리람 유나이티드", "Burnley": "번리", "Busan I Park": "부산 아이파크", "Busan I'Park": "부산 아이파크", "Busan Transportation": "부산교통공사", "CA La Paz": "라 파스", "CDS Tampico Madero": "탐피코 마데로",
  "CSKA 1948": "CSKA 1948", "CSKA Sofia": "CSKA 소피아", "CSKA Sofia II": "CSKA 소피아 2군", "Cadiz": "카디스", "Caen": "캉", "Cagliari": "칼리아리", "Cambuur": "캄뷔르", "Canberra FC": "캔버라 FC", "Canberra Juventus": "캔버라 유벤투스", "Canberra Olympic": "캔버라 올림픽",
  "Canberra White Eagles": "캔버라 화이트 이글스", "Cangzhou Mighty Lions": "창저우 마이티 라이온즈", "Cardiff": "카디프", "Carlos Mannucci": "카를로스 만누치", "Carrarese": "카라레세", "Cartagena": "카르타헤나", "Casa Pia": "카사 피아", "Castellon": "카스테욘", "Catanzaro": "카탄차로", "Cavalry FC": "캐벌리 FC",
  "Celta Vigo": "셀타 비고", "Celtic": "셀틱", "Central Coast Mariners": "센트럴 코스트 매리너스", "Cercle Brugge": "세르클 브뤼헤", "Cercle Brugge KSV": "세르클 브뤼허", "Cerezo Osaka": "세레소 Osaka", "Cerro": "세로", "Cerro Largo": "세로 라르고", "Cerro Porteno": "세로 포르테뇨", "Cerro Porteño": "세로 포르테뇨",
  "Cesena": "체세나", "Changchun Yatai": "창춘 야타이", "Changwon City": "창원시청", "Charleroi": "샤를루아", "Charlton": "찰턴", "Charlotte FC": "샬럿 FC", "Chaves": "샤베스", "Chelsea": "첼시", "Chengdu Rongcheng": "청두 룽청", "Chennaiyin": "첸나이인",
  "Cheonan City": "천안 시티", "Cherno More": "체르노 모레", "Cherno More Varna": "체르노 모레 바르나", "Chernomorets 1919 Burgas": "체르노모레츠 부르가스", "Chiangrai United": "치앙라이 유나이티드", "Chicago Fire": "시카고 파이어", "Chongqing Tongliang Long": "충칭 통량룽", "Chongqing Tonglianglong": "충칭 퉁량룽", "Chrobry Głogów": "크로브리 그워구프", "Chungbuk Cheongju": "충북 청주",
  "Chungnam Asan": "충남 아산", "Cienciano": "시엔시아노", "Cittadella": "치타델라", "Clermont Foot": "클레르몽", "Club America": "클루브 아메리카", "Club Brugge KV": "클뤼프 브뤼허", "Club Nacional": "나시오날", "Club Queretaro": "케레타로", "Club Tijuana": "클루브 티후아나", "Cobh Ramblers": "코브 램블러스",
  "Cobreloa": "코브렐로아", "Cobresal": "코브레살", "Colo Colo": "콜로콜로", "Colorado Rapids": "콜로라도 래피즈", "Columbus Crew": "콜럼버스 크루", "Comerciantes Unidos": "코메르시안테스 우니도스", "Como": "코모", "Cong An Ha Noi": "공안 하노이", "Consadole Sapporo": "콘사도레 삿포로", "Cooma Tigers FC": "쿠마 타이거스",
  "Coquimbo Unido": "코킴보 우니도", "Cordoba": "코르도바", "Corinthians": "코린치앙스", "Cork City": "코크 시티", "Corum FK": "초룸 FK", "Cosenza": "코센차", "Cove Rangers": "코브 레인저스", "Coventry": "코번트리", "Cracovia": "크라코비아", "Cremonese": "크레모네세",
  "Criciuma": "크리시우마", "Cruz Azul": "크루스 아술", "Cruzeiro": "크루제이루", "Crystal Palace": "크리스탈 팰리스", "Cuiaba": "쿠이아바", "Cumbayá": "쿰바야", "Cusco": "쿠스코", "D.C. United": "DC 유나이티드", "Daegu FC": "대구 FC", "Daejeon Citizen": "대전 하나시티즌",
  "Daejeon Korail": "대전 코레일", "Dalian Young Boy": "다롄 영 보이", "Dalian Zhixing": "다롄 즈싱", "Damac": "다막", "Dangjin Citizen": "당진시민", "Danubio": "다누비오", "Darmstadt 98": "다름슈타트", "De Graafschap": "더 흐라프스합", "Debrecen": "데브레첸", "Defensa Y Justicia": "데펜사 이 후스티시아",
  "Defensor Sporting": "데펜소르 스포르팅", "Delfin": "델핀", "Den Bosch": "덴보스", "Dender": "덴데르", "Deportes Copiapó": "데포르테스 코피아포", "Deportes Iquique": "데포르테스 이키케", "Deportes Tolima": "데포르테스 톨리마", "Deportivo Armenio": "데포르티보 아르메니오", "Deportivo Cali": "데포르티보 칼리", "Deportivo Camioneros": "카미오네로스",
  "Deportivo Cuenca": "데포르티보 쿠엥카", "Deportivo Garcilaso": "데포르티보 가르실라소", "Deportivo La Coruna": "데포르티보 라코루냐", "Deportivo La Guaira": "데포르티보 라 과이라", "Deportivo Maldonado": "데포르티보 말도나도", "Deportivo Pasto": "데포르티보 파스토", "Deportivo Pereira": "데포르티보 페레이라", "Derby": "더비 카운티", "Derry City": "데리 시티", "Dewa United": "데와 유나이티드",
  "Dibba Al Hisn": "딥바 알 히슨", "Dinamo Zagreb": "디나모 자그레브", "Diosgyor": "디오시죄르", "Diosgyori VTK": "디오슈죄르", "Dobrudzha": "도브루자", "Dong A Thanh Hoa": "동아 타인호아", "Dordrecht": "도르드레흐트", "Drogheda United": "드로헤다 유나이티드", "Dundalk": "던독", "Dundee": "던디",
  "Dundee FC": "던디 FC", "Dundee Utd": "던디 유나이티드", "Dunfermline": "던펌린", "Dunkerque": "됭케르크", "Dynamo Dresden": "디나모 드레스덴", "East Bengal": "이스트 벵골", "East Fife": "이스트 파이프", "Egersund": "에게르순", "Ehime FC": "에히메 FC", "Eibar": "에이바르",
  "Eintracht Braunschweig": "브라운슈바이크", "Eintracht Frankfurt": "프랑크푸르트", "El Gouna FC": "엘 구나 FC", "El Nacional": "엘 나시오날", "Elazığspor": "엘라즈으스포르", "Elche": "엘체", "Eldense": "엘덴세", "Emmen": "에먼", "Empoli": "엠폴리", "Envigado": "엔비가도",
  "Erbaaspor": "에르바스포르", "Erzurumspor": "에르주룸스포르", "Erzurumspor FK": "에르주룸스포르", "Esbjerg": "에스비에르", "Esenler Erokspor": "에센레르 에록스포르", "Espanyol": "에스파뇰", "Estoril": "에스토릴", "Estudiantes": "에스투디안테스", "Estudiantes L.P.": "에스투디안테스", "Estudiantes de Rio Cuarto": "에스투디안테스 리오쿠아르토",
  "Estrela": "이스트렐라", "Everton": "에버턴", "Everton de Viña del Mar": "에버턴 데 비냐 델 마르", "Excelsior": "엑셀시오르", "Eyupspor": "에위프스포르", "FC Aarau": "아라우", "FC Anyang": "FC 안양", "FC Augsburg": "아우크스부르크", "FC Cincinnati": "FC 신시내티", "FC Copenhagen": "FC 코펜하겐",
  "FC Dallas": "FC 댈러스", "FC Eindhoven": "FC 에인트호번", "FC Gifu": "FC 기후", "FC Goa": "FC 고아", "FC Koln": "쾰른", "FC Liefering": "리퍼링", "FC Luzern": "FC 루체른", "FC Midtjylland": "FC 미트윌란", "FC Nordsjaelland": "FC 노르셸란", "FC Porto": "FC 포르투",
  "FC Porto B": "포르투 B", "FC Seoul": "FC 서울", "FC Tokyo": "FC 도쿄", "FC Vaduz": "파두츠", "FC Volendam": "FC 폴렌담", "FC WIL 1900": "빌 1900", "FC Zurich": "FC 취리히", "FK Crvena Zvezda": "즈베즈다", "FK Haugesund": "하우게순", "FK Minyor Pernik": "미뇨르 페르니크",
  "Fagiano Okayama": "파지아노 오카야마", "Falkirk": "폴커크", "Famalicao": "파말리캉", "Farense": "파렌세", "Fehervar FC": "페헤르바르 FC", "Feirense": "페이렌세", "Felgueiras": "펠게이라스", "Felgueiras 1932": "펠게이라스", "Fenerbahce": "페네르바흐체", "Ferencvaros": "페렌츠바로시",
  "Ferencvarosi TC": "페렌츠바로시", "Ferrol": "페롤", "Feyenoord": "페예노르트", "Finn Harps": "핀 하프스", "Fiorentina": "피오렌티나", "Flamengo": "플라멩구", "Floridsdorfer AC": "플로리츠도르퍼", "Fluminense": "플루미넨시", "Forge FC": "포지 FC", "Fortaleza": "포르탈레자",
  "Fortaleza CEIF": "포르탈레사 CEIF", "Fortuna Düsseldorf": "뒤셀도르프", "Fortuna Sittard": "포르투나 시타르트", "Foshan Nanshi": "포산 난스", "Fratria": "프라트리아", "Fredrikstad": "프레드릭스타드", "Frosinone": "프로시노네", "FSV Mainz 05": "마인츠", "Fujieda MYFC": "후지에다 MYFC", "Fulham": "풀럼",
  "Future FC": "퓨처 FC", "GKS Katowice": "GKS 카토비체", "Galatasaray": "갈라타사라이", "Galway United": "골웨이 유나이티드", "Gamba Osaka": "감바 오사카", "Gangwon FC": "강원 FC", "Gaziantep FK": "가지안테프 FK", "Genclerbirligi": "겐츨레르비를리이", "Gençlerbirligi S.K.": "겐츨레르비를리이", "Genoa": "제노아",
  "Genk": "헹크", "Gent": "헨트", "Getafe": "헤타페", "Ghazl El Mehalla": "가즐 엘 마할라", "Gijon": "히혼", "Gil Vicente": "질 비센트", "Gimcheon Sangmu": "김천 상무", "Gimnasia L.P.": "힘나시아", "Gimpo FC": "김포 FC", "Girona": "지로나",
  "Go Ahead Eagles": "고 어헤드 이글스", "Godoy Cruz": "고도이 크루스", "Goias": "고이아스", "Gorica": "고리차", "Gornik Zabrze": "구르니크 자브제", "Granada": "그라나다", "Granada CF": "그라나다", "Grasshopper": "그라스호퍼", "Greenock Morton": "그리녹 모턴", "Gremio": "그레미우",
  "Grenoble": "그르노블", "Greuther Furth": "그로이터 퓌르트", "Groningen": "흐로닝언", "Guabirá": "과비라", "Guadalajara (Chivas)": "과달라하라 (치바스)", "Gualberto Villarroel": "과알베르토 비야로엘", "Guangxi Hengchen": "광시 헝천", "Guangxi Pingguo Haliao": "광시 핑궈 할랴오", "Guangzhou E-Power": "광저우 E-파워", "Guangzhou FC": "광저우 FC",
  "Guarani": "과라니", "Guimaraes": "비토리아 기마랑이스", "Guingamp": "갱강", "Gwangju FC": "광주 FC", "Gyeongju HNP": "경주 한수원", "Gyeongnam FC": "경남 FC", "Gyor": "죄르", "Gyori ETO FC": "죄르 ETO", "Göztepe": "괴즈테페", "HB Koge": "HB 쾨게",
  "Ha Noi FC": "하노이 FC", "Hajduk Split": "하이두크 스플리트", "Halifax Wanderers": "핼리팩스 원더러스", "Ham-Kam": "함캄", "Hamburger SV": "함부르크", "Hamilton Academical": "해밀턴 아카데미컬", "Hangzhou Greentown": "항저우 그린타운", "Hannover 96": "하노버", "Haras El Hodood": "하라스 엘 호두드", "Hatayspor": "하타이스포르",
  "Haugesund": "하우게순", "Heart Of Midlothian": "하츠", "Hearts": "하츠", "Hebar 1918": "헤바르 1918", "Heerenveen": "헤이렌베인", "Heidenheim": "하이덴하임", "Heilongjiang Ice City": "헤이룽장 아이스시티", "Hellas Verona": "엘라스 베로나", "Helmond Sport": "헬몬트 스포르트", "Henan": "허난",
  "Henan Jianye": "허난 젠예", "Heracles": "헤라클레스", "Hertha BSC": "헤르타 베를린", "Hertha Berlin": "헤르타 베를린", "Hibernian": "히버니언", "Hillerød": "힐레뢰드", "Hobro": "호브로", "Hoffenheim": "호펜하임", "Holstein Kiel": "홀슈타인 킬", "Hong Linh Ha Tinh": "홍린 하띤",
  "Houston Dynamo": "휴스턴 다이너모", "Huachipato": "우아치파토", "Huesca": "우에스카", "Hull City": "헐 시티", "Huracan": "우라칸", "Hvidovre": "흐비도브레", "Hwaseong": "화성", "Hyderabad": "하이데라바드", "Imbabura": "임바부라", "Incheon United": "인천 유나이티드",
  "Independ. Rivadavia": "인데펜디엔테 리바다비아", "Independiente": "인디펜디엔테", "Independiente Medellin": "인데펜디엔테 메데진", "Independiente Medellín": "인디펜디엔테 메데인", "Independiente Petrolero": "인디펜디엔테 페트롤레로", "Independiente del Valle": "인디펜디엔테 델 바예", "Instituto Cordoba": "인스티투토 코르도바", "Inter": "인테르", "Inter Miami": "인터 마이애미", "Internacional": "인테르나시오나우",
  "Ipswich": "입스위치", "Istra 1961": "이스트라 1961", "Istanbulspor": "이스탄불스포르", "Iwaki FC": "이와키 FC", "Iğdır FK": "이그디르 FK", "JEF United Chiba": "제프 유나이티드 지바", "Jagiellonia": "야기엘로니아", "Jagiellonia Bialystok": "야기엘로니아 비아위스토크", "Jaguares de Córdoba": "하과레스 데 코르도바", "Jahn Regensburg": "얀 레겐스부르크",
  "Jamshedpur": "잠셰드푸르", "Jeju United": "제주 유나이티드", "Jeju United FC": "제주 유나이티드", "Jeonbuk Motors": "전북 현대", "Jeonnam Dragons": "전남 드래곤즈", "Johor Darul Ta'zim": "조호르 다룰 타짐", "Jong AZ": "용 AZ", "Jong Ajax": "용 아약스", "Jong PSV": "용 PSV", "Jong Utrecht": "용 위트레흐트",
  "Jubilo Iwata": "주빌로 이와타", "Junior": "주니오르", "Juve Stabia": "유베 스타비아", "Juventude": "주벤투지", "Juventus": "유벤투스", "KFUM Oslo": "KFUM 오슬로", "KV Mechelen": "KV 메헬렌", "Kagoshima United": "가고시마 유나이티드", "Kaiserslautern": "카이저슬라우테른", "Karacabey Belediyespor": "카라자베이 벨레디예스포르",
  "Karagumruk": "카라귐뤼크", "Karaman FK": "카라만 FK", "Karlsruher SC": "카를스루에", "Kashima Antlers": "가시마 앤틀러스", "Kashiwa Reysol": "가시와 레이솔", "Kasimpasa": "카슴파샤", "Kastamonuspor": "카스타모누스포르", "Kataller Toyama": "카탈레르 도야마", "Kawasaki Frontale": "가와사키 프론탈레", "Kayserispor": "카이세리스포르",
  "Kazincbarcikai": "카진크바르치카이", "Kecskemeti TE": "케치케메트 TE", "Kedah": "케다", "Kelantan Darul Naim": "클란탄 다룰 나임", "Kelty Hearts": "켈티 하츠", "Kepezspor": "케페즈스포르", "Kerala Blasters": "케랄라 블래스터스", "Kerry": "케리", "Keçiörengücü": "케치외렌귀쥐", "Khorfakkan": "코르파칸",
  "Kifisia": "키피시아", "Kilmarnock": "킬마녹", "Kocaelispor": "코자엘리스포르", "Kolding IF": "콜딩", "Kongsvinger": "콩스빙에르", "Konyaspor": "코냐스포르", "Korona Kielce": "코로나 키엘체", "Kortrijk": "코르트레이크", "Kristiansund": "크리스티안순", "Kristiansund BK": "크리스티안순",
  "Krumovgrad": "크루모브그라드", "Kuala Lumpur City": "쿠알라룸푸르 시티", "Kuching City": "쿠칭 시티", "Kyoto Sanga": "교토 상가", "LA Galaxy": "LA 갤럭시", "LASK Linz": "LASK 린츠", "LDU Quito": "LDU 키토", "LDU de Quito": "LDU 키토", "La Equidad": "라 에키다드", "Lamia": "라미아",
  "Lamphun Warriors": "람푼 워리어스", "Lanus": "라누스", "Larisa": "라리사", "Las Palmas": "라스팔마스", "Lausanne Sport": "로잔 스포르", "Laval": "라발", "Lazio": "라치오", "Le Havre": "르아브르", "Le Mans": "르망", "Lecce": "레체",
  "Lech Poznan": "레흐 포즈난", "Lechia Gdansk": "레히아 그단스크", "Leeds": "리즈", "Leganes": "레가네스", "Legia Warszawa": "레기아 바르샤바", "Leiria": "레이리아", "Leixoes": "레이숑이스 (레이소에스)", "Lens": "랑스", "Leon": "레온", "Levadiakos": "레바디아코스",
  "Levante": "레반테", "Levski Sofia": "레프스키 소피아", "Liaoning Tieli": "랴오닝 톄리", "Libertad": "리베르타드", "Libertad Asuncion": "리베르타드", "Lille": "릴", "Lillestrom": "릴레스트롬", "Liverpool": "리버풀", "Liverpool M.": "리버풀 몬테비데오", "Livingston": "리빙스턴",
  "Lokeren-Temse": "로케런-템세", "Lokomotiv G. Oryahovitsa": "로코모티브 고르나 오랴호비차", "Lokomotiv Plovdiv": "로코모티브 플로브디프", "Lokomotiv Sofia": "로코모티브 소피아", "Lokomotiva Zagreb": "로코모티바 자그레브", "Longford Town": "롱퍼드 타운", "Lorient": "로리앙", "Los Angeles FC": "LA FC", "Los Chankas": "로스 찬카스", "Loudoun United": "라우던 유나이티드",
  "Louisville City": "루이빌 시티", "Ludogorets": "루도고레츠", "Ludogorets II": "루도고레츠 2군", "Lugano": "루가노", "Luton": "루턴", "Lyn": "린", "Lyngby": "링비", "Lyon": "리옹", "Ma'an": "마안", "Maastricht": "마스트리흐트",
  "Macará": "마카라", "Macarthur FC": "맥아더 FC", "Machida Zelvia": "마치다 젤비아", "Madura United": "마두라 유나이티드", "Mafra": "마프라", "Magdeburg": "마그데부르크", "Malaga": "말라가", "Mallorca": "마요르카", "Malut United": "말루트 유나이티드", "Manchester City": "맨시티",
  "Manchester United": "맨체스터 유나이티드", "Manisa F.K.": "마니사 FK", "Mantova": "만토바", "Maritimo": "마리티무", "Marseille": "마르세유", "Martigues": "마르티그", "Mazatlan FC": "마사틀란 FC", "Mechelen": "메헬렌", "Meizhou Hakka": "메이저우 하카", "Meizhou Kejia": "메이저우 커자",
  "Melbourne City": "멜버른 시티", "Melbourne Victory": "멜버른 빅토리", "Melgar": "멜가르", "Metz": "메스", "Mezokovesd-zsory": "메조쾨베슈드", "Middelfart": "미델파르트", "Middlesbrough": "미들즈브러", "Midland": "미들랜드", "Miedz Legnica": "미에츠 레그니차", "Millonarios": "미요나리오스",
  "Millwall": "밀월", "Miramar Misiones": "미라마르 미시오네스", "Mirandes": "미란데스", "Mirassol": "미라솔", "Mito Hollyhock": "미토 홀리호크", "Modena": "모데나", "Moghayer Al-Sarhan": "모가예르 알 사르한", "Mohammedan": "모하메단", "Mohun Bagan": "모훈 바간", "Mokpo City": "목포시청",
  "Molde": "몰데", "Monaco": "모나코", "Monaro Panthers": "모나로 팬서스", "Montana": "몬타나", "Montedio Yamagata": "몬테디오 야마가타", "Monterrey": "몬테레이", "Montevideo Wanderers": "몬테비데오 원더러스", "Montpellier": "몽펠리에", "Montrose": "몬트로즈", "Monza": "몬차",
  "Moreirense": "모레이렌세", "Morton": "모턴", "Motherwell": "마더웰", "Motor Lublin": "모토르 루블린", "Muang Thong United": "무앙통 유나이티드", "Mumbai City": "뭄바이 시티", "Mushuc Runa": "무슈크 루나", "Muğlaspor": "무을라스포르", "NAC Breda": "NAC 브레다", "NEC Nijmegen": "NEC 네이메헌",
  "Nacional": "나시오날", "Nacional Asunción": "나시오날 아순시온", "Nacional Potosí": "나시오날 포토시", "Nagoya Grampus": "나고야 그램퍼스", "Nakhon Pathom": "나콘파톰", "Nakhon Ratchasima": "나콘랏차시마", "Nam Dinh": "남딘", "Nancy": "낭시", "Nantes": "낭트", "Nantong Zhiyun": "난퉁 즈윈",
  "Napoli": "나폴리", "Nashville SC": "내슈빌 SC", "Necaxa": "네카사", "Negeri Sembilan": "느그리 셈빌란", "Neuchatel Xamax FC": "뇌샤텔 자막스", "New England Revolution": "뉴잉글랜드 레볼루션", "New York City FC": "뉴욕 시티 FC", "New York Red Bulls": "뉴욕 레드불스", "Newcastle": "뉴캐슬", "Newcastle Jets": "뉴캐슬 제츠",
  "Newell's Old Boys": "뉴웰스 올드 보이스", "Nice": "니스", "Nieciecza": "니에치에차", "Ningbo Professional": "닝보 프로페셔널", "Nong Bua Pitchaya": "농부아 피차야", "NorthEast United": "노스이스트 유나이티드", "Norwich": "노리치", "Nottingham Forest": "노팅엄", "Nueva Chicago": "누에바 시카고", "Nurnberg": "뉘른베르크",
  "Nyiregyhaza": "니레지하저", "O'Higgins": "오이긴스", "ODD Ballklubb": "오드", "OFI Crete": "OFI 크레타", "Odd": "오드", "Odense": "오덴세", "Odisha FC": "오디샤 FC", "Odra Opole": "오드라 오폴레", "Olimpia": "올림피아", "Olympiacos": "올림피아코스",
  "Oliveirense": "올리베이렌세", "Once Caldas": "온세 칼다스", "Orange County SC": "오렌지 카운티 SC", "Orense": "오렌세", "Oriente Petrolero": "오리엔테 페트롤레로", "Orlando City SC": "올랜도 시티", "Osaka": "오사카", "Osasuna": "오사수나", "Osijek": "오시예크", "Oviedo": "오비에도",
  "Oxford United": "옥스퍼드 유나이티드", "PAOK": "PAOK (파오크)", "PAU": "포", "PDRM": "PDRM", "PEC Zwolle": "PEC 즈볼러", "PSBS Biak": "PSBS 비악", "PSIS Semarang": "PSIS 스마랑", "PSM Makassar": "PSM 마카사르", "PSS Sleman": "PSS 슬레만", "PSV Eindhoven": "PSV 에인트호번",
  "Pachuca": "파추카", "Pacific FC": "퍼시픽 FC", "Pacos Ferreira": "파수스 페헤이라", "Pacos de Ferreira": "파수스 드 페헤이라", "Paderborn 07": "파더보른", "Paju Citizen": "파주시민", "Paksi SE": "팍시 SE", "Palestino": "팔레스티노", "Palermo": "팔레르모", "Palmeiras": "파우메이라스",
  "Panathinaikos": "파나티나이코스", "Panetolikos": "파네톨리코스", "Panserraikos": "판세라이코스", "Paris FC": "파리 FC", "Paris Saint Germain": "PSG", "Parma": "파르마", "Partick": "파틱", "Partick Thistle": "파틱 시슬", "Patriotas Boyacá": "파트리오타스 보야카", "Penafiel": "페나피엘",
  "Penang": "페낭", "Pendikspor": "펜디크스포르", "Penarol": "페냐롤", "Peñarol": "페냐롤", "Perak": "페락", "Persebaya": "페르세바야", "Persib Bandung": "페르십 반둥", "Persija Jakarta": "페르시자 자카르타", "Persik Kediri": "페르식 케디리", "Persis Solo": "페르시스 솔로",
  "Pescara": "페스카라", "Peterhead": "피터헤드", "Pharco": "파르코", "Philadelphia Union": "필라델피아 유니언", "Piast Gliwice": "피아스트 글리비체", "Pirin Blagoevgrad": "피린 블라고에브그라드", "Pisa": "피사", "Platense": "플라텐세", "Plymouth": "플리머스", "Pocheon": "포천",
  "Pogon Grodzisk Mazowiecki": "포곤 그로지스크 마조비에츠키", "Pogon Szczecin": "포곤 슈체친", "Pohang Steelers": "포항 스틸러스", "Polonia Bytom": "폴로니아 비톰", "Polonia Warszawa": "폴로니아 바르샤바", "Port FC": "포트 FC", "Portimonense": "포르티모넨세", "Portland Timbers": "포틀랜드 팀버스", "Porto B": "포르투 B", "Portsmouth": "포츠머스",
  "Prachuap": "쁘라추압", "Preston": "프레스턴", "Preussen Munster": "프로이센 뮌스터", "Preußen Münster": "프로이센 뮌스터", "Progreso": "프로그레소", "Puebla": "푸에블라", "Pumas UNAM": "푸마스 UNAM", "Punjab": "펀자브", "Puskas Academia": "푸스카스 아카데미아", "Puskas Academy": "푸스카시 아카데미아",
  "Puszcza Niepolomice": "푸슈차 니에폴로미체", "Puszcza Niepołomice": "푸슈차 니에폴로미체", "QPR": "QPR", "Qatar SC": "카타르 SC", "Qingdao Hainiu": "칭다오 하이뉴", "Qingdao West Coast": "칭다오 웨스트코스트", "Qingdao Youth Island": "칭다오 유스 아일랜드", "Quang Nam": "꽝남", "Queanbeyan City": "퀸비언 시티", "Queen of the South": "퀸 오브 더 사우스",
  "Queen's Park": "퀸스 파크", "Queretaro": "케레타로", "RAAL La Louvière": "라 루비에르", "RB Leipzig": "라이프치히", "RB Salzburg": "잘츠부르크", "RED Star FC 93": "레드 스타", "RSC Anderlecht II": "안데를레흐트 2군", "RWDM": "RWDM", "Racing": "라싱", "Racing Club": "라싱 클루브",
  "Racing Santander": "라싱 산탄데르", "Radomiak Radom": "라도미아크 라돔", "Raith Rovers": "레이스 로버스", "Raków Częstochowa": "라쿠프 쳉스토호바", "Rampla Juniors": "람플라 주니어스", "Ramtha": "람타", "Randers FC": "란데르스 FC", "Rangers": "레인저스", "Rapperswil": "라퍼스빌", "Ratchaburi": "랏차부리",
  "Rayo Vallecano": "라요 바예카노", "Ray오 Vallecano": "라요", "Real Betis": "베티스", "Real Madrid": "레알 마드리드", "Real Salt Lake": "레알 솔트레이크", "Real Santa Cruz": "레알 산타크루스", "Real Sociedad": "소시에다드", "Real Sociedad II": "레알 소시에다드 B", "Real Tomayapo": "레알 토마야포", "Red Bull Salzburg": "잘츠부르크",
  "Red Star": "레드 스타", "Reggiana": "레지아나", "Reims": "랭스", "Renofa Yamaguchi": "레노파 야마구치", "Rennes": "렌", "Rijeka": "리예카", "Rio Ave": "히우 아브", "River Plate": "리버 플레이트", "Rizespor": "리제스포르", "Roasso Kumamoto": "로아소 구마모토",
  "Roda": "로다", "Rodez": "로데즈", "Roma": "AS 로마", "Rosario Central": "로사리오 센트랄", "Rosenborg": "로젠보리", "Ross County": "로스 카운티", "Royal Pari": "로열 파리", "Ruch Chorzów": "루흐 호주프", "SC Braga": "브라가", "SC Freiburg": "프라이부르크",
  "SHANGHAI SIPG": "상하이 SIPG", "SHB Da Nang": "SHB 다낭", "SKN ST. Polten": "장크트 푈텐", "SKU Amstetten": "암슈테텐", "ST Johnstone": "세인트 존스톤", "ST Mirren": "세인트 미렌", "SV Elversberg": "엘버스베르크", "SV Kapfenberg": "카펜베르크", "Sabah": "사바", "Sagan Tosu": "사간 도스",
  "Sakaryaspor": "사카리아스포르", "Salernitana": "살레르니타나", "Sampdoria": "삼프도리아", "Samsunspor": "삼순스포르", "San Antonio": "산 안토니오", "San Jose Earthquakes": "산호세 어스퀘이크스", "San Lorenzo": "산로렌소", "San Martin Tucuman": "산마르틴 투쿠만", "Sandefjord": "산데피오르", "Sandnes ULF": "산네스 울프",
  "Sanfrecce Hiroshima": "산프레체 히로시마", "Sanliurfaspor": "샨리우르파스포르", "Santa Clara": "산타 클라라", "Santa Fe": "산타페", "Santos Laguna": "산토스 라구나", "Sao Paulo": "상파울루", "Sariyer": "사르예르", "Sarmiento Junin": "사르미엔토", "Sarpsborg 08": "사릅스보르그 08", "Sarpsborg 08 FF": "사릅스보르그",
  "Sarıyer": "사르예르", "Sassuolo": "사수올로", "Schalke 04": "샬케", "Schwarz-Weiß Bregenz": "슈바르츠바이스 브레겐츠", "Seattle Sounders": "시애틀 사운더스", "Selangor": "슬랑오르", "Semen Padang": "세멘 파당", "Septemvri Sofia": "세프템브리 소피아", "Seraing United": "세랭 유나이티드", "Serik Spor": "세리크스포르",
  "Servette": "세르베트", "Seungnam FC": "성남 FC", "Sevilla": "세비야", "Sevlievo": "세블리에보", "Shaanxi Union": "산시 유니온", "Shabab Al Ahli": "샤밥 알 아흘리", "Shabab Al-Ordon": "샤밥 알 오르돈", "Shakhtar Donetsk": "샤흐타르", "Shamrock Rovers": "샴록 로버스", "Shandong Luneng": "산둥 루넝",
  "Shandong Taishan": "산둥 타이산", "Shanghai Jiading Huilong": "상하이 자딩 후이룽", "Shanghai Port": "상하이 포트", "Shanghai Shenhua": "상하이 선화", "Sheffield Utd": "셰필드 유나이티드", "Sheffield Wednesday": "셰필드 웬즈데이", "Shelbourne": "셸본", "Shenyang Urban": "선양 어반", "Shenzhen Juniors": "선전 주니어스", "Shenzhen Peng City": "선전 펑시티",
  "Sibenik": "시베니크", "Siheung Citizen": "시흥시민", "Silkeborg": "실케보르", "Sint-Truiden": "신트트라위던", "Sion": "시옹", "Sivasspor": "시바스스포르", "Slask Wroclaw": "슬롱스크 브로츠와프", "Slavia Sofia": "슬라비아 소피아", "Slaven Belupo": "슬라벤 벨루포", "Sligo Rovers": "슬라이고 로버스",
  "Slovan Bratislava": "슬로반 브라티슬라바", "Sogndal": "송달", "Sol de América": "솔 데 아메리카", "Sonderjyske": "쇤데르위스케", "Song Lam Nghe An": "송람 응에안", "Southampton": "사우샘프턴", "Sparta Praha": "스파르타 프라하", "Sparta Rotterdam": "스파르타 로테르담", "Spartak Pleven": "스파르탁 플레벤", "Spartak Varna": "스파르타크 바르나",
  "Spezia": "스페치아", "Sport Boys": "스포르트 보이스", "Sport Huancayo": "스포르트 우앙카요", "Sporting CP": "스포르팅 CP", "Sporting CP B": "스포르팅 B", "Sporting Charleroi": "스포르팅 샤를루아", "Sporting Cristal": "스포르팅 크리스탈"
};

// ==========================
// 🔥 Logic B: 시간 가중치 폼 계산 함수
// ==========================
function calcForm(matches: any[], isAttack: boolean) {
  if (matches.length === 0) return 1.3;

  let total = 0;
  let weightSum = 0;

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

// ==========================
// 🔥 포아송 분포 함수
// ==========================
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function poissonProb(lambda: number, k: number) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

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
// 🛡️ API 보호용 글로벌 메모리 캐시 
// ==========================
let predictionCache: { [leagueSeason: string]: { timestamp: number, data: any[] } } = {};
let oddsCache: { [fixtureId: number]: { timestamp: number, data: any } } = {}; // 🔥 새로운 해외배당 전용 캐시

const CACHE_TTL = 60 * 60 * 1000; // 1시간 (순위 및 과거 전적)
const ODDS_CACHE_TTL = 2 * 60 * 60 * 1000; // 2시간 (해외 배당)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  const targetDateStr = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    const prevDate = new Date(targetDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const fetchAPI = (endpoint: string, params: string) => 
      fetch(`https://v3.football.api-sports.io/${endpoint}?${params}`, { 
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } 
      }).then(r => r.json());

    // 1. 경기 정보만 먼저 가져오기 (배당 묶음 호출 제거)
    const [targetData, prevData] = await Promise.all([
      fetchAPI('fixtures', `date=${targetDateStr}`),
      fetchAPI('fixtures', `date=${prevDateStr}`)
    ]);

    const allMatches = [...(targetData.response || []), ...(prevData.response || [])];

    // 2. 우리가 서비스하는 80개 리그 & 한국 시간 기준 오늘 경기만 1차 추출 (핵심 최적화!)
    const rawFilteredMatches = allMatches.filter((item: any) => {
      if (leagueNameMap[item.league.id] === undefined) return false;
      const matchDateKST = new Date(item.fixture.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
      return matchDateKST === targetDateStr;
    });

    const uniqueLeagues = new Set<string>();
    rawFilteredMatches.forEach((m: any) => {
      uniqueLeagues.add(`${m.league.id}-${m.league.season}`);
    });

    // 3. 리그별 진짜 평균 득/실점 및 과거 전적 구하기
    const standingsPromises = Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      return fetchAPI('standings', `league=${leagueId}&season=${season}`);
    });
    const standingsResults = await Promise.all(standingsPromises);

    const leagueAvgMap: { [key: string]: number } = {};

    standingsResults.forEach((res: any) => {
      if (res && res.response && res.response.length > 0 && res.response[0].league.standings[0]) {
        const leagueInfo = res.response[0].league;
        const leagueKey = `${leagueInfo.id}-${leagueInfo.season}`;

        let totalGoals = 0;
        let totalPlayed = 0;

        leagueInfo.standings[0].forEach((team: any) => {
          if (team.all && team.all.goals && team.all.goals.for !== undefined) {
            totalGoals += team.all.goals.for;
            totalPlayed += team.all.played;
          }
        });

        if (totalPlayed > 0) {
          leagueAvgMap[leagueKey] = totalGoals / totalPlayed;
        } else {
          leagueAvgMap[leagueKey] = 1.3;
        }
      }
    });

    const now = Date.now();
    await Promise.all(Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      if (!predictionCache[key] || now - predictionCache[key].timestamp > CACHE_TTL) {
        const pastMatchesRes = await fetchAPI('fixtures', `league=${leagueId}&season=${season}&status=FT`);
        predictionCache[key] = {
          timestamp: now,
          data: pastMatchesRes.response || []
        };
      }
    }));

    // 4. 🔥 [핵심 수정] 배당(Odds) 저격수 호출 & 캐싱 로직
    // 무식하게 전체 페이지를 뒤지지 않고, 방금 추려낸 중요 경기들(rawFilteredMatches)만 개별 타겟팅합니다.
    await Promise.all(rawFilteredMatches.map(async (item: any) => {
      const fId = item.fixture.id;
      const status = item.fixture.status.short;
      
      // 캐시가 비어있거나 만료되었을 때만 작동
      if (!oddsCache[fId] || now - oddsCache[fId].timestamp > ODDS_CACHE_TTL) {
        // 사전 배당은 경기 시작 전(NS)에만 제공되므로, 불필요한 API 낭비를 막음
        if (status === 'NS') {
          try {
            // bookmaker=8 (Bet365), bet=1 (Match Winner) 로 딱 한 줄만 빠르게 가져옵니다.
            const oddsRes = await fetchAPI('odds', `fixture=${fId}&bookmaker=8&bet=1`);
            let oddsData = null;
            if (oddsRes && oddsRes.response && oddsRes.response.length > 0) {
              const bookmaker = oddsRes.response[0].bookmakers[0];
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
          }
        } else {
          // 경기가 시작되었거나 끝났으면 캐시만 빈 값으로 채워둠
          if (!oddsCache[fId]) {
            oddsCache[fId] = { timestamp: now, data: null };
          }
        }
      }
    }));

    // 5. 최종 매핑 로직 (Logic B + C)
    const filteredMatches = rawFilteredMatches.map((item: any) => {
      const hName = item.teams.home.name;
      const aName = item.teams.away.name;
      
      const homeId = item.teams.home.id;
      const awayId = item.teams.away.id;
      
      const leagueKey = `${item.league.id}-${item.league.season}`;
      const pastMatches = predictionCache[leagueKey]?.data || [];
      const validPastMatches = pastMatches.filter((m: any) => m.fixture.id !== item.fixture.id);

      const leagueAvgGoals = leagueAvgMap[leagueKey] || 1.3;

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

      const homeHomeMatches = homeRecent.filter((m: any) => m.isHome);
      const awayAwayMatches = awayRecent.filter((m: any) => !m.isHome);

      const homeAttack = calcForm(homeHomeMatches, true);
      const homeDefense = calcForm(homeHomeMatches, false);
      const awayAttack = calcForm(awayAwayMatches, true);
      const awayDefense = calcForm(awayAwayMatches, false);

      // Logic B (Performance): 예상 득점 도출
      const expectedHomeGoals = Math.max(0.5, homeAttack * (awayDefense / leagueAvgGoals) * 1.1);
      const expectedAwayGoals = Math.max(0.5, awayAttack * (homeDefense / leagueAvgGoals) * 0.9);

      const logicBPredictions = poisson(expectedHomeGoals, expectedAwayGoals);
      const logicBProbHome = logicBPredictions.prob.home;
      const logicBProbDraw = logicBPredictions.prob.draw;
      const logicBProbAway = logicBPredictions.prob.away;

      // 🔥 Logic C (Market): 개별 캐시된 배당 정보를 불러와서 확률로 역산
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

      // 하이브리드 결합 (Golden Level: B 60% + C 40%)
      let finalProbHome = logicBProbHome;
      let finalProbDraw = logicBProbDraw;
      let finalProbAway = logicBProbAway;

      if (hasOdds) {
        finalProbHome = Math.round((logicBProbHome * 0.6) + (logicCProbHome * 0.4));
        finalProbDraw = Math.round((logicBProbDraw * 0.6) + (logicCProbDraw * 0.4));
        finalProbAway = Math.max(0, 100 - finalProbHome - finalProbDraw); 
      }

      // 스마트 타이 브레이커 (1:1, 2:2 무승부 방어 시스템)
      let predictHome = Math.round(expectedHomeGoals);
      let predictAway = Math.round(expectedAwayGoals);

      if (predictHome === predictAway) {
        if (finalProbHome - finalProbAway >= 10) predictHome += 1;
        else if (finalProbAway - finalProbHome >= 10) predictAway += 1;
      }

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
        korTime: new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }),
        predict: { home: predictHome, away: predictAway },
        probs: { home: finalProbHome, draw: finalProbDraw, away: finalProbAway },
        odds: matchOdds // 드디어 화면에 뜹니다!
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
    return res.status(200).json({ matches: [] });
  }
}
