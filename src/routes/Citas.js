import { signOut, getAuth } from "firebase/auth";

export default function Citas() {
	const auth = getAuth();
	async function handleSignOut() {
		try {
			await signOut(auth);
		} catch (error) {
			console.log(error);
		}
	}
	return (
		<div>
			<h1>Calendario</h1>
			<button
				onClick={() => {
					handleSignOut();
				}}
			>
				Salir
			</button>
		</div>
	);
}
