/* =========================================================
   Happy birthday! — A Story of Eunji & Jinhyung
   게임 콘텐츠 데이터

   이 파일만 수정하면 챕터, 퀴즈, 사진, 문구를 바꿀 수 있어요.
   새 에피소드는 chapters 배열 맨 끝에 Chapter 12 객체를 추가하면
   진행 바, 챕터 표시, 순서가 모두 자동으로 반영됩니다.

   ─ 장면(scene) 타입 ─────────────────────────────────────
   story       : 날짜 + 문장 + 말풍선(quote)
   quiz        : 객관식. answer: 'B'  또는  answer: ['A','C'] (복수 정답)
   status      : SINGLE → COUPLE 같은 상태 변화 애니메이션
   dialog      : 짧은 인터랙션(탭 N번) 후 대화창
   unlock      : "~ UNLOCKED" 배지 + 문장 + (선택) 사진
   gallery     : 사진 여러 장 갤러리 (탭하면 크게 보기)
   timeline    : 날짜별 이벤트 목록
   claw        : 인형뽑기 미니게임 (MEMORY CLAW)
   collection  : 탭해서 모으는 컬렉션 (예: 인형 16/16)
   merge       : 수박게임 스타일 미니게임 (MEMORY MERGE)
   achievement : 숫자 카운트업 업적
   warning     : 경고 연출 (가벼운 위기)
   gameover    : GAME OVER? → CONTINUE
   ride        : 놀이공원 애니메이션
   ppong       : 퐁이 첫 등장
   daily       : 체크리스트형 일상 인터랙션
   memory      : MEMORY UNLOCKED 화면. 챕터에 없으면 맨 끝에 자동 추가
   ========================================================= */

