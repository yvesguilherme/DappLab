import { Route, Routes, BrowserRouter } from "react-router-dom";

import Form from "./components/Form";
import App from "./pages/App";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <App /> } />
        <Route path="/form" element={ <Form /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;