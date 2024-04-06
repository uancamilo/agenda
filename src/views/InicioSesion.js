import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app, auth } from "../firebase/firebase.config"; // Importa la instancia de autenticación de Firebase
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; // Importa las funciones necesarias de Firebase Authentication
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export default function InicioSesion() {
	const navigate = useNavigate(); // Hook para la navegación en React Router
	const [phone, setPhone] = useState(""); // Estado para almacenar el número de teléfono
	const [showOTP, setShowOTP] = useState(false); // Estado para mostrar el formulario de OTP
	const [otp, setOtp] = useState(""); // Estado para almacenar el código de verificación OTP
	const [error, setError] = useState(null); // Estado para manejar errores

	async function onCaptchaVerify() {
		if (!window.recaptchaVerifier) {
			const recaptchaConfig = {
				size: "invisible",
				callback: onSignIn,
				"expired-callback": handleExpiredCaptcha,
			};

			window.recaptchaVerifier = new RecaptchaVerifier(
				auth,
				"recaptcha-container",
				recaptchaConfig
			);

			try {
				await window.recaptchaVerifier.verify();
			} catch (error) {
				console.error("Error al verificar el reCAPTCHA:", error);
				reinicializarRecaptcha();
			}
		}
	}

	// Función para reinicializar el reCAPTCHA
	function reinicializarRecaptcha() {
		window.recaptchaVerifier = null;
	}

	// Función para manejar el reCAPTCHA caducado
	function handleExpiredCaptcha() {
		reinicializarRecaptcha();
		onCaptchaVerify(); // Volver a inicializar el reCAPTCHA
	}

	async function onSignIn() {
		// Función para iniciar sesión y enviar OTP
		try {
			await onCaptchaVerify(); // Verifica el reCAPTCHA antes de enviar el OTP
			const formatPhone = "+57" + phone; // Formatea el número de teléfono según el formato esperado por Firebase
			const appVerifier = window.recaptchaVerifier; // Obtiene el verificador del reCAPTCHA

			await signInWithPhoneNumber(auth, formatPhone, appVerifier)
				.then(async (confirmationResult) => {
					window.confirmationResult = confirmationResult; // Almacena el resultado de la confirmación para su uso posterior
					setShowOTP(true); // Muestra el formulario de OTP después de enviar el código
				})
				.catch((error) => {
					if (error.code === "auth/invalid-phone-number") {
						console.error("Número de teléfono inválido");
					} else if (error.code === "auth/captcha-check-failed") {
						console.error("Verificación reCAPTCHA fallida");
					} else {
						console.error("Error desconocido al enviar OTP:", error);
					}
				});
		} catch (error) {
			console.error("Error al verificar el reCAPTCHA o enviar OTP:", error); // Maneja errores al verificar el reCAPTCHA o enviar OTP
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
			<div id="recaptcha-container"></div>
			{showOTP ? (
				<div>
					<p>{`El código de verificación se ha enviado al celular ${phone}`}</p>
					<input
						type="tel"
						id="verificationCode"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						placeholder="Código de verificación"
					/>
					<button onClick={onVerify}>Verificar</button>
				</div>
			) : (
				<div>
					<p>Para agendar una cita, ingrese su número de celular</p>
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
