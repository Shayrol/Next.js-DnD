import { useDrop } from "react-dnd";

export default function DropZone() {
  const [{ isOver }, drop] = useDrop({
    accept: "BOX", // 받아들일 아이템 타입
    drop: (item) => {
      alert(`Dropped item with id: ${item.id}`);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        height: "200px",
        width: "200px",
        backgroundColor: isOver ? "lightgreen" : "lightgrey",
        padding: "16px",
      }}
    >
      Drop here
    </div>
  );
}
