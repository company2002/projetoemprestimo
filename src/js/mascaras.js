// Máscara para o campo de telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        if (value.length > 10) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }
    }
    
    e.target.value = value;
});

// Máscara para o campo de valor
document.getElementById('valor').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    
    if (!isNaN(value)) {
        value = value.replace('.', ',');
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        e.target.value = `R$ ${value}`;
    } else {
        e.target.value = '';
    }
});

// Função para remover formatação de moeda
function desformatarMoeda(valor) {
    if (!valor) return 0;
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
}

// Função para formatar moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para validar nome (apenas letras e espaços)
document.getElementById('nome').addEventListener('input', function(e) {
    let value = e.target.value;
    if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
        value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        e.target.value = value;
    }
}); 