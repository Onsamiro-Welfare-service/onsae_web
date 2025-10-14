import {
  _id,
  _price,
  _times,
  _company,
  _boolean,
  _fullName,
  _taskNames,
  _postTitles,
  _description,
  _productNames,
} from './_mock';

// ----------------------------------------------------------------------

export const _myAccount = {
  displayName: 'Jaydon Frankie',
  email: 'demo@minimals.cc',
  photoURL: '',
};

// ----------------------------------------------------------------------

export const _users = [...Array(24)].map((_, index) => ({
  id: _id(index),
  name: _fullName(index),
  company: _company(index),
  isVerified: _boolean(index),
  avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  status: index % 4 ? 'active' : 'banned',
  role:
    [
      'Leader',
      'Hr Manager',
      'UI Designer',
      'UX Designer',
      'UI/UX Designer',
      'Project Manager',
      'Backend Developer',
      'Full Stack Designer',
      'Front End Developer',
      'Full Stack Developer',
    ][index] || 'UI Designer',
}));

// ----------------------------------------------------------------------

export const _posts = [...Array(23)].map((_, index) => ({
  id: _id(index),
  title: _postTitles(index),
  description: _description(index),
  coverUrl: `/assets/images/cover/cover-${index + 1}.webp`,
  totalViews: 8829,
  totalComments: 7977,
  totalShares: 8556,
  totalFavorites: 8870,
  postedAt: _times(index),
  author: {
    name: _fullName(index),
    avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  },
}));

// ----------------------------------------------------------------------

const COLORS = [
  '#00AB55',
  '#000000',
  '#FFFFFF',
  '#FFC0CB',
  '#FF4842',
  '#1890FF',
  '#94D82D',
  '#FFC107',
];

export const _products = [...Array(24)].map((_, index) => {
  const setIndex = index + 1;

  return {
    id: _id(index),
    price: _price(index),
    name: _productNames(index),
    priceSale: setIndex % 3 ? null : _price(index),
    coverUrl: `/assets/images/product/product-${setIndex}.webp`,
    colors:
      (setIndex === 1 && COLORS.slice(0, 2)) ||
      (setIndex === 2 && COLORS.slice(1, 3)) ||
      (setIndex === 3 && COLORS.slice(2, 4)) ||
      (setIndex === 4 && COLORS.slice(3, 6)) ||
      (setIndex === 23 && COLORS.slice(4, 6)) ||
      (setIndex === 24 && COLORS.slice(5, 6)) ||
      COLORS,
    status:
      ([1, 3, 5].includes(setIndex) && 'sale') || ([4, 8, 12].includes(setIndex) && 'new') || '',
  };
});

// ----------------------------------------------------------------------

export const _langs = [
  {
    value: 'en',
    label: 'English',
    icon: '/assets/icons/flags/ic-flag-en.svg',
  },
  {
    value: 'de',
    label: 'German',
    icon: '/assets/icons/flags/ic-flag-de.svg',
  },
  {
    value: 'fr',
    label: 'French',
    icon: '/assets/icons/flags/ic-flag-fr.svg',
  },
];

// ----------------------------------------------------------------------

export const _timeline = [...Array(5)].map((_, index) => ({
  id: _id(index),
  title: [
    '1983, orders, $4220',
    '12 Invoices have been paid',
    'Order #37745 from September',
    'New order placed #XF-2356',
    'New order placed #XF-2346',
  ][index],
  type: `order${index + 1}`,
  time: _times(index),
}));

export const _traffic = [
  {
    value: 'facebook',
    label: 'Facebook',
    total: 19500,
  },
  {
    value: 'google',
    label: 'Google',
    total: 91200,
  },
  {
    value: 'linkedin',
    label: 'Linkedin',
    total: 69800,
  },
  {
    value: 'twitter',
    label: 'Twitter',
    total: 84900,
  },
];

export const _tasks = Array.from({ length: 5 }, (_, index) => ({
  id: _id(index),
  name: _taskNames(index),
}));

// ----------------------------------------------------------------------

