import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.config"; // Importa la instancia de autenticación de Firebase
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; // Importa las funciones necesarias de Firebase Authentication

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
			.then((result) => {
				const user = result.user;
				console.log(user);
				console.log("Verificación exitosa");
				navigate("/calendario"); // Navega a la página de calendario después de la verificación exitosa
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
