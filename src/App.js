import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthContext } from "./context/authContext";
import InicioSesion from "./views/InicioSesion";
import Citas from "./routes/Citas";
import Protected from "./routes/Protected";

export default function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <InicioSesion />,
		},
		{
			path: "/calendario/*",
			element: (
				<Protected>
					<Citas />
				</Protected>
			),
		},
	]);
	return (
		<AuthContext>
			<RouterProvider router={router}></RouterProvider>
		</AuthContext>
	);
}