export const _notifications = [
  {
    id: _id(1),
    title: 'Your order is placed',
    description: 'waiting for shipping',
    avatarUrl: null,
    type: 'order-placed',
    postedAt: _times(1),
    isUnRead: true,
  },
  {
    id: _id(2),
    title: _fullName(2),
    description: 'answered to your comment on the Minimal',
    avatarUrl: '/assets/images/avatar/avatar-2.webp',
    type: 'friend-interactive',
    postedAt: _times(2),
    isUnRead: true,
  },
  {
    id: _id(3),
    title: 'You have new message',
    description: '5 unread messages',
    avatarUrl: null,
    type: 'chat-message',
    postedAt: _times(3),
    isUnRead: false,
  },
  {
    id: _id(4),
    title: 'You have new mail',
    description: 'sent from Guido Padberg',
    avatarUrl: null,
    type: 'mail',
    postedAt: _times(4),
    isUnRead: false,
  },
  {
    id: _id(5),
    title: 'Delivery processing',
    description: 'Your order is being shipped',
    avatarUrl: null,
    type: 'order-shipped',
    postedAt: _times(5),
    isUnRead: false,
  },
];

// 복지관 케어 시스템용 새로운 사용자 데이터
export const _careUsers = [
  {
    id: 'A001',
    name: '김철수',
    code: 'A001',
    phoneNumber: '010-1234-5678',
    guardianName: '김영희',
    guardianRelation: '부모',
    guardianPhone: '010-9876-5432',
    group: '고혈압',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-1.webp',
  },
  {
    id: 'A002',
    name: '이영희',
    code: 'A002',
    phoneNumber: '010-2345-6789',
    guardianName: '박민수',
    guardianRelation: '배우자',
    guardianPhone: '010-8765-4321',
    group: '당뇨병',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-2.webp',
  },
  {
    id: 'A003',
    name: '박민수',
    code: 'A003',
    phoneNumber: '010-3456-7890',
    guardianName: '이영희',
    guardianRelation: '배우자',
    guardianPhone: '010-7654-3210',
    group: '심장병',
    status: 'inactive',
    avatarUrl: '/assets/images/avatar/avatar-3.webp',
  },
  {
    id: 'A004',
    name: '최영수',
    code: 'A004',
    phoneNumber: '010-4567-8901',
    guardianName: '최영희',
    guardianRelation: '자녀',
    guardianPhone: '010-6543-2109',
    group: '고혈압',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-4.webp',
  },
  {
    id: 'A005',
    name: '정미영',
    code: 'A005',
    phoneNumber: '010-5678-9012',
    guardianName: '정민수',
    guardianRelation: '형제',
    guardianPhone: '010-5432-1098',
    group: '당뇨병',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-5.webp',
  },
  {
    id: 'A006',
    name: '한상호',
    code: 'A006',
    phoneNumber: '010-6789-0123',
    guardianName: '한미영',
    guardianRelation: '부모',
    guardianPhone: '010-4321-0987',
    group: '치매',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-6.webp',
  },
  {
    id: 'A007',
    name: '윤정희',
    code: 'A007',
    phoneNumber: '010-7890-1234',
    guardianName: '윤상호',
    guardianRelation: '자녀',
    guardianPhone: '010-3210-9876',
    group: '고혈압',
    status: 'inactive',
    avatarUrl: '/assets/images/avatar/avatar-7.webp',
  },
  {
    id: 'A008',
    name: '강민수',
    code: 'A008',
    phoneNumber: '010-8901-2345',
    guardianName: '강정희',
    guardianRelation: '배우자',
    guardianPhone: '010-2109-8765',
    group: '당뇨병',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-8.webp',
  },
  {
    id: 'A009',
    name: '임영수',
    code: 'A009',
    phoneNumber: '010-9012-3456',
    guardianName: '임민수',
    guardianRelation: '형제',
    guardianPhone: '010-1098-7654',
    group: '심장병',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-9.webp',
  },
  {
    id: 'A010',
    name: '조미영',
    code: 'A010',
    phoneNumber: '010-0123-4567',
    guardianName: '조영수',
    guardianRelation: '부모',
    guardianPhone: '010-0987-6543',
    group: '치매',
    status: 'active',
    avatarUrl: '/assets/images/avatar/avatar-10.webp',
  },
];

