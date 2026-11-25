
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:3001/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const dados = await response.json();

        if (!response.ok) {
            alert(dados.erro);
            return;
        }

        localStorage.setItem(
            "loggedMaster",
            JSON.stringify(dados.mestre)
        );

        console.log("Login realizado!");

        window.location.href = "dashboard.html";

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});