window.GAME_DATA = {
  meta: {
    title: 'Happy birthday!',
    subtitle: 'A Story of Eunji & Jinhyung',
    startDate: '2026-05-27',
    tagline: '127 days of us.',
    boyfriend: '진형',
    girlfriend: '은지',
    birthday: '2026.10.23'
  },

  mascot: {
    name: '퐁이',
    image: 'assets/ppong.jpg',
    // 챕터 10(퐁이를 처음 만난 날) 전까지는 실루엣 "???"로 등장합니다.
    cheers: ['정답이야!', '멍! 멍!', '역시 하지녕', '초록 공 내놔','허얼 천재'],
    mysteryCheers: ['???', '...!', '(누군가 지켜보고 있다)']
  },

  chapters: [
    {
      no: 1,
      code: 'FIRST ENCOUNTER',
      title: '처음 만난 날',
      date: '2026.03.12',
      place: '신촌',
      summary: '호주,축구,강아지 .. 우린 많은 공통점을 발견했다.',
      memory: { image: 'assets/photos/ch01.jpg', caption: '2026.03.12 · 신촌' },
      scenes: [
        {
          type: 'story',
          lines: ['시끌벅적한 맥주집 한쪽 테이블.', '처음 만난 두 사람은 이야기를 나누기 시작한다.', '좋아하는 것, 싫어하는 것, 등등…', '대화를 할수록 뭔가 이상하다.'],
          quoteLabel: '첫인상',
          quote: '오 공통점이 되게 많네??'
        },
        {
          type: 'quiz',
          question: '두 사람이 처음 만났을 때 가장 먼저 느낀 것은?',
          options: ['생각보다 어색한데?', '공통점이 되게 많네? 재밌다!', '완전 반대 성격인데?', '당장 집에 가고 싶다'],
          answer: 'B',
          correct: '맞아! 처음 만났는데 그렇게 끌린 건 처음이었어.',
          wrong: ['음… 그날 분위기는 그게 아니었는데?', '다시 떠올려 봐! 힌트: 대화가 끊기지 않았어.']
        }
      ]
    },

    {
      no: 2,
      code: 'CONNECTION',
      title: '연인이 된 날',
      date: '2026.05.27',
      summary: '오늘부터 1일!',
      memory: { image: 'assets/photos/ch02.jpg', caption: '2026.05.27 · Day 1' },
      scenes: [
        {
          type: 'status',
          from: 'SINGLE',
          to: 'COUPLE ❤️',
          lines: ['얼렁뚱땅 왁자지껄 우리의 연애 일기가', '진짜로 시작됐따!']
        }
      ]
    },

    {
      no: 3,
      code: 'FIRST GIFT',
      title: '첫 선물',
      date: '2026.06.18',
      summary: '은지 생일 기념 진형이가 은지에게 처음으로 선물을 준 날.',
      memory: { image: 'assets/photos/ch03.jpg', caption: '2026.06.18 · 향수와 꽃' },
      scenes: [
        {
          type: 'quiz',
          question: '이날 진형이가 은지에게 준 선물은?',
          options: ['인형', '향수와 꽃', '똥방구', '편지'],
          answer: 'B',
          correct: '정답! 디올 향수랑 꽃다발, 둘 다 받았던 날.',
          wrong: ['땡! 그건 아니었어.', '조금 더 향기로운 쪽이었어.ㅡㅡ']
        }
      ]
    },

    {
      no: 4,
      code: 'SWEET QUEST',
      title: '맥플러리',
      date: '2026.07.09',
      summary: '진형이가 전완근을 불태워 투게더 맥플러리 직접 만들어준 날.',
      memory: { image: 'assets/photos/ch04.jpg', caption: '2026.07.09 · 진형표 맥플러리' },
      scenes: [
        {
          type: 'dialog',
          intro: 'QUEST: 진형이의 맥플러리를 완성하라!',
          action: '스푼으로 휘젓기',
          taps: 4,
          lines: [
            { who: '진형', text: '마싯게 머거랏.' },
            { who: '은지', text: '마힛따' }
          ]
        }
      ]
    },

    {
      no: 5,
      code: 'TRAVEL MODE',
      title: '가평, 그리고 강릉',
      date: '2026.07.15 – 07.31',
      summary: '처음으로 함께 떠난 여행들.',
      memory: { image: 'assets/photos/ch05.jpg', caption: '2026.07 · 여름 여행' },
      scenes: [
        {
          type: 'unlock',
          badge: 'CO-OP MODE UNLOCKED',
          date: '2026.07.15 – 16',
          title: '가평 여행',
          lines: ['정윤 & 승준과 함께 떠난 가평 여행.', '2인 플레이가 4인 협동 플레이로 확장되었습니다.'],
          image: 'assets/photos/gapyeong-1.jpg'
        },
        {
          type: 'gallery',
          badge: 'FIRST COUPLE TRIP UNLOCKED',
          date: '2026.07.29 – 31',
          title: '둘이서 떠난 첫 여행, 강릉',
          lines: ['사진을 눌러서 크게 볼 수 있어요.'],
          photos: [
            { src: 'assets/photos/gangneung-01.jpg', caption: '강릉 #1' },
            { src: 'assets/photos/gangneung-02.jpg', caption: '강릉 #2' },
            { src: 'assets/photos/gangneung-03.jpg', caption: '강릉 #3' },
            { src: 'assets/photos/gangneung-04.jpg', caption: '강릉 #4' },
            { src: 'assets/photos/gangneung-05.jpg', caption: '강릉 #5' },
            { src: 'assets/photos/gangneung-06.jpg', caption: '강릉 #6' },
            { src: 'assets/photos/gangneung-07.jpg', caption: '강릉 #7' },
            { src: 'assets/photos/gangneung-08.jpg', caption: '강릉 #8' },
            { src: 'assets/photos/gangneung-09.jpg', caption: '강릉 #9' }
          ]
        }
      ]
    },

    {
      no: 6,
      code: 'SUMMER MEMORIES',
      title: '여름의 기록',
      date: '2026.08',
      summary: '영화, 두 번째 가평, 그리고 망원.',
      memory: { image: 'assets/photos/ch06.jpg', caption: '2026.08.20 · 망원 데이트' },
      scenes: [
        {
          type: 'timeline',
          items: [
            { date: '2026.08.09', title: '스파이더맨', text: '스파이더맨 영화를 본 날' },
            { date: '2026.08.12 – 13', title: '두 번째 가평', text: '진형이 친구들과 함께 떠난 가평 여행' },
            { date: '2026.08.20', title: '망원 데이트', text: '이날 인형을 16개 뽑았다.' }
          ]
        },
        {
          type: 'claw',
          title: 'MEMORY CLAW',
          date: '2026.08.20 · 망원 데이트',
          tries: 5,
          goal: 5,
          // 인형 목록: icon(이모지) 대신 image: 'assets/dolls/doll-01.png' 를 넣으면 사진으로 보여요.
          toys: [
            { icon: '🧸', name: '곰돌이' },
            { icon: '🐶', name: '강아지' },
            { icon: '🍓', name: '딸기' },
            { icon: '🌹', name: '장미' },
            { icon: '🍦', name: '아이스크림' }
          ],
          intro: '크레인을 움직여 인형을 잡아보세요!',
          unlockTitle: 'MEMORY UNLOCKED',
          unlockText: '2026년 8월 20일.\n망원에서 인형을 무려 16개나 뽑았던 날.',
          gameOver: '게임 종료!\n그래도 8월 20일에는 실제로 16개나 뽑았잖아 🧸❤'
        },
        {
          type: 'collection',
          title: '그날의 진짜 기록',
          total: 16,
          // {n}은 01, 02 … 16 으로 바뀝니다.
          itemPath: 'assets/dolls/doll-{n}.png',
          action: '뽑기!',
          lines: ['실제로 뽑은 인형은 16개! 전부 다시 모아보자.']
        },
        {
          type: 'merge',
          title: 'MEMORY MERGE',
          subtitle: '우리의 추억을 합쳐보세요',
          // 같은 추억 두 개가 닿으면 다음 단계로 합쳐져요. 마지막 두 개가 합쳐지면 완성!
          // 나중에 사진으로 바꿀 때는 icon 대신 image: 'assets/merge/01.png' 를 넣으면 돼요.
          levels: [
            { icon: '🍓', name: '첫 번째 추억', score: 2 },
            { icon: '🍊', name: '두 번째 추억', score: 5 },
            { icon: '🍎', name: '우리의 시작', score: 10 },
            { icon: '🍑', name: '데이트', score: 20 },
            { icon: '🍍', name: '여행', score: 40 },
            { icon: '🍉', name: '우리의 추억', score: 80 }
          ],
          // 이 단계까지 만들면 '다음' 버튼이 열려요 (0부터 셈, 3 = 🍑). 게임은 계속할 수 있어요.
          unlockAt: 3,
          intro: '위에서 끌어서 위치를 정하고, 손을 떼면 추억이 떨어져요!',
          finalTitle: '127 DAYS',
          finalText: '우리의 추억이\n하나의 이야기가 되었습니다.'
        }
      ]
    },

    {
      no: 7,
      code: '100 DAYS',
      title: '100일',
      date: '2026.09.03',
      summary: '두 사람이 함께한 지 100일째 되는 날.',
      memory: { image: 'assets/photos/ch07.jpg', caption: '2026.09.03 · 100일' },
      scenes: [
        {
          type: 'achievement',
          value: 100,
          unit: 'DAYS',
          badge: 'ACHIEVEMENT UNLOCKED',
          lines: ['2026.05.27부터 하루하루 쌓아 올린 100일.']
        },
        { type: 'memory' },
        {
          type: 'warning',
          title: 'WARNING',
          message: 'Relationship connection unstable...',
          lines: ['100일에 잠깐 신호가 약해졌다.', '(흔한 네트워크 지연입니다.)']
        }
      ]
    },

    {
      no: 8,
      code: 'CONTINUE',
      title: '화해, 그리고 한강',
      date: '2026.09.04',
      place: '한강',
      summary: '100일 다음 날.',
      memory: { image: 'assets/photos/ch08.jpg', caption: '2026.09.04 · 한강 데이트' },
      scenes: [
        {
          type: 'gameover',
          after: ['아직 끝난 이야기가 아니었다.'],
          lines: ['100일 다음 날, 두 사람은 화해하고', '한강으로 데이트를 떠났다.']
        }
      ]
    },

    {
      no: 9,
      code: 'ADVENTURE MODE',
      title: '롯데월드',
      date: '2026.09.10',
      place: '롯데월드',
      summary: '놀이공원 데이트.',
      memory: { image: 'assets/photos/ch09.jpg', caption: '2026.09.10 · 롯데월드' },
      scenes: [
        {
          type: 'ride',
          action: '자유이용권 사용하기',
          stamp: 'ADMIT TWO',
          lines: ['어트랙션, 퍼레이드, 그리고 줄 서면서 나눈 수다까지.', '모든 게 게임 속 어드벤처 같았던 날.']
        }
      ]
    },

    {
      no: 10,
      code: 'EVERYDAY',
      title: '퐁이를 만난 날',
      date: '2026.09.17',
      summary: '조금 특별하고, 조금 평범한 하루.',
      memory: { image: 'assets/photos/ch10.jpg', caption: '2026.09.17' },
      scenes: [
        {
          type: 'timeline',
          items: [
            { date: '2026.09.17', title: '퐁이를 처음 만남', text: '진형이가 키우는 비숑' },
            { date: '2026.09.17', title: '보드게임 카페', text: '승부욕이 드러난 시간' },
            { date: '2026.09.17', title: '영화 「인턴」', text: '같이 본 영화' }
          ]
        },
        {
          type: 'ppong',
          badge: 'MASCOT UNLOCKED',
          lines: ['그동안 가끔 보이던 실루엣의 정체는…', '진형이네 비숑, 퐁이!', '이제부터 퐁이가 화면 한쪽에서 응원해 줄 거예요.']
        }
      ]
    },

    {
      no: 11,
      code: 'EVERYDAY LOVE',
      title: '같이 피부과 간 날',
      date: '2026.09.23',
      summary: '특별한 사건이 없어도, 같이 보낸 하루는 추억이 된다.',
      memory: { image: 'assets/photos/ch11.jpg', caption: '2026.09.23 · 평범해서 좋은 날' },
      scenes: [
        {
          type: 'daily',
          title: '오늘의 퀘스트',
          items: ['둘이 처음으로 같이 피부과 가기', '평범한 하루를 같이 보내기', '그 하루를 추억으로 저장하기'],
          done: 'EVERYDAY LOVE +1',
          lines: ['평범한 일상도 둘이 함께면 기록할 만한 하루가 된다.']
        }
      ]
    }

    /* ── Chapter 12 이후 추가 예시 ────────────────────────
    ,{
      no: 12,
      code: 'NEW EPISODE',
      title: '새로운 에피소드',
      date: '2026.10.10',
      place: '장소',
      summary: '한 줄 요약',
      memory: { image: 'assets/photos/ch12.jpg', caption: '2026.10.10' },
      scenes: [
        { type: 'story', lines: ['이날 있었던 일'], quote: '그날의 한마디' },
        { type: 'quiz', question: '문제', options: ['1', '2', '3', '4'], answer: 'A' }
      ]
    }
    ─────────────────────────────────────────────────── */
  ],

  secretQuiz: {
    title: 'SECRET QUIZ',
    subtitle: 'HOW WELL DO YOU KNOW US?',
    questions: [
      {
        question: '은지가 자주 하는 말은?',
        options: ['귀여워', '배고파', '졸려', '진짜?'],
        answer: 'A',
        correct: '정답! 오늘도 몇 번 들었을걸?'
      },
      {
        question: '진형이가 자주 하는 말은? (모두 고르기)',
        options: ['완전 최키야 최틀러', '그대를 사모합니다', '나 응아둥 ..', '별거아니야', '난 운동이 제일 싫엉'],
        answer: ['A', 'C', 'D'],
        correct: '완벽해! 셋 다 진형이 공식 대사.'
      },
      {
        question: '둘만 아는 단어는?',
        options: ['밥 먹었어??', '똥 먹었어??', '잘 잤어??', '뭐 해??'],
        answer: 'B',
        correct: '정답… 이게 왜 우리 단어인지는 둘만 알지.'
      },
      {
        question: '은지가 좋아하는 음식은? (모두 고르기)',
        options: ['떡볶이', '초밥', '마라탕', '쭈꾸미', '굴'],
        answer: ['A', 'B', 'C', 'D'],
        correct: '정답! 다음 데이트 메뉴는 여기서 정해보자 ㅎ.'
      },
      {
        question: '진형이가 좋아하는 것은?',
        options: ['게임', '퐁이', '최은지', '치킨'],
        answer: 'C',
        correct: '당연하지!',
        heart: '최은지'
      }
    ]
  },

  systemError: {
    title: 'SYSTEM ERROR',
    message: '진형이 사진의 음악 추천 알고리즘에\n심각한 오류가 발생했습니다.',
    code: 'ERR_HIPPO_NOSTRIL_BUBBLE',
    song: '하마 콧구멍에서 나온 동그란 비눗방구',
    artist: '추천 알고리즘 (고장남)',
    recovered: '알고리즘 복구 완료. (사실 못 고쳤습니다)'
  },

  finale: {
    screens: [
      { kind: 'dates', big: '127 DAYS.', from: '2026.03.12', to: '2026.09.30' },
      { kind: 'quote', text: '처음에는\n‘공통점이 되게 많네?’였던 우리가\n\n어느새 서로의 일상이 되었습니다.' },
      { kind: 'said', who: '진형이가 은지에게 했던 말', text: '누나를 만난 게 내 인생의 터닝포인트야.' },
      { kind: 'said', who: '은지가 진형이에게 했던 말', text: '진형이 옆에서 언제나 같이 해줄게!' },
      { kind: 'birthday', line1: 'HAPPY BIRTHDAY', line2: 'JINHYUNG', date: '2026.10.23' }
    ],
    video: 'assets/birthday.mp4',
    // 영상이 없을 때 대신 보여줄 메시지
    letter: {
      to: '진형이에게',
      body: '생일 축하해!\n\n공통점이 많다며 웃던 날부터\n오늘까지, 하나하나 다 소중한 기억이야.\n\n앞으로 쌓일 날들도\n지금처럼 옆에서 같이 할게.\n\n태어나줘서 고마워.',
      from: '은지가'
    }
  }
};
