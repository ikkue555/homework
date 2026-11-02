import { AirportData, FlightRoutePreset, ThaiProvinceData, ScenicRoadTripPreset } from '../types';

export const GLOBAL_AIRPORTS: AirportData[] = [
  // Thailand Domestic & Hubs
  { code: 'BKK', name: 'สนามบินสุวรรณภูมิ (Suvarnabhumi)', city: 'กรุงเทพฯ', country: 'ไทย', lat: 13.6900, lng: 100.7501 },
  { code: 'DMK', name: 'สนามบินดอนเมือง (Don Mueang)', city: 'กรุงเทพฯ', country: 'ไทย', lat: 13.9126, lng: 100.6067 },
  { code: 'CNX', name: 'สนามบินเชียงใหม่ (Chiang Mai)', city: 'เชียงใหม่', country: 'ไทย', lat: 18.7668, lng: 98.9626 },
  { code: 'HKT', name: 'สนามบินภูเก็ต (Phuket)', city: 'ภูเก็ต', country: 'ไทย', lat: 8.1132, lng: 98.3169 },
  { code: 'USM', name: 'สนามบินสมุย (Samui)', city: 'เกาะสมุย', country: 'ไทย', lat: 9.5478, lng: 100.0623 },
  { code: 'KBV', name: 'สนามบินกระบี่ (Krabi)', city: 'กระบี่', country: 'ไทย', lat: 8.0991, lng: 98.9862 },
  { code: 'CEI', name: 'สนามบินเชียงราย (Mae Fah Luang)', city: 'เชียงราย', country: 'ไทย', lat: 19.9523, lng: 99.8828 },
  { code: 'HDY', name: 'สนามบินหาดใหญ่ (Hat Yai)', city: 'สงขลา/หาดใหญ่', country: 'ไทย', lat: 6.9397, lng: 100.3929 },
  { code: 'KKC', name: 'สนามบินขอนแก่น (Khon Kaen)', city: 'ขอนแก่น', country: 'ไทย', lat: 16.4660, lng: 102.7836 },
  { code: 'UBP', name: 'สนามบินอุบลราชธานี (Ubon Ratchathani)', city: 'อุบลราชธานี', country: 'ไทย', lat: 15.2514, lng: 104.8702 },

  // Asia - East & Southeast
  { code: 'SIN', name: 'สนามบินชางงี (Singapore Changi)', city: 'สิงคโปร์', country: 'สิงคโปร์', lat: 1.3644, lng: 103.9915 },
  { code: 'KUL', name: 'สนามบินกัวลาลัมเปอร์ (Kuala Lumpur)', city: 'กัวลาลัมเปอร์', country: 'มาเลเซีย', lat: 2.7456, lng: 101.7072 },
  { code: 'HND', name: 'สนามบินฮาเนดะ (Tokyo Haneda)', city: 'โตเกียว', country: 'ญี่ปุ่น', lat: 35.5494, lng: 139.7798 },
  { code: 'NRT', name: 'สนามบินนาริตะ (Tokyo Narita)', city: 'โตเกียว', country: 'ญี่ปุ่น', lat: 35.7720, lng: 140.3929 },
  { code: 'KIX', name: 'สนามบินคันไซ (Kansai Osaka)', city: 'โอซาก้า', country: 'ญี่ปุ่น', lat: 34.4347, lng: 135.2441 },
  { code: 'CTS', name: 'สนามบินนิวชิโตเสะ (Sapporo Chitose)', city: 'ซัปโปโร', country: 'ญี่ปุ่น', lat: 42.7752, lng: 141.6923 },
  { code: 'ICN', name: 'สนามบินอินชอน (Seoul Incheon)', city: 'โซล', country: 'เกาหลีใต้', lat: 37.4602, lng: 126.4407 },
  { code: 'TPE', name: 'สนามบินเถาหยวน (Taipei Taoyuan)', city: 'ไทเป', country: 'ไต้หวัน', lat: 25.0797, lng: 121.2342 },
  { code: 'HKG', name: 'สนามบินฮ่องกง (Hong Kong Chek Lap Kok)', city: 'ฮ่องกง', country: 'ฮ่องกง', lat: 22.3080, lng: 113.9185 },
  { code: 'PVG', name: 'สนามบินเซี่ยงไฮ้ผู่ตง (Shanghai Pudong)', city: 'เซี่ยงไฮ้', country: 'จีน', lat: 31.1443, lng: 121.8083 },
  { code: 'PEK', name: 'สนามบินปักกิ่งแคปิตอล (Beijing Capital)', city: 'ปักกิ่ง', country: 'จีน', lat: 40.0799, lng: 116.6031 },
  { code: 'HAN', name: 'สนามบินนอยไบ (Hanoi Noi Bai)', city: 'ฮานอย', country: 'เวียดนาม', lat: 21.2212, lng: 105.8072 },
  { code: 'SGN', name: 'สนามบินเตินเซินเญิ้ต (Ho Chi Minh Tan Son Nhat)', city: 'โฮจิมินห์', country: 'เวียดนาม', lat: 10.8188, lng: 106.6519 },
  { code: 'DPS', name: 'สนามบินงูระห์ไร (Bali Ngurah Rai)', city: 'บาหลี', country: 'อินโดนีเซีย', lat: -8.7482, lng: 115.1672 },

  // Middle East & South Asia
  { code: 'DXB', name: 'สนามบินดูไบ (Dubai International)', city: 'ดูไบ', country: 'สหรัฐอาหรับเอมิเรตส์', lat: 25.2532, lng: 55.3657 },
  { code: 'DOH', name: 'สนามบินฮาหมัด (Hamad Doha)', city: 'โดฮา', country: 'กาตาร์', lat: 25.2731, lng: 51.6081 },
  { code: 'DEL', name: 'สนามบินอินทิรา คานธี (Indira Gandhi)', city: 'นิวเดลี', country: 'อินเดีย', lat: 28.5562, lng: 77.1000 },
  { code: 'MLE', name: 'สนามบินเวลานา (Velana Male)', city: 'มาเล่', country: 'มัลดีฟส์', lat: 4.1918, lng: 73.5290 },

  // Europe
  { code: 'LHR', name: 'สนามบินลอนดอนฮีทโธรว์ (London Heathrow)', city: 'ลอนดอน', country: 'สหราชอาณาจักร', lat: 51.4700, lng: -0.4543 },
  { code: 'CDG', name: 'สนามบินปารีส ชาร์ล เดอ โกล (Paris CDG)', city: 'ปารีส', country: 'ฝรั่งเศส', lat: 49.0097, lng: 2.5479 },
  { code: 'FRA', name: 'สนามบินแฟรงก์เฟิร์ต (Frankfurt Airport)', city: 'แฟรงก์เฟิร์ต', country: 'เยอรมนี', lat: 50.0379, lng: 8.5622 },
  { code: 'ZRH', name: 'สนามบินซูริก (Zurich Airport)', city: 'ซูริก', country: 'สวิตเซอร์แลนด์', lat: 47.4582, lng: 8.5555 },
  { code: 'AMS', name: 'สนามบินอัมสเตอร์ดัม สคิปโฮล (Amsterdam Schiphol)', city: 'อัมสเตอร์ดัม', country: 'เนเธอร์แลนด์', lat: 52.3105, lng: 4.7683 },
  { code: 'FCO', name: 'สนามบินโรม ฟิอูมิชิโน (Rome Fiumicino)', city: 'โรม', country: 'อิตาลี', lat: 41.8003, lng: 12.2389 },
  { code: 'HEL', name: 'สนามบินเฮลซิงกิ (Helsinki Vantaa)', city: 'เฮลซิงกิ', country: 'ฟินแลนด์', lat: 60.3172, lng: 24.9633 },

  // North America
  { code: 'JFK', name: 'สนามบินจอห์น เอฟ. เคนเนดี (JFK New York)', city: 'นิวยอร์ก', country: 'สหรัฐอเมริกา', lat: 40.6413, lng: -73.7781 },
  { code: 'LAX', name: 'สนามบินลอสแอนเจลิส (Los Angeles)', city: 'ลอสแอนเจลิส', country: 'สหรัฐอเมริกา', lat: 33.9416, lng: -118.4085 },
  { code: 'SFO', name: 'สนามบินซานฟรานซิสโก (San Francisco)', city: 'ซานฟรานซิสโก', country: 'สหรัฐอเมริกา', lat: 37.6213, lng: -122.3790 },
  { code: 'YVR', name: 'สนามบินแวนคูเวอร์ (Vancouver)', city: 'แวนคูเวอร์', country: 'แคนาดา', lat: 49.1967, lng: -123.1815 },

  // Oceania
  { code: 'SYD', name: 'สนามบินซิดนีย์ (Sydney Kingsford Smith)', city: 'ซิดนีย์', country: 'ออสเตรเลีย', lat: -33.9399, lng: 151.1753 },
  { code: 'MEL', name: 'สนามบินเมลเบิร์น (Melbourne Tullamarine)', city: 'เมลเบิร์น', country: 'ออสเตรเลีย', lat: -37.6690, lng: 144.8410 },
  { code: 'AKL', name: 'สนามบินโอ๊คแลนด์ (Auckland Airport)', city: 'โอ๊คแลนด์', country: 'นิวซีแลนด์', lat: -37.0082, lng: 174.7850 },
];

