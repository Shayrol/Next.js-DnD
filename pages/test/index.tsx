// react-beautiful-dnd 라이브러리 사용으로 드래그 앤 드랍 구현하기

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
