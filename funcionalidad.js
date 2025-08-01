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
                this.updateUI();
                //this.dividingMode = false;
                //this.clear();
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

}, 1500);
