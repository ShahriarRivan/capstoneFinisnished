import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

// Initialize Firebase
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







document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculateButton').addEventListener('click', function() {
        const income = parseFloat(document.getElementById('income').value);
        const rent = parseFloat(document.getElementById('rent').value);
        const food = parseFloat(document.getElementById('food').value);
        const utilities = parseFloat(document.getElementById('utilities').value);
        const transportation = parseFloat(document.getElementById('transportation').value);
        const otherExpenses = parseFloat(document.getElementById('otherExpenses').value);

        if (isNaN(income) || income <= 0) {
            alert('Please enter a valid positive number for income.');
            return;
        }

        const expenses = rent + food + utilities + transportation + otherExpenses;
        const savings = income - expenses;
        const spendingPercentage = ((expenses / income) * 100).toFixed(2);
        const savingsAdvice = calculateSavingsAdvice(savings);

        let resultsHTML = `
            <h2>Budget Summary</h2>
            <p>Total Monthly Income: $${income.toFixed(2)}</p>
            <p>Total Monthly Expenses: $${expenses.toFixed(2)}</p>
            <p>Total Savings: $${savings.toFixed(2)}</p>
            <p>Percentage of Income Spent: ${spendingPercentage}%</p>
            <p style="font-weight: 600";>Savings Advice: Save at least $${savingsAdvice.save.toFixed(2)}, you can spend $${savingsAdvice.spend.toFixed(2)} on other things.</p>
        `;

        if (savings < 0) {
            resultsHTML += `<p style="color: red;"><strong>Warning:</strong> You are spending more than your income!</p>`;
        }

        document.getElementById('results').innerHTML = resultsHTML;
        renderChart([rent, food, utilities, transportation, otherExpenses], ['Rent/Mortgage', 'Food', 'Utilities', 'Transportation', 'Other']);
    });
});

function calculateSavingsAdvice(savings) {
    return {
        save: savings * 0.7,
        spend: savings * 0.3
    };
}

function renderChart(data, labels) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    // Check if the chart instance exists and is an instance of a Chart
    if (window.expenseChart instanceof Chart) {
        window.expenseChart.destroy(); // Destroy only if it exists and is a Chart
    }
    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to fetch historical spending data
function fetchHistoricalSpending() {
    const historicalSpendingRef = ref(db, `${userId}/budget`);
    get(historicalSpendingRef).then((snapshot) => {
        const historicalData = snapshot.val(); // m1, m2, m3, m4, m5
        const spendingValues = Object.values(historicalData); // Convert object to array
        getTotalSpentThisMonth(spendingValues);
    });
}

// Function to calculate and add this month's spending to the chart
function getTotalSpentThisMonth(previousMonths) {
    // References to different transaction sources
    const refs = [
        ref(db, `${userId}/banking/accounts/SavingsAcc/transactions`),
        ref(db, `${userId}/banking/accounts/CheckingsAcc/transactions`),
        ref(db, `${userId}/banking/cards/SavingsCC/transactions`),
        ref(db, `${userId}/banking/cards/BlackCC/transactions`),
        ref(db, `${userId}/SendReceive/SendFunds`)
    ];

    let totalSpent = 0;
    let promises = refs.map(ref => get(ref));

    Promise.all(promises).then(snapshots => {
        snapshots.forEach(snapshot => {
            snapshot.forEach(childSnapshot => {
                const transaction = childSnapshot.val();
                if (transaction.type === 'spent' && isInCurrentMonth(childSnapshot.key)) {
                    totalSpent += parseFloat(transaction.amount);
                }
            });
        });

        // Update total spent in HTML and render chart
        // document.getElementById('totalSpentThisMonth').textContent = totalSpent.toFixed(2);
        renderSpendingChart([...previousMonths, totalSpent]);
    });
}

function renderSpendingChart(spendingData) {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    // Check if window.spendingChart exists and is an instance of Chart before trying to destroy it
    if (window.spendingChart instanceof Chart) {
        window.spendingChart.destroy();
    }
    window.spendingChart = new Chart(ctx, {
        type: 'line', // Changed from 'bar' to 'line'
        data: {
            labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Monthly Spending',
                data: spendingData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue background
                borderColor: 'rgba(54, 162, 235, 1)', // Solid blue line
                borderWidth: 2,
                fill: true, // Fill area under the line
                tension: 0.3 // Smooths the line
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            elements: {
                line: {
                    tension: 0.4 // This adds some curvature to the line
                },
                point: {
                    radius: 5, // Increases the size of the point markers
                    hoverRadius: 8 // Increases the hover state size
                }
            }
        }
    });
}



// Helper function to determine if a transaction date is in the current month
function isInCurrentMonth(dateString) {
    const transactionDate = new Date(dateString);
    const currentDate = new Date();
    return transactionDate.getMonth() === currentDate.getMonth() &&
           transactionDate.getFullYear() === currentDate.getFullYear();
}

// Initialize the process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchHistoricalSpending();
});