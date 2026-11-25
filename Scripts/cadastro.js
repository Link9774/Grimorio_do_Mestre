const form = document.getElementById("registerForm");

form.addEventListener("submit", async function(event) {
event.preventDefault();

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const password = document.getElementById("password");
const confPassword = document.getElementById("confPassword");

const userNameError = document.getElementById("userNameError");
const userEmailError = document.getElementById("userEmailError");

let valid = true;

userName.classList.remove("error");
userEmail.classList.remove("error");

userNameError.textContent = "";
userEmailError.textContent = "";

if (userName.value.trim() === "") {
    userName.classList.add("error");
    userNameError.textContent = "O campo Nome de Usuário é obrigatório.";
    valid = false;

} else if (userName.value.trim().length < 3) {
    userName.classList.add("error");
    userNameError.textContent = "O nome precisa ter pelo menos 3 caracteres.";
    valid = false;
}

if (userEmail.value.trim() === "") {
    userEmail.classList.add("error");
    userEmailError.textContent = "O campo Email é obrigatório.";
    valid = false;

} else if (!userEmail.value.includes("@")) {
    userEmail.classList.add("error");
    userEmailError.textContent = "Digite um email válido.";
    valid = false;
}

if (password.value.trim() === "") {
    alert("O campo Senha é obrigatório.");
    valid = false;

} else if (password.value.length < 6) {
    alert("A senha precisa ter no mínimo 6 caracteres.");
    valid = false;
}

if (password.value !== confPassword.value) {
    alert("As senhas não coincidem!");
    valid = false;
}

if (valid) {

    const userData = {
        userName: userName.value.trim(),
        userEmail: userEmail.value.trim(),
        password: password.value
    };

    try {
        const resposta = await fetch("http://localhost:3001/api/mestres", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || "Não foi possível cadastrar.");
            return;
        }

        alert("Usuário cadastrado com sucesso!");

        window.location.href = "login.html";

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
}

});