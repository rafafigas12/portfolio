const $ = id => document.getElementById(id);
// Cole aqui a sua Access Key gerada em https://web3forms.com
const WEB3FORMS_ACCESS_KEY = '35f88c13-7fc6-4d8f-a2d9-42ffc231459a';
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

    const key = (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_ACCESS_KEY_HERE')
        ? WEB3FORMS_ACCESS_KEY
        : ($('access_key') && $('access_key').value !== 'YOUR_ACCESS_KEY_HERE' ? $('access_key').value : '');

    if (!key) {
        setStatus(`⚙️ <b>Falta a Access Key do Web3Forms:</b> Obtenha a sua chave gratuita em <a href="https://web3forms.com" target="_blank" rel="noopener" style="color:var(--lime);text-decoration:underline">web3forms.com</a> e cole-a em <code>script.js</code> na variável <code>WEB3FORMS_ACCESS_KEY</code>. Entretanto, pode <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Pedido de orçamento')}&body=${encodeURIComponent(build())}" style="color:var(--lime);text-decoration:underline">clicar aqui para enviar diretamente por email</a>.`, 'error');
        return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'A enviar pedido...';
    submitIcon.textContent = '⏳';

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: key,
                nome: nome || 'Não indicado',
                email: email,
                pacote: pacote,
                mensagem: msg || 'Ainda a definir',
                subject: `Novo pedido de orçamento: ${nome || 'Website'} (${pacote})`,
                from_name: 'Figas Studio Portfólio'
            })
        });

        const data = await response.json();

        if (response.ok && (data.success === true || data.success === 'true')) {
            setStatus(`✓ <b>Pedido enviado com sucesso!</b> Recebi a sua mensagem em ${CONTACT_EMAIL} e entrarei em contacto brevemente.`, 'success');
            form.reset();
            submitText.textContent = 'Pedido enviado!';
            submitIcon.textContent = '✓';
            setTimeout(() => {
                submitText.textContent = 'Enviar pedido de orçamento';
                submitIcon.textContent = '✉';
                submitBtn.disabled = false;
            }, 4000);
        } else {
            throw new Error(data.message || 'Falha no envio');
        }
    } catch (err) {
        console.error(err);
        setStatus(`Não foi possível enviar automaticamente (${err.message || 'erro de rede'}). Pode <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Pedido de orçamento')}&body=${encodeURIComponent(build())}" style="color:var(--lime);text-decoration:underline">clicar aqui para enviar pelo seu email</a> ou escrever para <b>${CONTACT_EMAIL}</b>.`, 'error');
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
