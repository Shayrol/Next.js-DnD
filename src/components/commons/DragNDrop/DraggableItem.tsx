import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

export default function DraggableItem() {
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef.current);
    }
  }, []);

  const [{ isDragging }, drag] = useDrag({
    type: "item", // 드래그되는 항목의 타입을 지정
    item: () => cardInfo, // 드래그되는 항목에 전달될 데이터를 설정. 여기서는 cardInfo를 반환한다.
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(), // 드래그 중인지 여부
    }),
  });

  return (
    <div
      ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: "lightblue",
        padding: "16px",
        margin: "16px",
        cursor: "move",
      }}
    >
      Drag me
    </div>
  );
}
