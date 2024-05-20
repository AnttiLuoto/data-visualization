import React, { useEffect, useState } from "react";
import BarChart from "./components/BarChart.jsx";

function App() {
    const [data, setData] = useState([]);
    const [playerAttribute, setPlayerAttribute] = useState('assists')

    // Get some sample data
    useEffect(() => {
        fetch('./data/stamkos.json')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-sky-400">Data Visualization with D3</h1>
            <div className="grid grid-rows-1 grid-cols-2">
                {data.length > 0 ? <BarChart data={data} playerAttribute={playerAttribute}/> : <p>Loading data...</p>}
            </div>
        </div>
    );
}

export default App;
