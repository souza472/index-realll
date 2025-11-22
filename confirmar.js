
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.confirmOrder = async function(){
    const ref = await addDoc(collection(db,'payments'),{
        productName:"Produto Teste",
        price:0.01,
        status:"pending",
        createdAt: serverTimestamp()
    });

    await fetch("https://us-central1-lka-store-backend.cloudfunctions.net/sendEmail",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ id: ref.id })
    });

    alert("Pedido confirmado e email enviado! ID: "+ref.id);
};
