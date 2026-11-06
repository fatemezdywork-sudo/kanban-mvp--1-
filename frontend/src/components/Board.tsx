"use client";
import { useReducer, useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type KeyboardCoordinateGetter,
  type DragEndEvent,
} from "@dnd-kit/core";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CheckCheck,
  ChevronLeft,
  Columns3,
  GripVertical,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
  Pencil,
  Eye,
  MoveHorizontal,
} from "lucide-react";
import {
  boardReducer,
  initialBoard,
  type Card,
  type Column,
} from "../lib/board";
const icons = [Lightbulb, ListTodo, LoaderCircle, Eye, CheckCheck];
const number = (n: number) => n.toLocaleString("fa-IR");
const keyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.code)) return;
  event.preventDefault();
  const rects = [...context.droppableRects.values()].sort(
    (a, b) => a.left - b.left,
  );
  const index = rects.reduce(
    (best, r, i) =>
      Math.abs(r.left - currentCoordinates.x) <
      Math.abs(rects[best].left - currentCoordinates.x)
        ? i
        : best,
    0,
  );
  const next = rects[index + (event.code === "ArrowRight" ? 1 : -1)];
  return next ? { x: next.left + 16, y: next.top + 65 } : currentCoordinates;
};
function CardContent({
  card,
  handle,
  onDelete,
  overlay = false,
}: {
  card: Card;
  handle?: React.ReactNode;
  onDelete?: () => void;
  overlay?: boolean;
}) {
  return (
    <div className={`task-card ${overlay ? "overlay-card" : ""}`}>
      <div className="card-tools">
        {handle}
        <button
          className="icon-button delete-button"
          aria-label={`حذف کارت ${card.title}`}
          onClick={onDelete}
          tabIndex={overlay ? -1 : 0}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <h3>{card.title}</h3>
      <p>{card.details || "بدون جزئیات"}</p>
      <div className="card-bottom">
        <span className="card-line" />
        <span className="card-dots">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
function TaskCard({ card, onDelete }: { card: Card; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id });
  return (
    <article
      ref={setNodeRef}
      data-testid={`card-${card.id}`}
      className={`card-wrapper ${isDragging ? "is-dragging" : ""}`}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
          : undefined
      }
    >
      <CardContent
        card={card}
        onDelete={onDelete}
        handle={
          <button
            className="drag-handle"
            aria-label={`جابه‌جایی کارت ${card.title}`}
            {...listeners}
            {...attributes}
          >
            <GripVertical size={17} />
          </button>
        }
      />
    </article>
  );
}
function ColumnView({
  column,
  index,
  onRename,
  onAdd,
  onDelete,
}: {
  column: Column;
  index: number;
  onRename: (title: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [name, setName] = useState(column.title);
  const input = useRef<HTMLInputElement>(null);
  const Icon = icons[index];
  function commit(value: string) {
    const title = value.trim();
    if (title) onRename(title);
    setName(title || column.title);
  }
  return (
    <section
      ref={setNodeRef}
      className={`column column-${index} ${isOver ? "drop-active" : ""}`}
      aria-label={column.title}
      data-testid={`column-${column.id}`}
    >
      <div className="column-heading">
        <span className="status-icon">
          <Icon size={17} />
        </span>
        <input
          ref={input}
          aria-label={`نام ستون ${index + 1}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setName(column.title);
              e.currentTarget.value = column.title;
              e.currentTarget.blur();
            }
          }}
        />
        <button
          className="rename-button"
          aria-label={`تغییر نام ستون ${column.title}`}
          onClick={() => {
            input.current?.focus();
            input.current?.select();
          }}
        >
          <Pencil size={12} />
        </button>
        <span className="count">{number(column.cards.length)}</span>
      </div>
      <div className="column-rule" />
      <div className="card-list">
        {column.cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            onDelete={() => onDelete(card.id)}
          />
        ))}
        {column.cards.length === 0 && (
          <div className="empty-column">
            <Columns3 size={25} />
            <p>فضا برای یک کار تازه</p>
            <span>کارت را اینجا رها کنید</span>
          </div>
        )}
      </div>
      <button className="add-card" onClick={onAdd}>
        <Plus size={17} />
        افزودن کارت
      </button>
    </section>
  );
}
function AddCardDialog({
  column,
  onClose,
  onSubmit,
  onRestoreFocus,
}: {
  column: Column | null;
  onClose: () => void;
  onSubmit: (title: string, details: string) => void;
  onRestoreFocus: () => void;
}) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const titleInput = useRef<HTMLInputElement>(null);
  return (
    <Dialog.Root
      open={!!column}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content"
          dir="rtl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            titleInput.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
        >
          <div className="dialog-top">
            <span className="dialog-symbol">
              <Plus size={22} />
            </span>
            <Dialog.Close className="icon-button" aria-label="بستن فرم">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Title>یک کار تازه</Dialog.Title>
          <Dialog.Description>
            افزودن کارت به ستون «{column?.title}»
          </Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) onSubmit(title.trim(), details.trim());
            }}
          >
            <label htmlFor="card-title">
              عنوان کارت <span className="required">ضروری</span>
            </label>
            <input
              ref={titleInput}
              id="card-title"
              placeholder="چه کاری باید انجام شود؟"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
            <label htmlFor="card-details">
              جزئیات <span>اختیاری</span>
            </label>
            <textarea
              id="card-details"
              placeholder="کمی بیشتر درباره این کار بنویسید…"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={!title.trim()}
              >
                <Plus size={17} />
                افزودن کارت
              </button>
              <Dialog.Close className="cancel-button" type="button">
                انصراف
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export default function Board() {
  const [board, dispatch] = useReducer(boardReducer, initialBoard);
  const nextCardId = useRef(10);
  const addTrigger = useRef<HTMLElement | null>(null);
  function openAdd(columnId: string) {
    addTrigger.current = document.activeElement as HTMLElement;
    setAddingTo(columnId);
  }
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );
  const activeCard = board
    .flatMap((c) => c.cards)
    .find((c) => c.id === activeId);
  const total = board.reduce((sum, c) => sum + c.cards.length, 0);
  function dragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (event.over) {
      const column = board.find((c) => c.id === event.over?.id);
      if (column) {
        dispatch({
          type: "move",
          cardId: String(event.active.id),
          columnId: column.id,
        });
        setAnnouncement(`کارت به ستون ${column.title} منتقل شد`);
        if (event.activatorEvent instanceof KeyboardEvent)
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLButtonElement>(
                `[data-testid="card-${event.active.id}"] .drag-handle`,
              )
              ?.focus(),
          );
      }
    }
  }
  function add(title: string, details: string) {
    if (addingTo) {
      dispatch({
        type: "add",
        columnId: addingTo,
        card: { id: `c${++nextCardId.current}`, title, details },
      });
      setAddingTo(null);
      setAnnouncement(`کارت ${title} اضافه شد`);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="روشن، تخته پروژه">
          <span className="brand-icon">
            <Columns3 size={25} strokeWidth={2.5} />
          </span>
          <span>
            روشن<span className="brand-caption">فضای کارهای بزرگ</span>
          </span>
        </a>
        <div className="sidebar-divider" />
        <div className="sidebar-label">فضای کار</div>
        <div className="nav-active">
          <LayoutDashboard size={19} />
          <span>تخته پروژه</span>
          <span className="nav-dot" />
        </div>
        <div className="sidebar-note">
          <div className="note-orbit">
            <Sparkles size={26} />
          </div>
          <h2>از ایده، تا انجام.</h2>
          <p>
            هر کار بزرگ، با یک قدم
            <br />
            کوچک شروع می‌شود.
          </p>
          <div className="note-line" />
        </div>
        <div className="sidebar-footer">
          <span className="footer-mark" />
          ساده فکر کن. روشن پیش برو.
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>فضای کار من</span>
            <ChevronLeft size={14} />
            <strong>تخته پروژه</strong>
          </div>
          <span className="workspace-label">
            <span />
            فضای شخصی
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                کمی نظم، کلی پیشرفت
              </div>
              <h1>
                جای ایده‌هایت اینجاست<span>.</span>
              </h1>
              <p>کارها را مرتب کن، قدم بعدی را بردار.</p>
            </div>
            <button
              className="primary-button new-card"
              onClick={() => openAdd(board[0].id)}
            >
              <Plus size={18} />
              کارت جدید
            </button>
          </div>
          <div className="board-toolbar">
            <div className="board-tab">
              <Columns3 size={18} />
              <span>تخته پروژه</span>
              <span className="total-count">{number(total)} کارت</span>
            </div>
            <div className="drag-hint">
              <MoveHorizontal size={16} />
              <span>کارت‌ها را بکش و جابه‌جا کن</span>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={(args) =>
              args.pointerCoordinates
                ? pointerWithin(args)
                : closestCenter(args)
            }
            onDragStart={(e) => setActiveId(String(e.active.id))}
            onDragEnd={dragEnd}
            onDragCancel={() => setActiveId(null)}
            accessibility={{
              screenReaderInstructions: {
                draggable:
                  "برای برداشتن کارت، کلید فاصله را بزنید. با جهت چپ و راست ستون را انتخاب کنید و دوباره فاصله بزنید. برای لغو، Escape را بزنید.",
              },
              announcements: {
                onDragStart: () => "کارت برداشته شد",
                onDragOver: ({ over }) =>
                  over
                    ? `ستون ${board.find((c) => c.id === over.id)?.title}`
                    : "",
                onDragEnd: ({ over }) =>
                  over ? "کارت رها شد" : "جابه‌جایی لغو شد",
                onDragCancel: () => "جابه‌جایی لغو شد",
              },
            }}
          >
            <div className="board-scroll">
              <div className="board">
                {board.map((column, index) => (
                  <ColumnView
                    key={column.id}
                    column={column}
                    index={index}
                    onRename={(title) =>
                      dispatch({ type: "rename", columnId: column.id, title })
                    }
                    onAdd={() => openAdd(column.id)}
                    onDelete={(cardId) => {
                      dispatch({ type: "delete", cardId });
                      setAnnouncement("کارت حذف شد");
                    }}
                  />
                ))}
              </div>
            </div>
            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <CardContent
                  card={activeCard}
                  overlay
                  handle={<GripVertical size={17} />}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
          <footer className="board-footer">
            <span>
              <span className="sample-dot" />
              این تخته با داده‌های نمونه شروع می‌شود.
            </span>
            <span>تغییرات با بارگذاری مجدد بازنشانی می‌شوند.</span>
          </footer>
          <div className="closing-note">
            <span />
            یک قدم نزدیک‌تر به انجام شدن
            <span />
          </div>
        </main>
      </div>
      {addingTo && (
        <AddCardDialog
          column={board.find((c) => c.id === addingTo)!}
          onClose={() => setAddingTo(null)}
          onSubmit={add}
          onRestoreFocus={() => addTrigger.current?.focus()}
        />
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
