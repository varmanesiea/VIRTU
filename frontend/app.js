// Configuration - Adapter selon votre environnement
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `http://${window.location.hostname}:30001/api`;

// Fonction pour voter
async function vote(option) {
    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ option: option })
        });

        if (response.ok) {
            showMessage(`Vote enregistre pour ${option} !`);
            loadResults();
        } else {
            showMessage('Erreur lors du vote', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Impossible de contacter le serveur', 'error');
    }
}

// Fonction pour charger les résultats
async function loadResults() {
    try {
        const response = await fetch(`${API_URL}/results`);
        const data = await response.json();

        const resultsDiv = document.getElementById('results');
        
        if (data.results && data.results.length > 0) {
            const total = data.results.reduce((sum, item) => sum + item.votes, 0);
            
            resultsDiv.innerHTML = data.results.map(item => {
                const percentage = total > 0 ? (item.votes / total * 100).toFixed(1) : 0;
                return `
                    <div class="result-item">
                        <div style="flex: 1;">
                            <strong>${item.option}</strong>
                            <div class="result-bar" style="width: ${percentage}%;">
                                ${item.votes} votes (${percentage}%)
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            resultsDiv.innerHTML = '<p>Aucun vote pour le moment. Soyez le premier à voter !</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error);
        document.getElementById('results').innerHTML = 
            '<p style="color: red;">Erreur de connexion au serveur</p>';
    }
}

// Fonction pour afficher un message
function showMessage(message, type = 'success') {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    const voteSection = document.querySelector('.vote-section');
    voteSection.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Charger les résultats au démarrage et toutes les 5 secondes
loadResults();
setInterval(loadResults, 5000);
