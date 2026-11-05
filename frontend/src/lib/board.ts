export type Card = { id: string; title: string; details: string };
export type Column = { id: string; title: string; cards: Card[] };
export const initialBoard: Column[] = [
  {
    id: "ideas",
    title: "ایده‌ها",
    cards: [
      {
        id: "c1",
        title: "یک شروع تازه برای برند",
        details:
          "جمع‌آوری ایده‌های اولیه برای هویت بصری؛ ساده، صمیمی و به‌یادماندنی.",
      },
      {
        id: "c2",
        title: "الهام از تجربه‌های خوب",
        details:
          "بررسی چند نمونه موفق و یادداشت کردن چیزهایی که تجربه را دلنشین می‌کنند.",
      },
    ],
  },
  {
    id: "todo",
    title: "برای انجام",
    cards: [
      {
        id: "c3",
        title: "شناخت مخاطب‌ها",
        details:
          "نیازها و دغدغه‌های اصلی مخاطب را مرور کنیم تا تصمیم‌های بهتری بگیریم.",
      },
      {
        id: "c4",
        title: "طراحی مسیر اصلی کاربر",
        details: "از اولین ورود تا رسیدن به هدف؛ یک مسیر کوتاه و بدون پیچیدگی.",
      },
      {
        id: "c5",
        title: "انتخاب رنگ و تایپوگرافی",
        details: "ساخت یک پالت منسجم و انتخاب قلمی خوانا برای همه صفحه‌ها.",
      },
    ],
  },
  {
    id: "doing",
    title: "در حال انجام",
    cards: [
      {
        id: "c6",
        title: "طراحی صفحه اصلی",
        details:
          "چیدمان اولیه صفحه با تمرکز روی فضای خالی، سلسله‌مراتب و وضوح.",
      },
      {
        id: "c7",
        title: "نوشتن متن‌های رابط کاربری",
        details: "متن‌های کوتاه، روشن و دوستانه برای راهنمایی کاربر در هر قدم.",
      },
    ],
  },
  {
    id: "review",
    title: "در انتظار بررسی",
    cards: [
      {
        id: "c8",
        title: "مرور وایرفریم‌ها",
        details:
          "بررسی ساختار صفحه‌ها و اطمینان از این‌که هر بخش هدف مشخصی دارد.",
      },
    ],
  },
  {
    id: "done",
    title: "انجام‌شده",
    cards: [
      {
        id: "c9",
        title: "تعریف هدف پروژه",
        details:
          "ساخت یک تجربه ساده و کاربردی که کارهای روزانه را مرتب‌تر می‌کند.",
      },
      {
        id: "c10",
        title: "جمع‌آوری نیازمندی‌ها",
        details: "نیازهای اصلی مشخص شده‌اند و مسیر اجرای نسخه اولیه آماده است.",
      },
    ],
  },
];
export type BoardAction =
  | { type: "add"; columnId: string; card: Card }
  | { type: "delete"; cardId: string }
  | { type: "rename"; columnId: string; title: string }
  | { type: "move"; cardId: string; columnId: string };
export function boardReducer(board: Column[], action: BoardAction): Column[] {
  switch (action.type) {
    case "add":
      return board.map((c) =>
        c.id === action.columnId
          ? { ...c, cards: [...c.cards, action.card] }
          : c,
      );
    case "delete":
      return board.map((c) => ({
        ...c,
        cards: c.cards.filter((card) => card.id !== action.cardId),
      }));
    case "rename":
      return action.title.trim()
        ? board.map((c) =>
            c.id === action.columnId ? { ...c, title: action.title.trim() } : c,
          )
        : board;
    case "move": {
      const source = board.find((c) =>
        c.cards.some((card) => card.id === action.cardId),
      );
      const target = board.find((c) => c.id === action.columnId);
      if (!source || !target || source.id === target.id) return board;
      const card = source.cards.find((card) => card.id === action.cardId)!;
      return board.map((c) =>
        c.id === source.id
          ? { ...c, cards: c.cards.filter((item) => item.id !== card.id) }
          : c.id === target.id
            ? { ...c, cards: [...c.cards, card] }
            : c,
      );
    }
  }
}
