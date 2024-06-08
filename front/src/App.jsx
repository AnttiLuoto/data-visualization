import React, {useEffect, useState} from "react";
import BarChart from "./components/BarChart.jsx";
import BarChart_test from "./components/BarChart_test.jsx";
import DropDown from "./components/Dropdown.jsx";
import PriceHistoryLine from "./components/PriceHistoryLine.jsx";
import PriceHistoryLinePercentage from "./components/PriceHistoryLinePercentage.jsx";
import PriceChangeBar from "./components/PriceChangeBar.jsx";

function App() {

    // Variables for D_Product and F_PriceHistory
    const [priceHistory, setPriceHistory] = useState([])
    const [productAggregates, setProductAggregates] = useState([])
    const [products, setProducts] = useState([])
    const [productNames, setProductNames] = useState([]) // Product names for the dropdown

    // Variables for selected items
    const [selectedProduct, setSelectedProduct] = useState('')


    // Load in the data
    useEffect(() => {

        // PriceHistory
        fetch('./data/F_PriceHistory.json')
            .then(response => response.json())
            .then(data => {
                setPriceHistory(data)
            })
            .catch(error => console.error('Error fetching PriceHistory: ', error));

        // Product aggretes
        fetch('./data/F_ProductAggregates.json')
            .then(response => response.json())
            .then(data => {
                setProductAggregates(data)
            })
            .catch(error => console.error('Error fetching ProductAggregates: ', error));

        // Products
        fetch('./data/D_Product.json')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                // Extract product names for dropdown selection
                const names = data.map(product => product.productName);
                setProductNames(names);
            })
            .catch(error => console.error('Error fetching Products: ', error));
    }, []);

    const handleProductSelect = (item) => {
        setSelectedProduct(item)
        console.log("handleProductSelect triggered: ", item)
    }

    // Filter the priceHistory -array based on selectedProduct to plot only data of selectedProduct
    const filteredPriceHistory = selectedProduct
        ? priceHistory.filter(record => record.productName === selectedProduct)
        : [];

    return (
        <div className="p-5 bg-emerald-50 min-h-screen text-gray-900">
            <div className="mb-5">
                <h1 className="text-3xl font-bold text-center">Retail price analysis</h1>
            </div>
            <div className='flex flex-row'>
                <div className='flex flex-col w-64 border-r-2 p-4'>
                    <h2 className="font-semibold mb-4">Filtering</h2>
                    <div className="mb-10">
                        <DropDown items={productNames} onItemSelect={handleProductSelect}/>
                    </div>
                </div>
                <div className="flex flex-col flex-1 pl-4 w-[1600px]">
                    <div className="w-[1600px]">
                        <div className="flex justify-center shadow-md rounded-md bg-blue-100 mb-10">
                            {priceHistory.length > 0 ?
                                <PriceChangeBar data={productAggregates} selectedProduct={selectedProduct} onBarClick={handleProductSelect}/> :
                                <p>Loading data...</p>}
                        </div>
                        <div className="grid gap-10 grid-cols-2">
                            {/* PriceHistoryLine and PriceHistoryPercentage should be below PriceChangeBar, and be one col wide */}
                            <div className="flex justify-center col-span-1 shadow-md rounded-md bg-blue-100">
                                {priceHistory.length > 0 ?
                                    <PriceHistoryLine data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                                    <p>Loading data...</p>}
                            </div>
                            <div className="flex justify-center         col-span-1 shadow-md rounded-md bg-blue-100">
                                {priceHistory.length > 0 ?
                                    <PriceHistoryLinePercentage data={filteredPriceHistory}
                                                                selectedProduct={selectedProduct}/> :
                                    <p>Loading data...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