// 복지관 케어 시스템용 질문 데이터
export const _questions = [
  {
    id: 'Q001',
    title: '오늘의 기분은 어떠세요?',
    content: '오늘 하루 동안의 전반적인 기분 상태를 평가해 주세요. 이 정보는 건강 상태 모니터링에 도움이 됩니다.',
    category: '건강상태',
    type: '객관식',
    priority: '높음',
    status: 'active',
    options: ['좋음', '보통', '나쁨'],
    createdAt: '2024-01-15',
    createdBy: '김관리',
    totalResponses: 1234,
    responseRate: 85.2,
    avgResponseTime: 2.3,
    lastResponse: '2시간 전',
  },
  {
    id: 'Q002',
    title: '혈압 측정 결과는?',
    content: '오늘 측정한 혈압 수치를 입력해 주세요. 정확한 수치를 알려주시면 건강 관리에 도움이 됩니다.',
    category: '건강상태',
    type: '텍스트 입력',
    priority: '높음',
    status: 'active',
    options: [],
    createdAt: '2024-01-14',
    createdBy: '김관리',
    totalResponses: 987,
    responseRate: 78.5,
    avgResponseTime: 1.8,
    lastResponse: '1시간 전',
  },
  {
    id: 'Q003',
    title: '약물 복용 여부',
    content: '오늘 처방받은 약물을 복용하셨나요?',
    category: '건강상태',
    type: '예/아니오',
    priority: '중간',
    status: 'active',
    options: ['예', '아니오'],
    createdAt: '2024-01-13',
    createdBy: '김관리',
    totalResponses: 1456,
    responseRate: 92.1,
    avgResponseTime: 0.5,
    lastResponse: '30분 전',
  },
  {
    id: 'Q004',
    title: '수면 시간은 얼마나 되었나요?',
    content: '어제 밤 몇 시간 정도 잠을 주무셨나요?',
    category: '생활습관',
    type: '객관식',
    priority: '중간',
    status: 'active',
    options: ['4시간 미만', '4-6시간', '6-8시간', '8시간 이상'],
    createdAt: '2024-01-12',
    createdBy: '이관리',
    totalResponses: 876,
    responseRate: 73.2,
    avgResponseTime: 1.2,
    lastResponse: '3시간 전',
  },
  {
    id: 'Q005',
    title: '운동을 하셨나요?',
    content: '오늘 어떤 종류의 운동을 하셨는지 알려주세요.',
    category: '생활습관',
    type: '다중 선택',
    priority: '낮음',
    status: 'active',
    options: ['걷기', '조깅', '수영', '자전거', '기타'],
    createdAt: '2024-01-11',
    createdBy: '이관리',
    totalResponses: 654,
    responseRate: 68.9,
    avgResponseTime: 2.1,
    lastResponse: '4시간 전',
  },
  {
    id: 'Q006',
    title: '식사는 잘 하셨나요?',
    content: '오늘 세 끼 식사를 모두 드셨나요?',
    category: '생활습관',
    type: '예/아니오',
    priority: '중간',
    status: 'inactive',
    options: ['예', '아니오'],
    createdAt: '2024-01-10',
    createdBy: '박관리',
    totalResponses: 432,
    responseRate: 45.6,
    avgResponseTime: 0.8,
    lastResponse: '1일 전',
  },
  {
    id: 'Q007',
    title: '스트레스 수준은?',
    content: '오늘 느끼신 스트레스 수준을 평가해 주세요.',
    category: '정신건강',
    type: '스케일',
    priority: '높음',
    status: 'active',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    createdAt: '2024-01-09',
    createdBy: '박관리',
    totalResponses: 789,
    responseRate: 82.3,
    avgResponseTime: 1.5,
    lastResponse: '2시간 전',
  },
  {
    id: 'Q008',
    title: '가족과의 대화는?',
    content: '오늘 가족과 얼마나 대화를 나누셨나요?',
    category: '사회활동',
    type: '객관식',
    priority: '낮음',
    status: 'active',
    options: ['많이', '보통', '적게', '전혀 없음'],
    createdAt: '2024-01-08',
    createdBy: '최관리',
    totalResponses: 567,
    responseRate: 71.4,
    avgResponseTime: 1.8,
    lastResponse: '5시간 전',
  },
  {
    id: 'Q009',
    title: '의료진과의 상담은?',
    content: '최근 의료진과 상담한 내용이 있으시면 알려주세요.',
    category: '의료상담',
    type: '텍스트 입력',
    priority: '높음',
    status: 'active',
    options: [],
    createdAt: '2024-01-07',
    createdBy: '최관리',
    totalResponses: 234,
    responseRate: 89.7,
    avgResponseTime: 3.2,
    lastResponse: '1시간 전',
  },
  {
    id: 'Q010',
    title: '복지관 프로그램 참여',
    content: '오늘 복지관에서 진행된 프로그램에 참여하셨나요?',
    category: '사회활동',
    type: '예/아니오',
    priority: '중간',
    status: 'active',
    options: ['예', '아니오'],
    createdAt: '2024-01-06',
    createdBy: '정관리',
    totalResponses: 345,
    responseRate: 76.8,
    avgResponseTime: 0.9,
    lastResponse: '6시간 전',
  },
];

