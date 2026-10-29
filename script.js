const $ = id => document.getElementById(id);
const FORMSUBMIT_ENDPOINT = 'rafafigas@gmail.com';
const CONTACT_EMAIL = 'rafafigas@gmail.com';
function build() {
    return `Pedido de orçamento
Negócio: ${$('nome').value || 'Ainda não indicado'}
Email para resposta: ${$('email').value || 'Ainda não indicado'}
Pacote de interesse: ${$('pacote').value}
O que precisa: ${$('msg').value || 'Ainda estou a definir.'}`;
}

const form = $('form');
const submitBtn = $('submitBtn');
const submitText = $('submitText');
const submitIcon = $('submitIcon');
const formStatus = $('formStatus');
const copyBtn = $('copyBtn');

function setStatus(msg, type) {
    formStatus.className = `form-status ${type}`;
    formStatus.innerHTML = msg;
}

function clearStatus() {
    formStatus.className = 'form-status';
    formStatus.innerHTML = '';
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    clearStatus();

    const nome = $('nome').value.trim();
    const email = $('email').value.trim();
    const pacote = $('pacote').value;
    const msg = $('msg').value.trim();

    if (!email || !email.includes('@')) {
        setStatus('Por favor, indique um email de resposta válido.', 'error');
        $('email').focus();
        return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'A enviar pedido...';
    submitIcon.textContent = '⏳';

    try {
        const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                Nome: nome || 'Não indicado',
                Email: email,
                Pacote: pacote,
                Mensagem: msg || 'Ainda a definir',
                _subject: `Novo pedido de orçamento: ${nome || 'Website'} (${pacote})`,
                _replyto: email,
                _template: 'table',
                _captcha: 'false'
            })
        });

        let data = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (_) {}
        }

        if (response.status === 521 || (!response.ok && !data)) {
            throw new Error('O serviço FormSubmit está temporariamente indisponível (servidor em manutenção).');
        }

        if (data && (response.ok && (data.success === 'true' || data.success === true))) {
            setStatus(`✓ <b>Pedido enviado com sucesso!</b> Recebi a sua mensagem em ${CONTACT_EMAIL} e entrarei em contacto brevemente.`, 'success');
            form.reset();
            submitText.textContent = 'Pedido enviado!';
            submitIcon.textContent = '✓';
            setTimeout(() => {
                submitText.textContent = 'Enviar pedido de orçamento';
                submitIcon.textContent = '✉';
                submitBtn.disabled = false;
            }, 4000);
            return;
        }

        if (data && data.message && data.message.toLowerCase().includes('activation')) {
            setStatus(`✉️ <b>Ativação necessária:</b> O FormSubmit enviou um email para <b>${CONTACT_EMAIL}</b> com o assunto <i>"Action Required: Confirm your form"</i>. Por favor abra esse email e clique no botão <b>"Activate Form"</b> para ativar o recebimento no domínio figasstudio.com.`, 'error');
            submitText.textContent = 'Aguardando ativação';
            submitIcon.textContent = '✉';
            submitBtn.disabled = false;
            return;
        }

        throw new Error((data && data.message) || `Falha no envio (HTTP ${response.status})`);
    } catch (err) {
        console.error(err);
        const msg = err.message || '';
        if (msg.toLowerCase().includes('activation')) {
            setStatus(`✉️ <b>Ativação necessária:</b> O FormSubmit enviou um email para <b>${CONTACT_EMAIL}</b> com o botão <i>"Activate Form"</i>. Clique nele uma única vez para desbloquear os envios.`, 'error');
        } else {
            setStatus(`Não foi possível enviar automaticamente (${msg || 'erro de rede'}). Pode <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Pedido de orçamento')}&body=${encodeURIComponent(build())}" style="color:var(--lime);text-decoration:underline">clicar aqui para enviar pelo seu email</a> ou escrever para <b>${CONTACT_EMAIL}</b>.`, 'error');
        }
        submitText.textContent = 'Tentar novamente';
        submitIcon.textContent = '✉';
        submitBtn.disabled = false;
    }
});

if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(build());
            copyBtn.textContent = '✓ Copiado!';
            setTimeout(() => { copyBtn.textContent = '⧉ Copiar resumo'; }, 2000);
        } catch (_) {
            alert('Não foi possível copiar o texto automaticamente.');
        }
    });
}

document.querySelectorAll('[data-pack]').forEach(a => a.addEventListener('click', () => { $('pacote').value = a.dataset.pack; }));
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Contagem animada dos números da secção "Porquê ter um site"
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const countIO = new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    countIO.unobserve(x.target);
    const el = x.target, end = +el.dataset.count, dur = 1400, t0 = performance.now();
    if (reduceMotion) return;
    const step = t => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
}), { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));
