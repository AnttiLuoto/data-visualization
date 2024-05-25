import React, {useEffect, useState} from "react";
import BarChart from "./components/BarChart.jsx";
import DropDown from "./components/Dropdown.jsx";

function App() {
    const [data, setData] = useState([]);
    const [playerAttribute, setPlayerAttribute] = useState('assists')
    const attributes = ['goals', 'assists', 'games']
    // Get some sample data
    useEffect(() => {
        fetch('./data/stamkos.json')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

    const handleItemSelect = (item) => {
        setPlayerAttribute(item)
        console.log("handleItemSelect triggered: ", item)
    }

    return (
        <div className="p-5 bg-gray-900 min-h-screen text-white">
            <div className="mb-5">
                <h1 className="text-3xl font-bold">Data Visualization with D3</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <DropDown items={attributes} onItemSelect={handleItemSelect} />
                </div>
                <div className="col-span-1">
                    {data.length > 0 ? <BarChart data={data} playerAttribute={playerAttribute} /> : <p>Loading data...</p>}
                </div>
                <div className="col-span-1">
                    {data.length > 0 ? <BarChart data={data} playerAttribute={playerAttribute} /> : <p>Loading data...</p>}
                </div>
            </div>
        </div>
    );
}

export default App;
