const stockBtn = document.getElementById("display");
const dropdown = document.getElementById("stocks");
const stockDetails = document.getElementById("stockDetails");
const stockTable = document.getElementById("compareTable");
const apiKey = '3e967742ccmshe87417d50838fa0p19bae3jsn6d941a75f7da';
let chart = null;

// Fetching stock data
async function fetchStockData(stockSymbol) {
    const url = `https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&outputsize=compact&datatype=json`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (data['Error Message']) {
            alert('Invalid stock symbol or no data available.');
            return null;
        }

        return data['Time Series (Daily)'] || null;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        alert('Failed to fetch stock data. Please try again later.');
        return null;
    }
}

// Update Stock Information Section
function updateStockInfo(stockSymbol, stockData) {
    const latestDate = Object.keys(stockData)[0];
    const latestData = stockData[latestDate];

    if (latestData) {
        stockDetails.innerHTML = `
            <p><strong>Stock Symbol:</strong> ${stockSymbol}</p>
            <p><strong>Latest Price:</strong> ${latestData['4. close']}</p>
            <p><strong>Open:</strong> ${latestData['1. open']}</p>
            <p><strong>High:</strong> ${latestData['2. high']}</p>
            <p><strong>Low:</strong> ${latestData['3. low']}</p>
            <p><strong>Volume:</strong> ${latestData['5. volume']}</p>
        `;
    } else {
        alert('No data available for this stock.');
    }
}

// Update Stock Chart
function updateStockChart(stockSymbol, stockData) {
    const labels = Object.keys(stockData).reverse();
    const prices = labels.map(date => parseFloat(stockData[date]['4. close']));

    // Destroy previous chart if it exists
    if (chart) chart.destroy();

    const ctx = document.getElementById('stock-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${stockSymbol} Price`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM dd, yyyy',
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}

// Add Stock to Comparison Table
function addToComparisonTable(stockSymbol, stockData) {
    const latestDate = Object.keys(stockData)[0];
    const latestData = stockData[latestDate];

    if (latestData) {
        const newRow = stockTable.insertRow();
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);

        cell1.innerText = stockSymbol;
        cell2.innerText = latestData['4. close'];
        cell3.innerText = (parseFloat(latestData['4. close']) - parseFloat(latestData['1. open'])).toFixed(2);
        cell4.innerText = latestData['5. volume'];
    } else {
        alert('No data available for this stock.');
    }
}

// Event listeners
stockBtn.addEventListener('click', async () => {
    const stockSymbol = dropdown.value;
    const stockData = await fetchStockData(stockSymbol);

    if (stockData) {
        updateStockInfo(stockSymbol, stockData);
        updateStockChart(stockSymbol, stockData);
        addToComparisonTable(stockSymbol, stockData);
    }
});
