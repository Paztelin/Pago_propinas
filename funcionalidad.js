// ************* FUNCIONES DE VENTANA MODAL ************
function showAlert(message, options = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById("modal-alert");
        const text = document.getElementById("modal-alert-text");
        const btnOk = document.getElementById("modal-alert-ok");

        text.innerHTML = message; //insertar-->mostrar texto

        //alineacion textos
        text.style.textAlign = options.align || "center";

        modal.style.display = "flex"; //mostrar ventana modam

        btnOk.onclick = () => {
            modal.style.display = "none"; //oculta la ventana
            resolve();
        };
    });
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("modal-confirm");
        const text = document.getElementById("modal-confirm-text");
        const btnYes = document.getElementById("modal-confirm-yes");
        const btnNo = document.getElementById("modal-confirm-no");

        text.textContent = message;
        modal.style.display = "flex";

        btnYes.onclick = () => {
            modal.style.display = "none";
            resolve(true);
        };

        btnNo.onclick = () => {
            modal.style.display = "none";
            resolve(false);
        };
    });
}

setTimeout(async () => {

    //alineacion izquierda
    await showAlert(`
        Bienvenido al sistema de propinas.<br><br>
        1. Usa los botones para ingresar lo indicado.<br>
        2. Presiona la palomita para confirmar.<br>
        3. Dividir las propinas es opcional.<br>
        4. Si aceptas, ingresa el número de personas.<br>
        5. Se visualizará el monto de la división.<br>
        6. Sino divides, continúa normalmente.<br>
        7. Puedes editar el monto de propinas.<br>
        8. Al editar, el monto x persona se actualiza.<br>
        9. Finalmente, elige el método de pago.<br>
        10. ¡Gracias por usar el sistema!`,
        { align: "left" }
    );

    await showAlert("Ingresa el efectivo en caja");

    //calculadora general
    class Calculator {
        constructor(displayElement) {
            this.displayElement = displayElement;
            this.clear();
            this.dividingMode = false; //para num de personas -dividir propinas
            this.totalPropina = 0; //para total propinas
            this.ingresandoEfectivo = true; //para ingresar efectivo caja
            this.fixedMessage = '';
        }

        clear() { //actualiza - limpia el display calcu
            this.currentValue = '';
            this.updateUI();
        }

        formatNumber(value) { //formato de 2 digitos, comas
            const number = parseFloat(value.replace(/,/g, '')); //elimina , del string      parseFloat->convierte en decimal
            if (isNaN(number)) return '';
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        updateUI() { //limpia display calcu
            if (this.fixedMessage !== '') {
                this.displayElement.textContent = this.fixedMessage;
                return;
            }

            if (this.currentValue === '') {
                this.displayElement.textContent = '';
                return;
            }
            if (this.dividingMode) { //quita formato decimal cuando se ingresa num-personas para dividir propinas
                this.displayElement.textContent = this.currentValue;
            } else {
                const formatted = this.formatNumber(this.currentValue);
                this.displayElement.textContent = `$${formatted}`;
            }
        }

        appendNumber(number) {
            if (this.fixedMessage !== '') {
                this.fixedMessage = '';
                this.displayElement.textContent = '';
            }

            if (number === '.' && this.currentValue.includes('.')) return;
            //para modo dividir prop solo numeros enteros
            if (this.dividingMode && number === '.') return;
            this.currentValue += number;
            this.updateUI();
        }

        delete() { //boton borrar calculadora
            this.currentValue = this.currentValue.slice(0, -1);
            this.updateUI();
        }

        async confirm() {
            const inputCaja = document.querySelector(".input-efectivo"); //efectivo en caja
            const inputPropina = document.querySelector(".input-propina"); //total propinas
            const divInput = document.querySelector(".input-num-person"); //caja num para dividir
            const divText = document.querySelector(".dividir-prop p"); //monto por persona

            if (this.currentValue === '') return;

            //paso1 - ingresar efectivo
            if (this.ingresandoEfectivo) {
                const monto = parseFloat(this.currentValue.replace(/,/g, ''));
                if (isNaN(monto) || monto < 0) { //valida monto
                    await showAlert("Monto inválido");
                    this.clear();
                    return;
                }

                const formattedEfectivo = this.formatNumber(this.currentValue); //aplica formato decimal
                if (inputCaja) {
                    inputCaja.value = `$${formattedEfectivo}`;
                }
                this.ingresandoEfectivo = false;
                this.clear();
                await showAlert("Efectivo en caja registrado.<br>Ahora ingresa el total de propinas.");
                return;
            }

            //paso2 - ingresar propinas
            if (!this.dividingMode) {
                const formatted = this.formatNumber(this.currentValue); //convierte un string a float
                const numericValue = parseFloat(this.currentValue.replace(/,/g, ''));

                inputPropina.value = `$${formatted}`;
                this.totalPropina = numericValue;

                //actualiza el campo "restante por pagar" del footer
                const restanteElemento = document.querySelector(".total-restante");
                if (restanteElemento) {
                    restanteElemento.textContent = `$${formatted}`;
                }
                await showAlert("Total de propinas registrado");
                this.clear();

                //paso3 - dividir propinas (opcional)
                const numPersonas = parseInt(divInput.value); // División automática si ya hay número en el input
                if (!isNaN(numPersonas) && numPersonas > 0) {
                    const propinaPorPersona = this.totalPropina / numPersonas;
                    divText.textContent = `$${propinaPorPersona.toFixed(2)} x persona`;
                    this.displayElement.textContent = `$${propinaPorPersona.toFixed(2)} x persona`;
                }

                else { //sino pregunta si se desea dividir las propinas
                    const deseaDividir = await showConfirm("¿Deseas dividir las propinas?");
                    if (deseaDividir) {
                        await showAlert("Ok, escribe entre cuántos se dividirán las propinas");
                        this.dividingMode = true;
                    } else {
                        await showAlert("Ok, continúa eligiendo el método de pago.");
                    }
                }

            } else { //calculo de division de propinas
                const numPersonas = parseInt(this.currentValue);
                if (isNaN(numPersonas) || numPersonas <= 0) {
                    await showAlert("Ingresa un número válido de personas");
                    this.clear();
                    return;
                }
                divInput.value = numPersonas;
                const propinaPorPersona = this.totalPropina / numPersonas;
                divText.textContent = `$${propinaPorPersona.toFixed(2)} x persona`;

                this.fixedMessage = `$${propinaPorPersona.toFixed(2)}`; //muestra monto propinas en display-calcu

                const pie_pagina = document.getElementById("calculator")
                const foot_calcu = document.createElement("div");

                foot_calcu.innerHTML = `
                    <p>Cantidad restante <strong> </strong></p<
                `;

                foot_calcu.style.borderRadius = "20px",
                    foot_calcu.style.background = "#ffffff",
                    foot_calcu.style.border = "2px solid #f89b8f",
                    foot_calcu.style.margin = "15px 0",
                    foot_calcu.style.padding = "0",
                    foot_calcu.style.fontSize = "14px",
                    foot_calcu.style.width = "100%",
                    foot_calcu.style.height = "50px",
                    foot_calcu.style.boxSizing = "border-box",
                    foot_calcu.style.textAlign = "center",
                    foot_calcu.style.color = "#e65c4f"

                pie_pagina.appendChild(foot_calcu);

                const strongElement = foot_calcu.querySelector("strong");
                strongElement.textContent = this.totalPropina.toFixed;


                console.log("Nuevo div añadido:", foot_calcu);


                await showAlert("Ahora por favor elije el método de pago");
                this.updateUI();
            }
        }

        async editInput() { //icono edital total propinas
            const inputPropina = document.querySelector(".input-propina"); //total propinas
            const divInput = document.querySelector(".input-num-person"); //caja num-persona para dividir

            //limpia valores
            if (inputPropina) inputPropina.value = '';
            this.totalPropina = 0;
            this.dividingMode = false;
            this.clear();

            const numPersonas = parseInt(divInput.value); //actualiza valores
            const divText = document.querySelector(".dividir-prop p");
            if (isNaN(numPersonas) || numPersonas <= 0) {
                divText.textContent = '$0.00 x persona';
            }
            await showAlert("Se actualizará el monto de propinas x persona.");
            await showAlert("Escribe el nuevo total de las propinas");
        }
    }

    //elementos del html
    const display = document.querySelector("[data-operand-1]");
    const btonesCalcu = document.querySelectorAll("[data-number]");
    const btnBorrar = document.querySelector(".btn-delete");
    const btnOk = document.querySelector(".data-ok");
    const btnEditar = document.querySelector(".edit");

    const calculator = new Calculator(display);

    btonesCalcu.forEach(button => {
        button.addEventListener("click", () => {
            calculator.appendNumber(button.textContent);
        });
    });

    btnBorrar.addEventListener("click", () => {
        calculator.delete();
    });

    btnOk.addEventListener("click", () => {
        calculator.confirm();
    });

    btnEditar.addEventListener("click", () => {
        calculator.editInput();
    });


    /////////////////////////////////////////////////////////////////////////


    const registrosDerecha = document.getElementById("registrar-pagos");
    const quitar_div = document.getElementById("registro-pagos");

    let primerPagoSeleccionado = false; //sbaer si ya se borró el div que ya está

    const pagos = [
        {
            id: "pago1",
            svg: `<svg class="icono-bill" width="30" height="30" viewBox="0 0 48 48" fill="none">
                <path d="M3 20 v21 h35" fill="none" stroke="#333" stroke-width="3.5" stroke-linejoin="bevel" />
                <rect x="10" y="14" width="32" height="20" rx="2" fill="none" stroke="#333" stroke-width="3.5" />
                <circle cx="26" cy="24" r="4" fill="#333" stroke="none" />
                <circle cx="13" cy="17" r="3.5" fill="#333" />
                <circle cx="39" cy="17" r="3.5" fill="#333" />
                <circle cx="13" cy="31" r="3.5" fill="#333" />
                <circle cx="39" cy="31" r="3.5" fill="#333" />
            </svg>`,
            texto: "Efectivo",
            svg2: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                stroke="#e65c4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>`
        },
        {
            id: "pago2",
            svg: `
            <svg class="icono-svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#333"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="4"></line>
            </svg>`,
            texto: "BBVA 1234",
            svg2: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                stroke="#e65c4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>`
        },
        {
            id: "pago3",
            svg: `
            <svg class="icono-svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#333"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="4"></line>
            </svg>`,
            texto: "Santander 1234",
            svg2: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                stroke="#e65c4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>`
        }
    ];

    // Crear div dinámico para los 3tipos de pago
    function crearDivPago(pago) {
        const div = document.createElement("div");
        div.classList.add("pago-seleccionado");

        div.innerHTML =
            `${pago.svg}
        <p>${pago.texto}</p>
        ${pago.svg2}`;

        Object.assign(div.style, {
            borderRadius: "15px",
            padding: "15px 25px",
            width: "90%",
            height: "25px",
            textAlign: "left",
            boxShadow: "3px 3px 5px lightgray, -3px 0 5px lightgray",
            fontSize: "15px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
        });

        return div;
    }

    // Eventos de click para cada pago
    pagos.forEach(pago => {
        const boton = document.getElementById(pago.id);
        if (!boton) return;

        boton.addEventListener("click", () => {
            // Oculta el div inicial solo la primera vez
            if (!primerPagoSeleccionado) {
                quitar_div.style.display = "none";
                primerPagoSeleccionado = true;
            }

            const nuevoDiv = crearDivPago(pago);
            registrosDerecha.appendChild(nuevoDiv);
        });
    });


    /*

    pago1.addEventListener("click", () => {
        // Oculta el div que tiene 
        quitar_div.style.display = "none";

        // Limpia el contenedor
        registrosDerecha.innerHTML = "";

        // Crea div nuevo
        const pago1_seleccionado = document.createElement("div");
        pago1_seleccionado.innerHTML =
            `< svg class="icono-bill" width = "30" height = "30" viewBox = "0 0 48 48" fill = "none" >
                            <path d="M3 20 v21 h35" fill="none" stroke="#333" stroke-width="3.5"
                                stroke-linejoin="bevel" />
                            <!--Billete delantero-- >
                            <rect x="10" y="14" width="32" height="20" rx="2" fill="none" stroke="#333"
                                stroke-width="3.5" />
                            <!--círculo central-- >
                            <circle cx="26" cy="24" r="4" fill="#333" stroke="none" />
                            <!--círculos en las esquinas internas-- >
                            <circle cx="13" cy="17" r="3.5" fill="#333" /> <!--sup izq-- >
                            <circle cx="39" cy="17" r="3.5" fill="#333" /> <!--sup der-- >
                            <circle cx="13" cy="31" r="3.5" fill="#333" /> <!--inf izq-- >
                            <circle cx="39" cy="31" r="3.5" fill="#333" /> <!--inf der-- >
            </svg >
                <p>Efectivo</p>`;

        //diseño del div nuevo -mismo que css
        Object.assign(pago1_seleccionado.style, {
            borderRadius: "15px",
            padding: "15px 25px",
            width: "90%",
            height: "25px",
            textAlign: "left",
            boxShadow: "3px 3px 5px lightgray, -3px 0 5px lightgray",
            fontSize: "15px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            gap: "10px",
        });

        // inserta el nuevo div
        registrosDerecha.appendChild(pago1_seleccionado);

        console.log("Nuevo div añadido:", pago1_seleccionado);
    });

    pago2.addEventListener("click", () => {
        // Crea div nuevo
        const pago2_seleccionado = document.createElement("div");
        pago2_seleccionado.innerHTML =
            `< svg class="icono-svg" width = "30" height = "30" viewBox = "0 0 24 24" fill = "none" stroke = "#333"
            stroke - width="2" stroke - linecap="round" stroke - linejoin="round" >
                            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="3" y1="10" x2="21" y2="10" stroke-width="4"></line>
                        </svg >
                <p>BBVA 123 ${fixedMessage}</p>`;

        //diseño del div nuevo -mismo que css
        Object.assign(pago2_seleccionado.style, {
            borderRadius: "15px",
            padding: "15px 25px",
            width: "90%",
            height: "25px",
            textAlign: "left",
            boxShadow: "3px 3px 5px lightgray, -3px 0 5px lightgray",
            fontSize: "15px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            gap: "10px",
        });

        // inserta el nuevo div
        registrosDerecha.appendChild(pago2_seleccionado);

        console.log("Nuevo div añadido:", pago2_seleccionado);
    });

    pago3.addEventListener("click", () => {
        // Crea div nuevo
        const pago3_seleccionado = document.createElement("div");
        pago3_seleccionado.innerHTML =
            `< svg class="icono-svg" width = "30" height = "30" viewBox = "0 0 24 24" fill = "none" stroke = "#333"
            stroke - width="2" stroke - linecap="round" stroke - linejoin="round" >
                            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="3" y1="10" x2="21" y2="10" stroke-width="4"></line>
                        </svg >
                <p>Santander 123 </p>`;

        //diseño del div nuevo -mismo que css
        Object.assign(pago3_seleccionado.style, {
            borderRadius: "15px",
            padding: "15px 25px",
            width: "90%",
            height: "25px",
            textAlign: "left",
            boxShadow: "3px 3px 5px lightgray, -3px 0 5px lightgray",
            fontSize: "15px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            gap: "10px",
        });

        // inserta el nuevo div
        registrosDerecha.appendChild(pago3_seleccionado);

        console.log("Nuevo div añadido:", pago3_seleccionado);
    });*/

}, 1500);
