import { auth, db, functions } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-functions.js";

// basic UI hookup
setTimeout(() => {
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.classList.remove('hidden');
}, 2500);

const loginBtn = document.querySelector('button[onclick="login()"]');

window.login = async function() {
  // simple demo login flow: show store screen
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('store-screen').classList.remove('hidden');
  await loadProducts();
};

async function loadProducts() {
  const productsDiv = document.querySelector('.products');
  if (!productsDiv) return;
  productsDiv.innerHTML = '';
  try {
    const col = collection(db, 'products');
    const snap = await getDocs(col);
    snap.forEach(doc => {
      const p = doc.data();
      const el = document.createElement('div');
      el.className = 'product';
      el.innerHTML = `<h3>${p.name}</h3><p>R$ ${p.price}</p>
        <button onclick="buy('${doc.id}','${p.name}', ${p.price})">Comprar</button>`;
      productsDiv.appendChild(el);
    });
  } catch (e) {
    console.error('Erro carregando products', e);
    productsDiv.innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

window.pay = function(produto) {
  const sel = document.getElementById('selected-product');
  if (sel) sel.innerText = "Produto selecionado: " + produto;
  document.getElementById('pix-modal').classList.remove('hidden');
};

window.closePix = function() {
  document.getElementById('pix-modal').classList.add('hidden');
};

window.sendNotification = async function() {
  // create a payment doc in Firestore (demo)
  try {
    const ref = await addDoc(collection(db,'payments'), {
      userId: 'guest',
      productName: document.getElementById('selected-product')?.innerText || 'produto',
      price: 0,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    // call cloud function (if deployed) to notify admin
    try {
      const sendNot = httpsCallable(functions, 'sendPaymentNotification');
      await sendNot({ paymentId: ref.id });
      alert('Pagamento registrado e notificação enviada (se a function estiver implantada).');
    } catch (err) {
      console.warn('Function não disponível ou erro ao chamar:', err);
      alert('Pagamento registrado. Abra o PIX e pague. ID: ' + ref.id);
    }
  } catch (e) {
    console.error(e);
    alert('Erro ao registrar pagamento.');
  }
};
