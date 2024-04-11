async function fixGrammar() {
    const inputText = document.getElementById('inputText').value;
    const response = await fetch('http://localhost:3000/api/fix-grammar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
    });
    const data = await response.json();
    document.getElementById('outputText').innerText = data.fixedText;
}
