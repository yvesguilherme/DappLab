import { useEffect, useState } from "react";

type Person = {
  name: string;
  age: number;
  uf: string;
}

type State = {
  readonly sigla: string;
  readonly nome: string;
}

function Form() {
  const [person, setPerson] = useState<Person>({ name: '', age: 0, uf: '' });
  const [state, setState] = useState<State[]>([]);

  useEffect(() => {
    fetchToIBGE();
  }, []);

  function fetchToIBGE() {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const states = data
          .map((state: { sigla: string; nome: string; }) => ({ sigla: state.sigla, nome: state.nome }))
          .sort((a: State, b: State) => a.nome.localeCompare(b.nome));

        setState(states);
      })
      .catch((error) => console.error('There was a problem with the fetch operation:', error));
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setPerson((prev) => ({ ...prev, name: value }));
  }

  function handleAgeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setPerson((prev) => ({ ...prev, age: Number(value) }));
  }

  function handleUfChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = event.target;
    setPerson((prev) => ({ ...prev, uf: value }));
  }

  function save() {

    if (!person.name || !person.uf || !person.age || isNaN(Number(person.age))) {
      return;
    }

    alert(`Saved: ${person.name}, ${person.age}, ${person.uf}`);

    reset();
  }

  function reset() {
    setPerson({ name: '', age: 0, uf: '' });
  }

  return (
    <form noValidate method="GET">
      <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <legend>Form</legend>

        <input
          type="text"
          id="name"
          name="name"
          placeholder="name"
          onChange={handleNameChange}
          value={person.name} />

        <input
          type="number"
          id="age"
          name="age"
          placeholder="age"
          min={1}
          max={100}
          onChange={handleAgeChange}
          value={person.age} />

        <select name="uf" id="uf" onChange={handleUfChange} value={person.uf}>
          {
            state.length === 0 ?
              <option value="">Loading...</option> :
              state.map((uf) => (<option key={uf.sigla} value={uf.sigla}>{uf.nome}</option>))
          }
        </select>

        <button type="button" onClick={save}>Submit</button>

        <button type="reset" onClick={reset}>Reset</button>
      </fieldset>
    </form>
  );
}

export default Form;