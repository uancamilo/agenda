import { BrowserRouter, Routes, Route } from "react-router-dom";

import Citas from "./routes/Citas";

function App() {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<Citas />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
