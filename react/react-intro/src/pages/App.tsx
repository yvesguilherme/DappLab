import reactLogo from '../assets/react.svg';
import './App.css';
import Header from '../components/Header';
import Counter from '../components/Counter';

function App() {
  return (
    <>
      <Header title='React - Yves Guilherme' />
      
      <img src={reactLogo} className="logo react" alt="React logo" />

      <h1>Hello, world!</h1>

      <div>
        <Counter />
      </div>
    </>
  );
}

export default App;
