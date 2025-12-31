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


const canvasEl = document.querySelector("#fire-overlay");
const scrollMsgEl = document.querySelector(".scroll-msg");

document.addEventListener("DOMContentLoaded", validarSesion);

function validarSesion() {
  const nombre = localStorage.getItem("nombre");

  if (!nombre) {
    // No hay nombre → fuera
    window.location.href = "index.html";
    return;
  }

  fetch("https://api-decla-production.up.railway.app/validar_persona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.sesion || data.sesion === 0) {
      // 🔒 Sesión cerrada
      localStorage.clear();
      window.location.href = "index.html";
    }
  })
  .catch(() => {
    // Error → mejor redirigir
    window.location.href = "index.html";
  });
}

const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
// const devicePixelRatio = 1;

const params = {
    fireTime: .35,
    fireTimeAddition: 0
}

let st, uniforms;
const gl = initShader();

st = gsap.timeline({
    scrollTrigger: {
        trigger: ".page",
        start: "0% 0%",
        end: "100% 100%",
        // markers: true,
        scrub: true,
        onLeaveBack: () => {
            // params.fireTimeAddition = Math.min(params.fireTimeAddition, .3);
            // gsap.to(params, {
            //     duration: .75,
            //     fireTimeAddition: 0
            // })
        },
    },
})
	 .to(scrollMsgEl, {
	   duration: .1,
   	opacity: 0
    }, 0)
    .to(params, {
        fireTime: .63
    }, 0)


window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gsap.set(".page", {
    opacity: 1
})


function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

    if (!gl) {
        alert("WebGL is not supported by your browser.");
    }

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return gl;
}

function render() {
    const currentTime = performance.now();
    gl.uniform1f(uniforms.u_time, currentTime);

    // if (st.scrollTrigger.isActive && st.scrollTrigger.direction === 1) {
    //     params.fireTimeAddition += .001;
    // }

    gl.uniform1f(uniforms.u_progress, params.fireTime + params.fireTimeAddition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvasEl.width = window.innerWidth * devicePixelRatio;
    canvasEl.height = window.innerHeight * devicePixelRatio;
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
    render();
}

function respuesta(valor) {
  const nombre = localStorage.getItem("nombre");

  if (!nombre) {
    window.location.href = "index.html";
    return;
  }

  // 🔐 VALIDAR SESIÓN ANTES DE RESPONDER
  fetch("https://api-decla-production.up.railway.app/validar_persona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre })
  })
  .then(res => res.json())
  .then(data => {

    // ❌ SESIÓN CERRADA
    if (!data.sesion || data.sesion === 0) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    // ✅ SESIÓN ACTIVA → MOSTRAR MENSAJE
    Swal.fire({
    title: valor === "si" ? "💖 Mi amor 💖" : "Bueno...",
    html: valor === "si"
        ? `
        <div style="font-family:'Dancing Script', cursive; font-size:28px;">
            Gracias por decir <b>SÍ</b> ❤️<br><br>
            Prometo amarte con todo mi corazón :)<br>
            y dar lo mejor de mi
        </div>
        `
        : `
        <div style="font-family:'Dancing Script', cursive; font-size:26px;">
            Gracias por todo <br><br>
            Cuídate...
        </div>
        `,
    background: "#0b0b0b",
    color: "#fff",
    confirmButtonText: "Cerrar",
    confirmButtonColor: valor === "si" ? "#b11226" : "#555",
    allowOutsideClick: false,
    allowEscapeKey: false
    })
    .then(() => {
    // 💾 Guardar respuesta
    enviarRespuesta(nombre, valor);
    // 🔁 VALIDAR SESIÓN NUEVAMENTE
    validarSesionDespues();
    });

  })
  .catch(() => {
    window.location.href = "index.html";
  });
}

function validarSesionDespues() {
  const nombre = localStorage.getItem("nombre");
  if (!nombre) {
    window.location.href = "index.html";
    return;
  }

  // Función que hace la validación con reintentos
  const intentos = 3;
  const delay = 500; // ms entre cada intento

  let i = 0;

  const checkSesion = () => {
    fetch("https://api-decla-production.up.railway.app/validar_persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.sesion || data.sesion === 0) {
        localStorage.clear();
        window.location.href = "index.html";
      } else if (i < intentos - 1) {
        i++;
        setTimeout(checkSesion, delay);
      }
    })
    .catch(() => {
      if (i < intentos - 1) {
        i++;
        setTimeout(checkSesion, delay);
      } else {
        window.location.href = "index.html";
      }
    });
  }

  checkSesion();
}



function enviarRespuesta(nombre, aceptacion) {
  fetch("https://api-decla-production.up.railway.app/respuesta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre: nombre,
      aceptacion: aceptacion
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Respuesta guardada:", data);
  })
  .catch(err => {
    console.error("Error:", err);
  });
}