// 복지관 케어 시스템용 응답 데이터
export const _responses = [
  {
    id: 'R001',
    userId: 'A001',
    userName: '김철수',
    userCode: 'A001',
    questionId: 'Q001',
    questionTitle: '오늘의 기분은 어떠세요?',
    responseData: {
      선택답변: '좋음',
      기타의견: null,
    },
    responseSummary: '기분: 좋음, 수면: 보통, 식욕: 좋음',
    responseText: '좋음',
    submittedAt: '2024-01-15 09:30',
    responseTime: 2.3,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q001',
        questionTitle: '오늘 기분은 어떠신가요?',
        answer: '좋음',
      },
      {
        questionId: 'Q004',
        questionTitle: '어제 밤 수면은 어떠셨나요?',
        answer: '보통',
      },
      {
        questionId: 'Q999',
        questionTitle: '식욕은 어떠신가요?',
        answer: '좋음',
      },
    ],
  },
  {
    id: 'R002',
    userId: 'A002',
    userName: '이영희',
    userCode: 'A002',
    questionId: 'Q001',
    questionTitle: '오늘의 기분은 어떠세요?',
    responseData: {
      선택답변: '보통',
      기타의견: '조금 피곤함',
    },
    responseSummary: '기분: 보통, 수면: 나쁨, 통증: 있음',
    responseText: '보통 (조금 피곤함)',
    submittedAt: '2024-01-15 10:15',
    responseTime: 1.8,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q001',
        questionTitle: '오늘 기분은 어떠신가요?',
        answer: '보통',
      },
      {
        questionId: 'Q004',
        questionTitle: '어제 밤 수면은 어떠셨나요?',
        answer: '나쁨',
      },
      {
        questionId: 'Q998',
        questionTitle: '통증이 있으신가요?',
        answer: '있음',
      },
    ],
  },
  {
    id: 'R003',
    userId: 'A003',
    userName: '박민수',
    userCode: 'A003',
    questionId: 'Q007',
    questionTitle: '스트레스 수준은?',
    responseData: {
      선택답변: '7',
      기타의견: null,
    },
    responseSummary: '기분: 나쁨, 수면: 좋음, 식욕: 보통',
    responseText: '7점',
    submittedAt: '2024-01-15 11:00',
    responseTime: 1.5,
    status: 'incomplete',
    detailedResponses: [
      {
        questionId: 'Q001',
        questionTitle: '오늘 기분은 어떠신가요?',
        answer: '나쁨',
      },
      {
        questionId: 'Q004',
        questionTitle: '어제 밤 수면은 어떠셨나요?',
        answer: '좋음',
      },
      {
        questionId: 'Q999',
        questionTitle: '식욕은 어떠신가요?',
        answer: '보통',
      },
    ],
  },
  {
    id: 'R004',
    userId: 'A004',
    userName: '최수진',
    userCode: 'A004',
    questionId: 'Q003',
    questionTitle: '약물 복용 여부',
    responseData: {
      선택답변: '예',
      기타의견: null,
    },
    responseSummary: '기분: 좋음, 수면: 좋음, 식욕: 좋음',
    responseText: '예',
    submittedAt: '2024-01-15 12:30',
    responseTime: 0.5,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q001',
        questionTitle: '오늘 기분은 어떠신가요?',
        answer: '좋음',
      },
      {
        questionId: 'Q004',
        questionTitle: '어제 밤 수면은 어떠셨나요?',
        answer: '좋음',
      },
      {
        questionId: 'Q999',
        questionTitle: '식욕은 어떠신가요?',
        answer: '좋음',
      },
    ],
  },
  {
    id: 'R005',
    userId: 'A005',
    userName: '정미영',
    userCode: 'A005',
    questionId: 'Q002',
    questionTitle: '혈압 측정 결과는?',
    responseData: {
      선택답변: null,
      기타의견: '130/80 mmHg',
    },
    responseSummary: '혈압: 130/80, 약물복용: 예',
    responseText: '130/80 mmHg',
    submittedAt: '2024-01-15 13:45',
    responseTime: 3.2,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q002',
        questionTitle: '혈압 측정 결과는?',
        answer: '130/80 mmHg',
      },
      {
        questionId: 'Q003',
        questionTitle: '약물 복용 여부',
        answer: '예',
      },
    ],
  },
  {
    id: 'R006',
    userId: 'A006',
    userName: '한상호',
    userCode: 'A006',
    questionId: 'Q008',
    questionTitle: '가족과의 대화는?',
    responseData: {
      선택답변: '많이',
      기타의견: '딸과 손자와 많은 대화를 나눴음',
    },
    responseSummary: '가족대화: 많이, 기분: 좋음',
    responseText: '많이 (딸과 손자와 많은 대화를 나눴음)',
    submittedAt: '2024-01-15 14:20',
    responseTime: 2.1,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q008',
        questionTitle: '가족과의 대화는?',
        answer: '많이',
      },
      {
        questionId: 'Q001',
        questionTitle: '오늘 기분은 어떠신가요?',
        answer: '좋음',
      },
    ],
  },
  {
    id: 'R007',
    userId: 'A007',
    userName: '윤정희',
    userCode: 'A007',
    questionId: 'Q005',
    questionTitle: '운동을 하셨나요?',
    responseData: {
      선택답변: ['걷기', '기타'],
      기타의견: '집에서 요가 30분',
    },
    responseSummary: '운동: 걷기, 요가 30분',
    responseText: '걷기, 기타 (집에서 요가 30분)',
    submittedAt: '2024-01-15 15:10',
    responseTime: 1.9,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q005',
        questionTitle: '운동을 하셨나요?',
        answer: '걷기, 기타 (집에서 요가 30분)',
      },
    ],
  },
  {
    id: 'R008',
    userId: 'A008',
    userName: '강민수',
    userCode: 'A008',
    questionId: 'Q009',
    questionTitle: '의료진과의 상담은?',
    responseData: {
      선택답변: null,
      기타의견: '정기검진 받았음. 당뇨 수치가 조금 높다고 해서 식단 조절이 필요하다고 함.',
    },
    responseSummary: '의료상담: 정기검진, 당뇨관리 필요',
    responseText: '정기검진 받았음. 당뇨 수치가 조금 높다고 해서 식단 조절이 필요하다고 함.',
    submittedAt: '2024-01-15 16:30',
    responseTime: 4.1,
    status: 'completed',
    detailedResponses: [
      {
        questionId: 'Q009',
        questionTitle: '의료진과의 상담은?',
        answer: '정기검진 받았음. 당뇨 수치가 조금 높다고 해서 식단 조절이 필요하다고 함.',
      },
    ],
  },
];