export const POPULAR_FLIGHT_PRESETS: FlightRoutePreset[] = [
  {
    id: 'tg-cnx',
    flightNumber: 'TG 102',
    airline: 'Thai Airways (การบินไทย)',
    originCode: 'BKK',
    destCode: 'CNX',
    realDurationMinutes: 75, // 1h 15m
    description: 'เที่ยวบินยอดนิยมขึ้นเหนือ สุวรรณภูมิ สู่ เชียงใหม่'
  },
  {
    id: 'pg-hkt',
    flightNumber: 'PG 271',
    airline: 'Bangkok Airways (บางกอกแอร์เวย์ส)',
    originCode: 'BKK',
    destCode: 'HKT',
    realDurationMinutes: 85, // 1h 25m
    description: 'บินลัดฟ้าลงใต้ สู่เกาะสวรรค์ภูเก็ต'
  },
  {
    id: 'sq-sin',
    flightNumber: 'SQ 705',
    airline: 'Singapore Airlines (สิงคโปร์แอร์ไลน์ส)',
    originCode: 'BKK',
    destCode: 'SIN',
    realDurationMinutes: 145, // 2h 25m
    description: 'บินข้ามสู่เกาะสิงคโปร์ สนามบินชางงี'
  },
  {
    id: 'cx-hkg',
    flightNumber: 'CX 750',
    airline: 'Cathay Pacific (คาเธ่ย์ แปซิฟิค)',
    originCode: 'BKK',
    destCode: 'HKG',
    realDurationMinutes: 175, // 2h 55m
    description: 'เส้นทางบินสู่อ่าววิคตอเรีย ฮ่องกง'
  },
  {
    id: 'tg-hnd',
    flightNumber: 'TG 682',
    airline: 'Thai Airways (การบินไทย)',
    originCode: 'BKK',
    destCode: 'HND',
    realDurationMinutes: 375, // 6h 15m
    description: 'ไฟลท์ยอดฮิต บินตรงสู่ โตเกียว ฮาเนดะ ญี่ปุ่น'
  },
  {
    id: 'ke-icn',
    flightNumber: 'KE 652',
    airline: 'Korean Air (โคเรียนแอร์)',
    originCode: 'BKK',
    destCode: 'ICN',
    realDurationMinutes: 345, // 5h 45m
    description: 'เส้นทางสู่กรุงโซล สนามบินอินชอน เกาหลีใต้'
  },
  {
    id: 'ek-dxb',
    flightNumber: 'EK 385',
    airline: 'Emirates (เอมิเรตส์ แอร์บัส A380)',
    originCode: 'BKK',
    destCode: 'DXB',
    realDurationMinutes: 395, // 6h 35m
    description: 'เดินทางสู่นครดูไบ ศูนย์กลางการบินตะวันออกกลาง'
  },
  {
    id: 'tg-lhr',
    flightNumber: 'TG 910',
    airline: 'Thai Airways (การบินไทย โบอิ้ง 777)',
    originCode: 'BKK',
    destCode: 'LHR',
    realDurationMinutes: 775, // 12h 55m
    description: 'ข้ามทวีปสู่ลอนดอน ฮีทโธรว์ ประเทศอังกฤษ'
  },
  {
    id: 'tg-cdg',
    flightNumber: 'TG 930',
    airline: 'Thai Airways (การบินไทย)',
    originCode: 'BKK',
    destCode: 'CDG',
    realDurationMinutes: 765, // 12h 45m
    description: 'เดินทางสู่นครแห่งแสงสี ปารีส ฝรั่งเศส'
  },
  {
    id: 'nh-lax',
    flightNumber: 'NH 106',
    airline: 'ANA (ออล นิปปอน แอร์เวย์ส)',
    originCode: 'HND',
    destCode: 'LAX',
    realDurationMinutes: 590, // 9h 50m
    description: 'บินข้ามมหาสมุทรแปซิฟิก จากโตเกียวสู่ลอสแอนเจลิส'
  }
];

