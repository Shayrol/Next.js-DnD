// 라이브러리 motion 사용 - 반응이 좀 느림 / sortable을 사용은 test 페이지에 작성

import {
  Dispatch,
  DragEvent,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
// 아이콘 라이브러리
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";

interface IColumnProps {
  title: string;
  column: string;
  headingColor: string;
  cards: ICardsData[];
  setCards: Dispatch<SetStateAction<ICardsData[]>>;
}

interface ICardsData {
  title: string;
  id: string;
  column: string;
  handleDragStart?: any;
}

interface IDropIndicator {
  beforeId: string;
  column: string;
}

interface IAddCard {
  column: string;
  setCards: Dispatch<SetStateAction<ICardsData[]>>;
}

interface IDragCard {
  setCards: Dispatch<SetStateAction<ICardsData[]>>;
}

export default function CardPage() {
  return (
    <div className="h-screen w-full bg-neutral-900 text text-neutral-50">
      <Board />
    </div>
  );
}

const Board = () => {
  // const [cards, setCards] = useState<ICardsData[]>(DEFAULT_CARDS);
  const [cards, setCards] = useState<ICardsData[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    const cardData = localStorage.getItem("cards");

    setCards(cardData ? JSON.parse(cardData) : []);
    setHasChecked(true);
  }, []);

  console.log("cards: ", cards);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-200"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-200"
        cards={cards}
        setCards={setCards}
      />
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

// 각각의 목록 공간
const Column = (props: IColumnProps) => {
  const [active, setActive] = useState(false);

  // 드래그 이벤트
  const handleDragStart = (e: DragEvent<HTMLDivElement>, card: ICardsData) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  // 다른곳 드래그 시 Column 배경 색상 변경 이벤트 및 효과
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  // 카드 아래 라인 색상 이펙트 변경
  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    (el.element as HTMLElement).style.opacity = "1";
  };

  // 카드 아래 색상 초기화
  const clearHighlights = (els: HTMLElement[] = getIndicators()) => {
    els.forEach((i: HTMLElement) => {
      i.style.opacity = "0";
    });
  };

  // const clearHighlights = (els: HTMLElement[]) => {
  //   const indicators = els || getIndicators();

  //   indicators.forEach((i: HTMLElement) => {
  //     i.style.opacity = "0";
  //   });
  // };

  // 카드 아래 색상 추가 - 카드 이동시 이동될 위치 표시
  const getNearestIndicator = (
    e: DragEvent<HTMLDivElement>,
    indicators: HTMLElement[]
  ) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  // <div data-column="todo">와 같은 []의 같은 요소를 찾음
  // 이후 getIndicators 함수는 해당 column이 todo인 요소만 선택하여 반환
  // 즉 어디 column에 이동을 했는지 추적
  const getIndicators = (): HTMLElement[] => {
    return Array.from(
      document.querySelectorAll(`[data-column="${props.column}"]`)
    );
  };

  // 해당 카드 드래그로 영역 벗어날 시 배경 색상 되돌림 + 선 색상
  const handleDragLeave = () => {
    setActive(false);
    clearHighlights();
  };

  // 해당 카드를 다른 영역의 Column에 드랍한 경우 배경 색상 되돌림 + 선 색상
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(false);
    clearHighlights();

    const cardId = e.dataTransfer.getData("cardId");

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    // 이동 후 이전에 있던 column 카드 삭제
    if (before !== cardId) {
      const column = props.column;
      let copy = [...props.cards];
      let cardToTransfer = copy.find((card) => card.id === cardId);
      if (!cardToTransfer) return;

      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((card) => card.id !== cardId);

      // 이동할 카드 해당 column에 추가
      const moveToBack = before === "-1";
      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      props.setCards(copy);
    }
  };

  // data에 있는 column의 개수 표시
  const filteredCards = props.cards.filter((c) => c.column === props.column);
  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${props.headingColor}`}>{props.title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((card) => {
          return (
            <Card
              key={card.id}
              {...card}
              handleDragStart={(e: DragEvent<HTMLDivElement>) =>
                handleDragStart(e, card)
              }
            />
          );
        })}
        <DropIndicator beforeId="-1" column={props.column} />
        <AddCard column={props.column} setCards={props.setCards} />
      </div>
    </div>
  );
};

// 카드 - title
const Card = (props: ICardsData) => {
  return (
    <>
      <DropIndicator beforeId={props.id} column={props.column} />
      {/* motion에 layout, layoutId 사용  - 이동에 대한 부드러운 모션 제공 */}
      <motion.div
        layout
        layoutId={props.id}
        // 드래그 가능하게 하기
        draggable={true}
        onDragStart={(e) =>
          props.handleDragStart(e, {
            title: props.title,
            id: props.id,
            column: props.column,
          })
        }
        // onDragStart={props.handleDragStart}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3"
      >
        <p className="text-sm text-neutral-100">{props.title}</p>
      </motion.div>
    </>
  );
};

// 카드 구분 선
const DropIndicator = (props: IDropIndicator) => {
  return (
    <div
      data-before={props.beforeId || "-1"}
      data-column={props.column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

// 드랍 삭제 공간
const BurnBarrel = (props: IDragCard) => {
  const [active, setActive] = useState(false);

  // 카드 드래그로 삭제 공간 가져갈 시
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(true);
  };

  // 카드 드래그로 삭제 공간 빠져나올 시
  const handleDragLeave = () => {
    setActive(false);
  };

  // 카드 드래그 완료 후
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 선택한 카드 id
    const cardId = e.dataTransfer.getData("cardId");

    // 현재 배열의 카드 가져와 선택된 cardId와 다른것만 남김
    props.setCards((pv) => pv.filter((card) => card.id !== cardId));

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

// 카드 추가
const AddCard = (props: IAddCard) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  // 카드 등록 Submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // 페이지 리로드 방지
    e.preventDefault();
    if (!text.trim().length) return;

    const newCard = {
      column: props.column,
      title: text.trim(),
      id: Math.random().toString(),
    };
    props.setCards((pv) => [...pv, newCard]);

    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form onSubmit={handleSubmit} layout>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

// 초기 드래그 시 드랍 활성화가 안됨 - 짧은 간격임.
// 바로바로 드래그 앤 드랍이 안되고 약간의 시간을 기다리고 드랍을 해줘야 함
