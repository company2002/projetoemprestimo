import { API_URL } from './config.js';

// Variável para controlar se a simulação foi realizada
let simulacaoRealizada = false;

// Função para enviar dados para o backend
async function enviarParaServidor(dados) {
    try {
        const response = await fetch(`${API_URL}/api/solicitacoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        throw error;
    }
}

// Função para enviar mensagem via WhatsApp
function enviarWhatsApp(dados) {
    const operadorSelect = document.getElementById('operador');
    const operadorNumero = operadorSelect.options[operadorSelect.selectedIndex].getAttribute('data-numero');
    
    let mensagem = `*Solicitação de Empréstimo*\n\n`;
    mensagem += `*Nome*: ${dados.nome}\n`;
    mensagem += `*Telefone*: ${dados.telefone}\n`;
    mensagem += `*Valor Solicitado*: ${dados.valor}\n`;
    mensagem += `*Tipo*: ${dados.tipo}\n`;
    
    if (dados.parcelas) {
        mensagem += `*Parcelas*: ${dados.parcelas}x\n`;
    }
    
    mensagem += `*Juros*: ${dados.juros}\n`;
    mensagem += `*Total*: ${dados.total}\n`;
    
    if (dados.prestacao) {
        mensagem += `*Prestação*: ${dados.prestacao}\n`;
    }
    
    if (dados.observacao) {
        mensagem += `\n*Observação*: ${dados.observacao}\n`;
    }
    
    mensagem += `\n*Data e Hora*: ${new Date().toLocaleString('pt-BR')}\n`;
    mensagem += `\n_Aguarde, em breve entraremos em contato._`;

    const whatsappUrl = `https://wa.me/${operadorNumero}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
}

// Event listener para o botão de enviar
document.getElementById('enviarBtn').addEventListener('click', async function() {
    if (!simulacaoRealizada) {
        document.getElementById('modalAviso').style.display = 'block';
        return;
    }

    if (!validarFormulario()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        const valores = calcularValores();
        const dados = {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            valor: document.getElementById('valor').value,
            tipo: document.getElementById('tipo').value,
            operador: document.getElementById('operador').value,
            observacao: document.getElementById('observacao').value,
            ...valores
        };

        // Adicionar informações específicas baseadas no tipo
        switch (dados.tipo) {
            case 'avulso':
                dados.parcelas = document.getElementById('prazo').value + ' dias';
                break;
            case 'parcelado':
            case 'renovacao_parcelado':
                dados.parcelas = document.getElementById('parcelas').value;
                break;
            case 'cartao':
            case 'renovacao_cartao':
                dados.parcelas = document.getElementById('parcelasCartao').value;
                break;
        }

        // Enviar para o servidor
        await enviarParaServidor(dados);
        
        // Enviar mensagem no WhatsApp
        enviarWhatsApp(dados);
        
        // Limpar formulário
        document.getElementById('loanForm').reset();
        simulacaoRealizada = false;
        
        // Resetar valores da simulação
        document.getElementById('juros').textContent = 'R$ 0,00';
        document.getElementById('total').textContent = 'R$ 0,00';
        document.getElementById('prestacao').textContent = 'R$ 0,00';
        document.getElementById('valorReceber').textContent = 'R$ 0,00';
        
        alert('Solicitação enviada com sucesso!');
    } catch (error) {
        console.error('Erro ao processar solicitação:', error);
        alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    }
});

// Event listener para o botão de calcular
document.getElementById('calcularBtn').addEventListener('click', function() {
    if (validarFormulario()) {
        calcularValores();
        simulacaoRealizada = true;
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Esconder todas as opções específicas inicialmente
    document.getElementById('opcoesAvulso').classList.add('hidden');
    document.getElementById('opcoesParcelado').classList.add('hidden');
    document.getElementById('opcoesCartao').classList.add('hidden');
}); 