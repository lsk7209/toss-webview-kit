export const FORTUNE_TOPICS = [
  { id: 'today', label: '오늘의 흐름을 볼래요' },
  { id: 'relationship', label: '관계운을 볼래요' },
  { id: 'work', label: '일운을 볼래요' },
] as const;

export type FortuneTopicId = (typeof FORTUNE_TOPICS)[number]['id'];

export interface FortuneResult {
  actionLabel: string;
  accentColor: string;
  cardName: string;
  catName: string;
  createdAt: string;
  extraAdvice: string;
  headline: string;
  readingId: string;
  rewardUnlocked: boolean;
  summary: string;
  topicId: FortuneTopicId;
  topicLabel: string;
}

interface FortuneTemplate {
  actionLabel: string;
  accentColor: string;
  cardName: string;
  catName: string;
  extraAdvice: string;
  headline: string;
  id: string;
  summary: string;
  topics: FortuneTopicId[];
}

const FORTUNE_POOL: FortuneTemplate[] = [
  {
    actionLabel: '답을 미루던 메시지는 오늘 안에 보내요',
    accentColor: '#ff8a65',
    cardName: '태양',
    catName: '해바라기냥',
    extraAdvice: '반응을 확인하기보다 먼저 톤을 분명하게 정리해 두는 편이 훨씬 유리해요.',
    headline: '오늘은 먼저 말하는 쪽이 흐름을 잡아요',
    id: 'sun-cat',
    summary:
      '주저하던 연락이나 결정이 예상보다 부드럽게 이어져요. 분위기를 먼저 열어 두면 후속 반응이 빨라져요.',
    topics: ['today', 'relationship'],
  },
  {
    actionLabel: '해야 할 일은 세 개만 남기고 나머지는 뒤로 밀어요',
    accentColor: '#fb7185',
    cardName: '절제',
    catName: '균형냥',
    extraAdvice: '속도를 높이기보다 우선순위를 줄이는 편이 오늘 수익과 집중도를 같이 지켜줘요.',
    headline: '많이 하기보다 흐름을 정리하는 날이에요',
    id: 'balance-cat',
    summary:
      '한 번에 너무 많은 것을 붙잡으면 컨디션이 먼저 흔들려요. 오늘은 필요한 일만 남기고 깔끔하게 정리해 보세요.',
    topics: ['today', 'work'],
  },
  {
    actionLabel: '회의나 대화 시작 전에 원하는 결론을 한 줄로 적어요',
    accentColor: '#60a5fa',
    cardName: '마법사',
    catName: '도사냥',
    extraAdvice: '결론을 먼저 정리해 두면 상대가 흔들어도 오늘 페이스를 잃지 않아요.',
    headline: '일에서는 준비된 한 문장이 승부를 갈라요',
    id: 'magician-cat',
    summary:
      '자료보다 전달 순서가 더 중요하게 작동해요. 오늘은 디테일보다 핵심을 먼저 꺼내는 방식이 먹혀요.',
    topics: ['work'],
  },
  {
    actionLabel: '마음이 불편한 관계는 질문 하나로 먼저 풀어봐요',
    accentColor: '#a78bfa',
    cardName: '연인',
    catName: '설렘냥',
    extraAdvice: '확신이 없어도 괜찮아요. 오늘은 정답보다 대화를 다시 여는 게 우선이에요.',
    headline: '관계운은 기다리는 쪽보다 묻는 쪽이 유리해요',
    id: 'lover-cat',
    summary:
      '상대의 의도를 짐작만 하고 있으면 오해가 더 커질 수 있어요. 가볍게 묻는 태도가 분위기를 바꿔줘요.',
    topics: ['relationship'],
  },
  {
    actionLabel: '결정이 필요하면 오전보다 오후에 확정해요',
    accentColor: '#f59e0b',
    cardName: '운명의 수레바퀴',
    catName: '굴러냥',
    extraAdvice: '오전에는 정보가 덜 모여요. 오후에는 선택지가 더 또렷해져서 후회가 줄어요.',
    headline: '흐름이 뒤집히는 건 나쁜 일이 아니라 기회예요',
    id: 'wheel-cat',
    summary:
      '처음 예상한 답과 다른 기회가 들어와도 당황하지 마세요. 오늘은 바뀌는 쪽이 오히려 더 맞는 길이에요.',
    topics: ['today', 'work'],
  },
  {
    actionLabel: '감정적으로 답하고 싶을수록 한 템포 쉬어요',
    accentColor: '#34d399',
    cardName: '여사제',
    catName: '조용냥',
    extraAdvice: '지금 바로 반응하지 않는 쪽이 결과적으로는 더 큰 신뢰를 만들어요.',
    headline: '조용한 직감이 오늘 가장 정확해요',
    id: 'priestess-cat',
    summary:
      '불편한 분위기에서도 바로 맞서기보다 한 번 정리한 뒤 움직이는 편이 맞아요. 침착함이 오늘의 강점이에요.',
    topics: ['today', 'relationship'],
  },
];

function createReadingId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createFortuneResult(topicId: FortuneTopicId): FortuneResult {
  const candidates = FORTUNE_POOL.filter((fortune) => fortune.topics.includes(topicId));
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const topicLabel =
    FORTUNE_TOPICS.find((topic) => topic.id === topicId)?.label ?? '오늘의 흐름을 볼래요';

  return {
    actionLabel: selected.actionLabel,
    accentColor: selected.accentColor,
    cardName: selected.cardName,
    catName: selected.catName,
    createdAt: new Date().toISOString(),
    extraAdvice: selected.extraAdvice,
    headline: selected.headline,
    readingId: createReadingId(),
    rewardUnlocked: false,
    summary: selected.summary,
    topicId,
    topicLabel,
  };
}
