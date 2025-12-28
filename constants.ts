
import { Theme, BlogPost, AgeGroup, Gender, Region } from './types';
import { BookOpen, Music, Code, PenTool, Dumbbell, Globe } from 'lucide-react';

export const THEME_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
];

export const INITIAL_THEMES: Theme[] = [
  {
    id: '1',
    title: 'フルスタック開発',
    totalSeconds: 345600, // 96 hours
    color: 'bg-blue-500',
    icon: 'Code',
    createdAt: Date.now() - 10000000,
  },
  {
    id: '2',
    title: 'ピアノ練習',
    totalSeconds: 12000, // ~3.3 hours
    color: 'bg-violet-500',
    icon: 'Music',
    createdAt: Date.now() - 5000000,
  },
];

// Helper to get icon component by string name
export const getIconComponent = (name: string) => {
  switch (name) {
    case 'Code': return Code;
    case 'Music': return Music;
    case 'PenTool': return PenTool;
    case 'Dumbbell': return Dumbbell;
    case 'Globe': return Globe;
    default: return BookOpen;
  }
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '「1万時間の法則」の真実とは？',
    excerpt: '多くの人が誤解しているこの法則。単に時間をかければ良いわけではありません。「意図的な練習」の重要性について解説します。',
    content: `
      <h3>1万時間の法則とは？</h3>
      <p>マルコム・グラッドウェルの著書『天才！成功する人々の法則』で広まった概念ですが、実は元となったアンダース・エリクソンの研究には重要な条件があります。</p>
      <p>それは<strong>「意図的な練習 (Deliberate Practice)」</strong>です。</p>
      
      <h3>ただ繰り返すだけでは意味がない</h3>
      <p>漫然とピアノを弾いたり、コードを書いたりするだけでは、スキルは向上しません。自分の限界よりも少し高いレベルに挑戦し、即座にフィードバックを得て修正する。このサイクルが必要です。</p>
      
      <h3>このアプリの使い方</h3>
      <p>タイマーで記録する際は、ただの作業時間ではなく「どれだけ集中して限界に挑んだか」をメモに残しましょう。それが真の1万時間への近道です。</p>
    `,
    category: 'Science',
    readTime: '3 min',
    publishedAt: Date.now() - 100000000,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: '2',
    title: '最初の20時間を乗り越える技術',
    excerpt: '新しいことを始めるときの苦痛は「激流」のようなもの。この最も辛い時期を、いかにしてゲーム感覚で乗り越えるか。',
    content: `
      <h3>初期の学習曲線は残酷</h3>
      <p>何かを新しく始めると、最初は「自分がどれだけできないか」を痛感させられます。これが挫折の主要因です。</p>
      
      <h3>20時間の壁</h3>
      <p>ジョシュ・カウフマンは著書で「最初の20時間」さえ乗り越えれば、そこそこのレベルに到達できると説いています。このアプリの「選抜期 (P2)」はこの期間をゲーム化しています。</p>
      
      <h3>対策：ハードルを極限まで下げる</h3>
      <p>やる気が出ない日は「1分だけやる」と決めましょう。実際に始めれば、作業興奮によって5分、10分と続くものです。</p>
    `,
    category: 'Mindset',
    readTime: '5 min',
    publishedAt: Date.now() - 50000000,
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: '3',
    title: '「斧を研ぐ」習慣の作り方',
    excerpt: '忙しい木こりは刃を研ぐ時間がありません。しかし、研がない斧では木は切れません。極小の行動が将来を変えます。',
    content: `
      <h3>7つの習慣における第7の習慣</h3>
      <p>「刃を研ぐ」とは、自分自身の資源（肉体、精神、知性、社会・情緒）を維持・向上させる活動のことです。</p>
      
      <h3>マイクロハビット（極小習慣）</h3>
      <p>このアプリの「目標機能」では、壮大な目標を「1秒でできる行動」まで分解することを推奨しています。</p>
      <ul>
        <li>・英語学習 → 「単語帳を開く」</li>
        <li>・筋トレ → 「腕立て1回の姿勢をとる」</li>
      </ul>
      <p>これなら、どんなに疲れていても言い訳できません。そして、毎日刃を研ぎ続けることで、切れ味（スキル）は劇的に向上します。</p>
    `,
    category: 'Technique',
    readTime: '4 min',
    publishedAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: '4',
    title: '停滞期（プラトー）の正体',
    excerpt: '「頑張っているのに結果が出ない」と感じる時期。それは成長が止まったのではなく、脳が変化を蓄積している期間です。',
    content: `
      <h3>成長は直線ではない</h3>
      <p>私たちは努力に比例して結果が出ると期待しますが、実際は違います。努力しても結果が見えない期間（潜伏期間）が長く続き、ある日突然ブレイクスルーが起きます。</p>
      
      <h3>氷の比喩</h3>
      <p>部屋の温度を-5度から1度ずつ上げていっても、0度になるまでは氷は溶けません。しかし、エネルギーは蓄積されています。プラトーは、まさにこの「0度に向かっている期間」なのです。</p>
      
      <h3>この時期にすべきこと</h3>
      <p>結果ではなく「プロセス（行動回数）」に目を向けましょう。「研ぎ回数」が増えているなら、あなたは確実に前に進んでいます。</p>
    `,
    category: 'Mindset',
    readTime: '6 min',
    publishedAt: Date.now() - 200000,
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: '5',
    title: '休むことも「練習」の一部',
    excerpt: '罪悪感を感じながら休んでいませんか？脳科学的には、スキルの定着は睡眠中やリラックス時に起こります。',
    content: `
      <h3>デフォルト・モード・ネットワーク</h3>
      <p>ぼーっとしている時、脳は活発に働いています。これをデフォルト・モード・ネットワークと呼び、情報の整理や記憶の定着を行っています。</p>
      
      <h3>意図的な休息</h3>
      <p>一流のアスリートや演奏家は、練習と同じくらい休息を重視します。疲労困憊の状態での練習は、悪いフォームを身につけてしまうリスクすらあります。</p>
      
      <h3>今日は休んでいい</h3>
      <p>もし今日、練習ができなかったとしても、それは「脳を整理する日」だったと捉えましょう。明日、フレッシュな状態で再開すれば良いのです。</p>
    `,
    category: 'Science',
    readTime: '4 min',
    publishedAt: Date.now() - 100000,
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

// --- World Sharpener Constants ---

export const WORLD_POPULATION = 8_232_000_000;

export interface SpiritualTier {
  name: string;
  englishName: string;
  percentile: number;
  minTGI: number;
  estimatedRank: number;
}

// 基準となるマイルストーン（TGIと順位の対応表として使用）
export const SPIRITUAL_TIERS: SpiritualTier[] = [
  { name: '鈍ら', englishName: 'Blunt', percentile: 100, minTGI: 0, estimatedRank: 8_232_000_000 },
  { name: '粗研ぎ', englishName: 'Sharp', percentile: 40, minTGI: 100, estimatedRank: 3_200_000_000 },
  { name: '業物', englishName: 'Master', percentile: 10, minTGI: 1000, estimatedRank: 820_000_000 },
  { name: '最上大業物', englishName: 'Supreme', percentile: 1, minTGI: 3000, estimatedRank: 82_000_000 },
  { name: '神域', englishName: 'Divine', percentile: 0.0001, minTGI: 10000, estimatedRank: 8_000 }, // Requirements said 8M but scaled for drama
];

export interface CountryMilestone {
  id: number;
  name: string;
  population: number;
  emoji: string;
}

export const COUNTRY_MILESTONES: CountryMilestone[] = [
  { id: 1, name: 'バチカン市国', population: 800, emoji: '🇻🇦' },
  { id: 2, name: 'ツバル', population: 11_000, emoji: '🇹🇻' },
  { id: 3, name: 'モナコ', population: 39_000, emoji: '🇲🇨' },
  { id: 4, name: 'アイスランド', population: 370_000, emoji: '🇮🇸' },
  { id: 5, name: 'シンガポール', population: 5_900_000, emoji: '🇸🇬' },
  { id: 6, name: 'ギリシャ', population: 10_000_000, emoji: '🇬🇷' },
  { id: 7, name: 'オーストラリア', population: 26_000_000, emoji: '🇦🇺' },
  { id: 8, name: '韓国', population: 51_000_000, emoji: '🇰🇷' },
  { id: 9, name: 'イギリス', population: 67_000_000, emoji: '🇬🇧' },
  { id: 10, name: 'ドイツ', population: 84_000_000, emoji: '🇩🇪' },
  { id: 11, name: '日本', population: 124_000_000, emoji: '🇯🇵' },
  { id: 12, name: 'ロシア', population: 144_000_000, emoji: '🇷🇺' },
  { id: 13, name: 'ブラジル', population: 215_000_000, emoji: '🇧🇷' },
  { id: 14, name: 'インドネシア', population: 275_000_000, emoji: '🇮🇩' },
  { id: 15, name: 'アメリカ', population: 333_000_000, emoji: '🇺🇸' },
  { id: 16, name: '中国', population: 1_400_000_000, emoji: '🇨🇳' },
  { id: 17, name: 'インド', population: 1_420_000_000, emoji: '🇮🇳' },
];

// --- Demographics Data (Approximate) ---
export const DEMOGRAPHICS = {
  age: {
    '10s': 1_300_000_000,
    '20s': 1_200_000_000,
    '30s': 1_150_000_000,
    '40s': 1_000_000_000,
    '50s': 900_000_000,
    '60s+': 2_680_000_000,
  } as Record<AgeGroup, number>,
  gender: {
    'Male': 4_150_000_000,
    'Female': 4_080_000_000,
    'Other': 2_000_000,
  } as Record<Gender, number>,
  region: {
    'Japan': 124_000_000,
    'Asia': 4_700_000_000,
    'NorthAmerica': 600_000_000,
    'Europe': 740_000_000,
    'Other': 2_068_000_000, // Africa, SA, Oceania
  } as Record<Region, number>
};