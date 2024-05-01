import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDnbRlkPkCCgwndDEnd-1moJ8Se_1D35Fw",
    authDomain: "capstoneproject451-d50f7.firebaseapp.com",
    databaseURL: "https://capstoneproject451-d50f7-default-rtdb.firebaseio.com",
    projectId: "capstoneproject451-d50f7",
    storageBucket: "capstoneproject451-d50f7.appspot.com",
    messagingSenderId: "811306304777",
    appId: "1:811306304777:web:f2a1cdc1795f0d5fc1ffd8",
    measurementId: "G-79VHWNQ2EY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const userId = "0901338";
let stockChart = null;  // Declare stockChart globally to manage its lifecycle

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchButton').addEventListener('click', function() {
        const symbol = document.getElementById('stockInput').value.toUpperCase();
        addStockToFirebase(symbol);
    });

    displayStocks();
});

function addStockToFirebase(symbol) {
    const stockRef = ref(db, `${userId}/favStocks/${symbol}`);
    set(stockRef, { symbol: symbol });
}

function displayStocks() {
    const stocksRef = ref(db, `${userId}/favStocks`);
    onValue(stocksRef, (snapshot) => {
        const container = document.getElementById('stockButtons');
        container.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const symbol = childSnapshot.val().symbol;
            const button = document.createElement('button');
            button.textContent = symbol;
            generateMockChart("TSLA");
            fetchStockNews("TSLA");
            document.getElementById('stockName').textContent = "TSLA"; 
            button.addEventListener('click', () => {
                document.getElementById('stockName').textContent = `${symbol}`; 
                generateMockChart(symbol);
                fetchStockNews(symbol);
            });
            container.appendChild(button);
        });
    });
}

function generateMockChart(symbol) {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = labels.map(() => Math.floor(Math.random() * 100) + 100);

    const ctx = document.getElementById('stockChart').getContext('2d');
    if (stockChart) {
        stockChart.destroy();  // Destroy the existing chart before creating a new one
    }
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${symbol} Stock Price`,
                data: data,
                borderColor: '#c3ff00',
                tension: 0.2
            }]
        },
        options: {
            scales: {
                y: {
                    grid: {
                        display: true,
                        color: '#3d3d3d',
                        lineWidth: 4
                    },
                    ticks: {
                        color: '#3d3d3d'
                    }
                },
                x: {
                    grid: {
                        color: '#3d3d3d',
                        lineWidth: 0  
                    }
                }
            }
        }
        
    });
}
const finnhubApiKey="conss9hr01qm6hd15tqgconss9hr01qm6hd15tr0";
function fetchStockNews(symbol) {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateOneMonthAgo()}&to=${getDateToday()}&token=${finnhubApiKey}`;
    fetch(url)
    .then(response => response.json())
    .then(news => {
        const newsContainer = document.getElementById('stockNews');
        newsContainer.innerHTML = '';
        // Use slice to get only the first 10 news items
        news.slice(0, 10).forEach(item => {
            const newsElement = document.createElement('div');
            newsElement.innerHTML = `<p><strong>${item.headline}</strong><br>${item.summary}<br><a href="${item.url}" target="_blank">Read more</a></p>`;
            newsContainer.appendChild(newsElement);
        });
    })
    .catch(error => {
        console.error('Error fetching stock news:', error);
        alert('Error fetching news. Please try again later.');
    });
}


function getDateToday() {
    return new Date().toISOString().split('T')[0];
}

function getDateOneMonthAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
}