export const THAI_PROVINCES: ThaiProvinceData[] = [
  // กรุงเทพและปริมณฑล / ภาคกลาง
  { id: 'bkk', name: 'กรุงเทพมหานคร', region: 'central', lat: 13.7563, lng: 100.5018, highlights: 'พระบรมมหาราชวัง • เสาชิงช้า • โรงเรียนสวนกุหลาบวิทยาลัย' },
  { id: 'non', name: 'นนทบุรี', region: 'central', lat: 13.8591, lng: 100.5217, highlights: 'เกาะเกร็ด • วัดบรมราชากาญจนาภิเษกอนุสรณ์' },
  { id: 'ptn', name: 'ปทุมธานี', region: 'central', lat: 14.0208, lng: 100.5250, highlights: 'ดรีมเวิลด์ • วัดโบสถ์' },
  { id: 'aya', name: 'พระนครศรีอยุธยา', region: 'central', lat: 14.3532, lng: 100.5684, highlights: 'อุทยานประวัติศาสตร์อยุธยา • วัดมหาธาตุ' },
  { id: 'lop', name: 'ลพบุรี', region: 'central', lat: 14.7995, lng: 100.6534, highlights: 'พระปรางค์สามยอด • วังนารายณ์' },
  { id: 'sbr', name: 'สระบุรี', region: 'central', lat: 14.5289, lng: 100.9101, highlights: 'วัดพระพุทธบาท • น้ำตกมวกเหล็ก' },
  { id: 'npt', name: 'นครปฐม', region: 'central', lat: 13.8196, lng: 100.0601, highlights: 'องค์พระปฐมเจดีย์ • พระราชวังสนามจันทร์' },
  { id: 'spb', name: 'สุพรรณบุรี', region: 'central', lat: 14.4745, lng: 100.1177, highlights: 'หอคอยบรรหาร-แจ่มใส • บึงฉวาก' },
  { id: 'swn', name: 'นครสวรรค์', region: 'central', lat: 15.6987, lng: 100.1199, highlights: 'บึงบอระเพ็ด • หอชมเมืองนครสวรรค์' },

  // ภาคเหนือ
  { id: 'cnx', name: 'เชียงใหม่', region: 'north', lat: 18.7883, lng: 98.9853, highlights: 'ดอยอินทนนท์ • วัดพระธาตุดอยสุเทพ • นิมมาน' },
  { id: 'cei', name: 'เชียงราย', region: 'north', lat: 19.9072, lng: 99.8325, highlights: 'วัดร่องขุ่น • ดอยแม่สลอง • สิงห์ปาร์ค' },
  { id: 'lpn', name: 'ลำพูน', region: 'north', lat: 18.5745, lng: 99.0087, highlights: 'วัดพระธาตุหริภุญชัย' },
  { id: 'lpg', name: 'ลำปาง', region: 'north', lat: 18.2888, lng: 99.4928, highlights: 'รถม้าลำปาง • วัดพระธาตุลำปางหลวง' },
  { id: 'mhs', name: 'แม่ฮ่องสอน', region: 'north', lat: 19.3021, lng: 97.9654, highlights: 'ปาย • ปางอุ๋ง • ภูชี้เพ้อ' },
  { id: 'nan', name: 'น่าน', region: 'north', lat: 18.7838, lng: 100.7782, highlights: 'วัดภูมินทร์ (กระซิบรัก) • ดอยเสมอดาว • ปัว' },
  { id: 'phs', name: 'พิษณุโลก', region: 'north', lat: 16.8211, lng: 100.2659, highlights: 'พระพุทธชินราช • ภูหินร่องกล้า' },
  { id: 'suk', name: 'สุโขทัย', region: 'north', lat: 17.0056, lng: 99.8264, highlights: 'อุทยานประวัติศาสตร์สุโขทัย' },

  // ภาคตะวันออก
  { id: 'cbi', name: 'ชลบุรี (พัทยา/บางแสน)', region: 'east', lat: 13.3611, lng: 100.9847, highlights: 'หาดบางแสน • แหลมบาลีฮาย พัทยา • เกาะล้าน' },
  { id: 'ryg', name: 'ระยอง', region: 'east', lat: 12.6814, lng: 101.2816, highlights: 'เกาะเสม็ด • หาดแม่รำพึง' },
  { id: 'cti', name: 'จันทบุรี', region: 'east', lat: 12.6114, lng: 102.1039, highlights: 'จุดชมวิวเนินนางพญา • เขาคิชฌกูฏ' },
  { id: 'trt', name: 'ตราด', region: 'east', lat: 12.2428, lng: 102.5175, highlights: 'เกาะช้าง • เกาะกูด • เกาะหมาก' },

  // ภาคตะวันตก
  { id: 'kri', name: 'กาญจนบุรี', region: 'west', lat: 14.0228, lng: 99.5328, highlights: 'สะพานข้ามแม่น้ำแคว • น้ำตกเอราวัณ • สังขละบุรี' },
  { id: 'rtb', name: 'ราชบุรี', region: 'west', lat: 13.5358, lng: 99.8164, highlights: 'ตลาดน้ำดำเนินสะดวก • สวนผึ้ง' },
  { id: 'pbi', name: 'เพชรบุรี (ชะอำ)', region: 'west', lat: 13.1114, lng: 99.9398, highlights: 'เขาวัง (พระนครคีรี) • หาดชะอำ' },
  { id: 'pkn', name: 'ประจวบคีรีขันธ์ (หัวหิน)', region: 'west', lat: 11.8124, lng: 99.7973, highlights: 'หาดหัวหิน • อ่าวมะนาว • อุทยานแห่งชาติเขาสามร้อยยอด' },

  // ภาคตะวันออกเฉียงเหนือ (อีสาน)
  { id: 'nma', name: 'นครราชสีมา (โคราช/เขาใหญ่)', region: 'northeast', lat: 14.9799, lng: 102.0978, highlights: 'อุทยานแห่งชาติเขาใหญ่ • อนุสาวรีย์ย่าโม' },
  { id: 'kkc', name: 'ขอนแก่น', region: 'northeast', lat: 16.4322, lng: 102.8236, highlights: 'บึงแก่นนคร • พระมหาธาตุแก่นนคร' },
  { id: 'ubp', name: 'อุบลราชธานี', region: 'northeast', lat: 15.2449, lng: 104.8473, highlights: 'สามพันโบก • ผาแต้ม • แม่น้ำสองสี' },
  { id: 'udn', name: 'อุดรธานี', region: 'northeast', lat: 17.4138, lng: 102.7872, highlights: 'ทะเลบัวแดง • วัดป่าภูก้อน • คำชะโนด' },
  { id: 'nki', name: 'หนองคาย', region: 'northeast', lat: 17.8783, lng: 102.7420, highlights: 'สะพานมิตรภาพไทย-ลาว • ศาลาแก้วกู่' },
  { id: 'bur', name: 'บุรีรัมย์', region: 'northeast', lat: 14.9930, lng: 103.1029, highlights: 'ปราสาทหินพนมรุ้ง • ช้างอารีนา' },

  // ภาคใต้
  { id: 'cpn', name: 'ชุมพร', region: 'south', lat: 10.4930, lng: 99.1800, highlights: 'หาดทรายรี • ศาลกรมหลวงชุมพรฯ' },
  { id: 'sni', name: 'สุราษฎร์ธานี (สมุย/พะงัน)', region: 'south', lat: 9.1382, lng: 99.3215, highlights: 'เขาสก • เขื่อนเชี่ยวหลาน • เกาะสมุย' },
  { id: 'pkt', name: 'ภูเก็ต', region: 'south', lat: 7.8804, lng: 98.3923, highlights: 'แหลมพรหมเทพ • ย่านเมืองเก่าภูเก็ต • หาดป่าตอง' },
  { id: 'kbi', name: 'กระบี่', region: 'south', lat: 8.0863, lng: 98.9063, highlights: 'อ่าวนาง • เกาะพีพี • สระมรกต' },
  { id: 'pna', name: 'พังงา', region: 'south', lat: 8.4501, lng: 98.5255, highlights: 'อ่าวพังงา • เขาตะปู • เกาะสิมิลัน' },
  { id: 'trg', name: 'ตรัง', region: 'south', lat: 7.5563, lng: 99.6114, highlights: 'ถ้ำมรกต • เกาะกระดาน • หมูย่างเมืองตรัง' },
  { id: 'ska', name: 'สงขลา (หาดใหญ่)', region: 'south', lat: 7.1898, lng: 100.5954, highlights: 'หาดสมิหลา • ตลาดกิมหยง • เมืองเก่าสงขลา' },
];

