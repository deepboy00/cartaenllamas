function detectarDispositivo() {
    const anchoPantalla = window.innerWidth;
    const esMovil = /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);

    // Definimos un ancho mínimo típico de laptop/PC (por ejemplo, 1024px)
    if (esMovil || anchoPantalla < 1024) {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;font-family:sans-serif;">
                <h1>🚫 Solo disponible en PC o Laptop</h1>
            </div>
        `;
        return false; // Bloquea todo el resto del JS
    }

    return true; // Dispositivo válido
}

// Ejecutar al cargar la página
if (!detectarDispositivo()) {
    // Si es móvil o tablet, detenemos cualquier otro script
    throw new Error("Dispositivo no soportado");
}


document.getElementById("btnIngresar").addEventListener("click", validar);

// ================= CORAZONES =================
const heartsContainer = document.getElementById("hearts");

setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = "❤";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (14 + Math.random() * 20) + "px";
    heart.style.animationDuration = (6 + Math.random() * 6) + "s";

    heartsContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 12000);
}, 300);

// ================= VALIDAR =================
function validar() {
    const nombre = document.getElementById("nombre").value.trim();
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = "";
    mensaje.className = "mensaje";

    if (!nombre) {
        mensaje.textContent = "Escribe tu nombre ❤️";
        mensaje.classList.add("error");
        return;
    }

    fetch("https://api-decla-production.up.railway.app/validar_persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    })
    .then(res => res.json())
    .then(data => {

        // ❌ Persona no existe
        if (data.error) {
            mensaje.textContent = "No se encontró tu nombre 💔";
            mensaje.classList.add("error");
            return;
        }

        // 🔒 YA ABRIÓ LA CARTA
        if (data.sesion === 0) {
            mensaje.textContent = "Ya abriste esta carta...";
            mensaje.classList.add("error");
            return;
        }

        // ✅ ACCESO PERMITIDO
        if (data.sesion === 1) {
            localStorage.setItem("nombre", data.nombre);

            mensaje.textContent = "Bienvenida, " + data.nombre + " ❤️";
            mensaje.classList.add("success");

            setTimeout(() => {
                window.location.href = "carta.html";
            }, 1500);
        }

    })
    .catch(() => {
        mensaje.textContent = "Error de conexión 💔";
        mensaje.classList.add("error");
    });
}

