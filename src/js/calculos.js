// Função para calcular juros e valores
function calcularValores() {
    const valorInput = document.getElementById('valor').value;
    const valor = desformatarMoeda(valorInput);
    const tipo = document.getElementById('tipo').value;
    
    let juros = 0;
    let total = 0;
    let prestacao = 0;
    let valorReceber = valor;

    switch (tipo) {
        case 'avulso':
            const prazo = parseInt(document.getElementById('prazo').value);
            juros = prazo === 20 ? valor * 0.2 : valor * 0.3;
            total = valor + juros;
            prestacao = total;
            break;

        case 'parcelado':
        case 'renovacao_parcelado':
            const parcelas = parseInt(document.getElementById('parcelas').value);
            if (parcelas === 2) {
                juros = valor * 0.3;
            } else if (parcelas === 6) {
                juros = valor * 0.45;
            } else if (parcelas === 10) {
                juros = valor * 0.65;
            }
            total = valor + juros;
            prestacao = total / parcelas;
            break;

        case 'cartao':
        case 'renovacao_cartao':
            const parcelasCartao = parseInt(document.getElementById('parcelasCartao').value);
            juros = parcelasCartao === 5 ? valor * 0.15 : valor * 0.2;
            total = valor + juros;
            prestacao = total / parcelasCartao;
            break;
    }

    // Atualizar os valores na tela
    document.getElementById('juros').textContent = formatarMoeda(juros);
    document.getElementById('total').textContent = formatarMoeda(total);
    document.getElementById('prestacao').textContent = formatarMoeda(prestacao);
    document.getElementById('valorReceber').textContent = formatarMoeda(valorReceber);

    return {
        juros,
        total,
        prestacao,
        valorReceber
    };
}

// Função para validar o formulário
function validarFormulario() {
    const campos = ['nome', 'telefone', 'valor', 'tipo', 'operador'];
    let valido = true;

    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (!elemento.value) {
            elemento.classList.add('invalido');
            valido = false;
        } else {
            elemento.classList.remove('invalido');
        }
    });

    const tipo = document.getElementById('tipo').value;
    
    switch (tipo) {
        case 'avulso':
            if (!document.getElementById('prazo').value) valido = false;
            break;
        case 'parcelado':
        case 'renovacao_parcelado':
            if (!document.getElementById('parcelas').value) valido = false;
            break;
        case 'cartao':
        case 'renovacao_cartao':
            if (!document.getElementById('parcelasCartao').value) valido = false;
            break;
    }

    return valido;
}

// Event Listeners
document.getElementById('tipo').addEventListener('change', function() {
    // Esconder todas as opções
    document.getElementById('opcoesAvulso').classList.add('hidden');
    document.getElementById('opcoesParcelado').classList.add('hidden');
    document.getElementById('opcoesCartao').classList.add('hidden');

    // Mostrar opções relevantes
    switch (this.value) {
        case 'avulso':
            document.getElementById('opcoesAvulso').classList.remove('hidden');
            break;
        case 'parcelado':
        case 'renovacao_parcelado':
            document.getElementById('opcoesParcelado').classList.remove('hidden');
            if (this.value === 'parcelado') {
                document.getElementById('modalTermos').style.display = 'block';
            }
            break;
        case 'cartao':
        case 'renovacao_cartao':
            document.getElementById('opcoesCartao').classList.remove('hidden');
            break;
    }
});

// Botão Calcular
document.getElementById('calcularBtn').addEventListener('click', function() {
    if (validarFormulario()) {
        calcularValores();
    } else {
        alert('Por favor, preencha todos os campos obrigatórios.');
    }
});

// Fechar modais
document.querySelectorAll('.close').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Clicar fora do modal para fechar
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}); 