export const POPULAR_ROAD_PRESETS: ScenicRoadTripPreset[] = [
  {
    id: 'bkk-cnx',
    name: 'เส้นทางหลวงหมายเลข 1 & 11: กรุงเทพฯ ➔ เชียงใหม่',
    originId: 'bkk',
    destId: 'cnx',
    highwayNumber: 'AH2 / Route 1 & 11',
    realDriveHours: 9.0,
    realDistanceKm: 695,
    scenicDescription: 'ขับขึ้นเหนือผ่านทุ่งทานตะวัน ขุนเขาดอยขุนตาน สู่เวียงพิงค์เชียงใหม่'
  },
  {
    id: 'bkk-pkt',
    name: 'ถนนเพชรเกษมเลียบทะเล: กรุงเทพฯ ➔ ภูเก็ต',
    originId: 'bkk',
    destId: 'pkt',
    highwayNumber: 'Route 4 (Phetkasem) & Route 402',
    realDriveHours: 11.5,
    realDistanceKm: 840,
    scenicDescription: 'เส้นทางสู่ไข่มุกอันดามัน ผ่านอ่าวไทย ชายฝั่งชุมพร สุราษฎร์ธานี'
  },
  {
    id: 'bkk-cbi',
    name: 'มอเตอร์เวย์สาย 7: กรุงเทพฯ ➔ พัทยา / บางแสน',
    originId: 'bkk',
    destId: 'cbi',
    highwayNumber: 'Motorway 7',
    realDriveHours: 2.0,
    realDistanceKm: 145,
    scenicDescription: 'ทางหลวงพิเศษเลียบชายฝั่งตะวันออก สู่เมืองตากอากาศพัทยา'
  },
  {
    id: 'bkk-pkn',
    name: 'ขับรถพักผ่อนหัวหิน: กรุงเทพฯ ➔ หัวหิน (ประจวบฯ)',
    originId: 'bkk',
    destId: 'pkn',
    highwayNumber: 'Route 35 (Rama 2) & Route 4',
    realDriveHours: 2.5,
    realDistanceKm: 195,
    scenicDescription: 'ถนนพระรามสองสู่เมืองชายทะเลคลาสสิก ชมวิวเขาช่องกระจก'
  },
  {
    id: 'bkk-nma',
    name: 'มอเตอร์เวย์ M6 มิตรภาพ: กรุงเทพฯ ➔ เขาใหญ่ / โคราช',
    originId: 'bkk',
    destId: 'nma',
    highwayNumber: 'Motorway M6 / Mittraphap',
    realDriveHours: 2.5,
    realDistanceKm: 185,
    scenicDescription: 'ขับรถรับลมหนาวชมวิวทิวทัศน์เขื่อนลำตะคองและอุทยานเขาใหญ่'
  },
  {
    id: 'bkk-kri',
    name: 'เส้นทางธรรมชาติ: กรุงเทพฯ ➔ กาญจนบุรี',
    originId: 'bkk',
    destId: 'kri',
    highwayNumber: 'Route 323 / M81',
    realDriveHours: 2.2,
    realDistanceKm: 130,
    scenicDescription: 'สู่ดินแดนแห่งสายน้ำแคว ขุนเขา และประวัติศาสตร์'
  },
  {
    id: 'cnx-cei',
    name: 'ขับรถท่องดอย: เชียงใหม่ ➔ เชียงราย',
    originId: 'cnx',
    destId: 'cei',
    highwayNumber: 'Route 118',
    realDriveHours: 3.2,
    realDistanceKm: 190,
    scenicDescription: 'เส้นทางโค้งสวยงามผ่านดอยสะเก็ด แม่ขะจาน สู่วัดร่องขุ่น'
  }
];

