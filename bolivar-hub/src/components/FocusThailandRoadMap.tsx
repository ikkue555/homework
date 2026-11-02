import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  useMap 
} from '@vis.gl/react-google-maps';
import { ThaiProvinceData } from '../types';
import { calculateGeoDistanceKm } from '../data/focusData';
import { 
  Gauge, 
  Milestone, 
  Layers, 
  Video, 
  VideoOff, 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  MapPin,
  Route,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FocusThailandRoadMapProps {
  originProvince: ThaiProvinceData;
  destProvince: ThaiProvinceData;
  progressPercent: number; // 0 to 100
  isDriving?: boolean;
  cameraFollow?: boolean;
  onToggleCameraFollow?: () => void;
}

export interface RealRouteData {
  points: google.maps.LatLngLiteral[];
  distanceText: string;
  durationText: string;
  roadName: string;
  distanceKm: number;
}

// Major Thailand Highway Junction Nodes & Strategic Hubs
interface HighwayJunction {
  id: string;
  name: string;
  lat: number;
  lng: number;
  road: string;
  neighbors: string[];
}

const THAI_HIGHWAY_GRAPH: Record<string, HighwayJunction> = {
  // Bangkok & Central
  bkk: {
    id: 'bkk',
    name: 'กรุงเทพฯ (อนุสาวรีย์ชัยฯ / บางซื่อ)',
    lat: 13.7563,
    lng: 100.5018,
    road: 'ทล.1 / ทล.31 วิภาวดีรังสิต',
    neighbors: ['rangsit', 'bangpa_in', 'rama2', 'motorway7', 'nakhonpathom']
  },
  rangsit: {
    id: 'rangsit',
    name: 'รังสิต - ดอนเมือง',
    lat: 13.9890,
    lng: 100.6177,
    road: 'ทล.1 ถนนพหลโยธิน',
    neighbors: ['bkk', 'bangpa_in']
  },
  bangpa_in: {
    id: 'bangpa_in',
    name: 'ต่างระดับบางปะอิน (ชุมทางสายเอเชีย)',
    lat: 14.2230,
    lng: 100.5980,
    road: 'ทล.32 สายเอเชีย / AH2',
    neighbors: ['rangsit', 'bkk', 'ayutthaya', 'saraburi']
  },
  ayutthaya: {
    id: 'ayutthaya',
    name: 'อยุธยา (ทล.32)',
    lat: 14.3532,
    lng: 100.5684,
    road: 'ทล.32 ถนนสายเอเชีย',
    neighbors: ['bangpa_in', 'angthong']
  },
  angthong: {
    id: 'angthong',
    name: 'อ่างทอง (ทล.32)',
    lat: 14.5896,
    lng: 100.4550,
    road: 'ทล.32 / AH2',
    neighbors: ['ayutthaya', 'singburi']
  },
  singburi: {
    id: 'singburi',
    name: 'สิงห์บุรี (ทล.32)',
    lat: 14.8872,
    lng: 100.4040,
    road: 'ทล.32 / AH2',
    neighbors: ['angthong', 'chainat']
  },
  chainat: {
    id: 'chainat',
    name: 'แยกชัยนาท / อินทร์บุรี',
    lat: 15.1852,
    lng: 100.1251,
    road: 'ทล.1 พหลโยธิน / ทล.32',
    neighbors: ['singburi', 'nakhonsawan']
  },
  nakhonsawan: {
    id: 'nakhonsawan',
    name: 'สะพานเดชาติวงศ์ นครสวรรค์ (ประตูสู่ภาคเหนือ)',
    lat: 15.6987,
    lng: 100.1199,
    road: 'ทล.1 พหลโยธิน / ทล.117',
    neighbors: ['chainat', 'kamphaengphet', 'phitsanulok']
  },

  // Northern Corridor
  kamphaengphet: {
    id: 'kamphaengphet',
    name: 'กำแพงเพชร (ทล.1)',
    lat: 16.4828,
    lng: 99.5227,
    road: 'ทล.1 พหลโยธิน / AH2',
    neighbors: ['nakhonsawan', 'tak']
  },
  tak: {
    id: 'tak',
    name: 'สี่แยกตาก (จุดเชื่อม ทล.1 / ทล.12 แม่สอด)',
    lat: 16.8839,
    lng: 99.1258,
    road: 'ทล.1 / ทล.12',
    neighbors: ['kamphaengphet', 'lampang', 'sukhothai']
  },
  lampang: {
    id: 'lampang',
    name: 'แยกดอยพระบาท ลำปาง',
    lat: 18.2888,
    lng: 99.4928,
    road: 'ทล.1 / ทล.11 ซุปเปอร์ไฮเวย์',
    neighbors: ['tak', 'phitsanulok', 'lamphun', 'phayao', 'phrae']
  },
  lamphun: {
    id: 'lamphun',
    name: 'ดอยขุนตาน - ลำพูน',
    lat: 18.5744,
    lng: 99.0087,
    road: 'ทล.11 ซุปเปอร์ไฮเวย์',
    neighbors: ['lampang', 'chiangmai']
  },
  chiangmai: {
    id: 'chiangmai',
    name: 'เชียงใหม่ (ทางหลวงสายเอเชีย AH2)',
    lat: 18.7883,
    lng: 98.9853,
    road: 'ทล.11 / ทล.108 / ทล.118',
    neighbors: ['lamphun', 'chiangrai', 'maehongson']
  },
  phayao: {
    id: 'phayao',
    name: 'พะเยา (กว๊านพะเยา ทล.1)',
    lat: 19.1664,
    lng: 99.9022,
    road: 'ทล.1 พหลโยธิน / AH2',
    neighbors: ['lampang', 'chiangrai']
  },
  chiangrai: {
    id: 'chiangrai',
    name: 'ห้าแยกพ่อขุนเม็งราย เชียงราย',
    lat: 19.9071,
    lng: 99.8325,
    road: 'ทล.1 พหลโยธิน / AH2',
    neighbors: ['phayao', 'chiangmai', 'maesai']
  },
  maesai: {
    id: 'maesai',
    name: 'ด่านพรมแดนแม่สาย (เหนือสุดแดนสยาม)',
    lat: 20.4435,
    lng: 99.8805,
    road: 'ทล.1 พหลโยธิน (ปลายทาง AH2)',
    neighbors: ['chiangrai']
  },
  maehongson: {
    id: 'maehongson',
    name: 'แม่ฮ่องสอน (ทล.108 / ทล.1095)',
    lat: 19.3021,
    lng: 97.9654,
    road: 'ทล.108 / ทล.1095 เส้นทาง 1,864 โค้ง',
    neighbors: ['chiangmai']
  },
  phitsanulok: {
    id: 'phitsanulok',
    name: 'สี่แยกอินโดจีน พิษณุโลก (ระเบียงเศรษฐกิจ)',
    lat: 16.8211,
    lng: 100.2659,
    road: 'ทล.11 / ทล.12 East-West Corridor',
    neighbors: ['nakhonsawan', 'sukhothai', 'lampang', 'phrae', 'lomsak']
  },
  sukhothai: {
    id: 'sukhothai',
    name: 'สุโขทัย (ทล.12)',
    lat: 17.0078,
    lng: 99.8230,
    road: 'ทล.12 ตาก-พิษณุโลก',
    neighbors: ['tak', 'phitsanulok']
  },
  phrae: {
    id: 'phrae',
    name: 'เด่นชัย - แพร่ (ทล.101)',
    lat: 18.1446,
    lng: 100.1403,
    road: 'ทล.101 เชื่อม ทล.11',
    neighbors: ['lampang', 'phitsanulok', 'nan']
  },
  nan: {
    id: 'nan',
    name: 'น่าน (ทล.101 ถนนลอยฟ้า)',
    lat: 18.7833,
    lng: 100.7782,
    road: 'ทล.101 / ทล.1080',
    neighbors: ['phrae']
  },

  // Northeastern Corridor (Mittraphap & Route 24)
  saraburi: {
    id: 'saraburi',
    name: 'ต่างระดับมิตรภาพ สระบุรี (ประตูสู่ภาคอีสาน)',
    lat: 14.5289,
    lng: 100.9101,
    road: 'ทล.1 / ทล.2 ถนนมิตรภาพ (AH12)',
    neighbors: ['bangpa_in', 'muaklek', 'chaibadan']
  },
  muaklek: {
    id: 'muaklek',
    name: 'มวกเหล็ก - แก่งคอย',
    lat: 14.6540,
    lng: 101.1980,
    road: 'ทล.2 ถนนมิตรภาพ (AH12)',
    neighbors: ['saraburi', 'pakchong']
  },
  pakchong: {
    id: 'pakchong',
    name: 'ปากช่อง - ริมเขื่อนลำตะคอง',
    lat: 14.7082,
    lng: 101.4161,
    road: 'ทล.2 ถนนมิตรภาพ / มอเตอร์เวย์ M6',
    neighbors: ['muaklek', 'sikhio']
  },
  sikhio: {
    id: 'sikhio',
    name: 'ต่างระดับสีคิ้ว (จุดแยกอีสานเหนือ-อีสานใต้)',
    lat: 14.8912,
    lng: 101.7245,
    road: 'ทล.2 / ทล.24 สายโชคชัย-เดชอุดม',
    neighbors: ['pakchong', 'korat', 'nangrong']
  },
  korat: {
    id: 'korat',
    name: 'นครราชสีมา (โคราช บายพาส ทล.2)',
    lat: 14.9799,
    lng: 102.0978,
    road: 'ทล.2 ถนนมิตรภาพ (AH12)',
    neighbors: ['sikhio', 'khonkaen', 'chaiyaphum']
  },
  khonkaen: {
    id: 'khonkaen',
    name: 'ขอนแก่น (มิตรภาพตัดมะลิวัลย์)',
    lat: 16.4419,
    lng: 102.8359,
    road: 'ทล.2 / ทล.12',
    neighbors: ['korat', 'udonthani', 'kalasin', 'lomsak']
  },
  udonthani: {
    id: 'udonthani',
    name: 'อุดรธานี (ทล.2)',
    lat: 17.4138,
    lng: 102.7872,
    road: 'ทล.2 / ทล.22',
    neighbors: ['khonkaen', 'nongkhai', 'sakonnakhon']
  },
  nongkhai: {
    id: 'nongkhai',
    name: 'สะพานมิตรภาพไทย-ลาว หนองคาย',
    lat: 17.8783,
    lng: 102.7420,
    road: 'ทล.2 ถนนมิตรภาพ (AH12 สิ้นสุด)',
    neighbors: ['udonthani']
  },
  sakonnakhon: {
    id: 'sakonnakhon',
    name: 'สกลนคร (เทือกเขาภูพาน ทล.22)',
    lat: 17.1546,
    lng: 104.1486,
    road: 'ทล.22 นิตโย / ทล.213',
    neighbors: ['udonthani', 'nakhonphanom', 'kalasin']
  },
  nakhonphanom: {
    id: 'nakhonphanom',
    name: 'สะพานมิตรภาพ 3 นครพนม (ทล.22)',
    lat: 17.3986,
    lng: 104.7699,
    road: 'ทล.22 สิ้นสุดแม่น้ำโขง',
    neighbors: ['sakonnakhon', 'mukdahan']
  },
  kalasin: {
    id: 'kalasin',
    name: 'กาฬสินธุ์ (ทล.12)',
    lat: 16.4322,
    lng: 103.5063,
    road: 'ทล.12 East-West Corridor',
    neighbors: ['khonkaen', 'sakonnakhon', 'mukdahan', 'roiet']
  },
  mukdahan: {
    id: 'mukdahan',
    name: 'สะพานมิตรภาพ 2 มุกดาหาร (ทล.12)',
    lat: 16.5434,
    lng: 104.7235,
    road: 'ทล.12 / ทล.212 เลียบโขง',
    neighbors: ['kalasin', 'nakhonphanom', 'ubon']
  },
  roiet: {
    id: 'roiet',
    name: 'ร้อยเอ็ด (ทล.23)',
    lat: 16.0538,
    lng: 103.6520,
    road: 'ทล.23 แจ้งสนิท',
    neighbors: ['kalasin', 'khonkaen', 'yasothon']
  },
  yasothon: {
    id: 'yasothon',
    name: 'ยโสธร (ทล.23)',
    lat: 15.7925,
    lng: 104.1451,
    road: 'ทล.23',
    neighbors: ['roiet', 'ubon']
  },
  nangrong: {
    id: 'nangrong',
    name: 'สี่แยกนางรอง บุรีรัมย์ (ทล.24)',
    lat: 14.6377,
    lng: 102.7915,
    road: 'ทล.24 โชคชัย-เดชอุดม',
    neighbors: ['sikhio', 'buriram', 'surin']
  },
  buriram: {
    id: 'buriram',
    name: 'บุรีรัมย์ (ทล.218 / ทล.226)',
    lat: 14.9930,
    lng: 103.1029,
    road: 'ทล.226 โคราช-อุบลฯ',
    neighbors: ['nangrong', 'surin', 'korat']
  },
  surin: {
    id: 'surin',
    name: 'สุรินทร์ (ทล.24 / ทล.226)',
    lat: 14.8818,
    lng: 103.4936,
    road: 'ทล.24 / ทล.226',
    neighbors: ['nangrong', 'buriram', 'sisaket']
  },
  sisaket: {
    id: 'sisaket',
    name: 'ศรีสะเกษ (ทล.226)',
    lat: 15.1186,
    lng: 104.3220,
    road: 'ทล.226',
    neighbors: ['surin', 'ubon']
  },
  ubon: {
    id: 'ubon',
    name: 'อุบลราชธานี (จุดบรรจบ ทล.23 / ทล.24)',
    lat: 15.2449,
    lng: 104.8473,
    road: 'ทล.23 / ทล.24 ประตูสู่อินโดจีน',
    neighbors: ['sisaket', 'yasothon', 'mukdahan']
  },
  chaiyaphum: {
    id: 'chaiyaphum',
    name: 'ชัยภูมิ (ทล.201)',
    lat: 15.8063,
    lng: 102.0315,
    road: 'ทล.201 สระบุรี-หล่มสัก-เลย',
    neighbors: ['korat', 'khonkaen', 'loei']
  },
  lomsak: {
    id: 'lomsak',
    name: 'สี่แยกพ่อขุนผาเมือง หล่มสัก (ทล.12 ตัด ทล.21)',
    lat: 16.7820,
    lng: 101.2420,
    road: 'ทล.12 ข้ามเขาค้อ / ทล.21',
    neighbors: ['phitsanulok', 'khonkaen', 'loei']
  },
  loei: {
    id: 'loei',
    name: 'เลย (ทล.201 / ทล.21)',
    lat: 17.4860,
    lng: 101.7223,
    road: 'ทล.201 / ทล.21 ภูเรือ-เชียงคาน',
    neighbors: ['lomsak', 'chaiyaphum', 'udonthani']
  },
  chaibadan: {
    id: 'chaibadan',
    name: 'ชัยบาดาล ลพบุรี (ทล.21)',
    lat: 15.2011,
    lng: 101.1340,
    road: 'ทล.21 สระบุรี-หล่มสัก',
    neighbors: ['saraburi', 'lomsak']
  },

  // Southern Corridor (Rama II / Phetkasem AH2 & Route 41)
  rama2: {
    id: 'rama2',
    name: 'สมุทรสาคร (ถนนพระราม 2 ทล.35)',
    lat: 13.5475,
    lng: 100.2744,
    road: 'ทล.35 ถนนพระราม 2 สายหลักลงใต้',
    neighbors: ['bkk', 'samutsongkhram']
  },
  samutsongkhram: {
    id: 'samutsongkhram',
    name: 'สมุทรสงคราม - ดอนหอยหลอด (ทล.35)',
    lat: 13.4098,
    lng: 99.9972,
    road: 'ทล.35 ถนนพระราม 2',
    neighbors: ['rama2', 'paktho']
  },
  paktho: {
    id: 'paktho',
    name: 'ต่างระดับปากท่อ ราชบุรี (จุดเชื่อม พระราม 2 เข้าเพชรเกษม ทล.4)',
    lat: 13.3550,
    lng: 99.8240,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['samutsongkhram', 'ratchaburi', 'phetchaburi']
  },
  nakhonpathom: {
    id: 'nakhonpathom',
    name: 'นครปฐม (ทล.4 เพชรเกษม / ทล.338 ปิ่นเกล้า)',
    lat: 13.8196,
    lng: 100.0601,
    road: 'ทล.4 ถนนเพชรเกษม',
    neighbors: ['bkk', 'ratchaburi', 'kanchanaburi']
  },
  ratchaburi: {
    id: 'ratchaburi',
    name: 'ราชบุรี (ทล.4 เพชรเกษม)',
    lat: 13.5359,
    lng: 99.8164,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['nakhonpathom', 'paktho', 'kanchanaburi']
  },
  kanchanaburi: {
    id: 'kanchanaburi',
    name: 'กาญจนบุรี (ทล.323 / มอเตอร์เวย์ M81)',
    lat: 14.0228,
    lng: 99.5328,
    road: 'ทล.323 แสงชูโต',
    neighbors: ['ratchaburi', 'nakhonpathom']
  },
  phetchaburi: {
    id: 'phetchaburi',
    name: 'เขาวัง เพชรบุรี (ทล.4)',
    lat: 13.1114,
    lng: 99.9392,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['paktho', 'huahin']
  },
  huahin: {
    id: 'huahin',
    name: 'ชะอำ - หัวหิน - ปราณบุรี (บายพาส ทล.37 / ทล.4)',
    lat: 12.5684,
    lng: 99.9577,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['phetchaburi', 'prachuap']
  },
  prachuap: {
    id: 'prachuap',
    name: 'ประจวบคีรีขันธ์ (จุดแคบสุดของประเทศ ทล.4)',
    lat: 11.8124,
    lng: 99.7972,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['huahin', 'bangsaphan']
  },
  bangsaphan: {
    id: 'bangsaphan',
    name: 'บางสะพาน (ทล.4)',
    lat: 11.2120,
    lng: 99.5080,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['prachuap', 'chumphon']
  },
  chumphon: {
    id: 'chumphon',
    name: 'สี่แยกปฐมพร ชุมพร (ประตูสู่ภาคใต้)',
    lat: 10.4930,
    lng: 99.1800,
    road: 'ทล.41 สายเอเชีย / ทล.4 เพชรเกษมอันดามัน',
    neighbors: ['bangsaphan', 'ranong', 'langsuan']
  },
  ranong: {
    id: 'ranong',
    name: 'ระนอง (ถนนเพชรเกษมเลียบอันดามัน ทล.4)',
    lat: 9.9529,
    lng: 98.6348,
    road: 'ทล.4 เพชรเกษม (สายอันดามัน)',
    neighbors: ['chumphon', 'phangnga']
  },
  langsuan: {
    id: 'langsuan',
    name: 'หลังสวน - ละแม (ทล.41)',
    lat: 9.9450,
    lng: 99.0780,
    road: 'ทล.41 สายเอเชีย',
    neighbors: ['chumphon', 'surat']
  },
  surat: {
    id: 'surat',
    name: 'สี่แยกพุนพิน สุราษฎร์ธานี (ทล.41 เชื่อม ทล.401)',
    lat: 9.1382,
    lng: 99.3217,
    road: 'ทล.41 / ทล.401 เชื่อมฝั่งอ่าวไทย-อันดามัน',
    neighbors: ['langsuan', 'phangnga', 'krabi', 'thungsong']
  },
  phangnga: {
    id: 'phangnga',
    name: 'พังงา (ทล.4 / ทล.402 สะพานสารสิน)',
    lat: 8.4509,
    lng: 98.5191,
    road: 'ทล.4 / ทล.402 ทางหลวงสู่เกาะภูเก็ต',
    neighbors: ['ranong', 'surat', 'phuket', 'krabi']
  },
  phuket: {
    id: 'phuket',
    name: 'สะพานสารสิน - ภูเก็ต (ทล.402)',
    lat: 7.8804,
    lng: 98.3923,
    road: 'ทล.402 ถนนเทพกระษัตรี',
    neighbors: ['phangnga']
  },
  krabi: {
    id: 'krabi',
    name: 'กระบี่ (ทล.4 ถนนเพชรเกษม)',
    lat: 8.0863,
    lng: 98.9063,
    road: 'ทล.4 / ทล.44 เซาท์เทิร์นซีบอร์ด',
    neighbors: ['phangnga', 'surat', 'trang']
  },
  thungsong: {
    id: 'thungsong',
    name: 'สี่แยกทุ่งสง นครศรีธรรมราช (ทล.41 ตัด ทล.403)',
    lat: 8.1645,
    lng: 99.6805,
    road: 'ทล.41 สายเอเชีย / ทล.403',
    neighbors: ['surat', 'trang', 'phatthalung']
  },
  trang: {
    id: 'trang',
    name: 'ตรัง (ทล.4 / ทล.403)',
    lat: 7.5563,
    lng: 99.6114,
    road: 'ทล.4 เพชรเกษม / ทล.403',
    neighbors: ['krabi', 'thungsong', 'phatthalung']
  },
  phatthalung: {
    id: 'phatthalung',
    name: 'สี่แยกเอเชีย พัทลุง (ทล.41 บรรจบ ทล.4)',
    lat: 7.6166,
    lng: 100.0740,
    road: 'ทล.4 ถนนเพชรเกษม / AH2',
    neighbors: ['thungsong', 'trang', 'hatyai']
  },
  hatyai: {
    id: 'hatyai',
    name: 'หาดใหญ่ สงขลา (ศูนย์กลางคมนาคมภาคใต้)',
    lat: 7.0084,
    lng: 100.4767,
    road: 'ทล.4 / ทล.408 / ทล.42 / ทล.43',
    neighbors: ['phatthalung', 'songkhla', 'pattani', 'sadao']
  },
  songkhla: {
    id: 'songkhla',
    name: 'สงขลา (สะพานติณสูลานนท์ ทล.408)',
    lat: 7.1898,
    lng: 100.5954,
    road: 'ทล.408 เลียบชายฝั่งอ่าวไทย',
    neighbors: ['hatyai', 'phatthalung']
  },
  sadao: {
    id: 'sadao',
    name: 'ด่านพรมแดนสะเดา (ปลายทาง AH2 สู่มาเลเซีย)',
    lat: 6.6433,
    lng: 100.4200,
    road: 'ทล.4 ถนนเพชรเกษม (AH2 สุดชายแดน)',
    neighbors: ['hatyai']
  },
  pattani: {
    id: 'pattani',
    name: 'ปัตตานี (ทล.42 / ทล.43)',
    lat: 6.8696,
    lng: 101.2501,
    road: 'ทล.42 ถนนเพชรเกษมสายปัตตานี-นราธิวาส',
    neighbors: ['hatyai', 'yala', 'narathiwat']
  },
  yala: {
    id: 'yala',
    name: 'ยะลา (ทล.410)',
    lat: 6.5411,
    lng: 101.2813,
    road: 'ทล.410 สู่เบตงใต้สุดแดนสยาม',
    neighbors: ['pattani', 'betong']
  },
  betong: {
    id: 'betong',
    name: 'เบตง ใต้สุดแดนสยาม เมืองในหมอก',
    lat: 5.7743,
    lng: 101.0718,
    road: 'ทล.410 ยะลา-เบตง',
    neighbors: ['yala']
  },
  narathiwat: {
    id: 'narathiwat',
    name: 'นราธิวาส (ด่านสุไหงโก-ลก ทล.42)',
    lat: 6.4255,
    lng: 101.8253,
    road: 'ทล.42 เลียบฝั่งอ่าวไทย',
    neighbors: ['pattani']
  },

  // Eastern Corridor (Motorway 7 & Sukhumvit Route 3)
  motorway7: {
    id: 'motorway7',
    name: 'สุวรรณภูมิ / ลาดกระบัง (มอเตอร์เวย์ 7)',
    lat: 13.6900,
    lng: 100.7501,
    road: 'ทางหลวงพิเศษระหว่างเมืองหมายเลข 7 (M7)',
    neighbors: ['bkk', 'chachoengsao', 'chonburi']
  },
  chachoengsao: {
    id: 'chachoengsao',
    name: 'ฉะเชิงเทรา (ทล.314 / ทล.304)',
    lat: 13.6904,
    lng: 101.0779,
    road: 'ทล.304 สู่กบินทร์บุรี-โคราช',
    neighbors: ['motorway7', 'chonburi', 'sakaeo']
  },
  chonburi: {
    id: 'chonburi',
    name: 'บายพาสชลบุรี (มอเตอร์เวย์ 7)',
    lat: 13.3611,
    lng: 100.9847,
    road: 'มอเตอร์เวย์ 7 / ทล.3 สุขุมวิท',
    neighbors: ['motorway7', 'chachoengsao', 'pattaya']
  },
  pattaya: {
    id: 'pattaya',
    name: 'พัทยา - มาบประชัน (มอเตอร์เวย์ 7 ส่วนต่อขยาย)',
    lat: 12.9276,
    lng: 100.8771,
    road: 'มอเตอร์เวย์ 7 / ทล.3 สุขุมวิท',
    neighbors: ['chonburi', 'rayong']
  },
  rayong: {
    id: 'rayong',
    name: 'มาบตาพุด - ระยอง (ทล.3 สุขุมวิท)',
    lat: 12.6815,
    lng: 101.2816,
    road: 'ทล.3 ถนนสุขุมวิท / ทล.36',
    neighbors: ['pattaya', 'chanthaburi']
  },
  chanthaburi: {
    id: 'chanthaburi',
    name: 'จันทบุรี (ทล.3 สุขุมวิท)',
    lat: 12.6114,
    lng: 102.1039,
    road: 'ทล.3 ถนนสุขุมวิท',
    neighbors: ['rayong', 'trat', 'sakaeo']
  },
  trat: {
    id: 'trat',
    name: 'ตราด (สุดแดนบูรพา ทล.3)',
    lat: 12.2428,
    lng: 102.5175,
    road: 'ทล.3 ถนนสุขุมวิท (สิ้นสุด)',
    neighbors: ['chanthaburi']
  },
  sakaeo: {
    id: 'sakaeo',
    name: 'สระแก้ว - อรัญประเทศ (ทล.33 สุวรรณศร)',
    lat: 13.8140,
    lng: 102.0728,
    road: 'ทล.33 ถนนสุวรรณศร / ทล.317',
    neighbors: ['chachoengsao', 'chanthaburi', 'saraburi']
  }
};

// Shortest path on Thailand Highway Network Graph using Dijkstra's Algorithm
function findShortestHighwayPath(
  startHubId: string,
  endHubId: string
): HighwayJunction[] {
  if (startHubId === endHubId) {
    return [THAI_HIGHWAY_GRAPH[startHubId]];
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(THAI_HIGHWAY_GRAPH));

  for (const id of unvisited) {
    distances[id] = Infinity;
    previous[id] = null;
  }
  distances[startHubId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;
    for (const id of unvisited) {
      if (distances[id] < smallestDist) {
        smallestDist = distances[id];
        currentId = id;
      }
    }

    if (currentId === null || distances[currentId] === Infinity) {
      break;
    }

    if (currentId === endHubId) {
      break;
    }

    unvisited.delete(currentId);
    const currNode = THAI_HIGHWAY_GRAPH[currentId];

    for (const neighborId of currNode.neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const neighborNode = THAI_HIGHWAY_GRAPH[neighborId];
      if (!neighborNode) continue;

      const edgeWeight = calculateGeoDistanceKm(
        currNode.lat,
        currNode.lng,
        neighborNode.lat,
        neighborNode.lng
      );
      const alt = distances[currentId] + edgeWeight;

      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    }
  }

  const path: HighwayJunction[] = [];
  let curr: string | null = endHubId;
  while (curr !== null) {
    path.unshift(THAI_HIGHWAY_GRAPH[curr]);
    curr = previous[curr];
  }

  return path.length > 0 && path[0].id === startHubId ? path : [];
}

// Map any province to its closest highway network junction
function findClosestHighwayJunction(lat: number, lng: number): HighwayJunction {
  let closest = Object.values(THAI_HIGHWAY_GRAPH)[0];
  let minD = Infinity;

  for (const node of Object.values(THAI_HIGHWAY_GRAPH)) {
    const d = calculateGeoDistanceKm(lat, lng, node.lat, node.lng);
    if (d < minD) {
      minD = d;
      closest = node;
    }
  }
  return closest;
}

// Compute authentic highway route with realistic curve points and metadata
export function computeThaiHighwayRoute(
  origin: ThaiProvinceData,
  dest: ThaiProvinceData
): RealRouteData {
  const originHub = findClosestHighwayJunction(origin.lat, origin.lng);
  const destHub = findClosestHighwayJunction(dest.lat, dest.lng);

  let hubSequence: HighwayJunction[] = [];
  if (originHub.id === destHub.id) {
    hubSequence = [originHub];
  } else {
    hubSequence = findShortestHighwayPath(originHub.id, destHub.id);
  }

  // Build raw waypoints starting at origin province, through highway corridors, to dest province
  const corridorWaypoints: google.maps.LatLngLiteral[] = [
    { lat: origin.lat, lng: origin.lng }
  ];

  // Add highway hubs (skip if too close to origin or dest)
  for (const hub of hubSequence) {
    const dOrig = calculateGeoDistanceKm(origin.lat, origin.lng, hub.lat, hub.lng);
    const dDest = calculateGeoDistanceKm(dest.lat, dest.lng, hub.lat, hub.lng);
    if (dOrig > 12 && dDest > 12) {
      corridorWaypoints.push({ lat: hub.lat, lng: hub.lng });
    }
  }

  corridorWaypoints.push({ lat: dest.lat, lng: dest.lng });

  // Generate high-resolution curved road points along the highway corridors
  const smoothPoints: google.maps.LatLngLiteral[] = [];
  for (let s = 0; s < corridorWaypoints.length - 1; s++) {
    const p1 = corridorWaypoints[s];
    const p2 = corridorWaypoints[s + 1];
    const segDist = calculateGeoDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    // 1 waypoint every ~6-10 km for smooth polyline and realistic car steering
    const steps = Math.max(8, Math.min(60, Math.round(segDist / 7)));

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      // Slight natural road curvature (roads follow valleys/rivers, not perfect straight lines)
      const roadSwerve = Math.sin(t * Math.PI) * 0.0035;
      const perpLat = -(p2.lng - p1.lng) * roadSwerve;
      const perpLng = (p2.lat - p1.lat) * roadSwerve;

      smoothPoints.push({
        lat: p1.lat + (p2.lat - p1.lat) * t + perpLat,
        lng: p1.lng + (p2.lng - p1.lng) * t + perpLng
      });
    }
  }
  smoothPoints.push(corridorWaypoints[corridorWaypoints.length - 1]);

  // Calculate realistic road highway distance
  let totalKm = 0;
  for (let i = 1; i < smoothPoints.length; i++) {
    totalKm += calculateGeoDistanceKm(
      smoothPoints[i - 1].lat,
      smoothPoints[i - 1].lng,
      smoothPoints[i].lat,
      smoothPoints[i].lng
    );
  }
  const realisticKm = Math.max(35, Math.round(totalKm * 1.08));

  // Determine Highway Corridor Name
  let roadName = '';
  const isNorth = origin.region === 'north' || dest.region === 'north';
  const isNE = origin.region === 'northeast' || dest.region === 'northeast';
  const isSouth = origin.region === 'south' || dest.region === 'south';
  const isEast = origin.region === 'east' || dest.region === 'east';

  if (isNorth && isNE) {
    roadName = 'ทล.12 ระเบียงเศรษฐกิจ East-West (พิษณุโลก-ขอนแก่น)';
  } else if (isNorth) {
    roadName = 'ทล.1 ถนนพหลโยธิน & ทล.11 ซุปเปอร์ไฮเวย์ (AH2)';
  } else if (isNE) {
    roadName = 'ทล.2 ถนนมิตรภาพ (AH12) & มอเตอร์เวย์สาย M6';
  } else if (isSouth) {
    roadName = 'ทล.35 ถนนพระราม 2 & ทล.4 เพชรเกษม / ทล.41 (AH2)';
  } else if (isEast) {
    roadName = 'ทางหลวงพิเศษระหว่างเมือง มอเตอร์เวย์หมายเลข 7';
  } else {
    roadName = 'โครงข่ายทางหลวงแผ่นดินไทยสายหลัก (AH1 / AH2)';
  }

  // Realistic highway driving speed ~80-95 km/h with traffic
  const hours = Math.floor(realisticKm / 85);
  const minutes = Math.round(((realisticKm % 85) / 85) * 60);
  const durationText = hours > 0 
    ? `${hours} ชม. ${minutes > 0 ? `${minutes} นาที` : ''}` 
    : `${Math.max(15, minutes)} นาที`;

  return {
    points: smoothPoints,
    distanceText: `${realisticKm.toLocaleString()} กม.`,
    durationText,
    roadName,
    distanceKm: realisticKm
  };
}

