setTimeout(() => {
    alert(
        "Bienvenido al sistema de propinas.\n\n" +
        "1. Usa los botones numéricos para ingresar lo que se indique (Efectivo en caja, total de propinas, etc).\n" +
        "2. Presiona la palomita para confirmar el monto de ambos.\n" +
        "3. Luego se te preguntará si deseas dividir las propinas.\n" +
        "4. Si decides dividirlo, ingresa el número de personas.\n" +
        "5. Verás cuánto le toca a cada uno.\n" +
        "6. Si no deseas dividirlas, continúa normalmente.\n" +
        "7. Puedes editar el monto de propinas si lo necesitas.\n" +
        "8. Al editar, el cálculo por persona se actualizará.\n" +
        "9. Finalmente, elige el método de pago.\n" +
        "10. ¡Gracias por usar el sistema!"
    );
    alert("Ingresa el efectivo en caja");

    class Calculator {
        constructor(displayElement) {
            this.displayElement = displayElement;
            this.clear();
            this.dividingMode = false; //num persona dividir prop
            this.totalPropina = 0;
            this.ingresandoEfectivo = true; //efectivo en caja
        }

        clear() { //actualizar display calculator
            this.currentValue = '';
            this.updateUI();
        }

        formatNumber(value) { //formato de 2 digitos, comas
            const number = parseFloat(value.replace(/,/g, '')); //convierte un string a float
            if (isNaN(number)) return '';

            return number.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        updateUI() { //limpia display
            if (this.currentValue === '') {
                this.displayElement.textContent = '';
                return;
            }
            if (this.dividingMode) { //quita formato decimal para num de personas
                this.displayElement.textContent = this.currentValue;
            } else { //muestra formato decimal
                const formatted = this.formatNumber(this.currentValue);
                this.displayElement.textContent = `$${formatted}`;
            }
        }

        appendNumber(number) {
            if (number === '.' && this.currentValue.includes('.')) return;

            // Para modo dividir prop solo números enteros
            if (this.dividingMode && number === '.') return;
            this.currentValue += number;
            this.updateUI();
        }

        delete() { //boton borrar calculadora
            this.currentValue = this.currentValue.slice(0, -1);
            this.updateUI();
        }

        confirm() {
            const inputCaja = document.querySelector(".cajaDinero"); //efectivo en caja
            const inputPropina = document.querySelector(".input-propina"); //total propinas
            const divInput = document.querySelector(".div-pro"); //caja numero para dividir
            const divText = document.querySelector(".divir p"); //monto por persona

            if (this.currentValue === '') return;

            // Paso 1: modo ingresando efectivo
            if (this.ingresandoEfectivo) {
                const monto = parseFloat(this.currentValue.replace(/,/g, ''));
                if (isNaN(monto) || monto < 0) { //valida monto
                    alert("Monto inválido");
                    this.clear();
                    return;
                }

                const formattedEfectivo = this.formatNumber(this.currentValue); //aplica formato decimal
                if (input-efectivo) {
                    input-efectivo.value = `$${formattedEfectivo}`;
                }
                this.ingresandoEfectivo = false;
                this.clear();
                alert("Efectivo en caja registrado. Ahora ingresa el total de propinas.");
                return;
            }

            // Paso 2: ingresar propinas 
            if (!this.dividingMode) {
                const formatted = this.formatNumber(this.currentValue);//convierte un string a float
                const numericValue = parseFloat(this.currentValue.replace(/,/g, '')); 

                inputPropina.value = `$${formatted}`;
                this.totalPropina = numericValue;

                //Actualiza el campo "restante por pagar" del footer
                const restanteElemento = document.querySelector(".total.restante");
                if (restanteElemento) {
                    restanteElemento.textContent = `$${formatted}`;
                }
                this.clear();

                //division de propinas
                const numPersonas = parseInt(divInput.value);     // División automática si ya hay número en el input
                if (!isNaN(numPersonas) && numPersonas > 0) {
                    const propinaPorPersona = this.totalPropina / numPersonas;
                    divText.textContent = `$${propinaPorPersona.toFixed(2)} x persona`;
                } else { //sino pregunta si se desea dividir las propinas
                    setTimeout(() => {
                        const deseaDividir = confirm("¿Deseas dividir las propinas?");
                        if (deseaDividir) {
                            alert("Ok, escribe entre cuántos se dividirán las propinas");
                            this.dividingMode = true;
                        } else {
                            alert("Ok, continúa eligiendo el método de pago.");
                        }
                    }, 1000);
                }

            } else { //calculo de division de propinas
                const numPersonas = parseInt(this.currentValue);
                if (isNaN(numPersonas) || numPersonas <= 0) {
                    alert("Ingresa un número válido de personas");
                    this.clear();
                    return;
                }
                divInput.value = numPersonas;
                const propinaPorPersona = this.totalPropina / numPersonas;
                divText.textContent = `$${propinaPorPersona.toFixed(2)} x persona`;

                this.dividingMode = false;
                this.clear();
            }
        }

        editInput() { //icono editar total de propinas
            const inputPropina = document.querySelector(".input-propina"); //total propinas
            const divInput = document.querySelector(".div-pro"); //caja numero para dividir

            //limpia valores
            if (inputPropina) inputPropina.value = '';
            this.totalPropina = 0;
            this.dividingMode = false;
            this.clear();

            const numPersonas = parseInt(divInput.value); //actualiza valores
            const divText = document.querySelector(".divir p");
            if (isNaN(numPersonas) || numPersonas <= 0) {
                divText.textContent = '$0.00 x persona';
            }
            alert("Se actualizará el monto de propinas x persona.");
            alert("Escribe el nuevo total de las propinas");
        }
    }

    // Selección de elementos del HTML
    const display = document.querySelector("[data-operand-1]");
    const btonesCalcu = document.querySelectorAll("[data-number]");
    const btnBorrar = document.querySelector("[data-delete]");
    const btnOk = document.querySelector("[data-ok]");
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
