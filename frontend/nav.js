function showSection(sectionId, clickedItem) {
    // Hide all sections
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    // Show selected section
    document.getElementById(sectionId).classList.remove("hidden");

    // Update sidebar active state
    document.querySelectorAll(".sidebar li").forEach(item => {
        item.classList.remove("active");
    });

    if (clickedItem) {
        clickedItem.classList.add("active");
    }
}

function goHome() {
    window.location.href = "index.html";
}

function goChat() {
    window.location.href = "chat.html";
}
async function resetChat() {
    await fetch("http://127.0.0.1:8000/reset", { method: "POST" });
    document.getElementById("chat-box").innerHTML = "";
}

