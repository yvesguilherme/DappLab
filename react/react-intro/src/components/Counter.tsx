import { useState } from "react";

function Counter() {

  const [counter, setCounter] = useState<number>(0);

  function btnClick() {
    setCounter(counter + 1);
  }

  function btnReset() {
    setCounter(0);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button style={{ marginRight: '1rem' }} onClick={btnClick}>Click me</button>
        <button onClick={btnReset}>Reset me</button>
      </div>

      <span>{counter} times...</span>
    </div>
  );
}

export default Counter;