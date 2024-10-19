// Função para atualizar a contagem e redirecionar
function contarRegressiva() {
    const contador = document.getElementById('contador');
    let segundos = 10;

    const intervalo = setInterval(() => {
        segundos--;
        contador.textContent = `Você será redirecionado em ${segundos} segundos.`;

        if (segundos === 0) {
            clearInterval(intervalo);
            window.location.href = 'https://ourworldindata.org/coronavirus'; // Substitua por sua URL desejada
        }
    }, 1000);
}

/// Funcao principal
async function main() {
    contarRegressiva()
}
 
// chamada de funcoes ao iniciar
function eventos() {
    tmp = setTimeout(main, 100);
};

window.addEventListener("load", eventos);