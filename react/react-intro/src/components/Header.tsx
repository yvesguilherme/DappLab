import { Link } from "react-router-dom";

type HeaderProps = {
  readonly title: string;
};

function Header(props: HeaderProps) {
  const style: React.CSSProperties = {
    top: '0',
    left: '0',
    marginLeft: '5rem',
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <header style={style}>
      <h2>{props.title}</h2>

      <div style={{ marginLeft: '2rem' }}>
        <Link to="/form">Form</Link>
      </div>
    </header>
  );
}

export default Header;