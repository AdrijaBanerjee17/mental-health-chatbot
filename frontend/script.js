function typeEffect(text, element) {
    let i = 0;
    element.innerHTML = "";

    const interval = setInterval(() => {
        element.innerHTML += text[i] === "\n" ? "<br>" : text[i];
        i++;
        if (i >= text.length) clearInterval(interval);
    }, 20);
}


async function sendMessage() {
    
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const message = input.value.trim();
    if (!message) return;

    // Show user message
    const userDiv = document.createElement("div");
    userDiv.className = "user";
    userDiv.innerText = message;
    chatBox.appendChild(userDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    input.value = "";

    try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!res.ok) {
            throw new Error("Backend error");
        }

        const data = await res.json();

        // Safety check
        const botText =
            (data.response || "I'm here with you.") +
            (data.tips ? "\n\n" + data.tips : "");

        const botDiv = document.createElement("div");
        botDiv.className = "bot";
        chatBox.appendChild(botDiv);

        const badge = data.emotion ? `<small>${emotionBadge(data.emotion)}</small><br>` : "";
typeEffect(badge + botText, botDiv);

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "bot";
        errorDiv.innerText = "⚠️ I'm having trouble responding right now.";
        chatBox.appendChild(errorDiv);
    }
}
function showTypingIndicator() {
    const chatBox = document.getElementById("chat-box");

    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "bot";
    typingDiv.innerText = "MindCare is typing…";

    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
}
function emotionBadge(emotion) {
    const map = {
        POSITIVE: "🟢 Positive",
        NEGATIVE: "🔴 Distressed",
        NEUTRAL: "🟡 Neutral"
    };
    return map[emotion] || "";
}