export const MOTIVATIONAL_FOCUS_QUOTES = [
  { th: "การมีสมาธิเพียง 25 นาที สามารถสร้างผลงานที่ยิ่งใหญ่กว่าการนั่งใจลอยทั้งวัน", en: "Focus is the bridge between goals and accomplishment." },
  { th: "ความสำเร็จไม่ได้เกิดจากความเร็ว แต่เกิดจากความสม่ำเสมอในทุกๆ นาที", en: "Small daily improvements over time lead to stunning results." },
  { th: "จงตั้งใจกับสิ่งที่อยู่ตรงหน้า เสมือนเป็นเที่ยวบินที่กำลังพาเธอไปสู่อนาคต", en: "Fly steadily towards your dreams, one focused hour at a time." },
  { th: "ไม่มีทางลัดสำหรับความเชี่ยวชาญ มีเพียงชั่วโมงบินที่สั่งสมอย่างมีวินัย", en: "Discipline is choosing between what you want now and what you want most." },
  { th: "เหมือนการขับรถบนถนนที่ยาวไกล ขอเพียงไม่หยุดพัก ความสำเร็จย่อมอยู่ตรงหน้า", en: "Keep driving forward. The destination is worth the journey." }
];

// Helper to calculate distance between two geo-coordinates in Kilometers (Haversine Formula)
export function calculateGeoDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
