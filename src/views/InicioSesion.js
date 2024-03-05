import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app, auth } from "../firebase/firebase.config"; // Importa la instancia de autenticación de Firebase
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; // Importa las funciones necesarias de Firebase Authentication
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export default function InicioSesion() {
	const navigate = useNavigate(); // Hook para la navegación en React Router
	const [showOTP, setShowOTP] = useState(false); // Estado para mostrar el formulario de OTP
	const [phone, setPhone] = useState(""); // Estado para almacenar el número de teléfono
	const [otp, setOtp] = useState(""); // Estado para almacenar el código de verificación OTP
	const [error, setError] = useState(null); // Estado para manejar errores

	async function onCaptchVerify() {
		if (!window.recaptchaVerifier) {
			const recaptchaConfig = {
				size: "invisible",
				callback: () => {
					onSignIn();
				},
				"expired-callback": () => {
					// Captcha expired callback logic, if needed
				},
			};

			window.recaptchaVerifier = new RecaptchaVerifier(
				auth,
				"recaptcha-container",
				recaptchaConfig
			);

			try {
				await window.recaptchaVerifier.verify();
			} catch (error) {
				// Manejar errores de verificación aquí
				console.error("Error al verificar el reCAPTCHA:", error);
			}
		}
	}

	function resetRecaptcha() {
		// Limpiar el antiguo RecaptchaVerifier
		window.recaptchaVerifier.clear();
		// Volver a crear el RecaptchaVerifier
		window.recaptchaVerifier = null;
		// Volver a llamar a la función onCaptchVerify para reiniciar el proceso
		onCaptchVerify();
	}

	async function onSignIn() {
		// Función para iniciar sesión y enviar OTP
		await onCaptchVerify(); // Verifica el reCAPTCHA antes de enviar el OTP
		const formatPhone = "+57" + phone; // Formatea el número de teléfono según el formato esperado por Firebase
		const appVerifier = window.recaptchaVerifier; // Obtiene el verificador del reCAPTCHA

		try {
			// Inicia sesión con el número de teléfono y el verificador del reCAPTCHA
			const confirmationResult = await signInWithPhoneNumber(
				auth,
				formatPhone,
				appVerifier
			);
			window.confirmationResult = confirmationResult; // Almacena el resultado de la confirmación para su uso posterior
			setShowOTP(true); // Muestra el formulario de OTP después de enviar el código
			console.log("OTP enviado exitosamente!");
		} catch (error) {
			// Maneja errores al enviar OTP
			console.error("Error al enviar OTP:", error);
			resetRecaptcha();
		}
	}

	function onVerify() {
		// Función para verificar el código OTP ingresado por el usuario
		const verificationCode = otp.trim();

		if (verificationCode === "") {
			setError("Ingrese el código de verificación.");
			return;
		}

		// Confirma el código OTP
		window.confirmationResult
			.confirm(verificationCode)
			.then(async (result) => {
				console.log("Verificación exitosa");

				const firestore = getFirestore(app);
				const userDocRef = doc(
					firestore,
					`usuarios/${result.user.phoneNumber}`
				);

				try {
					const userDocSnapshot = await getDoc(userDocRef);
					if (userDocSnapshot.exists()) {
						// El usuario ya existe, puedes realizar acciones adicionales si es necesario
						console.log("El usuario ya existe en la base de datos.");
					} else {
						// El usuario no existe, crea los datos del usuario en la colección
						const userData = {
							celular: result.user.phoneNumber,
							// Otros datos del usuario si es necesario
						};
						await setDoc(userDocRef, userData);
						console.log("Datos del usuario creados en la base de datos.");
					}

					// Navega a la página de calendario después de la verificación exitosa
					navigate("/calendario");
				} catch (error) {
					// Maneja errores al acceder a la base de datos
					setError("Error al acceder a la base de datos.");
					console.error(error);
				}
			})
			.catch((error) => {
				// Maneja errores al verificar el código OTP
				setError(
					"Error al verificar el código. Por favor, inténtelo de nuevo."
				);
				console.error(error);
			});
	}

	return (
		<>
			<p>Para agendar la cita, ingrese su número de teléfono</p>
			<div id="recaptcha-container"></div>
			{showOTP ? (
				<div>
					<input
						type="number"
						id="verificationCode"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						placeholder="Código de verificación"
					/>
					<button onClick={onVerify}>Verificar</button>
				</div>
			) : (
				<div>
					<input
						type="tel"
						name="telefono"
						value={phone}
						placeholder="Número de teléfono"
						onChange={(e) => setPhone(e.target.value)}
					/>
					<button onClick={onSignIn}>Obtener código</button>
				</div>
			)}
			{error && <p style={{ color: "red" }}>{error}</p>}
		</>
	);
}