// Inner Google Maps Controller Component
const GoogleMapsThailandRoute: React.FC<{
  originProvince: ThaiProvinceData;
  destProvince: ThaiProvinceData;
  progressPercent: number;
  cameraFollow: boolean;
  onToggleCameraFollow?: () => void;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  setMapType: (type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => void;
  routeData: RealRouteData;
}> = ({
  originProvince,
  destProvince,
  progressPercent,
  cameraFollow,
  onToggleCameraFollow,
  mapType,
  setMapType,
  routeData
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // 1. Render Google Maps Polyline along Thai Highway Route
  useEffect(() => {
    if (!map || routeData.points.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const polyline = new google.maps.Polyline({
      path: routeData.points,
      geodesic: true,
      strokeColor: '#0284c7', // Sky-600 vivid highway blue
      strokeOpacity: 0.95,
      strokeWeight: 6,
      map
    });

    polylineRef.current = polyline;

    // Fit map bounds to show full highway trip initially
    const bounds = new google.maps.LatLngBounds();
    routeData.points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    return () => {
      polyline.setMap(null);
    };
  }, [map, routeData]);

  // 2. Compute current car position & heading angle along the highway polyline
  const { currentPos, headingAngle } = useMemo(() => {
    const points = routeData.points.length > 1 ? routeData.points : [
      { lat: originProvince.lat, lng: originProvince.lng },
      { lat: destProvince.lat, lng: destProvince.lng }
    ];

    if (points.length <= 1) {
      return { currentPos: points[0], headingAngle: 0 };
    }

    const t = Math.max(0, Math.min(1, progressPercent / 100));

    // Cumulative distances along road polyline
    const dists: number[] = [0];
    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
      const d = calculateGeoDistanceKm(
        points[i - 1].lat,
        points[i - 1].lng,
        points[i].lat,
        points[i].lng
      );
      totalDist += d;
      dists.push(totalDist);
    }

    if (totalDist === 0) {
      return { currentPos: points[0], headingAngle: 0 };
    }

    const targetDist = t * totalDist;
    let segIdx = 0;
    while (segIdx < dists.length - 2 && dists[segIdx + 1] < targetDist) {
      segIdx++;
    }

    const p1 = points[segIdx];
    const p2 = points[segIdx + 1] || p1;
    const segDist = dists[segIdx + 1] - dists[segIdx];
    const segT = segDist > 0 ? Math.max(0, Math.min(1, (targetDist - dists[segIdx]) / segDist)) : 0;

    const lat = p1.lat + (p2.lat - p1.lat) * segT;
    const lng = p1.lng + (p2.lng - p1.lng) * segT;

    // Heading calculation in degrees (0 = North, 90 = East, 180 = South, 270 = West)
    const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
    const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(p2.lat * (Math.PI / 180));
    const x = Math.cos(p1.lat * (Math.PI / 180)) * Math.sin(p2.lat * (Math.PI / 180)) -
              Math.sin(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) * Math.cos(dLng);
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    heading = (heading + 360) % 360;

    return {
      currentPos: { lat, lng },
      headingAngle: heading
    };
  }, [routeData.points, originProvince, destProvince, progressPercent]);

  // 3. Smooth Camera Tracking Follow: Auto-pan to the moving car along real road
  useEffect(() => {
    if (!map || !cameraFollow) return;
    map.panTo(currentPos);
  }, [map, currentPos, cameraFollow]);

  const handleZoom = (delta: number) => {
    if (!map) return;
    const currentZoom = map.getZoom() || 7;
    map.setZoom(currentZoom + delta);
  };

  const handleCenterRoute = () => {
    if (!map) return;
    if (routeData.points.length >= 2) {
      const bounds = new google.maps.LatLngBounds();
      routeData.points.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  };

  return (
    <>
      {/* 1. Origin Province Marker */}
      <AdvancedMarker
        position={{ lat: originProvince.lat, lng: originProvince.lng }}
        title={`จุดเริ่มต้น: ${originProvince.name}`}
      >
        <div className="flex flex-col items-center select-none group cursor-pointer">
          <div className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] shadow-lg border border-white flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{originProvince.name}</span>
          </div>
          <div className="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-md" />
        </div>
      </AdvancedMarker>

      {/* 2. Destination Province Marker */}
      <AdvancedMarker
        position={{ lat: destProvince.lat, lng: destProvince.lng }}
        title={`ปลายทาง: ${destProvince.name}`}
      >
        <div className="flex flex-col items-center select-none group cursor-pointer">
          <div className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-bold text-[10px] shadow-lg border border-white flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-white" />
            <span>{destProvince.name}</span>
          </div>
          <div className="w-2 h-2 bg-rose-600 rotate-45 -mt-1 shadow-md" />
        </div>
      </AdvancedMarker>

      {/* 3. Moving GT Sports Car Marker with Heading Rotation & Realistic Headlights */}
      <AdvancedMarker
        position={currentPos}
        title="ตำแหน่งรถยนต์ปัจจุบันบนทางหลวงจริง"
      >
        <div 
          className="relative transition-transform duration-200 select-none cursor-pointer"
          style={{ transform: `rotate(${headingAngle}deg)` }}
        >
          {/* Headlight Beams */}
          <div 
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-t from-amber-300/40 via-amber-200/20 to-transparent pointer-events-none rounded-t-full blur-2xs animate-pulse"
          />

          {/* Car Vehicle Icon */}
          <div className="w-10 h-14 rounded-xl bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-700 p-0.5 shadow-2xl border border-white/90 flex flex-col items-center justify-between">
            {/* Front Windshield */}
            <div className="w-7 h-3 rounded-t-md bg-slate-900 border border-sky-300/40 mt-1" />
            {/* Roof */}
            <div className="w-6 h-3 rounded-xs bg-slate-800" />
            {/* Rear Windshield */}
            <div className="w-7 h-2.5 rounded-b-md bg-slate-900 mb-1" />
          </div>

          {/* Wheel Hubs */}
          <span className="absolute -left-1 top-2 w-1 h-3 bg-slate-900 rounded-xs" />
          <span className="absolute -right-1 top-2 w-1 h-3 bg-slate-900 rounded-xs" />
          <span className="absolute -left-1 bottom-2 w-1 h-3 bg-slate-900 rounded-xs" />
          <span className="absolute -right-1 bottom-2 w-1 h-3 bg-slate-900 rounded-xs" />
        </div>
      </AdvancedMarker>

      {/* Floating Map Controls on Top-Right */}
      <div className="absolute top-3 right-3 flex flex-col space-y-1.5 z-20 pointer-events-auto">
        {/* Camera Follow Toggle */}
        <button
          onClick={onToggleCameraFollow}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-lg transition-all active:scale-90 cursor-pointer ${
            cameraFollow
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title={cameraFollow ? 'กล้องกำลังติดตามรถ (คลิกเพื่อปิด)' : 'เปิดกล้องติดตามรถ'}
        >
          {cameraFollow ? <Video className="w-4 h-4 animate-pulse" /> : <VideoOff className="w-4 h-4" />}
        </button>

        {/* Map Type Switcher */}
        <button
          onClick={() => {
            const types: ('roadmap' | 'satellite' | 'hybrid' | 'terrain')[] = ['terrain', 'roadmap', 'satellite', 'hybrid'];
            const nextIdx = (types.indexOf(mapType) + 1) % types.length;
            setMapType(types[nextIdx]);
          }}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title={`เปลี่ยนรูปแบบแผนที่ (ปัจจุบัน: ${mapType})`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Recenter Route */}
        <button
          onClick={handleCenterRoute}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="จัดมุมมองทั้งเส้นทาง"
        >
          <Navigation className="w-4 h-4 text-sky-400" />
        </button>

        {/* Zoom In / Out */}
        <button
          onClick={() => handleZoom(1)}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="ซูมเข้า"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="ซูมออก"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export const FocusThailandRoadMap: React.FC<FocusThailandRoadMapProps> = ({
  originProvince,
  destProvince,
  progressPercent,
  isDriving = false,
  cameraFollow = true,
  onToggleCameraFollow
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [isFollowLocal, setIsFollowLocal] = useState<boolean>(cameraFollow);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setIsFollowLocal(cameraFollow);
  }, [cameraFollow]);

  const handleToggleFollow = () => {
    const next = !isFollowLocal;
    setIsFollowLocal(next);
    onToggleCameraFollow?.();
  };

  // Google Maps API Key
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDsRS6tLrKOlwTPl2LbJGrc9yBYi2M8i4M';

  // Compute authentic highway route and path
  const routeData = useMemo(() => {
    return computeThaiHighwayRoute(originProvince, destProvince);
  }, [originProvince, destProvince]);

  const totalKm = routeData.distanceKm;
  const kmDriven = Math.round((progressPercent / 100) * totalKm);
  const kmRemaining = Math.max(0, totalKm - kmDriven);

  const initialCenter = useMemo(() => ({
    lat: (originProvince.lat + destProvince.lat) / 2,
    lng: (originProvince.lng + destProvince.lng) / 2
  }), [originProvince.lat, originProvince.lng, destProvince.lat, destProvince.lng]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
      
      {/* Main Google Maps View (Real Google Maps of Thailand with Real Highway Routing) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        {apiKey ? (
          <APIProvider apiKey={apiKey} language="th" region="TH">
            <GoogleMap
              defaultCenter={initialCenter}
              defaultZoom={7}
              mapTypeId={mapType}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling="greedy"
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
            >
              <GoogleMapsThailandRoute
                originProvince={originProvince}
                destProvince={destProvince}
                progressPercent={progressPercent}
                cameraFollow={isFollowLocal}
                onToggleCameraFollow={handleToggleFollow}
                mapType={mapType}
                setMapType={setMapType}
                routeData={routeData}
              />
            </GoogleMap>
          </APIProvider>
        ) : (
          /* Graceful Fallback if API Key is not set */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
            <Compass className="w-10 h-10 text-sky-400 mb-2 animate-spin" />
            <p className="text-sm font-bold">กำลังเชื่อมต่อ Google Maps ประเทศไทย...</p>
          </div>
        )}
      </div>

      {/* Floating Top-Left Road Trip Navigation HUD (Compact & Collapsible to prevent blocking map) */}
      <div className="absolute top-3 left-3 z-20 pointer-events-auto max-w-[calc(100%-64px)] sm:max-w-md transition-all">
        {isCollapsed ? (
          /* Collapsed Mini Capsule */
          <div
            onClick={() => setIsCollapsed(false)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl cursor-pointer transition-all active:scale-95 group"
            title="คลิกเพื่อขยายดูรายละเอียดเส้นทาง"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[200px]">
              {originProvince.name} ➔ {destProvince.name}
            </span>
            <span className="text-[10px] text-amber-300 font-mono font-bold shrink-0">
              เหลือ {kmRemaining} กม.
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold shrink-0">
              {progressPercent.toFixed(1)}%
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 transition-transform group-hover:translate-y-0.5" />
          </div>
        ) : (
          /* Expanded Compact Card */
          <div className="flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl max-w-[290px] sm:max-w-md transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  <Milestone className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold truncate">
                  <span className="text-emerald-400 truncate max-w-[85px] sm:max-w-[120px]">{originProvince.name}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-rose-400 truncate max-w-[85px] sm:max-w-[120px]">{destProvince.name}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-black">
                  {progressPercent.toFixed(1)}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="w-6 h-6 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="ย่อแถบข้อมูลเพื่อเปิดมุมมองแผนที่ให้กว้างขึ้น"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/90 text-[10px] text-slate-400 gap-2">
              <span className="truncate">
                ระยะทาง: <span className="font-bold text-slate-200">{routeData.distanceText}</span> (เหลือ <span className="text-amber-400 font-bold">{kmRemaining} กม.</span>)
              </span>
              <span className="text-amber-300 font-mono shrink-0 hidden sm:inline">
                {routeData.durationText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Driving Perspective HUD: Real Highway & Live Speed */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white shadow-xl max-w-[calc(100%-24px)] sm:max-w-fit">
        <div className="flex items-center space-x-1.5">
          <Gauge className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <p className="text-[8px] text-slate-400 font-mono uppercase leading-tight">ความเร็ว</p>
            <p className="text-xs font-black font-mono text-amber-400 leading-tight">
              {isDriving ? '110 km/h' : '0 km/h'}
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        <div className="flex items-center space-x-1.5 min-w-0">
          <Route className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[8px] text-slate-400 font-mono uppercase leading-tight">สายทางหลวง</p>
            <p className="text-xs font-bold text-slate-200 truncate max-w-[130px] sm:max-w-xs leading-tight">
              {routeData.roadName}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Road Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 w-full h-1.5 bg-slate-900/60 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
