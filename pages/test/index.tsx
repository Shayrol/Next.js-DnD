import { FormEvent, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";

interface Item {
  id: string;
  content: string;
  column: string;
}

export default function App() {
  // --- Mock 데이터
  const [items, setItems] = useState([
    { id: "1", content: "1212", column: "todo" },
    { id: "2", content: "2222", column: "doing" },
    { id: "9", content: "3333", column: "todo" },
    { id: "4", content: "4444", column: "doing" },
    { id: "7", content: "5555", column: "done" },
    { id: "0", content: "6666", column: "todo" },
  ]);

  // 컬럽 공간
  const columns = ["todo", "doing", "done"];

  // Add Task
  const [adding, setAdding] = useState<{ [key: string]: boolean }>({});
  // Task 내용
  const [text, setText] = useState("");
  // dark, light 모드
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setIsDarkMode(storedTheme === "dark");
  }, []);

  // 다크모드 상태변화
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // 다크 모드 토글 함수
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // --- Draggable이 Droppable로 드래그 되었을 때 실행되는 이벤트
  // source: 선택된 Item의 Drop과 index (droppableId: 'todo', index: 1)
  // destination: 최종 도착된 Item이 Drop과 index (droppableId: 'done', index: 0)
  // --> todo 2번째 Item을 드래그를 통해 done의 첫 번째로 드랍함
  const onDragEnd = ({ source, destination }: DropResult) => {
    console.log("onDragEnd Start");
    console.log("source: ", source);
    console.log("destination: ", destination);

    if (!destination) return;

    const sourceColumn = source.droppableId; // 드래그된 아이템의 현재 column
    const destinationColumn = destination.droppableId; // 드롭된 위치의 column

    // 얖은 복사
    // const _items = [...items];
    // 깊은 복사
    const _items: Item[] = JSON.parse(JSON.stringify(items));

    // source column과 destination column에 해당하는 아이템들을 필터링
    const filteredSourceItems = _items.filter(
      (item) => item.column === sourceColumn
    );

    const filteredDestinationItems = _items.filter(
      (item) => item.column === destinationColumn
    );

    // 🎈 쓰레기통
    if (destinationColumn === "trash") {
      // source에서 드래그된 아이템을 찾고 splice로 제거
      const [targetItem] = filteredSourceItems.splice(source.index, 1);

      if (!targetItem) return; // 만약 대상 아이템이 없다면 종료

      // targetItem을 삭제 대상 컬럼(trash)으로 이동
      targetItem.column = destinationColumn;
      console.log("targetItem: ", targetItem);

      // 삭제된 아이템이 있는지 확인
      console.log("filteredSourceItems after splice: ", filteredSourceItems);

      // 전체 _items 배열에서 targetItem을 제외한 새로운 배열을 생성 (undefined 없이)
      const updatedItems: Item[] = _items.filter(
        (item) => item.id !== targetItem.id // targetItem과 같은 id를 가진 아이템을 제외
      );

      console.log("updatedItems: ", updatedItems);

      // 상태 변경
      setItems(updatedItems);

      return;
    }

    // 선택한 Item의 요소 즉 정보를 가져옴
    // source.index: Dnd에 제공하는 선택된 컬럼의 index 위치
    const [targetItem] = filteredSourceItems.splice(source.index, 1);

    if (!targetItem) return; // 대상 아이템이 없으면 아무 동작도 하지 않습니다.

    // 드래그가 같은 컬럼 내에서 발생한 경우
    if (sourceColumn === destinationColumn) {
      // 기존 아이템을 새로운 위치에 삽입
      filteredSourceItems.splice(destination.index, 0, targetItem);

      // 전체 _items 배열에서 업데이트된 sourceColumn의 아이템들로 반영
      const updatedItems: Item[] = _items.map((item) => {
        if (item.column === sourceColumn) {
          return filteredSourceItems.shift()!; // 업데이트된 아이템을 반영
        }
        return item; // 나머지는 그대로 유지
      });

      // 상태 변경
      setItems(updatedItems);
    } else {
      // 🎈 다른 컬럼으로 이동하는 경우
      // 선택한 column을 이동할 다른 column으로 변경
      targetItem.column = destinationColumn; // 아이템의 column 업데이트

      // 기존 아이템을 새로운 위치에 삽입
      filteredDestinationItems.splice(destination.index, 0, targetItem);
      console.log("filteredDestinationItems: ", filteredDestinationItems);

      // 전체 _items 배열에서 대상 컬럼의 아이템들만 업데이트합니다.
      const updatedItems: Item[] = _items.map((item) => {
        if (item.column === destinationColumn) {
          return filteredDestinationItems.shift()!; // 이동된 아이템 업데이트
        }
        return item; // 나머지는 그대로 유지
      });

      // 상태 변경
      setItems(updatedItems);
    }
  };

  // --- requestAnimationFrame 초기화
  const [enabled, setEnabled] = useState(false);

  // Next.js에서 동작하기 위한 환경세팅이다. (next.config.mjs에서 reactStrictMode: false 하기)
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }
  // --- requestAnimationFrame 초기화 END

  const itemCountInColumn = (columnId: string) => {
    return items.filter((el) => el.column === columnId).length;
  };

  // 테스크 생성
  const onClickAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim().length) return;

    const columnId = e.currentTarget.id;

    const newTask = {
      id: Math.random().toString(),
      content: text.trim(),
      column: columnId,
    };

    setItems((pv) => [...pv, newTask]);
    toggleAdding(columnId);
  };

  const toggleAdding = (columnId: string) => {
    setAdding((prev) => ({
      ...prev,
      [columnId]: !prev[columnId], // Column별로 adding 상태 토글
    }));
  };

  return (
    <div
      className={`h-screen w-full flex justify-center items-start py-10  
      ${isDarkMode ? " bg-gray-900 text-white" : " bg-amber-200 text-black"}`}
    >
      <div
        className={`border border-red-900 mr-[10px] cursor-pointer p-[3px] px-[5px] rounded ${
          isDarkMode ? "bg-white text-black" : "bg-black text-white"
        }`}
        onClick={toggleDarkMode}
      >
        {isDarkMode ? "Dark" : "Light"}
      </div>
      <div className="max-w-[1200px] flex">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((columnId) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <div className="flex flex-col h-full w-72 mx-2">
                  <div className="flex justify-between items-center ">
                    <h2 className="mb-2 text-xl font-bold">{columnId}</h2>
                    <h2 className="mb-2 text-xl font-bold">
                      {itemCountInColumn(columnId)}
                    </h2>
                  </div>
                  {/* Task 공간 */}
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`overflow-y-auto overflow-x-clip shadow-md h-full pr-1 pb-2 ${
                      snapshot.isDraggingOver
                        ? isDarkMode
                          ? "bg-neutral-700/80"
                          : "bg-amber-300/80"
                        : ""
                    }`}
                  >
                    {items
                      .filter((item) => item.column === columnId)
                      .map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            // Task
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded px-2 py-3 mb-1 text-black border border-neutral-400  hover:bg-gray-300/60 transition
                              ${
                                snapshot.isDragging
                                  ? "bg-gray-300/60"
                                  : "bg-neutral-50"
                              }`}
                            >
                              {item.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    {adding[columnId] ? (
                      // Add Task
                      <form id={columnId} onSubmit={onClickAddTask}>
                        <textarea
                          onChange={(e) => setText(e.target.value)}
                          autoFocus
                          placeholder="Add new task..."
                          className="w-full h-[100px] rounded border border-neutral-400 bg-slate-50 p-3 text-sm text-black placeholder-stone-400 focus:outline-0"
                        />
                        <div className="mt-1.5 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleAdding(columnId)}
                            className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-500"
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
                      </form>
                    ) : (
                      <button
                        onClick={() => toggleAdding(columnId)}
                        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-500"
                      >
                        <span>Add card</span>
                        <FiPlus />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

          {/* 쓰레기 통 */}
          <Droppable key="trash" droppableId="trash">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`relative flex justify-center items-center h-56 w-72 shrink-0 rounded border text-3xl ${
                  snapshot.isDraggingOver
                    ? "border-red-800 bg-red-800/20 text-red-500"
                    : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
                }`}
              >
                <Draggable key={"trash"} draggableId={"trash"} index={0}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="w-[4rem] flex absolute left-0"
                    ></div>
                  )}
                </Draggable>
                {provided.placeholder}

                <div className="absolute">
                  {snapshot.isDraggingOver ? (
                    <FaFire className="animate-bounce" />
                  ) : (
                    <FiTrash />
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

// 이동된 updatedItems 함수 이해하고 넘어가기
// 전체 데이터를 .map을 통해 순회하고 해당 item.column과 이동된 column과 같으면 shift()하는데
// 이해가 안감..

// const updatedItems: Item[] = _items.map((item) => {
//   if (item.column === destinationColumn) {
//     return filteredDestinationItems.shift()!; // 이동된 아이템 업데이트
//   }
//   return item; // 나머지는 그대로 유지
// });

// 여기서 copy한 _items를 map 함수로 순회한다.
// 전체 column을 통해 드랍된 공간의 column과 같은지 비교를 하는데
// 같으면
// splice를 통해 해당 index 위치에 추가된 즉 같은 column의 추가된 상태의
// filteredDestinationItems을 shift()로 첫 번째 요소를 제거를 하고 반환을 하는데
// updatedItems에 반환한다.

// 다르면
// 해당 값을 그냥 그대로 updatedItems에 반화한다.

// 이렇게 순회하면서 이동된 그리고 해당 index에 추가된 Item의 배열을 새로 생성을 한다.

// 즉 이과정을 거쳐야 다른 컬럼에 이동을 하고 원하는 위치(index)에 이동을 할 수 있다.
// 그전에 id로만 비교을 했을 때는 위치까지 이동이 안되었음. (data 선언된 객체 순으로 강제 이동됨)

// shift를 굳이 사용한 이유
// filteredDestinationItems가 배열이여서 shift를 사용하지 않으면 배열 안 배열로 이동을 하게됨
// 그래서 순회하면서 filteredDestinationItems의 배열의 요소를 제거 및 반환을 하는
// shift() 함수를 사용함

// 쓰레기 통 삭제 완
// 문제점
// 1. 비어있는 column에 Task 추가 시 약간의 위치 이동이 어설픔
// 2. 쓰레기 통에 Task Drop 하면 바로 사라지는게 아닌 왼쪽 위로 이동 후 사라짐

// 첫 번째 문제는 column의 크기 즉 Droppable의 최소 너비를 주면 해결될 듯 하다.

// 두 번째 문제는 Draggable이 없어 생긴 문제인지 잘 모름
// 일단 provided.placeholder의 인한 공간 생성으로 생긴 문제

//
// 쓰레기 통 Task Drop 후 가운데로 이동하게 한 후 사라지게 했음
// 해당 자리 또는 바로 사라지게 하고 싶었으나 Column을 사용하고 있고 이에 대한 애니메이션
// 효과가 일어남 - transition을 none을 해줬으나 해당 Task는 사라지지 않았음

// Add를 추가해 각각의 task에 추가할 수 있게 했음
// css 스타일 완성하면 끝
// 추가로 하고 싶은 기능은 각각의 Add가 아닌 오른쪽 상단에 추가를 클릭을 하면
// column, title를 추가하면 해당 Column에 Task가 추가 되도록 하기
// 앱 반응형으로 구현하기
//
// column의 이름 및 추가 기능 만들기
// columns의 배열을 추가하면 해결될 듯?
