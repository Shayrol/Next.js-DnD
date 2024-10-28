## 순수 JavaScript 사용과 react-beautiful-dnd 라이브러리 사용 각각 Drag and Drop 구현하기
> **순수 JavaScript 사용으로 Drag and Drop 구현**
- onDrop, onDragOver, onDragLeave, onDragStart 같이 HTML5의 드래그 앤 드롭 API를 통해 Drag and Drop을 구현 했습니다.

![2024-10-2814-41-48-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/52883cbd-7878-4e17-acfb-2f7bde0fa69a) <br>
영상에서는 드래그시 고스트 현상은 찍히지 않았지만 문제없이 되었습니다.. <br>

일부 사용 코드
```bash
<motion.div
  layout
  layoutId={props.id}
  draggable={true} // 드래그 가능하게 하기
  onDragStart={(e) =>
    props.handleDragStart(e, {
      title: props.title,
      id: props.id,
      column: props.column,
    })
  }
  className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3"
>
  <p className="text-sm text-neutral-100">{props.title}</p>
</motion.div>
```
onDragStart는 드래그 시 실행되는 함수 입니다. <br>
요소에 사용된 motion은 dnd 시 부드러운 연출을 위한 라이브러리를 사용한 것이며 속성으로 layout, layoutId를 사용했습니다.

---

> **react-beautiful-dnd**
- react-beautiful-dnd 라이브러리 사용으로 드래그 앤 드롭을 구현했습니다.

![2024-10-2815-38-32-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/ce0c9207-e189-4d7c-af0b-e8d80f823508) <br>


## 마무리
순수 JavaScript 구현은 영상을 참고했습니다.
참고 링크: https://www.youtube.com/watch?v=O5lZqqy7VQE
