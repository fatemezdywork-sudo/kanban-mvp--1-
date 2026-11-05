import { describe, it, expect } from "vitest";
import { boardReducer, initialBoard, type Card } from "../src/lib/board";
const card: Card = { id: "new", title: "عنوان", details: "جزئیات" };
describe("board state", () => {
  it("starts with exactly five populated columns and unique identifiers", () => {
    expect(initialBoard).toHaveLength(5);
    expect(initialBoard.every((c) => c.cards.length > 0)).toBe(true);
    const ids = initialBoard.flatMap((c) => [
      c.id,
      ...c.cards.map((x) => x.id),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("adds a card only to the selected column without mutating the source", () => {
    const result = boardReducer(initialBoard, {
      type: "add",
      columnId: "doing",
      card,
    });
    expect(result[2].cards.at(-1)).toEqual(card);
    expect(result[0]).toBe(initialBoard[0]);
    expect(initialBoard[2].cards).toHaveLength(2);
    expect(result).toHaveLength(5);
  });
  it("deletes the selected card and retains all other cards", () => {
    const result = boardReducer(initialBoard, { type: "delete", cardId: "c1" });
    expect(result[0].cards.map((c) => c.id)).toEqual(["c2"]);
    expect(result.flatMap((c) => c.cards)).toHaveLength(9);
    expect(initialBoard[0].cards).toHaveLength(2);
  });
  it("renames a column with trimmed input and preserves its cards", () => {
    const result = boardReducer(initialBoard, {
      type: "rename",
      columnId: "todo",
      title: "  بعدی  ",
    });
    expect(result[1].title).toBe("بعدی");
    expect(result[1].cards).toBe(initialBoard[1].cards);
    expect(result).toHaveLength(5);
  });
  it("rejects an empty column name", () => {
    expect(
      boardReducer(initialBoard, {
        type: "rename",
        columnId: "todo",
        title: "   ",
      }),
    ).toBe(initialBoard);
  });
  it.each(["todo", "doing", "review", "done"])(
    "moves a card intact to %s with no duplicate or loss",
    (columnId) => {
      const result = boardReducer(initialBoard, {
        type: "move",
        cardId: "c1",
        columnId,
      });
      expect(result[0].cards).not.toContainEqual(initialBoard[0].cards[0]);
      expect(result.find((c) => c.id === columnId)?.cards.at(-1)).toEqual(
        initialBoard[0].cards[0],
      );
      expect(result.flatMap((c) => c.cards)).toHaveLength(10);
      expect(initialBoard[0].cards).toHaveLength(2);
    },
  );
  it("handles same-column drops and canceled or stale targets without changes", () => {
    for (const [cardId, columnId] of [
      ["c1", "ideas"],
      ["unknown", "todo"],
      ["c1", "missing"],
    ])
      expect(
        boardReducer(initialBoard, { type: "move", cardId, columnId }),
      ).toBe(initialBoard);
  });
  it("allows the last card to leave a column and a card to return to it", () => {
    const empty = boardReducer(initialBoard, {
      type: "move",
      cardId: "c8",
      columnId: "done",
    });
    expect(empty[3].cards).toHaveLength(0);
    const back = boardReducer(empty, {
      type: "move",
      cardId: "c1",
      columnId: "review",
    });
    expect(back[3].cards[0].id).toBe("c1");
  });
});
