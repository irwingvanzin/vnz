<?php
/**
 * VNZ Climatização — Processador do formulário de contato
 * Envia o e-mail usando a função mail() do PHP (nativa do cPanel),
 * sem depender de nenhuma plataforma de terceiros.
 *
 * CONFIGURAÇÃO: se quiser mudar o e-mail que recebe as mensagens,
 * altere apenas a linha $destinatario abaixo.
 */

// ========================== CONFIGURAÇÃO ==========================
$destinatario = 'irwing@vnzclimatizacao.com.br'; // quem RECEBE as mensagens
$remetente    = 'irwing@vnzclimatizacao.com.br'; // conta do próprio domínio (evita cair em spam)
// ==================================================================

header('Content-Type: application/json; charset=UTF-8');

$ehAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH'])
       && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

/** Responde em JSON (AJAX) ou redireciona de volta ao site (sem JS). */
function responder(bool $sucesso, string $mensagem): void
{
    global $ehAjax;
    if ($ehAjax) {
        echo json_encode(['sucesso' => $sucesso, 'mensagem' => $mensagem], JSON_UNESCAPED_UNICODE);
    } else {
        $parametro = $sucesso ? 'enviado' : 'erro';
        header('Location: /?' . $parametro . '=1#contato');
    }
    exit;
}

// Aceita somente POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método inválido.');
}

// Honeypot: se o campo oculto "site" veio preenchido, é robô. Finge sucesso.
if (!empty($_POST['site'])) {
    responder(true, 'Mensagem enviada com sucesso! Retornaremos em breve.');
}

// Coleta e higieniza os campos
$nome     = trim(filter_input(INPUT_POST, 'nome') ?? '');
$email    = trim(filter_input(INPUT_POST, 'email') ?? '');
$mensagem = trim(filter_input(INPUT_POST, 'mensagem') ?? '');
$lgpd     = filter_input(INPUT_POST, 'lgpd');

// Validações
if ($nome === '' || $email === '' || $mensagem === '') {
    responder(false, 'Preencha todos os campos antes de enviar.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'Informe um endereço de e-mail válido.');
}
if (empty($lgpd)) {
    responder(false, 'É necessário concordar com o tratamento de dados (LGPD).');
}
if (mb_strlen($nome) > 120 || mb_strlen($email) > 120 || mb_strlen($mensagem) > 3000) {
    responder(false, 'Um dos campos excedeu o tamanho máximo permitido.');
}
// Anti-spam simples: bloqueia mensagens cheias de links
if (preg_match_all('/https?:\/\//i', $mensagem) > 2) {
    responder(false, 'Sua mensagem parece conter muitos links. Remova-os e tente novamente.');
}
// Impede injeção de cabeçalhos de e-mail
foreach ([$nome, $email] as $campo) {
    if (preg_match('/[\r\n]/', $campo)) {
        responder(false, 'Dados inválidos detectados.');
    }
}

// Monta o e-mail
$assunto = mb_encode_mimeheader('Novo contato pelo site - ' . $nome, 'UTF-8');

$corpo  = "Nova mensagem enviada pelo formulário do site vnzclimatizacao.com.br\n";
$corpo .= "------------------------------------------------------------\n\n";
$corpo .= "Nome: {$nome}\n";
$corpo .= "E-mail: {$email}\n";
$corpo .= "Data: " . date('d/m/Y H:i:s') . "\n";
$corpo .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'desconhecido') . "\n\n";
$corpo .= "Mensagem:\n{$mensagem}\n\n";
$corpo .= "------------------------------------------------------------\n";
$corpo .= "O visitante concordou com o tratamento da mensagem conforme a LGPD.\n";

$cabecalhos  = "MIME-Version: 1.0\r\n";
$cabecalhos .= "Content-Type: text/plain; charset=UTF-8\r\n";
$cabecalhos .= "Content-Transfer-Encoding: 8bit\r\n";
$cabecalhos .= "From: VNZ Climatizacao - Site <{$remetente}>\r\n";
$cabecalhos .= "Reply-To: {$nome} <{$email}>\r\n";

$enviado = mail($destinatario, $assunto, $corpo, $cabecalhos, '-f' . $remetente);

if ($enviado) {
    responder(true, 'Mensagem enviada com sucesso! Retornaremos em breve.');
} else {
    responder(false, 'Não foi possível enviar sua mensagem agora. Tente novamente mais tarde ou fale conosco pelo WhatsApp (92) 98632-3508.');
}
